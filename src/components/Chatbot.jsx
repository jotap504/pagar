import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';

const SYSTEM_PROMPT = `
Eres el Asistente Tecnico Oficial de Pag.ar (un dispositivo cobrador IoT con QR).
Tu objetivo es ayudar a los clientes a instalar y solucionar dudas sobre el modulo.
Responde de manera amable, directa, concisa y profesional. Usa emojis cuando sea adecuado.

INFORMACION DEL PRODUCTO (MANUAL):
- El hardware principal es un ESP32 o ESP32-S3.
- Funciona con Mercado Pago (genera QRs in situ en la pantallita TFT).
- Posee un Panel de Administracion Local por WiFi. Cuando el usuario lo enchufa y mantiene el boton configuracion (GPIO 0) por 5 segundos, la maquina crea un WiFi llamado "QR-Config". Ahi el usuario entra a 192.168.4.1 para configurarlo.
- Conexiones de Reles: Salidas por defecto son GPIO 7 y GPIO 15. Usan lógica de "Open Drain" (Pull-down hacia Ground). 
- Para modulos de reles de 5V inestables al arrancar (problema comun de micro-pulsos al encender), se OBLIGA al cliente a instalar 1) Dos resistencias de Pull-up de 10k desde el GPIO al pin de 3.3V, o 2) Usar un modulo I2C PCF8574 en los pines SDA=21, SCL=22.
- Para habilitar Split de Pagos (Marketplace), el usuario debe contactarnos para actualizar al Software v2.0 con backend en la nube (el v1.0 local estatico no lo soporta).
- Dudas de garantias o compras por mayor: "Por favor envianos un mensaje desde el formulario de Contacto de la web".

IMPORTANTE: Responde solo basandote en este manual. Si preguntan algo no relacionado con pagos, ESP32, reles o Pag.ar, diles amablemente que eres un bot tecnico de Pag.ar.
`;

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy el asistente técnico de Pag.ar 🤖. ¿En qué te puedo ayudar hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

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
            const apiMessages = [
                { role: 'system', content: SYSTEM_PROMPT },
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
                                placeholder="Escribe tu duda aquí..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-700"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-primary text-white p-2.5 rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-teal-500 shadow-sm"
                            >
                                <Send size={18} />
                            </button>
                        </form>
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
