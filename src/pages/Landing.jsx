import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Gamepad2, Coffee, Clock, ShieldCheck, Wifi, ChevronDown, CheckCircle2, PlayCircle, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const [activeMode, setActiveMode] = useState(0);

    const modes = [
        {
            id: 0,
            title: "Modo Créditos",
            icon: <Gamepad2 size={24} />,
            desc: "Ideal para Arcades, Peluches y Videojuegos.",
            details: "Reemplaza las fichas físicas. El cliente escanea, paga y la máquina recibe los créditos automáticamente.",
            image: "/landing_assets/1770395618004.png", // QR Code Screen
            color: "from-purple-600 to-blue-600",
            applications: ["Salones de Arcade", "Máquinas de Peluche (Grua)", "Kiddie Rides"]
        },
        {
            id: 1,
            title: "Modo Tiempo",
            icon: <Clock size={24} />,
            desc: "Perfecto para Canchas, Duchas e Iluminación.",
            details: "Cobra por minuto o fracción. El usuario elige cuánto tiempo quiere y el sistema activa el relé exactamente ese tiempo.",
            image: "/landing_assets/1770395561475.png", // Keypad Screen
            color: "from-blue-500 to-cyan-400",
            applications: ["Canchas de Padel/Tenis", "Duchas en Campings", "Sillones Masajeadores", "Aspiradoras de Autos"]
        },
        {
            id: 2,
            title: "Qr Estático",
            icon: <Coffee size={24} />,
            desc: "Vending Machines y Dispensers.",
            details: "Un precio fijo para un producto o servicio instantáneo. Rápido y sin fricción.",
            image: "/landing_assets/pagar480x320.png",
            color: "from-orange-500 to-red-500",
            applications: ["Dispensers de Agua Caliente", "Vending de Productos", "Molinetes de Acceso"]
        }
    ];


    return (
        <div className="bg-black text-white overflow-hidden font-sans">

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <img src="/landing_assets/logosinfondo.png" alt="Pag.ar Logo" className="h-32 md:h-48 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
                    >
                        El Futuro de los <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                            Cobros Automáticos
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-400 max-w-2xl mb-10"
                    >
                        Transforma cualquier máquina en un punto de venta inteligente.
                        Compatible con Mercado Pago. Sin técnicos, sin complicaciones.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <a href="#contact" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition transform hover:scale-105 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
                            <Zap size={20} />
                            Quiero Modernizarme
                        </a>
                        <Link to="/login" className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-full transition backdrop-blur-sm flex items-center justify-center gap-2">
                            <Smartphone size={20} />
                            Ir al Panel
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
                >
                    <ChevronDown size={32} />
                </motion.div>
            </section>

            {/* MODES CAROUSEL SECTION */}
            <section className="py-24 bg-zinc-950 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Un Sistema, Múltiples Soluciones</h2>
                        <p className="text-gray-400">Adaptable a cualquier tipo de negocio automatizado.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Mode Selection */}
                        <div className="space-y-4">
                            {modes.map((mode, index) => (
                                <motion.div
                                    key={mode.id}
                                    onClick={() => setActiveMode(index)}
                                    className={`p-6 rounded-2xl cursor-pointer border transition-all duration-300 ${activeMode === index ? 'bg-white/10 border-blue-500/50 scale-105 shadow-xl' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                                    whileHover={{ x: 10 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${mode.color} text-white shadow-lg`}>
                                            {mode.icon}
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-bold ${activeMode === index ? 'text-white' : 'text-gray-400'}`}>{mode.title}</h3>
                                            <p className="text-sm text-gray-500">{mode.desc}</p>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {activeMode === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 mt-2 border-t border-white/10">
                                                    <p className="text-gray-300 mb-3 text-sm leading-relaxed">{mode.details}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {mode.applications.map((app, i) => (
                                                            <span key={i} className="text-xs bg-black/50 px-2 py-1 rounded text-gray-400 border border-gray-800">{app}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>

                        {/* Right: Device Visualization */}
                        <div className="relative h-[600px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeMode}
                                    initial={{ opacity: 0, y: 50, rotate: -5 }}
                                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                                    exit={{ opacity: 0, y: -50, rotate: 5 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative z-10"
                                >
                                    {/* Clean Image Display */}
                                    <motion.img
                                        src={modes[activeMode].image}
                                        alt={modes[activeMode].title}
                                        className="w-full max-w-lg rounded-2xl shadow-2xl border border-white/10"
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Background Glow */}
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br ${modes[activeMode].color} blur-[150px] opacity-20 transition-all duration-700`}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES "AUTOINSTALABLE" SECTION */}
            <section className="py-24 bg-black relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <span className="text-green-400 font-bold tracking-widest uppercase text-sm border border-green-400/30 px-3 py-1 rounded-full">DIY - Do It Yourself</span>
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                Sin Técnicos.<br />
                                <span className="text-white">Lo instalas tú mismo.</span>
                            </h2>
                            <p className="text-xl text-gray-400">
                                Diseñamos Pag.ar pensando en la simplicidad. Solo necesitas conectar 2 cables. Si sabes enchufar una lámpara, sabes instalar nuestro sistema.
                            </p>

                            <ul className="space-y-4">
                                <FeatureItem text="Instrucciones paso a paso en video." />
                                <FeatureItem text="Manual de usuario en PDF detallado." />
                                <FeatureItem text="Soporte técnico por WhatsApp directo." />
                                <FeatureItem text="No requiere configuración compleja de red." />
                            </ul>

                            <button className="flex items-center gap-3 text-white border-b border-white pb-1 hover:text-blue-400 hover:border-blue-400 transition group">
                                <PlayCircle size={20} />
                                Ver video de instalación
                                <span className="group-hover:translate-x-1 transition">→</span>
                            </button>
                        </div>
                        <div className="flex-1 relative">
                            <div className="relative z-10 grid grid-cols-2 gap-4">
                                <div className="space-y-4 mt-8">
                                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 transform hover:-translate-y-2 transition duration-300">
                                        <Wifi className="text-blue-500 mb-4" size={32} />
                                        <h4 className="font-bold text-lg">WiFi Nativo</h4>
                                        <p className="text-sm text-gray-500">Se conecta a la red de tu local automáticamente.</p>
                                    </div>
                                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 transform hover:-translate-y-2 transition duration-300">
                                        <ShieldCheck className="text-green-500 mb-4" size={32} />
                                        <h4 className="font-bold text-lg">Seguro</h4>
                                        <p className="text-sm text-gray-500">Tokens encriptados y HTTPS para todas las transacciones.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 transform hover:-translate-y-2 transition duration-300">
                                        <Smartphone className="text-purple-500 mb-4" size={32} />
                                        <h4 className="font-bold text-lg">App Cloud</h4>
                                        <p className="text-sm text-gray-500">Gestiona precios y ve estadísticas desde tu celular.</p>
                                    </div>
                                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 transform hover:-translate-y-2 transition duration-300">
                                        <Zap className="text-amber-500 mb-4" size={32} />
                                        <h4 className="font-bold text-lg">Relé 10A</h4>
                                        <p className="text-sm text-gray-500">Soporta cargas directas de hasta 10 Amperes.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-900/10 blur-[100px] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA / CONTACT */}
            <section id="contact" className="py-24 bg-gradient-to-t from-blue-900/20 to-black">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <img src="/landing_assets/pagarlogo.png" alt="Logo" className="h-16 mx-auto mb-8 opacity-50 grayscale hover:grayscale-0 transition duration-500" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">¿Listo para escalar tu negocio?</h2>
                    <p className="text-xl text-gray-400 mb-10">
                        Deja de perder ventas por no tener cambio. Empieza a aceptar Mercado Pago hoy mismo.
                    </p>

                    <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10">
                        <form className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Tu Nombre" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                                <input type="tel" placeholder="WhatsApp" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                            </div>
                            <input type="email" placeholder="Correo Electrónico" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                            <textarea placeholder="Cuéntanos sobre tu proyecto (Arcade, Canchas, Vending...)" rows="3" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"></textarea>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition transform hover:scale-[1.02]">
                                Solicitar Asesoramiento Gratuito
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureItem = ({ text }) => (
    <li className="flex items-start gap-3">
        <CheckCircle2 className="text-green-400 shrink-0 mt-1" size={18} />
        <span className="text-gray-300">{text}</span>
    </li>
);

export default Landing;
