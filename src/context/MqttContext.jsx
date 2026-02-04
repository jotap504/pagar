import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import mqtt from 'mqtt';

const MqttContext = createContext();

export const useMqtt = () => useContext(MqttContext);

export const MqttProvider = ({ children }) => {
    const [client, setClient] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [messages, setMessages] = useState({});
    const clientRef = useRef(null);
    const connectionInProgressRef = useRef(false);

    // Configuration HiveMQ Cloud
    // URL: ea2b35fec63e49deb5d3683f11b750b0.s1.eu.hivemq.cloud
    // Port: 8884 (WSS)
    // Path: /mqtt
    const BROKER_URL = 'wss://ea2b35fec63e49deb5d3683f11b750b0.s1.eu.hivemq.cloud:8884/mqtt';

    const connect = useCallback((brokerUrl = BROKER_URL) => {
        if (clientRef.current?.connected || connectionInProgressRef.current) {
            console.log('MQTT: Connection already active or in progress. Skipping.');
            return;
        }

        connectionInProgressRef.current = true;
        setStatus('connecting');
        console.log(`Connecting to MQTT broker at ${brokerUrl}...`);

        if (clientRef.current) {
            clientRef.current.end(true);
        }

        const mqttClient = mqtt.connect(brokerUrl, {
            username: 'pagarqr',
            password: 'Corsa960',
            clientId: `pagar_web_${Math.random().toString(16).substring(2, 8)}`,
            keepalive: 60,
            reconnectPeriod: 5000,
        });

        mqttClient.on('connect', () => {
            console.log('MQTT Connected');
            setStatus('connected');
            connectionInProgressRef.current = false;
            clientRef.current = mqttClient;
            setClient(mqttClient);
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT Connection Error:', err);
            connectionInProgressRef.current = false;
        });

        mqttClient.on('close', () => {
            console.log('MQTT Disconnected');
            setStatus('disconnected');
            connectionInProgressRef.current = false;
            clientRef.current = null;
            setClient(null);
        });

        mqttClient.on('message', (topic, payload) => {
            const msg = payload.toString();
            console.log(`[MQTT IN] ${topic}:`, msg.substring(0, 100) + (msg.length > 100 ? '...' : ''));
            setMessages(prev => ({
                ...prev,
                [topic]: msg
            }));
        });
    }, []);

    const publish = useCallback((topic, message) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish(topic, message);
            return true;
        }
        return false;
    }, []);

    const subscribe = useCallback((topic) => {
        if (clientRef.current?.connected) {
            clientRef.current.subscribe(topic);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.end();
            }
        };
    }, []);

    const contextValue = useMemo(() => ({
        client,
        status,
        connect,
        publish,
        subscribe,
        messages
    }), [client, status, connect, publish, subscribe, messages]);

    return (
        <MqttContext.Provider value={contextValue}>
            {children}
        </MqttContext.Provider>
    );
};
