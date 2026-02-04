const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function check() {
    console.log('--- Testing Write ---');
    try {
        await db.collection('test').doc('connection_test').set({
            timestamp: new Date().toISOString(),
            status: 'working'
        });
        console.log('Write SUCCESS!');
    } catch (err) {
        console.error('Write FAILED:', err);
    }
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
