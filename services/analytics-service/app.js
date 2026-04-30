/**
 * Analytics Service — port 3006
 *
 * Subscribes to ALL RabbitMQ events (#) and maintains metrics in Redis.
 * Exposes read-only HTTP endpoints consumed by the admin dashboard.
 *
 * Metrics stored in Redis:
 *   analytics:events:total            → total events processed
 *   analytics:events:by-type          → hash { routingKey → count }
 *   analytics:top-viewed              → sorted set (postId → view count)
 *   analytics:top-saved               → sorted set (postId → save count)
 *   analytics:bookings:total          → counter
 *   analytics:price-changes           → list of last 50 price-change events
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../api/.env") });

import express from "express";
import cors from "cors";
import { connectBroker, subscribe } from "../broker/index.js";
import { getRedis, leaderboardTop } from "../cache/index.js";

const app = express();
app.use(cors({ origin: ["http://localhost:8800", "http://localhost:5174", "http://localhost:5175"] }));
app.use(express.json());

const r = () => getRedis();

// ── RabbitMQ subscriber — consume all events ──────────────────────────────────
async function startSubscriber() {
  await connectBroker("analytics-service");

  await subscribe("analytics.events", ["#"], async ({ routingKey, data, ts }) => {
    const redis = r();
    const pipe  = redis.pipeline();

    pipe.incr("analytics:events:total");
    pipe.hincrby("analytics:events:by-type", routingKey, 1);

    switch (routingKey) {
      case "listing.viewed":
        pipe.zincrby("analytics:top-viewed", 1, data.postId || data.id || "unknown");
        break;
      case "user.savedProperty":
        pipe.zincrby("analytics:top-saved", 1, data.postId || "unknown");
        break;
      case "booking.created":
        pipe.incr("analytics:bookings:total");
        break;
      case "listing.priceChanged":
        pipe.lpush("analytics:price-changes", JSON.stringify({ ...data, ts }));
        pipe.ltrim("analytics:price-changes", 0, 49); // keep last 50
        break;
      case "listing.created":
        pipe.incr("analytics:listings:created");
        break;
      case "listing.deleted":
        pipe.incr("analytics:listings:deleted");
        break;
    }

    await pipe.exec();
    console.log(`[analytics] ${routingKey}`, JSON.stringify(data).slice(0, 80));
  });
}

// ── GET /api/analytics/overview ───────────────────────────────────────────────
app.get("/api/analytics/overview", async (req, res) => {
  try {
    const redis = r();
    const [
      totalEvents,
      byType,
      totalBookings,
      totalCreated,
      totalDeleted,
    ] = await Promise.all([
      redis.get("analytics:events:total"),
      redis.hgetall("analytics:events:by-type"),
      redis.get("analytics:bookings:total"),
      redis.get("analytics:listings:created"),
      redis.get("analytics:listings:deleted"),
    ]);

    res.json({
      totalEvents:     parseInt(totalEvents)    || 0,
      totalBookings:   parseInt(totalBookings)  || 0,
      totalCreated:    parseInt(totalCreated)   || 0,
      totalDeleted:    parseInt(totalDeleted)   || 0,
      eventsByType:    byType || {},
      ts: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[analytics] overview error:", err.message);
    res.status(500).json({ message: "Analytics unavailable" });
  }
});

// ── GET /api/analytics/top-listings ──────────────────────────────────────────
app.get("/api/analytics/top-listings", async (req, res) => {
  try {
    const [topViewed, topSaved] = await Promise.all([
      leaderboardTop("analytics:top-viewed", 10),
      leaderboardTop("analytics:top-saved",  10),
    ]);
    res.json({ topViewed, topSaved });
  } catch (err) {
    res.status(500).json({ message: "Analytics unavailable" });
  }
});

// ── GET /api/analytics/price-changes ─────────────────────────────────────────
app.get("/api/analytics/price-changes", async (req, res) => {
  try {
    const raw = await r().lrange("analytics:price-changes", 0, 49);
    res.json(raw.map((s) => JSON.parse(s)));
  } catch {
    res.json([]);
  }
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ service: "analytics-service", status: "ok", ts: new Date().toISOString() })
);

// ── Boot ──────────────────────────────────────────────────────────────────────
startSubscriber().catch((err) => console.error("[analytics] subscriber failed:", err.message));
app.listen(3006, () => console.log("📊 analytics-service   → http://localhost:3006"));
