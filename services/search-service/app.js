/**
 * Search Service — MongoDB regex full-text search + RabbitMQ subscriber.
 * Elasticsearch-ready: replace the searchPosts() body with an ES client call.
 *
 * RabbitMQ subscription:
 *   listing.created / listing.updated → invalidate search cache
 *   listing.deleted                   → remove from index / cache
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../api/.env") });

import express from "express";
import cors from "cors";
import prisma from "../../api/lib/prisma.js";
import { connectBroker, subscribe } from "../broker/index.js";
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from "../cache/index.js";
import crypto from "crypto";

const app = express();
app.use(cors({ origin: ["http://localhost:5174","http://localhost:5175","http://localhost:5176","http://localhost:8800"] }));
app.use(express.json());

// ── RabbitMQ subscriber — invalidate search cache on listing changes ──────────
async function startSubscriber() {
  await connectBroker("search-service");

  await subscribe(
    "search.reindex",
    ["listing.created", "listing.updated", "listing.deleted"],
    async ({ routingKey, data }) => {
      console.log(`[search] ← ${routingKey}:`, data.postId || data.title);

      // Invalidate all list caches on any listing change
      await cacheDelPattern("search:*");

      if (routingKey === "listing.deleted") {
        await cacheDel(`search:single:${data.postId}`);
      }

      // [ES] For Elasticsearch: on created/updated → index the document
      //      On deleted → esClient.delete({ index: "posts", id: data.postId })
    },
  );
}

// ── Cache key ─────────────────────────────────────────────────────────────────
function searchCacheKey(query) {
  return `search:${crypto.createHash("md5").update(JSON.stringify(query)).digest("hex")}`;
}

// ── Core search function (swap body for Elasticsearch) ───────────────────────
async function searchPosts({ q, city, type, minPrice, maxPrice, bedroom, property, status, page, limit }) {
  // [ES] Replace this entire block with:
  // const { hits } = await esClient.search({ index: "posts", body: { query: { ... } } });
  // return { results: hits.hits.map(h => h._source), total: hits.total.value };

  const filters = {};

  if (q) {
    filters.OR = [
      { title:      { contains: q, mode: "insensitive" } },
      { address:    { contains: q, mode: "insensitive" } },
      { city:       { contains: q, mode: "insensitive" } },
      { postDetail: { desc: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (city)     filters.city     = { contains: city, mode: "insensitive" };
  if (type)     filters.type     = type;
  if (property) filters.property = property;
  if (status && ["available","under_offer","sold"].includes(status)) filters.status = status;
  if (bedroom && !isNaN(parseInt(bedroom))) filters.bedroom = { gte: parseInt(bedroom) };

  const min = parseInt(minPrice), max = parseInt(maxPrice);
  if (!isNaN(min) || !isNaN(max)) {
    filters.price = {};
    if (!isNaN(min)) filters.price.gte = min;
    if (!isNaN(max) && max > 0) filters.price.lte = max;
  }

  const skip = (page - 1) * limit;
  const [results, total] = await Promise.all([
    prisma.post.findMany({
      where:    filters,
      include:  { user: { select: { username: true, avatar: true } }, postDetail: true },
      orderBy:  { createdAt: "desc" },
      skip,
      take:     limit,
    }),
    prisma.post.count({ where: filters }),
  ]);

  return { results, total };
}

// ── GET /api/search ───────────────────────────────────────────────────────────
app.get("/api/search", async (req, res) => {
  const { q, city, type, minPrice, maxPrice, bedroom, property, status } = req.query;
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(24, parseInt(req.query.limit) || 12);

  if (!q && !city && !type && !minPrice && !maxPrice && !bedroom && !property && !status) {
    return res.status(400).json({ message: "Provide at least one search parameter" });
  }

  const cacheKey = searchCacheKey(req.query);
  const cached   = await cacheGet(cacheKey);
  if (cached) return res.json({ ...cached, fromCache: true });

  try {
    const { results, total } = await searchPosts({
      q, city, type, minPrice, maxPrice, bedroom, property, status, page, limit,
    });

    const payload = {
      results, total, page,
      pages: Math.ceil(total / limit),
      query: { q, city, type, minPrice, maxPrice, bedroom, property, status },
    };
    await cacheSet(cacheKey, payload, 180);
    res.json(payload);
  } catch (err) {
    console.error("search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

// ── GET /api/search/suggestions ──────────────────────────────────────────────
app.get("/api/search/suggestions", async (req, res) => {
  const { q = "" } = req.query;
  if (!q.trim()) return res.json([]);

  const cacheKey = `search:suggest:${q.toLowerCase()}`;
  const cached   = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [cities, titles] = await Promise.all([
      prisma.post.findMany({
        where:    { city: { contains: q, mode: "insensitive" } },
        select:   { city: true },
        distinct: ["city"],
        take:     5,
      }),
      prisma.post.findMany({
        where:  { title: { contains: q, mode: "insensitive" } },
        select: { id: true, title: true, city: true },
        take:   5,
      }),
    ]);

    const suggestions = [
      ...cities.map((c) => ({ type: "city",    label: c.city,  value: c.city })),
      ...titles.map((p) => ({ type: "listing", label: p.title, value: p.id, city: p.city })),
    ];

    await cacheSet(cacheKey, suggestions, 120);
    res.json(suggestions);
  } catch { res.json([]); }
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({
    service:              "search-service",
    backend:              "mongodb-regex",
    elasticsearchReady:   false,
    status:               "ok",
    ts:                   new Date().toISOString(),
  })
);

// ── Boot ──────────────────────────────────────────────────────────────────────
startSubscriber().catch((err) => console.error("[search] subscriber failed:", err.message));
app.listen(3005, () => console.log("🔍 search-service      → http://localhost:3005  (RabbitMQ subscriber active)"));
