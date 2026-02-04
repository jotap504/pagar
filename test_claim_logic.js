
import mqtt from 'mqtt';

const UID = '94254D9B4DC';
const MQTT_BROKER = "mqtts://ea2b35fec63e49deb5d3683f11b750b0.s1.eu.hivemq.cloud";

const PASSWORDS = ["admin1234", "D9B4DC", "admin"];

console.log(`Connecting to Secure MQTT Broker to test claim for ${UID}...`);

const client = mqtt.connect(MQTT_BROKER, {
    username: 'pagarqr',
    password: 'Corsa960'
});

client.on('connect', () => {
    console.log('✅ Connected. Testing passwords...');

    // Subscribe to status
    client.subscribe(`qrsolo/${UID}/stat/status`);

    let currentIndex = 0;

    const testNext = () => {
        if (currentIndex >= PASSWORDS.length) {
            console.log('Finished testing all passwords.');
            client.end();
            return;
        }

        const pass = PASSWORDS[currentIndex];
        console.log(`\nTesting password [${currentIndex + 1}/${PASSWORDS.length}]: "${pass}"`);

        client.publish(`qrsolo/${UID}/cmnd/verify_claim`, JSON.stringify({ pass: pass }));
        currentIndex++;
    };

    client.on('message', (topic, message) => {
        const msg = message.toString();
        console.log(`📩 [${topic}] ${msg}`);

        if (msg.includes('CLAIM_RESULT:OK')) {
            console.log(`🎯 SUCCESS! Password working.`);
            client.end();
            process.exit(0);
        } else if (msg.includes('CLAIM_RESULT:ERROR')) {
            console.log(`❌ Failed.`);
            testNext();
        }
    });

    testNext();
});

client.on('error', (err) => {
    console.error('❌ Connection error:', err);
    client.end();
});

setTimeout(() => {
    console.log('\nTimeout reached.');
    client.end();
}, 20000);
