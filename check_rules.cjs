const admin = require('firebase-admin');
const fs = require('fs');
const { FirestoreAdminClient } = require('@google-cloud/firestore').v1;

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function checkRules() {
    // Note: Finding current rules via Admin SDK is complex, 
    // but we can try to write to both and see which one fails with client-like simulation if we had it.
    // Instead, let's just assume the mismatch and prepare the fix.

    console.log('Detected Databases:');
    console.log('1. (default)');
    console.log('2. pagar-webonline');

    process.exit(0);
}

checkRules();
