/**
 * Shared Redis cache module (ioredis).
 * Designed to degrade gracefully when Redis is unavailable.
 *
 * Key patterns used across services:
 *   posts:list:{queryHash}   → paginated list results (TTL 300s)
 *   posts:single:{id}        → single post (TTL 600s)
 *   ratelimit:{ip}           → sliding window counter (TTL 60s)
 *   leaderboard:views        → sorted set (most-viewed posts)
 *   session:{userId}         → user session snapshot (TTL 3600s)
 */
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let _redis = null;

export function getRedis() {
  if (!_redis) {
    _redis = new Redis(REDIS_URL, {
      lazyConnect:           true,
      maxRetriesPerRequest:  1,
      connectTimeout:        2000,
      enableOfflineQueue:    false,
    });
    _redis.on("error", (err) => {
      if (err.code !== "ECONNREFUSED") console.warn("[redis] error:", err.message);
    });
  }
  return _redis;
}

export async function cacheGet(key) {
  try {
    const val = await getRedis().get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export async function cacheSet(key, value, ttlSeconds = 300) {
  try { await getRedis().setex(key, ttlSeconds, JSON.stringify(value)); } catch { /* noop */ }
}

export async function cacheDel(...keys) {
  try { if (keys.length) await getRedis().del(...keys); } catch { /* noop */ }
}

/** Delete all keys matching a glob pattern (e.g. "posts:list:*"). */
export async function cacheDelPattern(pattern) {
  try {
    const keys = await getRedis().keys(pattern);
    if (keys.length) await getRedis().del(...keys);
  } catch { /* noop */ }
}

/** Increment a sorted-set score (leaderboard). */
export async function leaderboardIncr(setKey, member, by = 1) {
  try { await getRedis().zincrby(setKey, by, member); } catch { /* noop */ }
}

/** Get top N from leaderboard (highest score first). */
export async function leaderboardTop(setKey, n = 10) {
  try {
    const items = await getRedis().zrevrange(setKey, 0, n - 1, "WITHSCORES");
    const result = [];
    for (let i = 0; i < items.length; i += 2) {
      result.push({ member: items[i], score: parseInt(items[i + 1]) });
    }
    return result;
  } catch { return []; }
}

/** Simple rate-limit check: sliding window, returns { allowed, remaining }. */
export async function checkRateLimit(key, limit, windowSeconds) {
  try {
    const r = getRedis();
    const current = await r.incr(key);
    if (current === 1) await r.expire(key, windowSeconds);
    return { allowed: current <= limit, remaining: Math.max(0, limit - current) };
  } catch {
    return { allowed: true, remaining: limit }; // fail open
  }
}
