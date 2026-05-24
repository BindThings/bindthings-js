/**
 * BindThings Sensor Example
 * ──────────────────────────
 * Reads sensor data and sends to BindThings.
 * Works with any sensor that returns JSON data.
 */

const { BindThings } = require('bindthings');

const TOKEN = 'YOUR_DEVICE_TOKEN';
const bt    = new BindThings(TOKEN);

// Simulate sensor reading
function readSensor() {
  return {
    temperature: (20 + Math.random() * 10).toFixed(1),
    humidity:    (50 + Math.random() * 20).toFixed(1),
    pressure:    (1010 + Math.random() * 10).toFixed(0),
  };
}

bt.onCommand((payload) => {
  const data = JSON.parse(payload);
  console.log('Command:', data);
});

async function main() {
  await bt.connect();

  await bt.sendAttributes({
    firmware: '1.0.0',
    model:    'NodeMCU-ESP32',
  });

  setInterval(async () => {
    const data = readSensor();
    await bt.send(data);
  }, 15000);
}

main().catch(console.error);

process.on('SIGINT', () => {
  bt.disconnect();
  process.exit(0);
});
