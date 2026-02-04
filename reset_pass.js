
import mqtt from 'mqtt';

const UID = '94254D9B4DC';
const MQTT_BROKER = "mqtts://ea2b35fec63e49deb5d3683f11b750b0.s1.eu.hivemq.cloud";

console.log(`Connecting to Secure MQTT Broker to reset pass for ${UID}...`);

const client = mqtt.connect(MQTT_BROKER, {
    username: 'pagarqr',
    password: 'Corsa960'
});

client.on('connect', () => {
    console.log('✅ Connected.');

    // Command to reset password to admin1234
    const topic = `qrsolo/${UID}/cmnd/settings`;
    const payload = JSON.stringify({ pass: "admin1234" });

    console.log(`Sending reset command to ${topic}...`);
    client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
            console.error('❌ Fail:', err);
        } else {
            console.log('✅ Command sent. Device should restart with password: admin1234');
        }
        client.end();
    });
});

client.on('error', (err) => {
    console.error('❌ Connection error:', err);
    client.end();
});
