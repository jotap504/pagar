import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Gamepad2, Coffee, Clock, ShieldCheck, Wifi } from 'lucide-react';

const Landing = () => {
    return (
        <div className="bg-black text-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px]"></div>
                    <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px]"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-semibold tracking-wide uppercase mb-4 inline-block">
                                Tecnología IoT de Vanguardia
                            </span>
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4">
                                El Futuro de los <br />
                                <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                    Pagos Automatizados
                                </span>
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-gray-400 max-w-lg mx-auto md:mx-0"
                        >
                            Controla y monetiza tus máquinas expendedoras, arcades y sistemas de iluminación. Todo gestionado desde la nube con máxima seguridad.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                        >
                            <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                Comprar Ahora
                            </button>
                            <button className="px-8 py-4 bg-transparent border border-gray-700 text-white font-bold rounded-full hover:bg-white/5 transition text-lg">
                                Ver Demo
                            </button>
                        </motion.div>
                    </div>

                    {/* Product Visualization */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 flex justify-center relative"
                    >
                        <div className="relative w-80 h-96 lg:w-[400px] lg:h-[500px] bg-gray-900 rounded-[3rem] border-4 border-gray-800 shadow-2xl flex flex-col items-center p-6 transform rotate-[-5deg] hover:rotate-0 transition duration-500">
                            <div className="absolute top-4 w-20 h-1 bg-gray-800 rounded-full"></div>

                            {/* Screen Simulation */}
                            <div className="w-full h-[65%] bg-black rounded-2xl mb-6 relative overflow-hidden flex flex-col items-center justify-center border border-gray-800">
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
                                <div className="text-center z-10">
                                    <div className="bg-white p-2 rounded-lg mb-2 mx-auto w-24 h-24 flex items-center justify-center">
                                        <div className="bg-black w-full h-full grid grid-cols-5 gap-1 p-1 opacity-80">
                                            {/* Fake QR */}
                                            {[...Array(25)].map((_, i) => (
                                                <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'bg-current' : 'bg-transparent'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs font-mono text-blue-400">ESCANEA PARA PAGAR</p>
                                    <p className="text-2xl font-bold mt-2">$500.00</p>
                                </div>
                            </div>

                            {/* Controls Simulation */}
                            <div className="w-full h-[25%] bg-gray-800/50 rounded-xl p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                    <span>STATUS</span>
                                    <span className="text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> ONLINE</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-blue-500 rounded-full"></div>
                                </div>
                                <div className="mt-auto flex justify-between">
                                    <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-gray-950/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Versatilidad Sin Límites</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Nuestro sistema se adapta a cualquier dispositivo que requiera control de tiempo o activación por créditos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Gamepad2 size={32} className="text-purple-500" />}
                            title="Arcades y Juegos"
                            desc="Reemplaza los ficheteros tradicionales. Gestiona créditos, bonus y precios de forma remota."
                        />
                        <FeatureCard
                            icon={<Coffee size={32} className="text-amber-500" />}
                            title="Vending Machines"
                            desc="Compatible con máquinas de café, agua caliente y dispensers. Control preciso de pulsos."
                        />
                        <FeatureCard
                            icon={<Zap size={32} className="text-blue-500" />}
                            title="Canchas Deportivas"
                            desc="Automatiza la iluminación de canchas de pádel, tenis y fútbol con temporizadores exactos."
                        />
                    </div>
                </div>
            </section>

            {/* Tech Specs */}
            <section className="py-20">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl font-bold">Especificaciones Técnicas</h2>
                        <ul className="space-y-6">
                            <SpecItem icon={<Wifi />} title="Conectividad WiFi + MQTT" desc="Control total en tiempo real desde cualquier lugar del mundo." />
                            <SpecItem icon={<ShieldCheck />} title="Seguridad Bancaria" desc="Integración directa con Mercado Pago. Tokens encriptados." />
                            <SpecItem icon={<Clock />} title="Precisión Milimétrica" desc="Temporizadores ajustables al milisegundo para control de relés." />
                        </ul>
                    </div>

                    <div className="flex-1 bg-gray-900 rounded-3xl p-8 border border-gray-800">
                        <h3 className="text-2xl font-bold mb-6">Panel de Administración</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-black rounded-xl border border-gray-800">
                                <span className="text-gray-400">Dispositivo</span>
                                <span className="font-bold text-white">Arcade Central</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-black rounded-xl border border-gray-800">
                                <span className="text-gray-400">Recaudación (Hoy)</span>
                                <span className="font-bold text-green-400">$ 12,500</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-black rounded-xl border border-gray-800">
                                <span className="text-gray-400">Estado</span>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">OPERATIVO</span>
                            </div>
                            <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl text-center text-blue-400 text-sm mt-4">
                                Actualizar Firmware Remotamente
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section id="contact" className="py-20 bg-gradient-to-t from-blue-900/20 to-transparent">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">¿Listo para modernizar tu negocio?</h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Únete a la revolución de los pagos digitales. Sin monedas, sin problemas.</p>
                    <form className="max-w-md mx-auto flex flex-col gap-4">
                        <input type="email" placeholder="Tu correo electrónico" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition text-center" />
                        <button className="w-full px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition transform hover:scale-105">
                            Solicitar Información
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="bg-gray-900 p-8 rounded-3xl border border-gray-800 hover:border-blue-500/50 transition duration-300"
    >
        <div className="bg-gray-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
);

const SpecItem = ({ icon, title, desc }) => (
    <div className="flex gap-4">
        <div className="mt-1 text-blue-500 bg-blue-500/10 p-2 rounded-lg h-fit">
            {icon}
        </div>
        <div>
            <h4 className="text-xl font-bold mb-1">{title}</h4>
            <p className="text-gray-400">{desc}</p>
        </div>
    </div>
);

export default Landing;
