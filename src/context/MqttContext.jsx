import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';

const MqttContext = createContext();

export const useMqtt = () => useContext(MqttContext);

export const MqttProvider = ({ children }) => {
    const [client, setClient] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [messages, setMessages] = useState({});
    const clientRef = useRef(null);

    // Configuration
    // Try WSS (Secure WebSocket) which is less likely to be blocked than WS
    // Broker: broker.emqx.io
    // Port: 8084 (WSS)
    // Path: /mqtt
    const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

    const connect = (brokerUrl = BROKER_URL) => {
        if (clientRef.current?.connected) return;

        setStatus('connecting');
        console.log(`Connecting to MQTT broker at ${brokerUrl}...`);

        const mqttClient = mqtt.connect(brokerUrl, {
            clientId: `pagar_web_${Math.random().toString(16).substring(2, 8)}`,
            keepalive: 60,
        });

        mqttClient.on('connect', () => {
            console.log('MQTT Connected');
            setStatus('connected');
            clientRef.current = mqttClient;
            setClient(mqttClient);
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT Connection Error:', err);
            // setStatus('error');
        });

        mqttClient.on('close', () => {
            console.log('MQTT Disconnected');
            setStatus('disconnected');
            clientRef.current = null;
            setClient(null);
        });

        mqttClient.on('message', (topic, payload) => {
            const msg = payload.toString();
            // console.log(`Msg: ${topic} => ${msg}`);
            setMessages(prev => ({
                ...prev,
                [topic]: msg
            }));
        });
    };

    const publish = (topic, message) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish(topic, message);
            return true;
        }
        return false;
    };

    const subscribe = (topic) => {
        if (clientRef.current?.connected) {
            clientRef.current.subscribe(topic);
        }
    };

    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.end();
            }
        };
    }, []);

    return (
        <MqttContext.Provider value={{ client, status, connect, publish, subscribe, messages }}>
            {children}
        </MqttContext.Provider>
    );
};
