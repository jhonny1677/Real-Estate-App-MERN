import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../api/.env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import prisma from "../../api/lib/prisma.js";
import { connectBroker, publish } from "../broker/index.js";
import { cacheGet, cacheSet, cacheDel, cacheDelPattern, leaderboardIncr } from "../cache/index.js";
import crypto from "crypto";

const app = express();

app.use(cors({
  origin: ["http://localhost:5174","http://localhost:5175","http://localhost:5176","http://localhost:8800"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.resolve(__dirname, "../../api/uploads")));

// ── Auth middleware ────────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not Authenticated!" });
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not Valid!" });
    req.user = { id: payload.id, role: payload.role };
    next();
  });
};

const requireAdmin = [
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    next();
  },
];

// ── CQRS Event Sourcing helper ────────────────────────────────────────────────
async function appendEvent(type, entityId, data, userId = null) {
  try {
    await prisma.eventLog.create({
      data: { type, entityId, data: JSON.stringify(data), userId },
    });
  } catch { /* non-critical */ }
}

// ── Geospatial setup: create 2dsphere index on startup ───────────────────────
async function ensureGeoIndex() {
  try {
    await prisma.$runCommandRaw({
      createIndexes: "Post",
      indexes: [{ key: { location: "2dsphere" }, name: "location_2dsphere" }],
    });
    console.log("🌍 2dsphere index ready on Post.location");
  } catch (err) {
    // Index may already exist — not an error
    if (!err.message?.includes("already exists") && !err.message?.includes("IndexOptionsConflict")) {
      console.warn("⚠️  2dsphere index:", err.message);
    }
  }
}

// ── Cache key helper ──────────────────────────────────────────────────────────
function listCacheKey(query) {
  return `posts:list:${crypto.createHash("md5").update(JSON.stringify(query)).digest("hex")}`;
}

// ── POST ROUTES  /api/posts/* ─────────────────────────────────────────────────
const postRouter = express.Router();

// GET /api/posts/cities
postRouter.get("/cities", async (req, res) => {
  const { q = "" } = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: q ? { city: { contains: q, mode: "insensitive" } } : {},
      select: { city: true },
      distinct: ["city"],
      take: 8,
      orderBy: { city: "asc" },
    });
    res.json(posts.map((p) => p.city).filter(Boolean));
  } catch { res.json([]); }
});

// GET /api/posts/near — proximity search via 2dsphere ($geoNear aggregation)
postRouter.get("/near", async (req, res) => {
  const { lat, lng, radius = 10000 } = req.query; // radius in metres, default 10 km
  if (!lat || !lng) return res.status(400).json({ message: "lat and lng are required" });

  try {
    const result = await prisma.$runCommandRaw({
      aggregate: "Post",
      pipeline: [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            distanceField: "distanceMetres",
            maxDistance: parseInt(radius),
            spherical: true,
            query: { location: { $exists: true } },
          },
        },
        { $limit: 20 },
        {
          $lookup: {
            from: "User", localField: "userId",
            foreignField: "_id", as: "user",
            pipeline: [{ $project: { username: 1, avatar: 1 } }],
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ],
      cursor: {},
    });

    const posts = (result?.cursor?.firstBatch || []).map((p) => ({
      ...p,
      id: p._id?.$oid || p._id,
      distanceKm: ((p.distanceMetres || 0) / 1000).toFixed(2),
    }));

    res.json({ posts, total: posts.length });
  } catch (err) {
    console.error("proximity search error:", err.message);
    res.status(500).json({ message: "Proximity search failed", detail: err.message });
  }
});

// GET /api/posts/:id/price-history
postRouter.get("/:id/price-history", async (req, res) => {
  const { id } = req.params;
  try {
    const history = await prisma.priceHistory.findMany({ where: { postId: id }, orderBy: { date: "asc" } });
    const post = await prisma.post.findUnique({ where: { id }, select: { price: true, createdAt: true } });
    if (!post) return res.json([]);
    const points = history.length
      ? history.map((h) => ({ price: h.price, date: h.date }))
      : [{ price: post.price, date: post.createdAt }];
    const last = points[points.length - 1];
    if (last.price !== post.price) points.push({ price: post.price, date: new Date() });
    res.json(points);
  } catch { res.json([]); }
});

// GET /api/posts — list with filters, pagination, Redis cache
postRouter.get("/", async (req, res) => {
  const {
    city, type, property, bedroom, bathroom, minPrice, maxPrice,
    minSize, maxSize, utilities, pet, income, nearSchool, nearBus, nearRestaurant,
    sortBy, status, latMin, latMax, lngMin, lngMax,
  } = req.query;

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(24, parseInt(req.query.limit) || 12);

  // Try Redis cache first
  const cacheKey = listCacheKey(req.query);
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json({ ...cached, fromCache: true });

  try {
    const filters = {};
    const detailFilters = {};

    if (city?.trim())  filters.city     = { contains: city.trim(), mode: "insensitive" };
    if (type)          filters.type     = type;
    if (property)      filters.property = property;
    if (bedroom  && !isNaN(parseInt(bedroom)))  filters.bedroom  = { gte: parseInt(bedroom)  };
    if (bathroom && !isNaN(parseInt(bathroom))) filters.bathroom = { gte: parseInt(bathroom) };
    if (status && ["available","under_offer","sold"].includes(status)) filters.status = status;

    const min = parseInt(minPrice), max = parseInt(maxPrice);
    if (!isNaN(min) || !isNaN(max)) {
      filters.price = {};
      if (!isNaN(min)) filters.price.gte = min;
      if (!isNaN(max) && max > 0) filters.price.lte = max;
    }

    const minS = parseInt(minSize), maxS = parseInt(maxSize);
    if (!isNaN(minS) || !isNaN(maxS)) {
      detailFilters.size = {};
      if (!isNaN(minS)) detailFilters.size.gte = minS;
      if (!isNaN(maxS) && maxS > 0) detailFilters.size.lte = maxS;
    }

    if (utilities)   detailFilters.utilities  = { contains: utilities,   mode: "insensitive" };
    if (pet)         detailFilters.pet         = { contains: pet,         mode: "insensitive" };
    if (income)      detailFilters.income      = { contains: income,      mode: "insensitive" };
    if (nearSchool && !isNaN(parseInt(nearSchool)))     detailFilters.school     = { lte: parseInt(nearSchool) };
    if (nearBus    && !isNaN(parseInt(nearBus)))        detailFilters.bus        = { lte: parseInt(nearBus)    };
    if (nearRestaurant && !isNaN(parseInt(nearRestaurant))) detailFilters.restaurant = { lte: parseInt(nearRestaurant) };
    if (Object.keys(detailFilters).length > 0) filters.postDetail = detailFilters;

    const orderByMap = {
      "price-asc":  { price: "asc"  }, "price-desc":  { price: "desc" },
      "size-asc":   { postDetail: { size: "asc"  } },
      "size-desc":  { postDetail: { size: "desc" } },
      "newest":     { createdAt: "desc" }, "oldest": { createdAt: "asc" },
    };
    const orderBy = orderByMap[sortBy] || { price: "asc" };
    const include = { user: { select: { username: true, avatar: true } }, postDetail: true };
    const skip    = (page - 1) * limit;

    // Geo-bounds filter (in-memory, fast for current scale; 2dsphere handles $geoNear separately)
    const hasBounds = latMin && latMax && lngMin && lngMax;
    if (hasBounds) {
      const all = await prisma.post.findMany({ where: filters, include, orderBy });
      const latMinF = Math.min(+latMin, +latMax), latMaxF = Math.max(+latMin, +latMax);
      const lngMinF = Math.min(+lngMin, +lngMax), lngMaxF = Math.max(+lngMin, +lngMax);
      const bounded = all.filter((p) => {
        const lat = parseFloat(p.latitude), lng = parseFloat(p.longitude);
        return !isNaN(lat) && !isNaN(lng) && lat >= latMinF && lat <= latMaxF && lng >= lngMinF && lng <= lngMaxF;
      });
      const payload = {
        posts:  bounded.slice(skip, skip + limit),
        total:  bounded.length,
        page,
        pages:  Math.ceil(bounded.length / limit) || 1,
      };
      await cacheSet(cacheKey, payload, 120); // shorter TTL for geo queries
      return res.json(payload);
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where: filters, include, orderBy, skip, take: limit }),
      prisma.post.count({ where: filters }),
    ]);

    const payload = { posts, total, page, pages: Math.ceil(total / limit) };
    await cacheSet(cacheKey, payload, 300);
    res.json(payload);
  } catch (err) {
    console.error("getPosts error:", err);
    res.status(500).json({ message: "Failed to get posts" });
  }
});

// GET /api/posts/:id — single post with view tracking
postRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ message: "Invalid post ID" });

  // Try cache
  const cacheKey = `posts:single:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    // Track view (async, no await)
    leaderboardIncr("leaderboard:views", id).catch(() => {});
    publish("listing.viewed", { postId: id }).catch(() => {});
    return res.json({ ...cached, fromCache: true });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { postDetail: true, user: { select: { id: true, username: true, avatar: true } } },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    await cacheSet(cacheKey, post, 600);
    leaderboardIncr("leaderboard:views", id).catch(() => {});
    publish("listing.viewed", { postId: id, title: post.title }).catch(() => {});

    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: { userId_postId: { postId: id, userId: payload.id } },
          });
          return res.json({ ...post, isSaved: !!saved });
        }
        res.json({ ...post, isSaved: false });
      });
    } else {
      res.json({ ...post, isSaved: false });
    }
  } catch { res.status(500).json({ message: "Failed to get post" }); }
});

// POST /api/posts — create
postRouter.post("/", verifyToken, async (req, res) => {
  try {
    const { postData, postDetail } = req.body;

    // Build GeoJSON location for 2dsphere index
    const lat = parseFloat(postData.latitude);
    const lng = parseFloat(postData.longitude);
    const location = (!isNaN(lat) && !isNaN(lng))
      ? { type: "Point", coordinates: [lng, lat] }
      : undefined;

    const newPost = await prisma.post.create({
      data: {
        ...postData,
        ...(location ? { location } : {}),
        userId: req.user.id,
        postDetail: { create: postDetail },
      },
    });

    // Invalidate list caches
    await cacheDelPattern("posts:list:*");

    // CQRS event log
    await appendEvent("listing.created", newPost.id, { title: newPost.title, price: newPost.price, city: newPost.city }, req.user.id);

    // RabbitMQ event
    await publish("listing.created", {
      postId: newPost.id, title: newPost.title,
      price: newPost.price, city: newPost.city, userId: req.user.id,
    });

    res.json(newPost);
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// PUT /api/posts/:id — update
postRouter.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.post.findUnique({ where: { id }, include: { postDetail: true } });
    if (!existing) return res.status(404).json({ message: "Post not found!" });
    if (existing.userId !== req.user.id) return res.status(403).json({ message: "Not authorized!" });

    const { id: _di, postId: _pi, ...cleanDetail } = req.body.postDetail || {};
    const originalPrice = existing.price;
    const newPrice      = req.body.postData?.price || originalPrice;

    // Update GeoJSON if coordinates changed
    const newLat = parseFloat(req.body.postData?.latitude  ?? existing.latitude);
    const newLng = parseFloat(req.body.postData?.longitude ?? existing.longitude);
    const location = (!isNaN(newLat) && !isNaN(newLng))
      ? { type: "Point", coordinates: [newLng, newLat] }
      : undefined;

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...req.body.postData,
        ...(location ? { location } : {}),
        postDetail: {
          update: {
            desc: cleanDetail.desc || "",
            utilities:   cleanDetail.utilities   || null,
            pet:         cleanDetail.pet         || null,
            income:      cleanDetail.income      || null,
            size:        cleanDetail.size        ? parseInt(cleanDetail.size) : null,
            school:      cleanDetail.school      || null,
            bus:         cleanDetail.bus         || null,
            restaurant:  cleanDetail.restaurant  || null,
          },
        },
      },
      include: { postDetail: true, user: { select: { username: true, avatar: true } } },
    });

    // Invalidate caches
    await Promise.all([cacheDel(`posts:single:${id}`), cacheDelPattern("posts:list:*")]);

    // Price history + events
    if (newPrice !== originalPrice) {
      await prisma.priceHistory.create({ data: { postId: id, price: newPrice } });

      await appendEvent("listing.priceChanged", id, {
        title: updated.title, oldPrice: originalPrice, newPrice,
      }, req.user.id);

      await publish("listing.priceChanged", {
        postId: id, title: updated.title,
        oldPrice: originalPrice, newPrice,
        savings: originalPrice - newPrice,
        percentage: (((originalPrice - newPrice) / originalPrice) * 100).toFixed(1),
      });

      if (newPrice < originalPrice) {
        updated.priceDropDetected = {
          oldPrice: originalPrice, newPrice,
          savings: originalPrice - newPrice,
          percentage: (((originalPrice - newPrice) / originalPrice) * 100).toFixed(1),
        };
      }
    }

    await appendEvent("listing.updated", id, { title: updated.title, price: newPrice }, req.user.id);
    await publish("listing.updated", { postId: id, title: updated.title, price: newPrice, city: updated.city });

    res.json(updated);
  } catch (err) {
    console.error("updatePost error:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
});

// DELETE /api/posts/:id
postRouter.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({ where: { id }, include: { postDetail: true } });
    if (!post || post.userId !== req.user.id) return res.status(403).json({ message: "Not Authorized!" });
    if (post.postDetail) await prisma.postDetail.delete({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });

    await Promise.all([cacheDel(`posts:single:${id}`), cacheDelPattern("posts:list:*")]);

    await appendEvent("listing.deleted", id, { title: post.title }, req.user.id);
    await publish("listing.deleted", { postId: id, title: post.title, userId: req.user.id });

    res.json({ message: "Post deleted" });
  } catch { res.status(500).json({ message: "Failed to delete post" }); }
});

app.use("/api/posts", postRouter);

// ── LISTINGS alias ────────────────────────────────────────────────────────────
const listingsRouter = express.Router();

listingsRouter.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await prisma.post.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found." });
    if (listing.userId !== req.user.id) return res.status(403).json({ error: "Unauthorized." });
    await prisma.post.delete({ where: { id } });
    await Promise.all([cacheDel(`posts:single:${id}`), cacheDelPattern("posts:list:*")]);
    await publish("listing.deleted", { postId: id, title: listing.title });
    res.json({ message: "Listing deleted successfully." });
  } catch { res.status(500).json({ error: "Server error." }); }
});

listingsRouter.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await prisma.post.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found." });
    if (listing.userId !== req.user.id) return res.status(403).json({ error: "Unauthorized." });
    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: req.body.title, price: req.body.price, address: req.body.address,
        images: req.body.images, bedroom: req.body.bedroom, bathroom: req.body.bathroom,
        postDetail: { update: { desc: req.body.desc, utilities: req.body.utilities, pet: req.body.pet, income: req.body.income, school: req.body.school, bus: req.body.bus, restaurant: req.body.restaurant, size: req.body.size } },
      },
      include: { postDetail: true },
    });
    await Promise.all([cacheDel(`posts:single:${id}`), cacheDelPattern("posts:list:*")]);
    await publish("listing.updated", { postId: id, title: updated.title, price: updated.price });
    res.json(updated);
  } catch { res.status(500).json({ error: "Server error." }); }
});

app.use("/api/listings", listingsRouter);

// ── SAVED POSTS (user.savedProperty event) ────────────────────────────────────
const savedPostsRouter = express.Router();

savedPostsRouter.post("/", verifyToken, async (req, res) => {
  const { postId } = req.body;
  try {
    const existing = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId: req.user.id, postId } },
    });

    if (existing) {
      await prisma.savedPost.delete({ where: { userId_postId: { userId: req.user.id, postId } } });
      return res.json({ saved: false });
    }

    await prisma.savedPost.create({ data: { userId: req.user.id, postId } });
    await publish("user.savedProperty", { userId: req.user.id, postId });
    return res.json({ saved: true });
  } catch { res.status(500).json({ message: "Failed to toggle save" }); }
});

savedPostsRouter.get("/", verifyToken, async (req, res) => {
  try {
    const saved = await prisma.savedPost.findMany({
      where: { userId: req.user.id },
      include: { post: { include: { postDetail: true, user: { select: { username: true, avatar: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(saved.map((s) => s.post));
  } catch { res.status(500).json({ message: "Failed to fetch saved posts" }); }
});

app.use("/api/posts/saved", savedPostsRouter);

// ── BOOKING ROUTES  /api/bookings/* ──────────────────────────────────────────
const bookingRouter = express.Router();

bookingRouter.post("/create-payment-intent", verifyToken, async (req, res) => {
  const { amount, currency = "usd" } = req.body;
  if (!process.env.STRIPE_SECRET_KEY) return res.json({ clientSecret: null, demo: true });
  try {
    const stripe = (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), currency,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: intent.client_secret, demo: false });
  } catch { res.status(500).json({ message: "Failed to create payment intent" }); }
});

bookingRouter.get("/slots/:postId", async (req, res) => {
  const { postId } = req.params;
  const { date }   = req.query;
  if (!date) return res.json({ bookedSlots: [] });
  try {
    const bookings = await prisma.booking.findMany({
      where: { postId, date, status: { not: "cancelled" } },
      select: { time: true },
    });
    res.json({ bookedSlots: bookings.map((b) => b.time) });
  } catch { res.json({ bookedSlots: [] }); }
});

bookingRouter.post("/confirm", verifyToken, async (req, res) => {
  const { postId, visitType, date, time, fee, contactInfo, notes, paymentId, paymentMethod } = req.body;
  try {
    const existing = await prisma.booking.findFirst({
      where: { postId, date, time, status: { not: "cancelled" } },
    });
    if (existing) return res.status(409).json({ message: "This time slot is already booked." });

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id, postId, visitType, date, time, fee,
        contactName: contactInfo.name, contactEmail: contactInfo.email, contactPhone: contactInfo.phone,
        notes: notes || "", paymentId: paymentId || null,
        paymentMethod: paymentMethod || "demo",
        confirmationNumber: `CONF_${Date.now()}`, status: "confirmed",
      },
    });

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { title: true } });

    await appendEvent("booking.created", booking.id, {
      postId, userId: req.user.id, date, time, fee,
    }, req.user.id);

    await publish("booking.created", {
      bookingId:          booking.id,
      confirmationNumber: booking.confirmationNumber,
      postId,
      postTitle:          post?.title || "",
      userId:             req.user.id,
      email:              contactInfo.email,
      username:           contactInfo.name,
      date, time, visitType, fee,
    });

    res.status(201).json(booking);
  } catch { res.status(500).json({ message: "Failed to save booking" }); }
});

bookingRouter.get("/my", verifyToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
  } catch { res.status(500).json({ message: "Failed to fetch bookings" }); }
});

app.use("/api/bookings", bookingRouter);

// ── ADMIN ROUTES  /api/admin/* ────────────────────────────────────────────────
const adminRouter = express.Router();

adminRouter.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalBookings] = await Promise.all([
      prisma.user.count(), prisma.post.count(), prisma.booking.count(),
    ]);
    res.json({ totalUsers, totalPosts, totalBookings });
  } catch { res.status(500).json({ message: "Failed to fetch stats" }); }
});

adminRouter.get("/posts", requireAdmin, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(posts);
  } catch { res.status(500).json({ message: "Failed to fetch posts" }); }
});

adminRouter.delete("/posts/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({ where: { id }, include: { postDetail: true } });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.postDetail) await prisma.postDetail.delete({ where: { postId: id } });
    await prisma.savedPost.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });
    await Promise.all([cacheDel(`posts:single:${id}`), cacheDelPattern("posts:list:*")]);
    await publish("listing.deleted", { postId: id, source: "admin" });
    res.json({ message: "Post deleted" });
  } catch (err) { res.status(500).json({ message: "Failed to delete post", detail: err.message }); }
});

// CQRS: event log replay (audit trail)
adminRouter.get("/event-log", requireAdmin, async (req, res) => {
  const { type, entityId, limit = 50, page = 1 } = req.query;
  try {
    const where = {};
    if (type)     where.type     = type;
    if (entityId) where.entityId = entityId;

    const [events, total] = await Promise.all([
      prisma.eventLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.min(100, parseInt(limit)),
        skip: (parseInt(page) - 1) * parseInt(limit),
      }),
      prisma.eventLog.count({ where }),
    ]);

    res.json({
      events: events.map((e) => ({ ...e, data: JSON.parse(e.data) })),
      total, page: parseInt(page),
    });
  } catch { res.status(500).json({ message: "Failed to fetch event log" }); }
});

app.use("/api/admin", adminRouter);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ service: "listing-service", status: "ok", ts: new Date().toISOString() })
);

// ── Boot ──────────────────────────────────────────────────────────────────────
connectBroker("listing-service").catch(() => {});
ensureGeoIndex().catch(() => {});

app.listen(3002, () => console.log("🏠 listing-service     → http://localhost:3002  (cache+events+geo)"));
