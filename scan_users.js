
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function listUsersAndCheckDocs() {
    try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log("Listing Auth Users...");
        const userList = await admin.auth().listUsers();
        console.log(`Total Auth users: ${userList.users.length}`);

        const dbIds = ["(default)", "pagar-webonline"];

        for (const userRecord of userList.users) {
            console.log(`\n👤 User: ${userRecord.email} (${userRecord.uid})`);

            for (const dbId of dbIds) {
                const db = admin.app().firestore(dbId);
                const userDoc = await db.collection('users').doc(userRecord.uid).get();

                if (userDoc.exists) {
                    console.log(`  [${dbId}] ✅ Doc found in /users/${userRecord.uid}`);
                    console.log(`  Devices: ${JSON.stringify(userDoc.data().devices || [])}`);
                } else {
                    console.log(`  [${dbId}] ❌ No doc in /users/${userRecord.uid}`);
                }
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

listUsersAndCheckDocs();
