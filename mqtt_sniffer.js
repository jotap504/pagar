import mqtt from 'mqtt';

// Configuration
const BROKER_URL = 'mqtt://broker.emqx.io:1883'; // TCP connection for Node.js
const TOPIC_FILTER = 'qrsolo/+/cmnd/#';

console.log(`Connecting to broker ${BROKER_URL}...`);
const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
    console.log(`[SNIFFER] Connected!`);
    console.log(`[SNIFFER] Subscribing to ${TOPIC_FILTER} to catch all commands...`);
    client.subscribe(TOPIC_FILTER, (err) => {
        if (!err) {
            console.log('[SNIFFER] Listening for traffic...');
        } else {
            console.error('[SNIFFER] Subscription error:', err);
        }
    });
});

client.on('message', (topic, message) => {
    console.log(`\n[CAPTURED] Topic: ${topic}`);
    console.log(`[PAYLOAD]  ${message.toString()}`);
    console.log(`[TIME]     ${new Date().toLocaleTimeString()}`);
});

client.on('error', (err) => {
    console.error('[SNIFFER] Error:', err);
});
