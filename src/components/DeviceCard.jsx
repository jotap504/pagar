import React from 'react';
import { Wifi, WifiOff, Clock, Smartphone, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const DeviceCard = ({ uid, data }) => {
    const isOnline = (Date.now() / 1000) - data.timestamp < 60; // Consider offline if no update in 60s

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/30 transition shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">{data.name || `Device ${uid}`}</h3>
                    <p className="text-xs text-gray-500 font-mono">ID: {uid}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/40 p-3 rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Modo</p>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        {data.mode === 0 ? <Clock size={16} className="text-blue-400" /> : <Smartphone size={16} className="text-purple-400" />}
                        {data.mode === 0 ? 'Tiempo' : 'Crédito'}
                    </div>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">RSSI</p>
                    <p className="text-sm font-semibold">{data.rssi || '-'} dBm</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-xs text-gray-600">
                    Uptime: {Math.floor((data.uptime || 0) / 3600)}h
                </div>
                <Link
                    to={`/admin/device/${uid}`}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
                >
                    <SettingsIcon size={18} />
                </Link>
            </div>
        </div>
    );
};

export default DeviceCard;
