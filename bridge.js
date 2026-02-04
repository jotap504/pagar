/**
 * CLOUD BRIDGE: MQTT -> FIRESTORE
 * This script runs as a background service to aggregate logs from all devices.
 */
import mqtt from 'mqtt';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// 1. Initialize Firebase Admin
// You need to download your serviceAccountKey.json from Firebase Console
// Settings -> Service Accounts -> Generate new private key
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. MQTT Config
const MQTT_BROKER = "mqtt://broker.emqx.io"; // Use your broker
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('✅ Bridge connected to MQTT Broker');
    // Subscribe to all device logs
    client.subscribe('qrsolo/+/stat/status');
});

client.on('message', async (topic, message) => {
    const statusMsg = message.toString();

    // Check if it's a new log entry
    if (statusMsg.startsWith('LOG_NEW:')) {
        const parts = topic.split('/');
        const uid = parts[1]; // Get UID from topic

        console.log(`[Bridge] New log from ${uid}: ${statusMsg}`);

        try {
            // Find who owns this device
            const deviceDoc = await db.collection('devices').doc(uid).get();
            if (!deviceDoc.exists) {
                console.log(`[Bridge] Device ${uid} is not linked to any user. Skipping.`);
                return;
            }

            const ownerId = deviceDoc.data().ownerId;
            const logData = statusMsg.replace('LOG_NEW:', '').split(',');

            // Parse CSV: amount, duration, ref
            const entry = {
                deviceUid: uid,
                amount: parseFloat(logData[0]) || 0,
                duration: parseInt(logData[1]) || 0,
                ref: logData[2] || 'Venta',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                raw: statusMsg
            };

            // Save to user's global logs collection for easy statistics
            await db.collection('users').doc(ownerId).collection('history').add(entry);

            console.log(`[Bridge] Log successfully synced for User: ${ownerId}`);

        } catch (e) {
            console.error('[Bridge] Error syncing log:', e);
        }
    }
});

client.on('error', (err) => {
    console.error('❌ MQTT Bridge Error:', err);
});
