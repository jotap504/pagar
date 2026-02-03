import React, { useEffect, useState } from 'react';
import { useMqtt } from '../context/MqttContext';
import { RefreshCw, Search, Power, Zap, Wifi, WifiOff, LayoutGrid, BarChart2, History, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { connect, status, subscribe, messages } = useMqtt();
    const [devices, setDevices] = useState({});

    useEffect(() => {
        if (status === 'disconnected') {
            connect();
        }
    }, [status, connect]);

    useEffect(() => {
        if (status === 'connected') {
            subscribe('qrsolo/+/stat/state');
        }
    }, [status, subscribe]);

    useEffect(() => {
        Object.keys(messages).forEach(topic => {
            if (topic.includes('/stat/state')) {
                const parts = topic.split('/');
                const uid = parts[1];
                try {
                    const payload = JSON.parse(messages[topic]);
                    setDevices(prev => ({
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
    }, [messages]);

    const devicesList = Object.entries(devices);

    return (
        <div className="min-h-screen bg-[#11161d] text-white font-sans pb-24">
            {/* Top Bar */}
            <div className="p-6 flex justify-between items-center bg-[#11161d]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <LayoutGrid size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">MQTT Admin</h1>
                        <p className="text-xs text-gray-500">ESP32-S3 Network</p>
                    </div>
                </div>
                <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-red-500 absolute top-0 right-0 border-2 border-[#11161d]"></div>
                    <div className="bg-[#1f2630] p-2 rounded-full">
                        <span className="sr-only">Notifications</span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                </div>
            </div>

            <div className="px-6 space-y-6 max-w-[1600px] mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#1f2630] rounded-2xl p-5 border border-gray-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-blue-500 opacity-20"><Wifi size={48} /></div>
                        <p className="text-gray-400 text-xs font-medium mb-1">Dispositivos Activos</p>
                        <div className="flex items-baseline gap-1">
                            <h2 className="text-2xl font-bold text-white">{devicesList.length}</h2>
                            <span className="text-xs text-gray-500">/ 26</span>
                        </div>
                        <p className="text-[10px] text-green-400 mt-2 font-bold">+2% estabilidad</p>
                    </div>
                    <div className="bg-[#1f2630] rounded-2xl p-5 border border-gray-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-green-500 opacity-20"><Zap size={48} /></div>
                        <p className="text-gray-400 text-xs font-medium mb-1">Recaudación Diaria</p>
                        <h2 className="text-2xl font-bold text-white">$1,240.50</h2>
                        <p className="text-[10px] text-green-400 mt-2 font-bold">+5.4% mes anterior</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search machine or ID..."
                            className="w-full bg-[#1f2630] border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-gray-600 shadow-inner"
                        />
                    </div>

                    <div className="flex gap-2 text-xs font-medium overflow-x-auto pb-2 scrollbar-hide">
                        <button className="px-5 py-2 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25 whitespace-nowrap">All</button>
                        <button className="px-5 py-2 rounded-full bg-[#1f2630] text-gray-400 border border-gray-700 hover:border-gray-500 whitespace-nowrap">Online ({devicesList.length})</button>
                        <button className="px-5 py-2 rounded-full bg-[#1f2630] text-gray-400 border border-gray-700 hover:border-gray-500 whitespace-nowrap">Offline (2)</button>
                        <button className="px-5 py-2 rounded-full bg-[#1f2630] text-gray-400 border border-gray-700 hover:border-gray-500 whitespace-nowrap">Arcade</button>
                    </div>
                </div>

                {/* Device List */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Connected Devices</h3>
                        <span className="text-[10px] px-2 py-1 bg-[#1f2630] rounded text-blue-400 font-mono">Sync: 10:42 AM</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {devicesList.map(([uid, data]) => (
                            <DeviceListItem key={uid} uid={uid} data={data} isOnline={(Date.now() / 1000) - data.timestamp < 60} />
                        ))}

                        {/* Simulated/Demo items to fill the UI if empty */}
                        {devicesList.length === 0 && (
                            <>
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 p-8 text-center border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 text-sm">
                                    Esperando conexión MQTT...
                                    <br />
                                    <span className="text-xs text-blue-500 mt-2 block animate-pulse">Intentando conectar a {status}...</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation (Sticky) */}
            <div className="fixed bottom-0 left-0 w-full bg-[#11161d]/95 backdrop-blur-lg border-t border-gray-800 flex justify-around p-4 z-50">
                <NavItem icon={<LayoutGrid size={24} />} label="Dashboard" active />
                <NavItem icon={<BarChart2 size={24} />} label="Analytics" />
                <NavItem icon={<History size={24} />} label="Logs" />
                <NavItem icon={<Settings size={24} />} label="Settings" />
            </div>
        </div>
    );
};

const DeviceListItem = ({ uid, data, isOnline }) => (
    <div className="bg-[#1f2630] rounded-2xl p-4 border border-gray-800 flex items-center gap-4 hover:border-gray-700 transition shadow-sm group">
        <div className="w-12 h-12 rounded-xl bg-[#161b22] flex items-center justify-center relative">
            <Zap className="text-blue-500" size={20} />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1f2630] ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>

        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm truncate">{data.devName || `Device ${uid}`}</h4>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-500 font-mono uppercase">ID: ESP-S3-{uid.slice(-4)}</span>
                <span className="text-[10px] bg-[#161b22] px-1.5 py-0.5 rounded text-gray-400">v1.0.4</span>
            </div>
        </div>

        <Link to={`/admin/device/${uid}`} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition active:scale-95">
            Control
        </Link>
    </div>
);

const NavItem = ({ icon, label, active }) => (
    <button className={`flex flex-col items-center gap-1 ${active ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default Dashboard;
