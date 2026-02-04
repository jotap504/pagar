const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function check() {
    console.log('--- Listing Collections ---');
    try {
        const collections = await db.listCollections();
        console.log('Collections found:', collections.map(c => c.id));
    } catch (err) {
        console.error('Error listing collections:', err);
    }
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
