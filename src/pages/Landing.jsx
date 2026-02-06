import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="bg-bg-light font-sans selection:bg-green-100 min-h-screen">
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-0 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-green-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="flex flex-col items-center text-center space-y-8 max-w-xl mx-auto lg:mx-0 lg:max-w-none lg:w-full">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100/50 border border-green-200 text-green-800 text-xs font-bold uppercase tracking-widest w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                                </span>
                                Revolución IoT en Pagos
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                                El Futuro de los <br />
                                <span className="text-gradient italic pr-2">Cobros Automáticos</span>
                            </h1>
                            <p className="text-lg lg:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
                                Transforma cualquier máquina en un punto de venta inteligente. Compatible con Mercado Pago. Sin técnicos, sin complicaciones.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <a href="#contact" className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4 hover:scale-105 transition-transform duration-300 group cursor-pointer">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                        <span className="material-symbols-outlined text-primary">rocket_launch</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Empieza Ahora</div>
                                        <div className="font-bold text-slate-800 text-lg">Quiero Modernizarme</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-100/40 to-blue-50/40 rounded-[3rem] -rotate-3"></div>
                            <div className="relative w-full h-full p-4 lg:p-0">
                                {/* Using the user's high-quality QR image for the hero */}
                                <img src="/landing_assets/qr1.png" alt="Hardware Pag.ar" className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />

                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white p-5 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4 whitespace-nowrap">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                                        <span className="material-symbols-outlined">qr_code_scanner</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estado del Sistema</div>
                                        <div className="font-bold text-slate-800">Online & Listo</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Un Sistema, Múltiples Soluciones</h2>
                        <p className="text-slate-500 text-lg">Adaptable a cualquier tipo de negocio automatizado.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        {/* Credits Mode */}
                        <div className="p-10 rounded-4xl bg-slate-50 border border-slate-100 hover:border-green-200 transition-all group hover:-translate-y-2 hover:shadow-lg">
                            <div className="w-16 h-16 bg-blue-100/50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <span className="material-symbols-outlined text-3xl">videogame_asset</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">Modo Créditos</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Ideal para Arcades, Peluches y Videojuegos. Reemplaza las fichas físicas. El cliente escanea, paga y la máquina recibe los créditos automáticamente.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase text-slate-500 tracking-wider">Salones Arcade</span>
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase text-slate-500 tracking-wider">Peluches</span>
                            </div>
                        </div>

                        {/* Time Mode */}
                        <div className="p-10 rounded-4xl bg-slate-50 border border-slate-100 hover:border-green-200 transition-all group hover:-translate-y-2 hover:shadow-lg">
                            <div className="w-16 h-16 bg-green-100/50 text-green-700 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-700 group-hover:text-white transition-all">
                                <span className="material-symbols-outlined text-3xl">timer</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">Modo Tiempo</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Perfecto para Canchas de fútbol, Duchas en campings e Iluminación de canchas de tenis. Cobra por minutos de uso.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase text-slate-500 tracking-wider">Canchas</span>
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase text-slate-500 tracking-wider">Duchas</span>
                            </div>
                        </div>

                        {/* Static QR */}
                        <div className="p-10 rounded-4xl bg-slate-50 border border-slate-100 hover:border-green-200 transition-all group hover:-translate-y-2 hover:shadow-lg">
                            <div className="w-16 h-16 bg-amber-100/50 text-amber-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                <span className="material-symbols-outlined text-3xl">qr_code</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">Qr Estático</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Vending Machines y Dispensers de agua. Pago único por producto. Configuración simple para ventas directas sin hardware complejo.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase text-slate-500 tracking-wider">Vending</span>
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase text-slate-500 tracking-wider">Dispensers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* APPLICATIONS SECTION */}
            <section id="applications" className="py-32 bg-bg-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-[0.2em]">Escalabilidad</div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900">Donde sea que necesites cobrar.</h2>
                            <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
                                Nuestra tecnología IoT permite integrar cobros digitales en segundos. Olvida el manejo de efectivo y las llaves de recaudación.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 shrink-0 bg-white shadow-sm rounded-xl flex items-center justify-center text-primary border border-slate-100">
                                        <span className="material-symbols-outlined text-2xl">coffee</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Cafeteras</h4>
                                        <p className="text-sm text-slate-500">Expendedoras automáticas de café.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 shrink-0 bg-white shadow-sm rounded-xl flex items-center justify-center text-primary border border-slate-100">
                                        <span className="material-symbols-outlined text-2xl">local_drink</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Agua Caliente</h4>
                                        <p className="text-sm text-slate-500">Dispensers para estaciones de servicio.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative flex flex-col gap-8">
                            <div className="w-full">
                                {/* Ideally use relevant images here, keeping placeholders from the template until user provides app-specific ones */}
                                <img src="/landing_assets/qr1.png" alt="Máquina de café vending lifestyle" className="rounded-4xl shadow-2xl w-full h-[300px] object-cover border-4 border-white object-top" />
                            </div>
                            <div className="w-full">
                                <img src="/landing_assets/qr2.png" alt="Arcade cabinet lifestyle" className="rounded-4xl shadow-2xl w-full h-[300px] object-cover border-4 border-white object-top" />
                            </div>
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-green-50 blur-[100px] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>


            {/* CONFIGURATION MODE SECTION */}
            <section className="py-32 bg-white override-clip">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Text Content */}
                        <div className="order-2 lg:order-1">
                            <span className="text-primary font-bold tracking-[0.25em] uppercase text-xs mb-6 block">Totalmente Personalizable</span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-slate-900 leading-[1.1]">
                                Modo de <br />
                                <span className="text-gradient">Configuración</span>
                            </h2>
                            <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                                Diferénciate de la competencia adaptando el sistema a tu marca. Accede a un panel de configuración exclusivo donde podrás ajustar cada detalle de la experiencia de usuario.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                        <span className="material-symbols-outlined">campaign</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Modo Publicidad</h4>
                                        <p className="text-sm text-slate-500">Sube tus propias imágenes promocionales. Cuando la máquina está inactiva, estas rotarán automáticamente para captar la atención de tus clientes.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
                                        <span className="material-symbols-outlined">encrypted</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Integración Mercado Pago</h4>
                                        <p className="text-sm text-slate-500">Vincula tu cuenta de forma 100% segura. Solo subes tu Access Token encriptado y el dispositivo se enlaza al instante sin compartir claves.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                                        <span className="material-symbols-outlined">tune</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Control Total</h4>
                                        <p className="text-sm text-slate-500">Define precios, tiempos y modos de operación en tiempo real.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Images - Single Cielu3 */}
                        <div className="order-1 lg:order-2 flex items-center justify-center bg-slate-50 rounded-[3rem] p-8">
                            <img src="/landing_assets/celu3.png" alt="Configuración Avanzada" className="w-full max-w-[280px] lg:max-w-xs object-contain shadow-2xl rounded-3xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* DIY SECTION */}
            <section id="diy" className="py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                        <div className="flex flex-col justify-center">
                            <span className="text-primary font-bold tracking-[0.25em] uppercase text-xs mb-6 block">DIY - DO IT YOURSELF</span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 text-slate-900 leading-[1.1]">Sin Técnicos.<br />Lo instalas tú mismo.</h2>
                            <p className="text-slate-500 mb-10 text-lg leading-relaxed max-w-lg">
                                Diseñamos Pag.ar pensando en la simplicidad. Solo necesitas conectar 2 cables. Si sabes enchufar una lámpara, sabes instalar nuestro sistema.
                            </p>
                            <div className="grid grid-cols-1 gap-5 mb-12">
                                <FeatureCheck text="Instrucciones paso a paso en video." />
                                <FeatureCheck text="Manual de usuario en PDF detallado." />
                                <FeatureCheck text="Soporte técnico por WhatsApp directo." />
                                <FeatureCheck text="No requiere configuración compleja de red." />
                            </div>
                            <a href="#" className="inline-flex items-center gap-3 font-bold text-primary hover:text-green-800 transition-colors group text-lg">
                                Ver video de instalación
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InfoCard icon="wifi" title="WiFi Nativo" desc="Se conecta a la red de tu local fácilmente desde tu celular o notebook con wifi." />
                            <InfoCard icon="phonelink_setup" title="App Cloud" desc="Gestiona precios y ve estadísticas desde tu celular." />
                            <InfoCard icon="security" title="Seguro" desc="Tokens encriptados y HTTPS para todas las transacciones." />
                            <InfoCard icon="bolt" title="Relé 10A" desc="Soporta cargas directas de hasta 10 Amperes." />
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section id="contact" className="py-32 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">¿Listo para escalar tu negocio?</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Deja de perder ventas por no tener cambio. Empieza a aceptar Mercado Pago hoy mismo.</p>
                    </div>
                    <form className="bg-white border border-slate-100 p-8 md:p-16 rounded-[3rem] soft-shadow space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 ml-1">Tu Nombre</label>
                                <input type="text" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-300" placeholder="Ej: Juan Pérez" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 ml-1">WhatsApp</label>
                                <input type="tel" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-300" placeholder="+54 9 11 ..." />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">Correo Electrónico</label>
                            <input type="email" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-300" placeholder="hola@ejemplo.com" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">Cuéntanos sobre tu proyecto</label>
                            <textarea rows="4" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-300" placeholder="Arcade, Canchas, Vending..."></textarea>
                        </div>
                        <button type="submit" className="w-full bg-primary hover:bg-green-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-green-900/10 transition-all hover:scale-[1.01] active:scale-95 text-lg">
                            Solicitar Asesoramiento Gratuito
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

const FeatureCheck = ({ text }) => (
    <div className="flex items-center gap-4 text-slate-700 font-medium">
        <span className="material-symbols-outlined text-green-600 bg-green-100 rounded-full p-1 text-base">check</span>
        {text}
    </div>
);

const InfoCard = ({ icon, title, desc }) => (
    <div className="bg-white p-8 rounded-4xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary mb-6">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h4 className="font-bold text-slate-900 mb-3 text-lg">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

export default Landing;
