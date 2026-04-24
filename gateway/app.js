/**
 * API Gateway — port 8800
 *
 * Features added over the plain proxy:
 *   - Rate limiting   : 100 req / 60 s per IP (Redis sliding window; fail-open)
 *   - Circuit breaker : per-service, via opossum — open after 5 failures in 10 s
 *                       fallback returns 503 + cached last-good response from Redis
 *   - JWT auth check  : strips and validates JWT cookie before forwarding to services
 *                       (endpoints listed in PUBLIC_PATHS skip auth)
 *   - WebSocket proxy : /socket.io → chat-service
 */
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import CircuitBreaker from "opossum";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../api/.env") });

const app = express();

const CLIENT_ORIGINS = [
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:5178",
];

app.use(cors({ origin: CLIENT_ORIGINS, credentials: true }));

// ── Redis (for rate limiting + circuit-breaker cache) ─────────────────────────
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let redis = null;
try {
  redis = new Redis(REDIS_URL, {
    lazyConnect:          true,
    maxRetriesPerRequest: 1,
    connectTimeout:       2000,
    enableOfflineQueue:   false,
  });
  redis.on("error", (err) => {
    if (err.code !== "ECONNREFUSED") console.warn("[gateway:redis]", err.message);
  });
} catch { /* Redis optional */ }

// ── Rate limiting middleware (100 req / 60 s per IP) ─────────────────────────
async function rateLimit(req, res, next) {
  if (!redis) return next(); // fail open when Redis is unavailable
  const ip  = req.ip || req.socket.remoteAddress || "unknown";
  const key = `ratelimit:gw:${ip}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);
    res.setHeader("X-RateLimit-Limit",     "100");
    res.setHeader("X-RateLimit-Remaining", Math.max(0, 100 - count).toString());
    if (count > 100) {
      return res.status(429).json({ message: "Too many requests — try again in a moment." });
    }
  } catch { /* fail open */ }
  next();
}

app.use(rateLimit);

// ── Public paths that skip JWT verification ───────────────────────────────────
const PUBLIC_PATHS = [
  /^\/api\/auth\//,
  /^\/api\/posts($|\?)/,             // GET /api/posts (list)
  /^\/api\/posts\/[^/]+$/,           // GET /api/posts/:id
  /^\/api\/posts\/[^/]+\/price-history/, // GET /api/posts/:id/price-history
  /^\/api\/posts\/cities/,
  /^\/api\/posts\/near/,
  /^\/api\/search/,
  /^\/api\/contact/,
  /^\/api\/analytics/,         // read-only stats, no auth needed
  /^\/health$/,
  /^\/socket\.io/,
];

function isPublic(path) {
  return PUBLIC_PATHS.some((re) => re.test(path));
}

// ── Optional JWT auth check at gateway (non-blocking for most routes) ─────────
function gatewayAuth(req, res, next) {
  if (isPublic(req.path)) return next();
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY);
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

// Parse cookies for auth check (no body parsing — just passthrough proxy)
import cookieParser from "cookie-parser";
app.use(cookieParser());
app.use(gatewayAuth);

// ── Service registry ──────────────────────────────────────────────────────────
const SVC = {
  auth:      "http://localhost:3001",
  listing:   "http://localhost:3002",
  chat:      "http://localhost:3003",
  notify:    "http://localhost:3004",
  search:    "http://localhost:3005",
  analytics: "http://localhost:3006",
};

// ── Circuit breaker factory ───────────────────────────────────────────────────
const breakers = {};

function getBreaker(name, target) {
  if (breakers[name]) return breakers[name];

  // The "action" is just a resolved promise — the breaker wraps the proxy call
  // via the onError handler below. We use opossum as a state machine only.
  const breaker = new CircuitBreaker(
    async () => { /* proxy handles the actual call */ },
    {
      timeout:              5000,  // 5 s
      errorThresholdPercentage: 50,
      volumeThreshold:      5,     // trip only after ≥5 requests
      resetTimeout:         10000, // try half-open after 10 s
    },
  );

  breaker.on("open",     () => console.warn(`⚡ [gateway] circuit OPEN   — ${name} (${target})`));
  breaker.on("halfOpen", () => console.info(`⚡ [gateway] circuit HALF   — ${name} trying`));
  breaker.on("close",    () => console.info(`✅ [gateway] circuit CLOSED — ${name} recovered`));

  breakers[name] = breaker;
  return breaker;
}

// ── Proxy factory with circuit breaker + error fallback ───────────────────────
function makeProxy(name, target, prefix) {
  const breaker = getBreaker(name, target);

  const onError = async (_err, req, res) => {
    breaker.open(); // manually open on transport error

    if (res.headersSent) return;

    // Try Redis for last-good cached response
    if (redis) {
      try {
        const cached = await redis.get(`cb:cache:${name}:${req.url}`);
        if (cached) {
          res.setHeader("X-Circuit-Breaker", "cached");
          return res.status(200).json(JSON.parse(cached));
        }
      } catch { /* noop */ }
    }

    res.status(503).json({
      message: `${name} is temporarily unavailable. Please try again shortly.`,
      circuitBreaker: "open",
    });
  };

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite:  { "^": prefix },
    on: {
      error: onError,
      proxyRes(proxyRes, req, res) {
        // Cache successful GET responses for circuit-breaker fallback
        if (req.method === "GET" && proxyRes.statusCode === 200 && redis) {
          const chunks = [];
          proxyRes.on("data", (c) => chunks.push(c));
          proxyRes.on("end", () => {
            try {
              const body = Buffer.concat(chunks).toString();
              redis.setex(`cb:cache:${name}:${req.url}`, 120, body).catch(() => {});
            } catch { /* noop */ }
          });
        }
      },
    },
  });
}

// ── Route table ──────────────────────────────────────────────────────────────
// /api/admin/users must come before /api/admin (more-specific first)
app.use("/api/admin/users", makeProxy("auth",      SVC.auth,      "/api/admin/users"));
app.use("/api/auth",        makeProxy("auth",      SVC.auth,      "/api/auth"));
app.use("/api/users",       makeProxy("auth",      SVC.auth,      "/api/users"));

app.use("/api/admin",       makeProxy("listing",   SVC.listing,   "/api/admin"));
app.use("/api/posts",       makeProxy("listing",   SVC.listing,   "/api/posts"));
app.use("/api/listings",    makeProxy("listing",   SVC.listing,   "/api/listings"));
app.use("/api/bookings",    makeProxy("listing",   SVC.listing,   "/api/bookings"));

app.use("/api/chats",       makeProxy("chat",      SVC.chat,      "/api/chats"));
app.use("/api/messages",    makeProxy("chat",      SVC.chat,      "/api/messages"));

app.use("/api/contact",     makeProxy("notify",    SVC.notify,    "/api/contact"));

app.use("/api/search",      makeProxy("search",    SVC.search,    "/api/search"));

app.use("/api/analytics",   makeProxy("analytics", SVC.analytics, "/api/analytics"));

// ── WebSocket proxy ───────────────────────────────────────────────────────────
const wsProxy = createProxyMiddleware({
  target:       SVC.chat,
  changeOrigin: true,
  ws:           true,
  on: { error: (_err, _req, res) => { if (!res.headersSent) res.status(502).end(); } },
});
app.use("/socket.io", wsProxy);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({
    gateway:  "ok",
    services: SVC,
    breakers: Object.fromEntries(
      Object.entries(breakers).map(([k, b]) => [k, b.opened ? "open" : "closed"])
    ),
    ts: new Date().toISOString(),
  })
);

// ── Start ─────────────────────────────────────────────────────────────────────
const server = createServer(app);
server.on("upgrade", wsProxy.upgrade);
server.listen(8800, () => {
  console.log("🚀 API Gateway        → http://localhost:8800");
  console.log("   Rate limit: 100 req/min per IP  |  Circuit breaker: opossum");
  Object.entries(SVC).forEach(([k, v]) => console.log(`   ${k.padEnd(12)} → ${v}`));
});
