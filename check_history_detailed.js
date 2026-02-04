
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function checkHistory() {
    try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        const db = admin.app().firestore("pagar-webonline");
        const userUid = 'Afo45Ep8fXeVEyC9mfzrxOPCRk82';

        console.log(`Checking history for user: ${userUid}`);
        const historyCol = db.collection('users').doc(userUid).collection('history');
        const snapshot = await historyCol.orderBy('timestamp', 'desc').limit(20).get();

        console.log(`History count: ${snapshot.size}`);

        if (snapshot.size > 0) {
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp ? data.timestamp.toDate() : 'N/A';
                console.log(` - [${date}] ID: ${doc.id}, Amount: ${data.amount}, Device: ${data.deviceUid}, Ref: ${data.ref}`);
            });
        } else {
            console.log('❌ History sub-collection is EMPTY.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkHistory();
