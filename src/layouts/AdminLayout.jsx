import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="bg-[#11161d] min-h-screen">
            {/* We removed the Sidebar to let Dashboard handle the layout/nav internally as requested by the Mobile UI design */}
            <main className="w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
