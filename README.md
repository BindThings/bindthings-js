# BindThings Node.js

Official Node.js client for the [BindThings](https://bindthings.com) IoT Platform.

## Installation

```bash
npm install bindthings-sdk
```

## Quick Start

```js
const { BindThings } = require('bindthings');

const bt = new BindThings('YOUR_DEVICE_TOKEN');

async function main() {
  await bt.connect();
  await bt.send({ temperature: 25.5, humidity: 60 });
}

main();
```

## API Reference

### Constructor
```js
const bt = new BindThings(token, options);
```

### Connect
```js
await bt.connect(); // Returns Promise
```

### Send Telemetry
```js
await bt.send({ temperature: 25.5 });
await bt.send({ temperature: 25.5, humidity: 60, pressure: 1013 });
```

### Send Attributes
```js
await bt.sendAttributes({ firmware: '1.0.0', model: 'ESP32' });
```

### Receive Commands
```js
bt.onCommand((payload) => {
  const data = JSON.parse(payload);
  console.log(data);
});
```

### Status
```js
bt.isConnected(); // Check connection
bt.disconnect();  // Graceful disconnect
```

## Examples

| Example | Description |
|---------|-------------|
| [basic.js](examples/basic.js) | Send temperature and humidity every 15 seconds |
| [sensor.js](examples/sensor.js) | Multi-sensor with attributes |

## Connection Details

| Parameter | Value |
|-----------|-------|
| Broker | `mqtts://mqtt.bindthings.io:8883` |
| Username | Your Device Token |
| Password | Your Device Token |

## License

MIT License — © 2025 BindThings
