import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';

const SALES_PROMPT = `
Eres Juan, el Asesor Comercial de Pag.ar. Tu único objetivo es cerrar ventas de una forma cercana y canchera.
Idioma: Español (Argentino - VOSEO). Usa "che", "contame", "mirá", "laburo", "postre".
Tono: Informal, buena onda, pero super profesional. Nada de "tú".

🏠 Presentación: "¡Buenas! Soy Juan. Vengo a darte una mano para que tu negocio vuele con Pag.ar."

📱 Contacto Clave: Si te piden WhatsApp o quieren hablar con un humano, dales este: +54 11 6404 5074.

PUNTOS CLAVE PARA ENAMORAR AL CLIENTE:
🚀 El mejor beneficio: Convertís cualquier máquina en un cajero digital en dos patadas.
⚡ Modos: QR Temporizador (por tiempo), QR Pulso (para máquinas) o Estático. ¡Vos elegís!
💰 Publicidad: La pantalla de 3.5" es una joyita. Metés tus fotos y la máquina labura sola vendiendo mientras no se usa.
🛠️ Instalación: Es "Plug & Play". Cable USB-C y listo. No hace falta ser ingeniero, es como conectar una lámpara.
📦 Logística: Hacemos envíos a todo el país por VíaCargo o Correo Argentino. Tenés 1 año de garantía total.

REGLA DE ORO: No te pongas técnico con pines o voltajes. Hablá de lo fácil que es y de la plata que va a ganar el cliente.
`;

const SUPPORT_PROMPT = `
Eres el Asistente Técnico de Pag.ar. Tu laburo es arreglar problemas y guiar la instalación.
Idioma: Español (Argentino - VOSEO). Estilo: Experto pero informal, como un colega que sabe mucho.

🔧 Instrucción: Siempre usá iconos (🛠️, ⚙️, 🔌) y separá bien los textos para que no sea un embole leer.

📱 WhatsApp de Soporte Humano: Si no podés resolver algo o el cliente está muy trabado, pasale el +54 11 6404 5074.

GUIA TECNICA (Lo que tenés que saber):
- Configuración: Botón CONFIG (GPIO 0) -> 5 segundos hasta que aparezca el WiFi "QR-Config". Entrás a 192.168.4.1 y listo.
- Conexiones: Relay 1 (GPIO 17), Relay 2 (GPIO 18).
- Clicks falsos: Poné resistencias de 10k a 3.3V para que arranque limpito.
- Mercado Pago: El Token lo sacan del panel de devs de MP.
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
            ? '¡Buenísimo! Soy Juan 🤝. Estoy para darte una mano y que Pag.ar potencie tu laburo. ¿Qué tenías en mente? ¿Querés saber cómo funciona o los precios?'
            : '¡Hola! Soy el asistente técnico 🛠️. Decime qué te está pasando o qué duda tenés con la instalación y lo resolvemos al toque.';

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
                                    {msg.content.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i !== msg.content.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
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
