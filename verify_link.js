
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function verify() {
    try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        const db = admin.app().firestore("pagar-webonline");

        const userUid = 'Afo45Ep8fXeVEyC9mfzrxOPCRk82';
        const deviceUid = '94254D9B4DC';

        console.log(`Checking User: ${userUid}`);
        const userDoc = await db.collection('users').doc(userUid).get();
        if (userDoc.exists) {
            console.log(`✅ User found. Devices: ${JSON.stringify(userDoc.data().devices || [])}`);
        } else {
            console.log('❌ User document NOT found.');
        }

        console.log(`Checking Device: ${deviceUid}`);
        const deviceDoc = await db.collection('devices').doc(deviceUid).get();
        if (deviceDoc.exists) {
            console.log(`✅ Device found. Data: ${JSON.stringify(deviceDoc.data(), null, 2)}`);
        } else {
            console.log('❌ Device document NOT found.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

verify();
