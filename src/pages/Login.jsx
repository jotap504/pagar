import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Initialize user doc in Firestore
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: email,
                    devices: [],
                    createdAt: new Date().toISOString()
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/admin');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found') setError('Usuario no encontrado');
            else if (err.code === 'auth/wrong-password') setError('Contraseña incorrecta');
            else if (err.code === 'auth/email-already-in-use') setError('El email ya está registrado');
            else if (err.code === 'auth/weak-password') setError('La contraseña es muy débil');
            else setError('Error al autenticar: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#11161d] flex items-center justify-center px-4 font-sans">
            <div className="w-full max-w-md bg-[#1c222b] border border-gray-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-center mb-2 text-white">
                    {isRegistering ? 'Crear Cuenta' : 'Bienvenido de Nuevo'}
                </h2>
                <p className="text-gray-500 text-xs text-center mb-8 uppercase tracking-widest font-black">Panel de Gestión Pagar</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-xs text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#11161d] border border-gray-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-blue-500 transition placeholder:text-gray-700"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#11161d] border border-gray-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-blue-500 transition placeholder:text-gray-700"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20 text-sm uppercase tracking-widest mt-4 flex items-center justify-center gap-2"
                    >
                        {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                        {isRegistering ? 'Empezar ahora' : 'Ingresar al Panel'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-gray-500 hover:text-white text-xs transition font-bold"
                    >
                        {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Eres nuevo? Crea una cuenta gratis'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
