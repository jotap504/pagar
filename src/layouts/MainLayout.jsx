import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart, LogIn } from 'lucide-react';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Pagar
                    </Link>

                    <nav className="hidden md:flex gap-6 items-center">
                        <a href="#features" className="hover:text-blue-400 transition">Características</a>
                        <a href="#applications" className="hover:text-blue-400 transition">Aplicaciones</a>
                        <a href="#contact" className="hover:text-blue-400 transition">Contacto</a>
                    </nav>

                    <div className="flex gap-4 items-center">
                        <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition text-sm">
                            <LogIn size={16} />
                            Admin
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow pt-16">
                <Outlet />
            </main>

            <footer className="border-t border-white/10 py-8 bg-black">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Pagar IoT Solutions. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
