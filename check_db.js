
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function check() {
    try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        const db = admin.app().firestore("pagar-webonline");

        const uid = '94254D9B4DC';
        console.log(`Checking device: ${uid}`);

        const deviceDoc = await db.collection('devices').doc(uid).get();
        if (deviceDoc.exists) {
            console.log('✅ Device found in Firestore:');
            console.log(JSON.stringify(deviceDoc.data(), null, 2));

            const ownerId = deviceDoc.data().ownerId;
            if (ownerId) {
                console.log(`✅ Owner found: ${ownerId}`);

                const history = await db.collection('users').doc(ownerId).collection('history')
                    .where('deviceUid', '==', uid)
                    .orderBy('timestamp', 'desc')
                    .limit(5)
                    .get();

                console.log(`History count for this device: ${history.size}`);
                history.forEach(doc => {
                    console.log(` - [${doc.data().timestamp?.toDate()}] ${doc.data().ref}: $${doc.data().amount}`);
                });
            } else {
                console.log('❌ Device has NO ownerId linked.');
            }
        } else {
            console.log('❌ Device NOT found in Firestore devices collection.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

check();
