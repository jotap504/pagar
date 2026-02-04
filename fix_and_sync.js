
import mqtt from 'mqtt';

const UID = '94254D9B4DC';
const MQTT_BROKER = "mqtts://ea2b35fec63e49deb5d3683f11b750b0.s1.eu.hivemq.cloud";

console.log(`Connecting to Secure MQTT Broker to fix ${UID}...`);

const client = mqtt.connect(MQTT_BROKER, {
    username: 'pagarqr',
    password: 'Corsa960'
});

client.on('connect', () => {
    console.log('✅ Connected to HiveMQ Cloud');

    const topic = `qrsolo/${UID}/stat/status`;
    const payload = "LOG_NEW:0.01,1,REPARACION_VINCULO";

    console.log(`Sending trigger log to ${topic}...`);

    client.publish(topic, payload, (err) => {
        if (err) {
            console.error('❌ Fail:', err);
        } else {
            console.log('✅ Trigger sent. Bridge should now self-heal.');
        }
        client.end();
    });
});

client.on('error', (err) => {
    console.error('❌ Connection error:', err);
    client.end();
});
