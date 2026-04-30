/**
 * Shared RabbitMQ broker module.
 * All services import { connectBroker, publish, subscribe } from here.
 *
 * Exchange:  estate.events  (topic, durable)
 * Routing keys:
 *   listing.created | listing.updated | listing.priceChanged |
 *   listing.deleted | listing.viewed  | user.savedProperty   | booking.created
 */
import amqplib from "amqplib";

const EXCHANGE   = "estate.events";
const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let _channel = null;

export async function connectBroker(serviceName = "service") {
  try {
    const conn = await amqplib.connect(RABBIT_URL);
    _channel = await conn.createChannel();
    await _channel.assertExchange(EXCHANGE, "topic", { durable: true });

    conn.on("error", ()  => { _channel = null; });
    conn.on("close", ()  => { _channel = null; });

    console.log(`✅ [${serviceName}] RabbitMQ connected → ${RABBIT_URL}`);
    return _channel;
  } catch (err) {
    console.warn(`⚠️  [${serviceName}] RabbitMQ unavailable — events disabled:`, err.message);
    return null;
  }
}

/** Fire-and-forget publish. Never throws. */
export async function publish(routingKey, data) {
  if (!_channel) return;
  try {
    _channel.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify({ routingKey, data, ts: new Date().toISOString() })),
      { persistent: true },
    );
  } catch { /* swallow */ }
}

/**
 * Subscribe to an array of routing-key patterns.
 * handler(event) receives { routingKey, data, ts }.
 * Messages are ack'd on success, discarded (no requeue) on error.
 */
export async function subscribe(queue, patterns, handler) {
  if (!_channel) return;
  await _channel.assertQueue(queue, { durable: true });
  for (const pattern of patterns) {
    await _channel.bindQueue(queue, EXCHANGE, pattern);
  }
  _channel.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      await handler(event);
      _channel.ack(msg);
    } catch (err) {
      console.error(`[broker:${queue}] handler error:`, err.message);
      _channel.nack(msg, false, false); // discard, no requeue
    }
  });
}
