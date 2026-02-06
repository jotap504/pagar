import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogIn } from 'lucide-react';

const MainLayout = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    return (
        <div className={`min-h-screen font-sans selection:bg-green-100 flex flex-col ${isLogin ? 'bg-zinc-950 text-white' : 'bg-bg-light text-slate-800'}`}>
            <nav className={`fixed top-0 w-full z-50 border-b backdrop-blur-md transition-colors ${isLogin ? 'bg-zinc-950/80 border-white/10' : 'bg-white/80 border-slate-100'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-2">
                            {/* Use logo image with filter brightness-0 invert if on login for white logo */}
                            <img src={isLogin ? "/landing_assets/headernegrook.png" : "/landing_assets/headerblancook.png"} alt="Pag.ar" className="h-16 w-auto transition" />
                        </Link>
                        <div className={`hidden md:flex items-center space-x-8 text-sm font-medium ${isLogin ? 'text-slate-300' : 'text-slate-600'}`}>
                            <a href="#features" className="hover:text-primary transition-colors">Características</a>
                            <a href="#applications" className="hover:text-primary transition-colors">Aplicaciones</a>
                            <a href="#diy" className="hover:text-primary transition-colors">Instalación</a>
                            <a href="#contact" className="hover:text-primary transition-colors">Contacto</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm font-semibold ${isLogin ? 'border-white/20 hover:bg-white/10 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                                <span className="material-symbols-outlined text-lg">login</span>
                                Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow">
                <Outlet />
            </main>

            <footer className={`py-16 border-t ${isLogin ? 'bg-zinc-950 border-white/10' : 'bg-white border-slate-100'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex items-center gap-3">
                            <img src="/landing_assets/Plogoheader.png" alt="Pag.ar" className={`h-8 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition ${isLogin ? 'invert' : ''}`} />
                        </div>
                        <p className={`${isLogin ? 'text-slate-600' : 'text-slate-400'} text-sm`}>© {new Date().getFullYear()} Pagar IoT Solutions. Todos los derechos reservados.</p>
                        <div className="flex gap-6">
                            {/* Social icons can go here */}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
