const admin = require('firebase-admin');
const fs = require('fs');
const { FirestoreAdminClient } = require('@google-cloud/firestore').v1;

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function listDatabases() {
    const client = new FirestoreAdminClient({
        credentials: {
            client_email: serviceAccount.client_email,
            private_key: serviceAccount.private_key
        },
        projectId: serviceAccount.project_id
    });

    console.log('--- Listing Databases ---');
    try {
        const res = await client.listDatabases({
            parent: `projects/${serviceAccount.project_id}`
        });
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error('Error listing databases:', err);
    }
    process.exit(0);
}

listDatabases();
