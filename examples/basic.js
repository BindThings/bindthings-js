/**
 * BindThings Basic Example
 * ─────────────────────────
 * Sends temperature and humidity every 15 seconds.
 *
 * Install: npm install bindthings
 */

const { BindThings } = require('bindthings');

const TOKEN = 'YOUR_DEVICE_TOKEN';
const bt    = new BindThings(TOKEN);

bt.onCommand((payload) => {
  console.log('Command received:', payload);
  const data = JSON.parse(payload);
  // Handle command
  // e.g. if (data.relay === 1) gpio.write(PIN, 1);
});

async function main() {
  await bt.connect();

  setInterval(async () => {
    await bt.send({ temperature: 25.5, humidity: 60 });
  }, 15000); // FREE plan: 15s interval
}

main().catch(console.error);

process.on('SIGINT', () => {
  bt.disconnect();
  process.exit(0);
});
