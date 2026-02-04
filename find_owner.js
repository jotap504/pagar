
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function findOwner() {
    try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        const db = admin.app().firestore("pagar-webonline");

        const uid = '94254D9B4DC';
        console.log(`Searching for owner of device: ${uid}`);

        const users = await db.collection('users').get();
        console.log(`Total users checked: ${users.size}`);

        let found = false;
        users.forEach(doc => {
            const data = doc.data();
            console.log(`Checking user: ${doc.id}, Devices: ${JSON.stringify(data.devices || [])}`);
            if (data.devices && data.devices.includes(uid)) {
                console.log(`🎯 FOUND! User ${doc.id} has device ${uid}`);
                found = true;
            }
        });

        if (!found) {
            console.log('❌ No user found with this device in their "devices" list.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

findOwner();
