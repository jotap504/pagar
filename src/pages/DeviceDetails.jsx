import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMqtt } from '../context/MqttContext';
import { Save, ChevronLeft, Volume2, Wifi, Upload, RefreshCw, Smartphone, Clock, Terminal, FileText, Lock, Image as ImageIcon, Plus, QrCode, Eye, EyeOff } from 'lucide-react';

const DeviceDetails = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const normalizedUid = uid?.toUpperCase();
    const { publish, subscribe, messages, status } = useMqtt();

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
        googleScriptUrl: '',
        manifestUrl: '',
        files: []
    });

    const [showMpToken, setShowMpToken] = useState(false);
    const [logs, setLogs] = useState([
        { amount: 0, duration: 60, ref: 'TEST_TIME', time: '10:42 AM' },
        { amount: 500, duration: 120, ref: 'Pago Recibido', time: '10:43 AM' },
        { amount: 0, duration: 0, ref: 'PowerCycle', time: '09:15 AM' }
    ]);

    // Sync with device
    useEffect(() => {
        if (status === 'connected' && normalizedUid) {
            console.log(`[DeviceDetails] Subscribing to qrsolo/${normalizedUid}/stat/settings`);
            // 1. Subscribe to settings updates
            subscribe(`qrsolo/${normalizedUid}/stat/settings`);
            // 2. Request current settings
            publish(`qrsolo/${normalizedUid}/cmnd/get_settings`, '{}');
        }
    }, [status, normalizedUid, subscribe, publish]);

    // Handle incoming messages
    useEffect(() => {
        const settingsTopic = `qrsolo/${normalizedUid}/stat/settings`;
        if (messages[settingsTopic]) {
            try {
                const payload = JSON.parse(messages[settingsTopic]);
                console.log('--- MQTT DEBUG ---');
                console.log('Topic:', settingsTopic);
                console.log('Received Settings Payload:', payload);

                setConfig(prev => ({
                    ...prev,
                    devName: payload.devName !== undefined ? payload.devName : prev.devName,
                    price: payload.price || prev.price,
                    mode: payload.mode !== undefined ? payload.mode : prev.mode,
                    pulseDur: payload.pulseDur || prev.pulseDur,

                    fixedUnits: payload.fixedUnits || prev.fixedUnits,
                    fixedModeType: payload.fixedType !== undefined ? payload.fixedType : prev.fixedModeType,
                    staticQrText: payload.staticQrText || prev.staticQrText,

                    promoEnabled: payload.promoEn !== undefined ? payload.promoEn : prev.promoEnabled,
                    promoThreshold: payload.promoThr || prev.promoThreshold,
                    promoDiscount: payload.promoVal || prev.promoDiscount,

                    audioEnabled: payload.sound !== undefined ? payload.sound : prev.audioEnabled,
                    volume: payload.vol || prev.volume,

                    wifiSsid: payload.wifiSsid || prev.wifiSsid,
                    // wifiPass: payload.wifiPass, // Often not sent back for security
                    mpToken: payload.mpToken || prev.mpToken,
                    googleScriptUrl: payload.googleUrl || prev.googleScriptUrl,
                    manifestUrl: payload.fwUrl || prev.manifestUrl
                }));
            } catch (e) {
                console.error('Error parsing settings:', e);
            }
        }
    }, [messages, uid]);

    const handleChange = (name, value) => {
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAll = () => {
        const topic = `qrsolo/${normalizedUid}/cmnd/settings`;

        // Create copy of config to modify payload
        const payload = { ...config };

        // Security: If mpToken is masked (starts with ... or *****), do NOT send it back
        // This prevents overwriting the real token with the mask.
        if (payload.mpToken && (payload.mpToken.startsWith('...') || payload.mpToken === '*****')) {
            delete payload.mpToken;
        }

        publish(topic, JSON.stringify(payload));
        alert('Configuración guardada y enviada.');
    };

    const sendCommand = (cmd, payload = {}) => {
        publish(`qrsolo/${normalizedUid}/cmnd/${cmd}`, JSON.stringify(payload));
        alert(`Comando ${cmd} enviado.`);
    };

    // Helper for formatting MP Token
    const formatToken = (token) => {
        if (!token) return '';
        if (showMpToken) return token;
        if (token.length <= 5) return token;
        return `...${token.slice(-5)}`;
    };

    const [lastUpdated, setLastUpdated] = useState(null);
    useEffect(() => {
        if (messages[`qrsolo/${uid}/stat/settings`]) {
            setLastUpdated(new Date());
        }
    }, [messages, uid]);

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
                            alert('Solicitando configuración...');
                        }}
                        className="p-2 bg-[#1f2630] hover:bg-[#252d38] text-gray-400 hover:text-white rounded-full transition"
                        title="Recargar desde dispositivo"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={handleSaveAll}
                        className="px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-sm font-bold transition shadow-lg shadow-blue-500/20"
                    >
                        Guardar
                    </button>
                </div>
            </div>

            {/* Main Grid Container - Full Width on Desktop */}
            <div className="w-full max-w-[1600px] mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">

                    {/* COLUMN 1: Primary Settings */}
                    <div className="space-y-6">
                        {/* GENERAL */}
                        <Section title="GENERAL">
                            <InputGroup label="Nombre del Dispositivo">
                                <Input value={config.devName} onChange={(e) => handleChange('devName', e.target.value)} />
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

                            {/* Static Mode Config */}
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
                        </Section>

                        {/* PROMOS */}
                        {config.mode !== 2 && (
                            <Section title="PROMOCIONES">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="Umbral (Mínimo)">
                                        <Input type="number" value={config.promoThreshold} onChange={(e) => handleChange('promoThreshold', e.target.value)} />
                                    </InputGroup>
                                    <InputGroup label="Descuento (%)">
                                        <Input type="number" value={config.promoDiscount} onChange={(e) => handleChange('promoDiscount', e.target.value)} />
                                    </InputGroup>
                                </div>
                                <button className="w-full py-3 mt-2 border border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition text-sm flex items-center justify-center gap-2">
                                    <Plus size={16} /> Agregar Regla de Descuento
                                </button>
                            </Section>
                        )}
                    </div>

                    {/* COLUMN 2: Connectivity & Hardware */}
                    <div className="space-y-6">
                        {/* RED Y API */}
                        <Section title="RED Y API">
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="WiFi SSID">
                                    <Input value={config.wifiSsid} onChange={(e) => handleChange('wifiSsid', e.target.value)} />
                                </InputGroup>
                                <InputGroup label="WiFi Password">
                                    <Input type="password" value={config.wifiPass} onChange={(e) => handleChange('wifiPass', e.target.value)} />
                                </InputGroup>
                            </div>

                            <InputGroup label="Mercado Pago Token">
                                <div className="relative">
                                    <Input
                                        type={showMpToken ? "text" : "password"}
                                        value={config.mpToken}
                                        // We keep the real value in state, but rendering logic could be complex if we wanted to mask while editing.
                                        // For simplicity: standard password input toggle
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
                                {/* Display the masked "ending in" hint if we have a value and it's hidden */}
                                {!showMpToken && config.mpToken && config.mpToken.length > 5 && (
                                    <p className="text-[10px] text-green-500 mt-1 font-mono text-right">
                                        Activo • Termina en ...{config.mpToken.slice(-5)}
                                    </p>
                                )}
                            </InputGroup>

                            <InputGroup label="Google Script URL">
                                <Input value={config.googleScriptUrl} onChange={(e) => handleChange('googleScriptUrl', e.target.value)} className="text-xs font-mono" />
                            </InputGroup>
                        </Section>

                        {/* PRUEBAS HW */}
                        <Section title="PRUEBAS HW">
                            <div className="grid grid-cols-2 gap-4">
                                <ActionButton
                                    icon={<Clock size={24} className="mb-1" />}
                                    label="1 min Remoto"
                                    onClick={() => sendCommand('activate', { type: 'time', duration: 60 })}
                                />
                                <ActionButton
                                    icon={<Smartphone size={24} className="mb-1" />}
                                    label="5 Créditos"
                                    onClick={() => sendCommand('activate', { type: 'credit', amount: 5 })}
                                />
                            </div>
                        </Section>

                        {/* SONIDO */}
                        <Section title="SONIDO">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Volume2 className="text-blue-400" size={20} />
                                    <span className="font-medium">Sonidos de Interfaz</span>
                                </div>
                                <Switch checked={config.audioEnabled} onChange={() => handleChange('audioEnabled', !config.audioEnabled)} />
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-2 text-gray-400">
                                    <span>Volumen</span>
                                    <span>{config.volume}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={config.volume}
                                    onChange={(e) => handleChange('volume', e.target.value)}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        </Section>
                    </div>

                    {/* COLUMN 3: Management & Logs */}
                    <div className="space-y-6">
                        {/* HISTORIAL */}
                        <Section title="HISTORIAL" headerAction={<div className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/20">MicroSD OK</div>}>
                            <div className="bg-[#1a202a] rounded-xl overflow-hidden text-sm">
                                <div className="grid grid-cols-3 p-3 bg-[#1f2630] text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    <div>Evento</div>
                                    <div>Detalle</div>
                                    <div className="text-right">Hora</div>
                                </div>
                                <div className="divide-y divide-gray-800 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {logs.map((log, i) => (
                                        <div key={i} className="grid grid-cols-3 p-3 hover:bg-white/5 transition">
                                            <span className="text-gray-300">{log.ref === 'Pago Recibido' ? 'Pago Recibido' : 'Evento Sistema'}</span>
                                            <span className={log.amount > 0 ? "text-blue-400 font-bold" : "text-gray-400"}>
                                                {log.amount > 0 ? `$${log.amount.toFixed(2)}` : log.ref}
                                            </span>
                                            <div className="text-right text-gray-500">{log.time}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 text-center border-t border-gray-800">
                                    <button className="text-blue-400 text-xs font-bold hover:text-blue-300">Ver todos los logs</button>
                                </div>
                            </div>
                        </Section>

                        {/* PUBLICIDAD */}
                        <Section title="PUBLICIDAD (PANTALLA)">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-video bg-[#1a202a] rounded-xl border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden group">
                                    <div className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs shadow-md z-10 cursor-pointer hover:bg-red-600 transition">x</div>
                                    <div className="w-12 h-16 bg-blue-500/20 border border-blue-500/30 rounded mb-2"></div>
                                    <p className="text-[10px] text-gray-400">promo_verano.jpg</p>
                                </div>
                                <div className="aspect-video bg-[#1a202a] rounded-xl border border-dashed border-gray-700 flex flex-col items-center justify-center hover:bg-white/5 cursor-pointer transition">
                                    <ImageIcon className="text-gray-500 mb-2" />
                                    <p className="text-[10px] text-gray-500">Subir Archivo</p>
                                </div>
                            </div>
                            <p className="mt-2 text-[10px] text-gray-600">Recomendado: JPG, 320x240px. Max 150KB.</p>
                        </Section>

                        {/* ACTUALIZACION */}
                        <Section title="ACTUALIZACIÓN">
                            <div className="bg-[#1a202a] rounded-xl p-4 border border-gray-800 space-y-4">
                                <InputGroup label="OTA Manifest URL">
                                    <Input value={config.manifestUrl} onChange={(e) => handleChange('manifestUrl', e.target.value)} className="text-xs" placeholder="https://..." />
                                </InputGroup>
                                <button className="w-full py-3 bg-[#1f2630] hover:bg-[#252d38] text-blue-400 font-bold rounded-lg text-sm transition flex items-center justify-center gap-2">
                                    <Upload size={16} /> Buscar Actualizaciones
                                </button>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Reusable Components ---

const Section = ({ title, headerAction, children }) => (
    <section className="bg-[#161b22] border border-[#1f2630] rounded-2xl p-5 shadow-sm space-y-5 h-full">
        <div className="flex justify-between items-center -mt-1 mb-2">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h2>
            {headerAction}
        </div>
        <div>
            {children}
        </div>
    </section>
);

const InputGroup = ({ label, children }) => (
    <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

const Input = ({ className = "", ...props }) => (
    <input
        className={`w-full bg-[#1c222b] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition ${className}`}
        {...props}
    />
);

const ModeTab = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
    >
        {icon}
        {label}
    </button>
);

const Switch = ({ checked, onChange }) => (
    <button onClick={onChange} className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${checked ? 'bg-blue-500' : 'bg-gray-700'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
);

const ActionButton = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="bg-[#1f2630] hover:bg-[#252d38] border border-gray-700 hover:border-gray-600 text-white py-6 rounded-xl flex flex-col items-center justify-center transition group">
        <div className="text-blue-500 group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-sm font-bold mt-2">{label}</span>
    </button>
);

export default DeviceDetails;
