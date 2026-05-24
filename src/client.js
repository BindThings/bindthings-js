'use strict';

const mqtt = require('mqtt');

const BROKER  = 'mqtts://mqtt.bindthings.io:8883';
const VERSION = '1.0.0';

class BindThings {
  /**
   * Official Node.js client for BindThings IoT Platform.
   *
   * @param {string} token - Device token
   * @param {object} options - Optional MQTT options
   *
   * @example
   * const bt = new BindThings('YOUR_DEVICE_TOKEN');
   * bt.connect();
   * bt.send({ temperature: 25.5 });
   */
  constructor(token, options = {}) {
    this._token   = token;
    this._options = options;
    this._client  = null;
    this._connected = false;
    this._commandCb = null;

    this._topics = {
      telemetry:  `devices/${token}/telemetry`,
      status:     `devices/${token}/status`,
      commands:   `devices/${token}/commands`,
      attributes: `devices/${token}/attributes`,
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Connect to BindThings MQTT broker.
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      const mqttOptions = {
        username:           this._token,
        password:           this._token,
        clientId:           `bt_js_${this._token.slice(0, 8)}_${Date.now()}`,
        rejectUnauthorized: false,
        will: {
          topic:   this._topics.status,
          payload: JSON.stringify({ online: false, reason: 'lwt' }),
          qos:     1,
          retain:  true,
        },
        ...this._options,
      };

      console.log(`[BindThings] Connecting to ${BROKER}...`);
      this._client = mqtt.connect(BROKER, mqttOptions);

      this._client.on('connect', () => {
        this._connected = true;
        this._client.subscribe(this._topics.commands, { qos: 1 });
        this._setOnline(true);
        console.log('[BindThings] Connected ✓');
        resolve();
      });

      this._client.on('error', (err) => {
        console.error('[BindThings] Error:', err.message);
        reject(err);
      });

      this._client.on('offline', () => {
        this._connected = false;
        console.warn('[BindThings] Offline');
      });

      this._client.on('reconnect', () => {
        console.log('[BindThings] Reconnecting...');
      });

      this._client.on('message', (topic, payload) => {
        if (topic === this._topics.commands && this._commandCb) {
          const msg = payload.toString();
          console.log(`[BindThings] Command: ${msg}`);
          this._commandCb(msg);
        }
      });
    });
  }

  /**
   * Disconnect from broker.
   */
  disconnect() {
    if (!this._client) return;
    this._setOnline(false);
    this._client.end();
    this._connected = false;
    console.log('[BindThings] Disconnected');
  }

  /**
   * Send telemetry data.
   * @param {object} data - Key-value pairs. e.g. { temperature: 25.5 }
   * @returns {Promise<void>}
   */
  send(data) {
    return new Promise((resolve, reject) => {
      if (!this._connected) {
        return reject(new Error('[BindThings] Not connected'));
      }

      const payload = JSON.stringify(data);
      this._client.publish(this._topics.telemetry, payload, { qos: 0 }, (err) => {
        if (err) {
          console.error('[BindThings] Send failed:', err.message);
          reject(err);
        } else {
          console.log(`[BindThings] Sent: ${payload}`);
          resolve();
        }
      });
    });
  }

  /**
   * Send device attributes (non-timeseries).
   * @param {object} data
   */
  sendAttributes(data) {
    return new Promise((resolve, reject) => {
      if (!this._connected) return reject(new Error('Not connected'));
      const payload = JSON.stringify(data);
      this._client.publish(this._topics.attributes, payload, { qos: 1 }, (err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  /**
   * Register callback for incoming commands.
   * @param {Function} callback - Called with payload string when command arrives
   *
   * @example
   * bt.onCommand((payload) => {
   *   const data = JSON.parse(payload);
   *   console.log(data);
   * });
   */
  onCommand(callback) {
    this._commandCb = callback;
  }

  /**
   * Check if connected.
   * @returns {boolean}
   */
  isConnected() {
    return this._connected;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _setOnline(online) {
    if (!this._client) return;
    const payload = JSON.stringify({ online });
    this._client.publish(this._topics.status, payload, { qos: 1, retain: true });
  }
}

module.exports = { BindThings };
