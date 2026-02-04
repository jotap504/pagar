
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function repair() {
    try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        const db = admin.app().firestore("pagar-webonline");

        const userUid = 'Afo45Ep8fXeVEyC9mfzrxOPCRk82';
        const deviceUid = '94254D9B4DC';

        console.log(`Repairing link: User(${userUid}) <-> Device(${deviceUid})`);

        // 1. Update User's devices list
        await db.collection('users').doc(userUid).set({
            devices: admin.firestore.FieldValue.arrayUnion(deviceUid)
        }, { merge: true });
        console.log('✅ Added device to users collection');

        // 2. Update Device's ownerId
        await db.collection('devices').doc(deviceUid).set({
            ownerId: userUid,
            linkedAt: new Date().toISOString(),
            status: 'online'
        }, { merge: true });
        console.log('✅ Updated ownerId in devices collection');

        console.log('--- REPAIR COMPLETE ---');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

repair();
