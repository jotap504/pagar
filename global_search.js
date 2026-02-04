
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

async function globalSearch() {
    try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        const dbIds = ["(default)", "pagar-webonline"];
        const targetValue = '94254D9B4DC';
        console.log(`Global search for: ${targetValue}`);

        for (const dbId of dbIds) {
            console.log(`\n🔍 Searching Database: ${dbId}...`);
            const db = admin.app().firestore(dbId);
            const collections = await db.listCollections();

            for (const col of collections) {
                const docs = await col.get();
                docs.forEach(doc => {
                    const data = JSON.stringify(doc.data());
                    if (data.includes(targetValue)) {
                        console.log(`🎯 MATCH found in [${dbId}] collection [${col.id}] doc [${doc.id}]`);
                        console.log(`   Data: ${data}`);
                    }
                });
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

globalSearch();
