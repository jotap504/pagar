import React, { useEffect, useState } from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { RefreshCw, Search, Power, Zap, Wifi, WifiOff, LayoutGrid, BarChart2, History, Settings, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClaimDevice from '../components/ClaimDevice';

const Dashboard = () => {
    const { connect, status, subscribe, messages } = useMqtt();
    const { user } = useAuth();
    const [claimedUids, setClaimedUids] = useState([]);
    const [deviceStates, setDeviceStates] = useState({});
    const [showClaimModal, setShowClaimModal] = useState(false);

    useEffect(() => {
        if (status === 'disconnected') {
            connect();
        }
    }, [status, connect]);

    // 1. Listen for claimed devices in Firestore
    useEffect(() => {
        if (!user) return;

        console.log('[Dashboard] Listening for claimed devices for:', user.uid);
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setClaimedUids(data.devices || []);
            }
        });

        return unsubscribe;
    }, [user]);

    // 2. Subscribe to claimed devices only
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

    const devicesList = claimedUids.map(uid => ({
        uid,
        data: deviceStates[uid] || {},
        isOnline: deviceStates[uid] ? (Date.now() / 1000) - deviceStates[uid].timestamp < 60 : false
    }));

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
                    {/* Placeholder for real revenue stats from Firebase later */}
                    <div className="bg-[#1f2630] rounded-2xl p-5 border border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-green-500/10 group-hover:text-green-500/20 transition-all"><BarChart2 size={100} /></div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Ventas Hoy (Estimado)</p>
                        <h2 className="text-3xl font-black text-white">$ 0.00</h2>
                    </div>
                </div>

                {/* Main List */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500">Mis Dispositivos</h3>
                        <button onClick={() => setShowClaimModal(true)} className="md:hidden text-blue-500 p-1"><Plus size={24} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {devicesList.map(({ uid, data, isOnline }) => (
                            <DeviceListItem key={uid} uid={uid} data={data} isOnline={isOnline} />
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

const DeviceListItem = ({ uid, data, isOnline }) => (
    <div className="bg-[#1f2630] rounded-2xl p-4 border border-gray-800 flex items-center gap-4 hover:border-gray-700 transition shadow-sm group">
        <div className="w-12 h-12 rounded-xl bg-[#161b22] flex items-center justify-center relative">
            <Zap className={isOnline ? "text-blue-500" : "text-gray-700"} size={20} />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1f2630] ${isOnline ? 'bg-green-500' : 'bg-gray-800 shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}></div>
        </div>

        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm truncate">{data.devName || `Equipo Pagar`}</h4>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">ID: {uid}</span>
            </div>
        </div>

        <Link to={`/admin/device/${uid}`} className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white text-xs font-bold rounded-lg transition active:scale-95 border border-blue-500/20 hover:border-blue-500 shadow-sm">
            Panel
        </Link>
    </div>
);

export default Dashboard;
