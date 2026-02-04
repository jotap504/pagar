const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.app().firestore("pagar-webonline");
const userUid = 'Afo45Ep8fXeVEyC9mfzrxOPCRk82';

async function verify() {
    console.log('--- Testing Write to Named Database ---');
    try {
        await db.collection('test').doc('named_db_test').set({
            timestamp: new Date().toISOString(),
            status: 'confirmed_database'
        });
        console.log('Write SUCCESS to pagar-webonline!');

        console.log('--- Reading User ---');
        const userDoc = await db.collection('users').doc(userUid).get();
        console.log('User document:', userDoc.exists ? userDoc.data() : 'NOT FOUND');

    } catch (err) {
        console.error('Operation FAILED:', err);
    }
    process.exit(0);
}

verify();
