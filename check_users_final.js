
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function checkUsers() {
    try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        const db = admin.app().firestore("pagar-webonline");
        const usersCol = db.collection('users');
        const snapshot = await usersCol.get();

        console.log(`Checking Database: pagar-webonline`);
        console.log(`Users collection size: ${snapshot.size}`);

        if (snapshot.size > 0) {
            snapshot.forEach(doc => {
                console.log(` - User ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
            });
        } else {
            console.log('❌ Users collection is EMPTY in pagar-webonline');

            // Check default just in case
            const dbDefault = admin.app().firestore("(default)");
            const snapshotDefault = await dbDefault.collection('users').get();
            console.log(`Checking Database: (default)`);
            console.log(`Users collection size: ${snapshotDefault.size}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkUsers();
