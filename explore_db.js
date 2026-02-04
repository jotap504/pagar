
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function explore() {
    try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        const dbIds = ["(default)", "pagar-webonline"];

        for (const dbId of dbIds) {
            console.log(`\n--- Exploring Database: ${dbId} ---`);
            const db = admin.app().firestore(dbId);
            const collections = await db.listCollections();
            console.log(`Collections found: ${collections.length}`);
            for (const col of collections) {
                console.log(` - Collection: ${col.id}`);
                const docs = await col.limit(3).get();
                console.log(`   Sample docs: ${docs.size}`);
                docs.forEach(doc => {
                    console.log(`     * ID: ${doc.id}`);
                });
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

explore();
