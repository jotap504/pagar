import React, { useEffect, useState, useRef } from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, doc, onSnapshot, updateDoc, setDoc, arrayRemove, deleteDoc } from 'firebase/firestore';
import { RefreshCw, Search, Power, Zap, Wifi, WifiOff, LayoutGrid, BarChart2, History, Settings, Plus, X, Trash2, AlertTriangle, Users, Mail, Phone, ShoppingBag, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClaimDevice from '../components/ClaimDevice';
import { decryptToken } from '../utils/encryption';

const Dashboard = () => {
    const { connect, status, subscribe, messages } = useMqtt();
    const { user } = useAuth();
    const [claimedUids, setClaimedUids] = useState([]);
    const [deviceStates, setDeviceStates] = useState({});
    const [firestoreStatuses, setFirestoreStatuses] = useState({});
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [unlinkingId, setUnlinkingId] = useState(null);
    const [activeTab, setActiveTab] = useState('devices'); // 'devices', 'activity', 'customers'
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        if (status === 'disconnected') {
            connect();
        }
    }, [status, connect]);

    // 1. Listen for claimed devices in Firestore
    useEffect(() => {
        if (!user) return;

        console.log('[Dashboard] Listening for claimed devices for:', user.uid);
        const unsubscribe = onSnapshot(
            doc(db, 'users', user.uid),
            (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setClaimedUids(data.devices || []);
                }
            },
            (err) => {
                console.error('[Dashboard] Error in snapshot listener:', err);
            }
        );

        return unsubscribe;
    }, [user]);

    // 2. Listen for device statuses in 'devices' collection
    useEffect(() => {
        if (!user || claimedUids.length === 0) {
            setFirestoreStatuses({});
            return;
        }

        console.log('[Dashboard] Listening for device statuses for:', claimedUids);

        // We listen to the entire devices collection where ownerId is the user
        // This is more efficient than individual listeners
        const q = query(collection(db, 'devices'), where('ownerId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const statuses = {};
            snapshot.forEach((doc) => {
                statuses[doc.id] = doc.data();
            });
            setFirestoreStatuses(statuses);
        });

        return unsubscribe;
    }, [user, claimedUids]);

    // 3. Subscribe to claimed devices only (MQTT)
    useEffect(() => {
        if (status === 'connected' && claimedUids.length > 0) {
            claimedUids.forEach(uid => {
                subscribe(`qrsolo/${uid}/stat/state`);
            });
        }
    }, [status, claimedUids, subscribe]);

    // 3. Process incoming states
    useEffect(() => {
        Object.keys(messages).forEach(topic => {
            if (topic.includes('/stat/state')) {
                const parts = topic.split('/');
                const uid = parts[1];
                if (!claimedUids.includes(uid)) return;

                try {
                    const payload = JSON.parse(messages[topic]);
                    setDeviceStates(prev => ({
                        ...prev,
                        [uid]: {
                            ...payload,
                            timestamp: Date.now() / 1000
                        }
                    }));
                } catch (e) {
                    console.error('Error parsing device state', e);
                }
            }
        });
    }, [messages, claimedUids]);

    const handleUnlink = async (uid) => {
        if (!window.confirm(`¿Estás seguro de que quieres desvincular el dispositivo ${uid}? Dejará de aparecer en tu panel.`)) return;

        try {
            // 1. Remove from user's device list
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                devices: arrayRemove(uid)
            });

            // 2. Clean up device document (remove owner)
            // We set it to null so it can be claimed again
            const deviceRef = doc(db, 'devices', uid);
            await updateDoc(deviceRef, {
                ownerId: null,
                status: 'offline', // Reset status
                unlinkedAt: new Date()
            });

            console.log('[Dashboard] Device unlinked successfully:', uid);
        } catch (err) {
            console.error('[Dashboard] Error unlinking device:', err);
            alert('Error al desvincular el dispositivo');
        }
    };

    // 4. Fetch Global History for Stats & Activity
    const [globalLogs, setGlobalLogs] = useState([]);
    const [stats, setStats] = useState({ todayRevenue: 0 });

    useEffect(() => {
        if (!user) return;

        console.log('[Dashboard] Fetching global history for stats...');
        const q = query(
            collection(db, 'users', user.uid, 'history'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().timestamp?.toDate() || new Date()
            }));

            setGlobalLogs(logs);

            // Calculate Today's Revenue
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const revenue = logs
                .filter(log => log.date >= today)
                .reduce((acc, log) => acc + (log.amount || 0), 0);

            setStats({ todayRevenue: revenue });
        });

        return unsubscribe;
    }, [user]);

    // 5. Fetch Global Customers
    useEffect(() => {
        if (!user) return;

        console.log('[Dashboard] Listening for customers collection...');
        const q = query(
            collection(db, 'users', user.uid, 'customers'),
            orderBy('lastPurchase', 'desc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const customerList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCustomers(customerList);
        });

        return unsubscribe;
    }, [user]);

    // 6. Auto-Resolve Payer Information (Secure Client-Side)
    const resolvingRefs = useRef(new Set());
    useEffect(() => {
        if (!user || globalLogs.length === 0) return;

        const resolveNext = async () => {
            const toResolve = globalLogs.find(l =>
                l.paymentId &&
                l.paymentId !== '---' &&
                !l.payerName &&
                !resolvingRefs.current.has(l.id)
            );

            if (!toResolve) return;

            // Get token for specific device
            const deviceData = firestoreStatuses[toResolve.deviceUid];
            let token = deviceData?.mpToken;

            if (token?.startsWith('enc:') && user?.uid) {
                token = await decryptToken(token, user.uid);
            }

            if (!token) {
                console.warn(`[Dashboard] No token found for device ${toResolve.deviceUid}`);
                return;
            }

            resolvingRefs.current.add(toResolve.id);

            // Local UI Feedback
            setGlobalLogs(prev => prev.map(l => l.id === toResolve.id ? { ...l, payerName: 'Resolviendo...' } : l));

            console.log(`[Dashboard] Securely resolving payer for ${toResolve.deviceUid}...`);

            try {
                const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${toResolve.paymentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (mpResponse.ok) {
                    const mpData = await mpResponse.json();
                    const payer = mpData.payer;
                    if (payer) {
                        const payerName = payer.nickname || `${payer.first_name || ''} ${payer.last_name || ''}`.trim() || 'Cliente';
                        const payerEmail = payer.email || '';
                        let payerPhone = '';
                        if (payer.phone && payer.phone.number) {
                            payerPhone = (payer.phone.area_code ? payer.phone.area_code + ' ' : '') + payer.phone.number;
                        }

                        console.log(`[Dashboard] Payer resolved: Name="${payerName}", Email="${payerEmail}", Phone="${payerPhone}"`);

                        // Update log in history
                        const logRef = doc(db, 'users', user.uid, 'history', toResolve.id);
                        await updateDoc(logRef, { payerName, payerEmail, payerPhone });

                        // Update Customer Database
                        // Use email, phone, or name as ID
                        const customerId = payerEmail || payerPhone || `anon_${toResolve.paymentId}`;
                        if (customerId) {
                            console.log(`[Dashboard] Updating customer record for: ${customerId}`);
                            const customerRef = doc(db, 'users', user.uid, 'customers', customerId);
                            await setDoc(customerRef, {
                                name: payerName,
                                email: payerEmail,
                                phone: payerPhone,
                                lastPaymentId: toResolve.paymentId,
                                lastPurchase: new Date()
                            }, { merge: true });
                        }
                    } else {
                        console.warn(`[Dashboard] MP resolution succeeded but no payer data found for ID: ${toResolve.paymentId}`);
                    }
                } else {
                    const errorText = await mpResponse.text();
                    const statusText = `Error MP ${mpResponse.status}`;
                    console.error(`[Dashboard] ${statusText}:`, errorText);

                    // Update UI with error
                    setGlobalLogs(prev => prev.map(l => l.id === toResolve.id ? { ...l, payerName: statusText } : l));

                    // Remove from resolvingRefs to allow retry later if they refresh
                    resolvingRefs.current.delete(toResolve.id);
                }
            } catch (error) {
                console.error('[Dashboard] Payer resolution failed:', error);
                setGlobalLogs(prev => prev.map(l => l.id === toResolve.id ? { ...l, payerName: 'Error de Red' } : l));
                // Remove from resolvingRefs to allow retry later
                resolvingRefs.current.delete(toResolve.id);
            }
        };

        const timer = setTimeout(resolveNext, 1200); // Slight delay for performance
        return () => clearTimeout(timer);
    }, [globalLogs, firestoreStatuses, user]);

    const devicesList = claimedUids.map(uid => {
        const fsData = firestoreStatuses[uid] || {};
        const mqttData = deviceStates[uid] || {};

        // Online if Firestore says so OR if we have recent MQTT activity
        const isOnline = fsData.status === 'online' ||
            (mqttData.timestamp && (Date.now() / 1000) - mqttData.timestamp < 60);

        return {
            uid,
            data: { ...fsData, ...mqttData },
            isOnline
        };
    });

    return (
        <div className="min-h-screen bg-[#11161d] text-white font-sans pb-24">
            {/* Top Bar */}
            <div className="p-6 flex justify-between items-center bg-[#11161d]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <LayoutGrid size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Mi Panel Pagar</h1>
                        <p className="text-xs text-gray-500">Gestión de Equipos</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowClaimModal(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={16} />
                        Vincular Equipo
                    </button>
                    <div className="bg-[#1f2630] p-2 rounded-full relative">
                        <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-0 right-0 border-2 border-[#11161d]"></div>
                        <Settings size={20} className="text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="px-6 space-y-6 max-w-[1600px] mx-auto">
                {/* Global Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#1f2630] rounded-2xl p-5 border border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-blue-500/10 group-hover:text-blue-500/20 transition-all"><Zap size={100} /></div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Equipos Online</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-black text-white">{devicesList.filter(d => d.isOnline).length}</h2>
                            <span className="text-xs text-gray-500">de {claimedUids.length}</span>
                        </div>
                    </div>

                    <div className="bg-[#1f2630] rounded-2xl p-5 border border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-green-500/10 group-hover:text-green-500/20 transition-all"><BarChart2 size={100} /></div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Ventas Hoy (Reales)</p>
                        <h2 className="text-3xl font-black text-white">$ {stats.todayRevenue.toFixed(2)}</h2>
                    </div>

                    <div className="bg-[#1f2630] rounded-2xl p-5 border border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-purple-500/10 group-hover:text-purple-500/20 transition-all"><Users size={100} /></div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Base de Clientes</p>
                        <h2 className="text-3xl font-black text-white">{customers.length}</h2>
                        <span className="text-xs text-gray-500">registrados</span>
                    </div>
                </div>

                {/* Tabs Selector */}
                <div className="flex border-b border-gray-800 gap-8">
                    <button
                        onClick={() => setActiveTab('devices')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'devices' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Equipos
                        {activeTab === 'devices' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'activity' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Historial Global
                        {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'customers' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Base de Clientes
                        {activeTab === 'customers' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full"></div>}
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-8">
                    {activeTab === 'devices' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {devicesList.map(({ uid, data, isOnline }) => (
                                    <DeviceListItem
                                        key={uid}
                                        uid={uid}
                                        data={data}
                                        isOnline={isOnline}
                                        onUnlink={() => handleUnlink(uid)}
                                    />
                                ))}

                                {claimedUids.length === 0 && (
                                    <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-800 rounded-3xl group hover:border-blue-500/30 transition-all cursor-pointer" onClick={() => setShowClaimModal(true)}>
                                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                                            <Plus size={32} />
                                        </div>
                                        <h4 className="text-white font-bold mb-1">No tienes equipos vinculados</h4>
                                        <p className="text-xs text-gray-500 max-w-[250px] mx-auto">Vincular tu placa es muy fácil. Solo necesitas el ID y la contraseña de admin.</p>
                                        <button className="mt-6 px-8 py-2.5 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg shadow-blue-500/20">Vincular Mi Primer Equipo</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="bg-[#1f2630] rounded-2xl border border-gray-800 overflow-hidden">
                                <div className="grid grid-cols-4 p-4 bg-black/20 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                    <div>Evento / Equipo</div>
                                    <div>Cliente</div>
                                    <div>Monto</div>
                                    <div className="text-right">Fecha / Hora</div>
                                </div>
                                <div className="divide-y divide-gray-800/50">
                                    {globalLogs.length > 0 ? globalLogs.map((log) => (
                                        <div key={log.id} className="p-4 hover:bg-white/5 transition grid grid-cols-4 items-center gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-200 truncate">{log.ref || 'Venta'}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">ID: {log.deviceUid}</p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-300 truncate">{log.payerName || 'Público'}</p>
                                                {log.payerEmail && <p className="text-[9px] text-gray-500 truncate">{log.payerEmail}</p>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-blue-400">${log.amount.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-200">
                                                    {log.date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                                                </p>
                                                <p className="text-[10px] text-gray-600 font-mono">
                                                    {log.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-20 text-center text-gray-600 italic text-sm">Sin actividad registrada</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'customers' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {customers.length > 0 ? customers.map((customer) => (
                                    <div key={customer.id} className="bg-[#1f2630] rounded-2xl p-5 border border-gray-800 hover:border-blue-500/30 transition-all group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                <Users size={24} />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gasto Total</p>
                                                <p className="text-lg font-black text-green-400">$ {(customer.totalSpent || 0).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <h4 className="text-white font-bold text-base truncate mb-1">{customer.name}</h4>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Mail size={14} className="flex-shrink-0" />
                                                <span className="text-xs truncate">{customer.email || 'No disponible'}</span>
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Phone size={14} className="flex-shrink-0" />
                                                    <span className="text-xs">{customer.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                                            <div className="flex items-center gap-1.5">
                                                <ShoppingBag size={12} className="text-blue-400" />
                                                <span className="text-[10px] font-bold text-gray-400">{customer.purchaseCount || 1} Compras</span>
                                            </div>
                                            <span className="text-[10px] text-gray-600">
                                                Ulp. {customer.lastPurchase?.toDate().toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                                        <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                                            <Users size={32} />
                                        </div>
                                        <h4 className="text-white font-bold mb-1">No hay clientes registrados</h4>
                                        <p className="text-xs text-gray-500">Los datos de los clientes aparecerán aquí automáticamente tras cada pago aprobado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Claim Modal Overlay */}
            {showClaimModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowClaimModal(false)}></div>
                    <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <button
                            className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition"
                            onClick={() => setShowClaimModal(false)}
                        >
                            <X size={24} />
                        </button>
                        <ClaimDevice onClaimed={() => {
                            setTimeout(() => setShowClaimModal(false), 2000);
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
};

const DeviceListItem = ({ uid, data, isOnline, onUnlink }) => (
    <div className="bg-[#1f2630] rounded-2xl p-4 border border-gray-800 flex items-center gap-4 hover:border-gray-700 transition shadow-sm group">
        <div className="w-12 h-12 rounded-xl bg-[#161b22] flex items-center justify-center relative">
            <Zap className={isOnline ? "text-blue-500" : "text-gray-700"} size={20} />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1f2630] ${isOnline ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}></div>
        </div>

        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm truncate">{data.name || data.devName || `Equipo Pagar`}</h4>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">ID: {uid}</span>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button
                onClick={(e) => { e.preventDefault(); onUnlink(); }}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                title="Desvincular"
            >
                <Trash2 size={16} />
            </button>
            <Link to={`/admin/device/${uid}`} className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white text-xs font-bold rounded-lg transition active:scale-95 border border-blue-500/20 hover:border-blue-500 shadow-sm">
                Panel
            </Link>
        </div>
    </div>
);

export default Dashboard;
