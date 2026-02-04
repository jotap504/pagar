import React, { useState, useEffect } from 'react';
import { useMqtt } from '../context/MqttContext';
import { db, auth } from '../firebase';
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import { Shield, Cpu, Lock, CheckCircle, XCircle, Loader2, Plus } from 'lucide-react';

const ClaimDevice = ({ onClaimed }) => {
    const { publish, subscribe, messages } = useMqtt();
    const [step, setStep] = useState('input'); // input, verifying, success, error
    const [uid, setUid] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const claimResultTopic = `qrsolo/${uid?.toUpperCase()}/stat/status`;
    const claimResultMsg = messages[claimResultTopic];

    useEffect(() => {
        if (step === 'verifying' && claimResultMsg) {
            console.log('Claim Result Received:', claimResultMsg);
            if (claimResultMsg.includes('CLAIM_RESULT:OK')) {
                saveClaimToFirestore();
            } else if (claimResultMsg.includes('CLAIM_RESULT:ERROR')) {
                setStep('error');
                setErrorMsg('Contraseña incorrecta o el dispositivo no respondió.');
            }
        }
    }, [claimResultMsg, step]);

    const handleVerify = async () => {
        if (!uid || !password) {
            alert('Por favor, ingresa el ID y la Contraseña.');
            return;
        }

        const normalizedUid = uid.toUpperCase().trim();
        setUid(normalizedUid);
        setStep('verifying');
        setErrorMsg('');

        // Subscribe to result
        subscribe(`qrsolo/${normalizedUid}/stat/status`);

        // Send verification command
        setTimeout(() => {
            publish(`qrsolo/${normalizedUid}/cmnd/verify_claim`, JSON.stringify({ pass: password }));
        }, 500);

        // Timeout after 10s
        setTimeout(() => {
            if (step === 'verifying') {
                setStep('error');
                setErrorMsg('El dispositivo no responde. Asegúrate de que esté online.');
            }
        }, 10000);
    };

    const saveClaimToFirestore = async () => {
        try {
            // Check if user is logged in
            if (!auth.currentUser) {
                setStep('error');
                setErrorMsg('Debes iniciar sesión para vincular dispositivos.');
                return;
            }

            const userRef = doc(db, 'users', auth.currentUser.uid);
            const deviceMapRef = doc(db, 'devices', uid);

            // 1. Update user's device list
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                await updateDoc(userRef, {
                    devices: arrayUnion(uid)
                });
            } else {
                await setDoc(userRef, {
                    devices: [uid]
                });
            }

            // 2. Create reverse mapping for the Bridge
            await setDoc(deviceMapRef, {
                ownerId: auth.currentUser.uid,
                linkedAt: new Date().toISOString()
            }, { merge: true });

            setStep('success');
            if (onClaimed) onClaimed(uid);
        } catch (e) {
            console.error('Error saving claim:', e);
            setStep('error');
            setErrorMsg('Error al guardar en la nube.');
        }
    };

    if (step === 'input') {
        return (
            <div className="p-6 bg-[#1f2630] rounded-2xl border border-gray-800 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Plus size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Vincular Nuevo Equipo</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Claim Hardware</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 ml-1 uppercase">ID del Dispositivo (UID)</label>
                        <input
                            type="text"
                            className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
                            placeholder="Ej: 94254D9B4DC"
                            value={uid}
                            onChange={(e) => setUid(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 ml-1 uppercase">Contraseña de Administrador</label>
                        <input
                            type="password"
                            className="w-full bg-[#161b22] border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={handleVerify}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                    Verificar y Vincular
                </button>
            </div>
        );
    }

    if (step === 'verifying') {
        return (
            <div className="p-10 bg-[#1f2630] rounded-2xl border border-gray-800 text-center space-y-4">
                <Loader2 className="mx-auto text-blue-500 animate-spin" size={48} />
                <h3 className="font-bold text-white">Verificando...</h3>
                <p className="text-xs text-gray-500">Estamos hablando con tu placa para confirmar la contraseña. No cierres esta ventana.</p>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="p-10 bg-[#1f2630] rounded-2xl border border-green-500/30 text-center space-y-4 animate-in zoom-in-95">
                <CheckCircle className="mx-auto text-green-500" size={48} />
                <h3 className="font-bold text-white text-lg">¡Equipo Vinculado!</h3>
                <p className="text-xs text-gray-400">El dispositivo ahora es tuyo. Podrás ver sus ventas y configurarlo desde tu panel.</p>
                <button
                    onClick={() => setStep('input')}
                    className="mt-4 px-6 py-2 bg-green-500/10 text-green-500 rounded-full text-xs font-bold hover:bg-green-500/20 transition"
                >
                    Añadir Otro
                </button>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="p-10 bg-[#1f2630] rounded-2xl border border-red-500/30 text-center space-y-4">
                <XCircle className="mx-auto text-red-500" size={48} />
                <h3 className="font-bold text-white">Error de Vinculación</h3>
                <p className="text-xs text-red-400/80">{errorMsg}</p>
                <button
                    onClick={() => setStep('input')}
                    className="mt-4 px-6 py-2 bg-white/5 text-white rounded-full text-xs font-bold hover:bg-white/10 transition"
                >
                    Reintentar
                </button>
            </div>
        );
    }
};

export default ClaimDevice;
