import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Save, ChevronLeft, Volume2, Wifi, Upload, RefreshCw, Smartphone, Clock, Terminal, FileText, Lock, Image as ImageIcon, Plus, QrCode, Eye, EyeOff } from 'lucide-react';

const DeviceDetails = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const normalizedUid = uid?.toUpperCase();
    const { user } = useAuth();
    const { publish, subscribe, messages, status } = useMqtt();
    const hasRequestedSettings = useRef(false);
    const lastProcessedMessageRef = useRef('');

    useEffect(() => {
        console.log('[DeviceDetails] Mounted');
        return () => console.log('[DeviceDetails] Unmounted');
    }, []);

    // Form states
    const [config, setConfig] = useState({
        devName: '',
        price: 100,
        mode: 0, // 0: Time, 1: Credit, 2: Static QR
        fixedUnits: 1,
        fixedModeType: 0, // 0: Time, 1: Credit
        staticQrText: '',
        pulseDur: 100,
        promoEnabled: false,
        promoThreshold: 10,
        promoDiscount: 20,
        audioEnabled: true,
        volume: 75,
        wifiSsid: '',
        wifiPass: '',
        mpToken: '',
        googleUrl: '',
        manifestUrl: '',
        files: []
    });

    const [showMpToken, setShowMpToken] = useState(false);
    const [logs, setLogs] = useState([]);
    const [files, setFiles] = useState([]);
    const [availableWifi, setAvailableWifi] = useState([]);
    const [isScanning, setIsScanning] = useState(false);

    // 1. Sync with device via MQTT
    useEffect(() => {
        if (status === 'connected' && normalizedUid && !hasRequestedSettings.current) {
            console.log(`[DeviceDetails] Subscribing to qrsolo/${normalizedUid}/stat/#`);
            subscribe(`qrsolo/${normalizedUid}/stat/settings`);
            subscribe(`qrsolo/${normalizedUid}/stat/status`);

            console.log('[DeviceDetails] Requesting full device state...');
            publish(`qrsolo/${normalizedUid}/cmnd/get_settings`, '{}');
            publish(`qrsolo/${normalizedUid}/cmnd/list_ads`, '{}');

            hasRequestedSettings.current = true;
        }
    }, [status, normalizedUid, subscribe, publish]);

    // 2. Fetch Historical Logs from Firestore
    useEffect(() => {
        if (!user || !normalizedUid) return;

        console.log(`[DeviceDetails] Listening for Firestore logs. User: ${user.uid}, Device: ${normalizedUid}`);
        // Remove deviceUid filter to avoid composite index requirement
        const q = query(
            collection(db, 'users', user.uid, 'history'),
            orderBy('timestamp', 'desc'),
            limit(200) // Fetch a bit more to ensure we have enough for this device
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date()
            }));

            // Filter by device in memory
            const filteredLogs = allLogs
                .filter(log => log.deviceUid === normalizedUid)
                .map(log => ({
                    time: log.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    amount: log.amount,
                    duration: log.duration,
                    ref: log.ref,
                    isCloud: true
                }));

            console.log(`[DeviceDetails] Firestore Sync: Received ${filteredLogs.length} logs for ${normalizedUid}`);
            setLogs(prev => {
                // If we have local MQTT logs, we want to keep them until they appear in Firestore
                // This is a simple merge logic
                const fsIds = new Set(allLogs.map(l => l.id));
                const localOnly = prev.filter(l => !l.isCloud && !fsIds.has(l.id));
                return [...localOnly, ...filteredLogs];
            });
        }, (err) => {
            console.error('[DeviceDetails] History listener error:', err);
        });

        return unsubscribe;
    }, [user, normalizedUid]);

    // Handle settings and status messages
    const settingsTopic = `qrsolo/${normalizedUid}/stat/settings`;
    const statusTopic = `qrsolo/${normalizedUid}/stat/status`;
    const settingsMsg = messages[settingsTopic];
    const statusMsg = messages[statusTopic];

    // Settings Handler
    useEffect(() => {
        if (settingsMsg) {
            try {
                if (lastProcessedMessageRef.current === settingsMsg) return;
                lastProcessedMessageRef.current = settingsMsg;

                const payload = JSON.parse(settingsMsg);
                console.log('--- MQTT SETTINGS ---', payload);

                setConfig(prev => ({
                    ...prev,
                    devName: payload.devName !== undefined ? payload.devName : prev.devName,
                    price: payload.price !== undefined ? payload.price : prev.price,
                    mode: payload.mode !== undefined ? payload.mode : prev.mode,
                    pulseDur: payload.pulseDur !== undefined ? payload.pulseDur : prev.pulseDur,
                    fixedUnits: payload.fixedUnits !== undefined ? payload.fixedUnits : prev.fixedUnits,
                    fixedModeType: payload.fixedType !== undefined ? payload.fixedType : prev.fixedModeType,
                    staticQrText: payload.staticQrText !== undefined ? payload.staticQrText : prev.staticQrText,
                    promoEnabled: payload.promoEn !== undefined ? payload.promoEn : prev.promoEnabled,
                    promoThreshold: payload.promoThr !== undefined ? payload.promoThr : prev.promoThreshold,
                    promoDiscount: payload.promoVal !== undefined ? payload.promoVal : prev.promoDiscount,
                    audioEnabled: payload.sound !== undefined ? payload.sound : prev.audioEnabled,
                    volume: payload.vol !== undefined ? payload.vol : prev.volume,
                    wifiSsid: payload.wifiSsid !== undefined ? payload.wifiSsid : prev.wifiSsid,
                    mpToken: payload.mpToken !== undefined ? payload.mpToken : prev.mpToken,
                    googleUrl: payload.googleUrl !== undefined ? payload.googleUrl : prev.googleUrl,
                    manifestUrl: payload.fwUrl !== undefined ? payload.fwUrl : prev.manifestUrl
                }));
            } catch (e) {
                console.error('Error parsing settings:', e);
            }
        }
    }, [settingsMsg, settingsTopic]);

    // Status / Logs / Files Handler
    useEffect(() => {
        if (statusMsg) {
            console.log('[DeviceDetails] MQTT STATUS RECEIVED:', statusMsg);

            if (statusMsg.startsWith('FILES:')) {
                try {
                    const jsonStr = statusMsg.replace('FILES:', '').trim();
                    const fileArray = JSON.parse(jsonStr);
                    const fileList = fileArray.map(f => typeof f === 'string' ? f : f.name);
                    setFiles(fileList);
                } catch (e) {
                    console.error('Error parsing files JSON:', e);
                }
            }
            else if (statusMsg.startsWith('LOG_NEW:')) {
                // Real-time log injection via MQTT
                // Format: LOG_NEW:amount,duration,ref
                try {
                    const content = statusMsg.replace('LOG_NEW:', '').trim();
                    const [amount, duration, ref] = content.split(',');
                    const newLog = {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        amount: parseFloat(amount),
                        duration: parseInt(duration),
                        ref: ref,
                        isCloud: false,
                        id: `local_${Date.now()}` // Temporary ID
                    };
                    console.log('[DeviceDetails] MQTT LOG RECEIVED:', newLog);
                    setLogs(prev => [newLog, ...prev]);
                } catch (e) {
                    console.error('Error parsing real-time log:', e);
                }
            }
            else if (statusMsg.startsWith('WIFI_LIST:')) {
                try {
                    const jsonStr = statusMsg.replace('WIFI_LIST:', '').trim();
                    const wifiList = JSON.parse(jsonStr);
                    setAvailableWifi(wifiList.sort((a, b) => b.rssi - a.rssi));
                    setIsScanning(false);
                } catch (e) {
                    console.error('Error parsing wifi list:', e);
                    setIsScanning(false);
                }
            }
        }
    }, [statusMsg]);

    const [lastUpdated, setLastUpdated] = useState(null);
    useEffect(() => {
        if (settingsMsg) {
            setLastUpdated(new Date());
        }
    }, [settingsMsg]);

    const handleChange = (name, value) => {
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    // Mapping of internal state fields to ESP32 firmware keys
    const getPayload = (fields = null) => {
        const fullMapping = {
            devName: config.devName,
            price: parseFloat(config.price),
            mode: parseInt(config.mode),
            pulseDur: parseInt(config.pulseDur),
            fixedUnits: parseInt(config.fixedUnits),
            fixedType: parseInt(config.fixedModeType),
            staticQrText: config.staticQrText,
            promoEn: config.promoEnabled,
            promoThr: parseInt(config.promoThreshold),
            promoVal: parseFloat(config.promoDiscount),
            sound: config.audioEnabled,
            vol: parseInt(config.volume),
            wifiSsid: config.wifiSsid,
            wifiPass: config.wifiPass,
            mpToken: config.mpToken,
            googleUrl: config.googleUrl,
            fwUrl: config.manifestUrl
        };

        if (!fields) return fullMapping;

        const partial = {};
        fields.forEach(f => {
            if (fullMapping[f] !== undefined) partial[f] = fullMapping[f];
        });
        return partial;
    };

    const handleSaveSection = async (sectionName, fields) => {
        // 1. Handle Cloud-Only fields (Device Name)
        if (fields.includes('devName')) {
            try {
                console.log(`[DeviceDetails] Saving alias "${config.devName}" to Firestore...`);
                await setDoc(doc(db, 'devices', normalizedUid), {
                    name: config.devName
                }, { merge: true });
            } catch (e) {
                console.error("Error saving device name to cloud:", e);
                alert("Error al guardar el nombre en la nube");
                // Don't return, try to save other fields
            }
        }

        // 2. Prepare Firmware Payload (Exclude devName to keep FW pure)
        const firmwareFields = fields.filter(f => f !== 'devName');

        if (firmwareFields.length > 0) {
            const topic = `qrsolo/${normalizedUid}/cmnd/settings`;
            const payload = getPayload(firmwareFields);

            if (payload.mpToken && (payload.mpToken.startsWith('...') || payload.mpToken === '*****')) {
                delete payload.mpToken;
            }

            console.log(`[DeviceDetails] Saving/Publishing firmware settings [${sectionName}]:`, payload);
            publish(topic, JSON.stringify(payload));
        }

        alert(`Configuración de ${sectionName} guardada.`);
    };

    const handleSaveAll = () => {
        const topic = `qrsolo/${normalizedUid}/cmnd/settings`;
        const payload = getPayload();

        if (payload.mpToken && (payload.mpToken.startsWith('...') || payload.mpToken === '*****')) {
            delete payload.mpToken;
        }

        console.log('[DeviceDetails] Sending Full Save Payload:', payload);
        publish(topic, JSON.stringify(payload));
        alert('Toda la configuración enviada al dispositivo.');
    };

    const sendCommand = (cmd, payload = {}) => {
        publish(`qrsolo/${normalizedUid}/cmnd/${cmd}`, JSON.stringify(payload));
        alert(`Comando ${cmd} enviado.`);
    };

    return (
        <div className="min-h-screen bg-[#11161d] text-white pb-20 font-sans">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-[#11161d]/95 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin')} className="p-1 hover:bg-white/10 rounded-full transition">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Configuración</h1>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-blue-400 font-mono tracking-wide">{uid}</p>
                            {lastUpdated && <span className="text-[10px] text-green-500">• Actualizado {lastUpdated.toLocaleTimeString()}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            publish(`qrsolo/${uid}/cmnd/get_settings`, '{}');
                            publish(`qrsolo/${uid}/cmnd/get_logs`, '{}');
                            publish(`qrsolo/${uid}/cmnd/list_ads`, '{}');
                            alert('Solicitando datos actualizados...');
                        }}
                        className="p-2 bg-[#1f2630] hover:bg-[#252d38] text-gray-400 hover:text-white rounded-full transition"
                        title="Recargar todo desde dispositivo"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Main Grid Container */}
            <div className="w-full max-w-[1600px] mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">

                    {/* COLUMN 1: Operational */}
                    <div className="space-y-6">
                        <Section
                            title="CONFIGURACIÓN OPERATIVA"
                            onSave={() => handleSaveSection('Operación', ['devName', 'mode', 'price', 'pulseDur', 'fixedUnits', 'fixedType', 'staticQrText', 'promoEn', 'promoThr', 'promoVal'])}
                        >
                            <InputGroup label="Nombre del Dispositivo">
                                <Input value={config.devName} onChange={(e) => handleChange('devName', e.target.value)} placeholder={`Ej: Disp-${uid}`} />
                            </InputGroup>

                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Precio Unitario ($)">
                                    <Input type="number" value={config.price} onChange={(e) => handleChange('price', e.target.value)} />
                                </InputGroup>
                                {config.mode === 1 && (
                                    <InputGroup label="Duración Pulso (ms)">
                                        <Input type="number" value={config.pulseDur} onChange={(e) => handleChange('pulseDur', e.target.value)} />
                                    </InputGroup>
                                )}
                            </div>

                            <div className="pt-2">
                                <label className="block font-medium text-sm text-gray-200 mb-3">Modo de Operación</label>
                                <div className="bg-[#1c222b] p-1 rounded-xl flex">
                                    <ModeTab active={config.mode === 0} onClick={() => handleChange('mode', 0)} icon={<Clock size={16} />} label="TIEMPO" />
                                    <ModeTab active={config.mode === 1} onClick={() => handleChange('mode', 1)} icon={<Smartphone size={16} />} label="CRÉDITO" />
                                    <ModeTab active={config.mode === 2} onClick={() => handleChange('mode', 2)} icon={<QrCode size={16} />} label="FIJO" />
                                </div>
                            </div>

                            {config.mode === 2 && (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="text-xs font-bold text-blue-400 uppercase">Configuración QR Fijo</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Unidades Fijas">
                                            <Input type="number" value={config.fixedUnits} onChange={(e) => handleChange('fixedUnits', e.target.value)} />
                                        </InputGroup>
                                        <InputGroup label="Tipo">
                                            <select
                                                className="w-full bg-[#1c222b] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                                                value={config.fixedModeType}
                                                onChange={(e) => handleChange('fixedModeType', parseInt(e.target.value))}
                                            >
                                                <option value={0}>Minutos</option>
                                                <option value={1}>Créditos</option>
                                            </select>
                                        </InputGroup>
                                    </div>
                                    <InputGroup label="Texto Informativo">
                                        <Input value={config.staticQrText} onChange={(e) => handleChange('staticQrText', e.target.value)} placeholder='Ej: "Valor por 30 min"' />
                                    </InputGroup>
                                </div>
                            )}

                            {config.mode !== 2 && (
                                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                                            <span className="text-sm font-bold text-yellow-500/90 uppercase tracking-tight">Habilitar Promociones</span>
                                        </div>
                                        <Switch checked={config.promoEnabled} onChange={() => handleChange('promoEnabled', !config.promoEnabled)} />
                                    </div>

                                    {config.promoEnabled && (
                                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                                            <InputGroup label="Umbral (Mínimo)">
                                                <Input type="number" value={config.promoThreshold} onChange={(e) => handleChange('promoThreshold', e.target.value)} />
                                            </InputGroup>
                                            <InputGroup label="Descuento (%)">
                                                <Input type="number" value={config.promoDiscount} onChange={(e) => handleChange('promoDiscount', e.target.value)} />
                                            </InputGroup>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Section>
                    </div>

                    {/* COLUMN 2: Network & Services */}
                    <div className="space-y-6">
                        <Section title="RED WIFI" onSave={() => handleSaveSection('WiFi', ['wifiSsid', 'wifiPass'])}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="WiFi SSID">
                                        <div className="relative">
                                            <Input value={config.wifiSsid} onChange={(e) => handleChange('wifiSsid', e.target.value)} />
                                            <button
                                                onClick={() => {
                                                    setIsScanning(true);
                                                    setAvailableWifi([]);
                                                    sendCommand('scan_wifi');
                                                }}
                                                disabled={isScanning}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition disabled:opacity-50"
                                            >
                                                {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Wifi size={14} />}
                                            </button>
                                        </div>
                                    </InputGroup>
                                    <InputGroup label="WiFi Password">
                                        <Input type="password" value={config.wifiPass} onChange={(e) => handleChange('wifiPass', e.target.value)} />
                                    </InputGroup>
                                </div>

                                {availableWifi.length > 0 && (
                                    <div className="bg-black/20 rounded-xl border border-gray-800/50 overflow-hidden divide-y divide-gray-800">
                                        <div className="px-3 py-2 bg-[#1f2630] flex justify-between items-center text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                            <span>Redes Detectadas</span>
                                            <button onClick={() => setAvailableWifi([])} className="hover:text-white">Cerrar</button>
                                        </div>
                                        <div className="max-h-[150px] overflow-y-auto custom-scrollbar">
                                            {availableWifi.map((net, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => handleChange('wifiSsid', net.ssid)}
                                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 cursor-pointer transition group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Wifi size={12} className={net.rssi > -60 ? "text-green-500" : net.rssi > -80 ? "text-yellow-500" : "text-red-500"} />
                                                        <span className="text-xs text-gray-300 group-hover:text-white">{net.ssid}</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-gray-600">{net.rssi} dBm</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Section>

                        <Section title="MERCADO PAGO" onSave={() => handleSaveSection('Mercado Pago', ['mpToken'])}>
                            <InputGroup label="Access Token">
                                <div className="relative">
                                    <Input
                                        type={showMpToken ? "text" : "password"}
                                        value={config.mpToken}
                                        onChange={(e) => handleChange('mpToken', e.target.value)}
                                        className="text-xs font-mono pr-10"
                                    />
                                    <button
                                        onClick={() => setShowMpToken(!showMpToken)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        {showMpToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </InputGroup>
                        </Section>

                        <Section title="GOOGLE CONFIG" onSave={() => handleSaveSection('Google Script', ['googleUrl'])}>
                            <InputGroup label="Script URL">
                                <Input value={config.googleUrl} onChange={(e) => handleChange('googleUrl', e.target.value)} className="text-xs font-mono" />
                            </InputGroup>
                        </Section>

                        <Section title="SONIDO Y VOLUMEN" onSave={() => handleSaveSection('Sonido', ['sound', 'vol'])}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Volume2 className="text-blue-400" size={20} />
                                    <span className="font-medium text-sm">Altavoz del Dispositivo</span>
                                </div>
                                <Switch checked={config.audioEnabled} onChange={() => handleChange('audioEnabled', !config.audioEnabled)} />
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={config.volume}
                                onChange={(e) => handleChange('volume', e.target.value)}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </Section>

                        <Section title="PRUEBAS HW">
                            <div className="grid grid-cols-2 gap-4">
                                <ActionButton
                                    icon={<Clock size={24} className="mb-1" />}
                                    label="1 min Remoto"
                                    onClick={() => sendCommand('activate', { units: 1, ref: 'TEST_RELOJ' })}
                                />
                                <ActionButton
                                    icon={<Smartphone size={24} className="mb-1" />}
                                    label="5 Créditos"
                                    onClick={() => sendCommand('activate', { units: 5, ref: 'TEST_CRED' })}
                                />
                            </div>
                        </Section>
                    </div>

                    {/* COLUMN 3: Logs & Tools */}
                    <div className="space-y-6">
                        <Section title="HISTORIAL" headerAction={<div className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/20 font-bold font-mono">SD OK</div>}>
                            <div className="bg-[#1a202a] rounded-xl overflow-hidden text-sm border border-gray-800/50">
                                <div className="grid grid-cols-3 p-3 bg-[#1f2630] text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                    <div>Evento</div>
                                    <div>Detalle</div>
                                    <div className="text-right">Hora</div>
                                </div>
                                <div className="divide-y divide-gray-800 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {logs.length > 0 ? logs.map((log, i) => (
                                        <div key={i} className="grid grid-cols-3 p-3 hover:bg-white/5 transition border-l-2 border-transparent hover:border-blue-500">
                                            <span className="text-gray-300 text-xs truncate">{log.ref}</span>
                                            <span className={log.amount > 0 ? "text-blue-400 font-bold" : "text-gray-400"}>
                                                {log.amount > 0 ? `$${log.amount.toFixed(2)}` : '-'}
                                            </span>
                                            <div className="text-right text-gray-500 text-[10px] font-mono">{log.time}</div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-gray-600 italic text-xs">No hay registros hoy</div>
                                    )}
                                </div>
                            </div>
                        </Section>

                        <Section title="PUBLICIDAD (SD CARD)">
                            <div className="space-y-3">
                                {files.length > 0 ? files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-[#1a202a] rounded-xl border border-gray-800 group hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-3 truncate">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <FileText size={16} />
                                            </div>
                                            <span className="text-xs font-mono text-gray-300 truncate">{file}</span>
                                        </div>
                                        <button
                                            onClick={() => sendCommand('delete_ad', file)}
                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition"
                                            title="Eliminar archivo"
                                        >
                                            <Plus size={16} className="rotate-45" />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-gray-600 italic text-xs border border-dashed border-gray-800 rounded-xl bg-black/5">
                                        No hay archivos en la SD
                                    </div>
                                )}
                                <div
                                    className="p-3 bg-blue-500/5 border border-dashed border-blue-500/20 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500/10 cursor-pointer transition group"
                                    onClick={() => alert('Solo carga via SD manual por ahora')}
                                >
                                    <Plus className="text-blue-500/50 group-hover:text-blue-500" size={16} />
                                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Añadir Archivo JPG</p>
                                </div>
                            </div>
                        </Section>

                        <Section title="ACTUALIZACIÓN FRM" onSave={() => handleSaveSection('OTA', ['fwUrl'])}>
                            <InputGroup label="OTA Manifest URL">
                                <Input value={config.manifestUrl} onChange={(e) => handleChange('manifestUrl', e.target.value)} className="text-[10px] font-mono" placeholder="https://..." />
                            </InputGroup>
                            <button className="w-full py-3 mt-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-black rounded-lg text-[10px] uppercase tracking-[0.2em] transition border border-blue-500/20">
                                Forzar Búsqueda
                            </button>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Child Components ---

const Section = ({ title, headerAction, onSave, children }) => (
    <section className="bg-[#161b22] border border-[#1f2630] rounded-2xl p-5 shadow-sm flex flex-col h-full hover:border-[#252d38] transition-colors">
        <div className="flex justify-between items-center -mt-1 mb-5">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{title}</h2>
            {headerAction}
        </div>
        <div className="flex-1 space-y-5">
            {children}
        </div>
        {onSave && (
            <div className="mt-6 pt-4 border-t border-gray-800/50 flex justify-end">
                <button
                    onClick={onSave}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded text-[10px] font-black uppercase tracking-widest transition-all border border-blue-500/20 hover:border-blue-500/40"
                >
                    <Save size={12} />
                    Guardar {title.split(" ")[0]}
                </button>
            </div>
        )}
    </section>
);

const InputGroup = ({ label, children }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest">{label}</label>
        {children}
    </div>
);

const Input = ({ className = "", ...props }) => (
    <input
        className={`w-full bg-[#1c222b] border border-gray-800/50 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition placeholder:text-gray-700 ${className}`}
        {...props}
    />
);

const ModeTab = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
    >
        {icon}
        {label}
    </button>
);

const Switch = ({ checked, onChange }) => (
    <button onClick={onChange} className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${checked ? 'bg-blue-500' : 'bg-gray-800'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </button>
);

const ActionButton = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="bg-[#1f2630] hover:bg-blue-500/10 border border-gray-800 hover:border-blue-500/30 text-white py-5 rounded-xl flex flex-col items-center justify-center transition group">
        <div className="text-gray-600 group-hover:text-blue-500 group-hover:scale-110 transition-all">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest mt-2">{label}</span>
    </button>
);

export default DeviceDetails;
