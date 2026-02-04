const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const userUid = 'Afo45Ep8fXeVEyC9mfzrxOPCRk82';
const deviceUid = '94254D9B4DC';

async function check() {
    console.log('--- Checking User ---');
    const userDoc = await db.collection('users').doc(userUid).get();
    if (userDoc.exists) {
        console.log('User document found:', userDoc.data());
    } else {
        console.log('User document NOT found!');
    }

    console.log('--- Checking Device ---');
    const deviceDoc = await db.collection('devices').doc(deviceUid).get();
    if (deviceDoc.exists) {
        console.log('Device document found:', deviceDoc.data());
    } else {
        console.log('Device document NOT found!');
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
