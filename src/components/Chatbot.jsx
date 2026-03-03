import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';

const SALES_PROMPT = `
Eres el Asesor Comercial Senior de Pag.ar. Tu único objetivo es cerrar ventas y demostrar el valor del producto.
Idioma: Español (Argentina/Latam). Estilo: Persuasiro, profesional, entusiasta.

PUNTOS CLAVE DE VENTA:
- Beneficio: Transforma cualquier máquina en un punto de cobro digital en minutos.
- Versatilidad: 3 modos (Temporizador para tiempo, Pulso para servicios, Estático para cobros base).
- Ingresos Extra: Pantalla de 3.5" para publicidad (sube tus banners y genera más dinero).
- Instalación: "Plug & Play". Se alimenta por USB-C y se conecta como una tecla de luz. No necesitás ser técnico.
- Garantía y Envíos: 1 año de garantía oficial. Envíos a todo el país (VíaCargo/Correo Argentino).
- Escalamiento: Si el cliente pregunta por manejar muchos locales o comisiones divididas, menciona que tenemos el "Sistema de Franquicias v2.0" y que deje su contacto para una asesoría personalizada.

REGLA DE ORO: NO menciones tecnicismos como números de pines (GPIO), protocolos I2C, o resistencias, a menos que el cliente sea muy insistente. Enfócate en la facilidad de uso y rentabilidad.
`;

const SUPPORT_PROMPT = `
Eres el Asistente Tecnico Oficial de Pag.ar. Tu objetivo es la resolucion de problemas y guia de instalacion.
Estilo: Preciso, servicial, experto.

GUIA TECNICA (FAQs):
- Configuracion: Mantener GPIO 0 por 5 seg -> WiFi "QR-Config" -> 192.168.4.1.
- Pines: Relay 1 (GPIO 17), Relay 2 (GPIO 18).
- Solucion Glitch/Micro-pulso: Pull-ups de 10k a 3.3V, Transistor BC337 o Modulo I2C PCF8574.
- Mercado Pago: El token se obtiene en el panel de desarrolladores de MP. 
- Medidas Publicidad: 480x320px. 
`;

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState(null); // 'sales' | 'support' | null
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { role: 'assistant', content: '¡Hola! Bienvenido a Pag.ar 🤖. Para ayudarte mejor, ¿con quién te gustaría hablar?' }
            ]);
        }
    }, []);

    const selectMode = (m) => {
        setMode(m);
        const choiceText = m === 'sales' ? 'Hablar con un Asesor Comercial' : 'Hablar con Soporte Técnico';
        const responseText = m === 'sales'
            ? '¡Excelente! Soy tu asesor comercial. Estoy aquí para contarte cómo Pag.ar puede potenciar tu negocio. ¿Qué te gustaría saber?'
            : 'Entendido. Soy el asistente técnico. Estoy listo para ayudarte con la instalación o configuración de tu equipo. ¿Qué problema o duda tienes?';

        setMessages(prev => [
            ...prev,
            { role: 'user', content: choiceText },
            { role: 'assistant', content: responseText }
        ]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e?.preventDefault();

        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Add User message
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Check API Key
            const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

            if (!apiKey) {
                throw new Error("API Key no configurada. (VITE_DEEPSEEK_API_KEY)");
            }

            // Build payload for DeepSeek API (OpenAI compatible API)
            const currentSystemPrompt = mode === 'sales' ? SALES_PROMPT : SUPPORT_PROMPT;
            const apiMessages = [
                { role: 'system', content: currentSystemPrompt },
                ...newMessages.map(m => ({ role: m.role, content: m.content }))
            ];

            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat', // DeepSeek-V3
                    messages: apiMessages,
                    temperature: 0.3, // Low temp for technical accuracy
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || "Error en la comunicacion con el servidor.");
            }

            const data = await response.json();
            const assistantResponse = data.choices[0].message.content;

            setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error.message}. Por favor intenta de nuevo más tarde.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">

                    {/* Header */}
                    <div className="bg-primary px-4 py-3 pb-8 text-white flex justify-between items-center bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm relative">
                        <div className="flex items-center gap-2">
                            <Bot size={24} />
                            <div>
                                <h3 className="font-semibold leading-tight">Soporte Pag.ar</h3>
                                <p className="text-emerald-100 text-xs text-left">Respuestas instantáneas (IA)</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors absolute top-2 right-2"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative top-[-1rem] rounded-t-2xl border-t border-slate-100">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-primary text-white bg-teal-500 rounded-br-none'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                                        }`}
                                >
                                    {/* Simple markdown parsing for bold text just rendering plain for now */}
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Mode Selection Buttons */}
                        {!mode && !isLoading && (
                            <div className="flex flex-col gap-2 p-2 animate-in fade-in zoom-in duration-300">
                                <button
                                    onClick={() => selectMode('sales')}
                                    className="bg-white border-2 border-primary text-teal-600 font-medium py-3 px-4 rounded-xl hover:bg-teal-50 transition-all text-sm shadow-sm flex items-center justify-between group"
                                >
                                    <span>Asesor Comercial</span>
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">payments</span>
                                </button>
                                <button
                                    onClick={() => selectMode('support')}
                                    className="bg-white border-2 border-primary text-teal-600 font-medium py-3 px-4 rounded-xl hover:bg-teal-50 transition-all text-sm shadow-sm flex items-center justify-between group"
                                >
                                    <span>Soporte Técnico</span>
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">build</span>
                                </button>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 text-slate-400 shadow-sm flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span className="text-xs">Escribiendo...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={mode ? "Escribe tu duda..." : "Selecciona una opción arriba"}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-700"
                                disabled={isLoading || !mode}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading || !mode}
                                className="bg-primary text-white p-2.5 rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-teal-500 shadow-sm"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                        {mode && (
                            <button
                                onClick={() => { setMode(null); setMessages([{ role: 'assistant', content: '¡Hola! ¿Con quién te gustaría hablar ahora?' }]); }}
                                className="w-full text-[10px] text-slate-400 mt-2 hover:text-primary transition-colors uppercase tracking-widest font-bold"
                            >
                                ← Volver al menú principal
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary hover:bg-teal-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 flex items-center justify-center bg-teal-500"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
};

export default Chatbot;
