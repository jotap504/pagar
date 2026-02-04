import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    signInAnonymously
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (e) {
            console.error('Login error:', e);
            return false;
        }
    };

    const loginAnonymously = async () => {
        try {
            await signInAnonymously(auth);
            return true;
        } catch (e) {
            console.error('Anon login error:', e);
            return false;
        }
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, login, loginAnonymously, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
