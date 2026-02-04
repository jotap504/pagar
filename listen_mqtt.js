
import mqtt from 'mqtt';

const UID = '94254D9B4DC';
const MQTT_BROKER = "mqtts://ea2b35fec63e49deb5d3683f11b750b0.s1.eu.hivemq.cloud";

console.log(`Connecting to Secure MQTT Broker to listen to ${UID}...`);

const client = mqtt.connect(MQTT_BROKER, {
    username: 'pagarqr',
    password: 'Corsa960'
});

client.on('connect', () => {
    console.log('✅ Connected. Requesting settings...');

    // Subscribe to settings and status
    client.subscribe(`qrsolo/${UID}/stat/settings`);
    client.subscribe(`qrsolo/${UID}/stat/status`);
    client.subscribe(`qrsolo/${UID}/stat/state`);

    // Request settings
    client.publish(`qrsolo/${UID}/cmnd/get_settings`, "");
});

client.on('message', (topic, message) => {
    console.log(`\n📩 [${topic}]`);
    try {
        const data = JSON.parse(message.toString());
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.log(message.toString());
    }
});

setTimeout(() => {
    console.log('\nTimeout reached. Closing.');
    client.end();
    process.exit();
}, 10000);
