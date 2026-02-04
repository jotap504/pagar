/**
 * CLOUD BRIDGE: MQTT -> FIRESTORE
 * This script runs as a background service to aggregate logs from all devices.
 */
import mqtt from 'mqtt';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// --- LOGGING HELPER ---
const log = (msg) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${msg}`);
};

const logError = (msg, err) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ERROR: ${msg}`, err || '');
};

// --- GLOBAL ERROR HANDLING ---
process.on('uncaughtException', (err) => {
    logError('Uncaught Exception occurred!', err);
    // Ideally, we'd exit and let a process manager (like PM2 or systemd) restart us
    // process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
    logError('Unhandled Rejection at:', promise);
    logError('Reason:', reason);
});

log('🚀 Starting Cloud Bridge...');

// 1. Initialize Firebase Admin
try {
    const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    log('✅ Firebase Admin initialized');
} catch (err) {
    logError('Failed to initialize Firebase Admin', err);
    process.exit(1);
}

const db = admin.app().firestore("pagar-webonline");

// 2. MQTT Config (HiveMQ Cloud)
const MQTT_BROKER = "mqtts://ea2b35fec63e49deb5d3683f11b750b0.s1.eu.hivemq.cloud";
log(`📡 Connecting to Secure MQTT Broker: ${MQTT_BROKER}`);

const client = mqtt.connect(MQTT_BROKER, {
    username: 'pagarqr',
    password: 'Corsa960',
    reconnectPeriod: 5000, // Reconnect every 5 seconds if disconnected
    connectTimeout: 30 * 1000, // 30s timeout
});

client.on('connect', () => {
    log('✅ Bridge connected to MQTT Broker');
    client.subscribe('qrsolo/+/stat/status', (err) => {
        if (err) {
            logError('Failed to subscribe to topic', err);
        } else {
            log('📝 Subscribed to qrsolo/+/stat/status');
        }
    });
});

client.on('reconnect', () => {
    log('🔄 Attempting to reconnect to MQTT Broker...');
});

client.on('offline', () => {
    log('⚠️ MQTT Client is offline');
});

client.on('error', (err) => {
    logError('MQTT Bridge Error', err);
});

client.on('message', async (topic, message) => {
    try {
        const statusMsg = message.toString();

        if (statusMsg.startsWith('LOG_NEW:')) {
            const parts = topic.split('/');
            const uid = parts[1];

            log(`[Bridge] New log from ${uid}: ${statusMsg}`);

            // Find who owns this device
            const deviceDoc = await db.collection('devices').doc(uid).get();
            let ownerId = deviceDoc.exists ? deviceDoc.data().ownerId : null;

            if (!ownerId) {
                log(`[Bridge] Device ${uid} has no direct owner link. Attempting self-healing...`);

                // Query users who have this device in their 'devices' array
                const usersWithDevice = await db.collection('users')
                    .where('devices', 'array-contains', uid)
                    .limit(1)
                    .get();

                if (!usersWithDevice.empty) {
                    const ownerDoc = usersWithDevice.docs[0];
                    ownerId = ownerDoc.id;
                    log(`[Bridge] Found owner for ${uid}: ${ownerId}. Repairing link in Firestore...`);

                    // Repair the reverse mapping
                    await db.collection('devices').doc(uid).set({
                        ownerId: ownerId,
                        linkedAt: new Date().toISOString(),
                        status: 'online',
                        lastActive: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } else {
                    log(`[Bridge] Device ${uid} is not linked to any user in the system. Skipping.`);
                    return;
                }
            }

            const logData = statusMsg.replace('LOG_NEW:', '').split(',');

            const entry = {
                deviceUid: uid,
                amount: parseFloat(logData[0]) || 0,
                duration: parseInt(logData[1]) || 0,
                ref: logData[2] || 'Venta',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                raw: statusMsg
            };

            await db.collection('users').doc(ownerId).collection('history').add(entry);
            log(`[Bridge] Log successfully synced for User: ${ownerId}`);

            // Also update device status as online since we just got a log
            await db.collection('devices').doc(uid).update({
                status: 'online',
                lastActive: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        else if (statusMsg === 'online' || statusMsg === 'offline') {
            const parts = topic.split('/');
            const uid = parts[1];
            log(`[Bridge] Device ${uid} is now ${statusMsg.toUpperCase()}`);

            await db.collection('devices').doc(uid).set({
                status: statusMsg,
                lastActive: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } catch (e) {
        logError('[Bridge] Critical error processing message', e);
    }
});
