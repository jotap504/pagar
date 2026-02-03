import mqtt from 'mqtt';

const UID = '94254D9B4DC';
const BROKER = 'mqtt://broker.emqx.io:1883'; // Standard TCP for Node/Device
// Note: HiveMQ public broker bridges TCP (1883) and WS (8000)

console.log(`Connecting to ${BROKER} to simulate device ${UID}...`);

const client = mqtt.connect(BROKER);

client.on('connect', () => {
    console.log('Connected! Sending heartbeat...');

    // Topic: qrsolo/{UID}/stat/state
    const topic = `qrsolo/${UID}/stat/state`;

    // Payload matching MqttManager.cpp structure
    const payload = JSON.stringify({
        active: true,
        mode: 0, // Time mode
        rem: 120, // 120 seconds remaining (simulated)
        ref: "SIMULATION_TEST",
        rssi: -45,
        uptime: 3600
    });

    client.publish(topic, payload, { retain: true }, (err) => {
        if (err) {
            console.error('Publish error:', err);
        } else {
            console.log(`Published to ${topic}: ${payload}`);
            console.log('Check your Web Dashboard now!');
        }
        client.end();
    });
});

client.on('error', (err) => {
    console.error('Connection error:', err);
    client.end();
});
