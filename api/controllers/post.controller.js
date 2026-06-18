import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

// ✅ GET PRICE HISTORY for a property
export const getPriceHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const history = await prisma.priceHistory.findMany({
      where: { postId: id },
      orderBy: { date: "asc" },
    });

    // Always include current price as the latest point
    const post = await prisma.post.findUnique({ where: { id }, select: { price: true, createdAt: true } });
    if (!post) return res.json([]);

    // If no history, return just the creation price as the starting point
    const points = history.length
      ? history.map(h => ({ price: h.price, date: h.date }))
      : [{ price: post.price, date: post.createdAt }];

    // Add current price as final point if it differs from last recorded
    const last = points[points.length - 1];
    if (last.price !== post.price) {
      points.push({ price: post.price, date: new Date() });
    }

    res.json(points);
  } catch (err) {
    console.error("Price history error:", err);
    res.json([]);
  }
};

// ✅ GET CITY SUGGESTIONS for autocomplete
export const getCities = async (req, res) => {
  const { q = "" } = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: q ? { city: { contains: q, mode: "insensitive" } } : {},
      select: { city: true },
      distinct: ["city"],
      take: 8,
      orderBy: { city: "asc" },
    });
    res.json(posts.map(p => p.city).filter(Boolean));
  } catch (err) {
    res.json([]);
  }
};

// ✅ GET ALL POSTS with filtering support and debug logging
export const getPosts = async (req, res) => {
  const {
    city, type, property, bedroom, bathroom, minPrice, maxPrice,
    minSize, maxSize, utilities, pet, income, nearSchool, nearBus, nearRestaurant, sortBy, status,
    latMin, latMax, lngMin, lngMax
  } = req.query;

  try {
    const filters = {};
    const postDetailFilters = {};

    // 🔍 Log raw incoming query
    console.log("Incoming query:", req.query);

    // City: case-insensitive partial match
    if (city && city.trim() !== "") {
      filters.city = {
        contains: city.trim(),
        mode: "insensitive",
      };
    }

    // Type: "buy" or "rent"
    if (type) {
      filters.type = type;
    }

    // Property type (apartment, house, etc.)
    if (property) {
      filters.property = property;
    }

    // Bedroom (minimum bedrooms)
    if (bedroom && !isNaN(parseInt(bedroom))) {
      filters.bedroom = {
        gte: parseInt(bedroom)
      };
    }

    // Bathroom (minimum bathrooms)
    if (bathroom && !isNaN(parseInt(bathroom))) {
      filters.bathroom = {
        gte: parseInt(bathroom)
      };
    }

    // Price Range
    const min = parseInt(minPrice);
    const max = parseInt(maxPrice);
    if (!isNaN(min) || !isNaN(max)) {
      filters.price = {};
      if (!isNaN(min)) filters.price.gte = min;
      if (!isNaN(max) && max > 0) filters.price.lte = max;
    }

    // Size Range (PostDetail filters)
    const minSizeNum = parseInt(minSize);
    const maxSizeNum = parseInt(maxSize);
    if (!isNaN(minSizeNum) || !isNaN(maxSizeNum)) {
      postDetailFilters.size = {};
      if (!isNaN(minSizeNum)) postDetailFilters.size.gte = minSizeNum;
      if (!isNaN(maxSizeNum) && maxSizeNum > 0) postDetailFilters.size.lte = maxSizeNum;
    }

    // Utilities filter
    if (utilities) {
      postDetailFilters.utilities = {
        contains: utilities,
        mode: "insensitive"
      };
    }

    // Pet policy filter
    if (pet) {
      postDetailFilters.pet = {
        contains: pet,
        mode: "insensitive"
      };
    }

    // Income requirement filter
    if (income) {
      postDetailFilters.income = {
        contains: income,
        mode: "insensitive"
      };
    }

    // Proximity filters (convert to numeric for comparison)
    if (nearSchool && !isNaN(parseInt(nearSchool))) {
      postDetailFilters.school = {
        lte: parseInt(nearSchool)
      };
    }

    if (nearBus && !isNaN(parseInt(nearBus))) {
      postDetailFilters.bus = {
        lte: parseInt(nearBus)
      };
    }

    if (nearRestaurant && !isNaN(parseInt(nearRestaurant))) {
      postDetailFilters.restaurant = {
        lte: parseInt(nearRestaurant)
      };
    }

    if (status && ["available","under_offer","sold"].includes(status)) {
      filters.status = status;
    }

    if (Object.keys(postDetailFilters).length > 0) {
      filters.postDetail = postDetailFilters;
    }

    // Add sorting
    let orderBy = {};
    if (sortBy) {
      switch (sortBy) {
        case "price-asc":   orderBy = { price: "asc" };  break;
        case "price-desc":  orderBy = { price: "desc" }; break;
        case "size-asc":    orderBy = { postDetail: { size: "asc" } };  break;
        case "size-desc":   orderBy = { postDetail: { size: "desc" } }; break;
        case "newest":      orderBy = { createdAt: "desc" }; break;
        case "oldest":      orderBy = { createdAt: "asc" };  break;
        default:            orderBy = { price: "asc" };
      }
    } else {
      orderBy = { price: "asc" };
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(24, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    // Bounding box: lat/lng stored as strings → filter in JS after fetch
    const hasBounds = latMin && latMax && lngMin && lngMax;

    if (hasBounds) {
      // Fetch ALL matching posts (other filters applied), then filter by coords in JS
      const allPosts = await prisma.post.findMany({
        where: filters,
        include: {
          user: { select: { username: true, avatar: true } },
          postDetail: true,
        },
        orderBy,
      });

      const latMinF = Math.min(+latMin, +latMax);
      const latMaxF = Math.max(+latMin, +latMax);
      const lngMinF = Math.min(+lngMin, +lngMax);
      const lngMaxF = Math.max(+lngMin, +lngMax);

      const bounded = allPosts.filter(p => {
        const lat = parseFloat(p.latitude);
        const lng = parseFloat(p.longitude);
        return !isNaN(lat) && !isNaN(lng) &&
               lat >= latMinF && lat <= latMaxF &&
               lng >= lngMinF && lng <= lngMaxF;
      });

      const total = bounded.length;
      const sliced = bounded.slice(skip, skip + limit);
      console.log(`Map search: ${total} posts in bounds`);
      return res.status(200).json({ posts: sliced, total, page, pages: Math.ceil(total / limit) || 1 });
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: filters,
        include: {
          user: { select: { username: true, avatar: true } },
          postDetail: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({ where: filters }),
    ]);

    console.log(`Posts found: ${posts.length} / ${total}`);
    res.status(200).json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("getPosts error:", err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

// ✅ GET SINGLE POST
export const getPost = async (req, res) => {
  const id = req.params.id;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          return res.status(200).json({ ...post, isSaved: !!saved });
        } else {
          return res.status(200).json({ ...post, isSaved: false });
        }
      });
    } else {
      return res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.log("getPost error:", err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

// ✅ ADD POST
export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.user?.id;

  if (!tokenUserId) return res.status(401).json({ message: "Unauthorized" });

  if (!body.postData) {
    return res.status(400).json({ message: "Missing postData" });
  }
  const requiredFields = ["title", "price", "address", "city", "type", "property"];
  const missing = requiredFields.filter((f) => !body.postData[f] && body.postData[f] !== 0);
  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

// ✅ UPDATE POST
export const updatePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.user?.id;
  const body = req.body;

  if (!tokenUserId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { postDetail: true },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found!" });
    }

    if (existingPost.userId !== tokenUserId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this post!" });
    }

    const { id: detailId, postId, ...cleanPostDetail } = body.postDetail || {};

    // Store original price for price drop detection
    const originalPrice = existingPost.price;
    const newPrice = body.postData.price || originalPrice;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...body.postData,
        images: body.postData.images,
        postDetail: {
          update: {
            desc: cleanPostDetail.desc || "",
            utilities: cleanPostDetail.utilities || null,
            pet: cleanPostDetail.pet || null,
            income: cleanPostDetail.income || null,
            size: cleanPostDetail.size ? parseInt(cleanPostDetail.size) : null,
            school: cleanPostDetail.school || null,
            bus: cleanPostDetail.bus || null,
            restaurant: cleanPostDetail.restaurant || null,
          },
        },
      },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Record price history whenever price changes
    if (newPrice !== originalPrice) {
      await prisma.priceHistory.create({
        data: { postId: id, price: newPrice },
      });
      console.log(`📈 Price change recorded: ${existingPost.title} $${originalPrice} → $${newPrice}`);
    }

    if (newPrice < originalPrice) {
      updatedPost.priceDropDetected = {
        oldPrice: originalPrice,
        newPrice: newPrice,
        savings: originalPrice - newPrice,
        percentage: (((originalPrice - newPrice) / originalPrice) * 100).toFixed(1),
      };
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Failed to update post:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

// ✅ DELETE POST
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.user?.id;

  if (!tokenUserId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { postDetail: true },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }
    if (post.userId !== tokenUserId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    if (post.postDetail) {
      await prisma.postDetail.delete({
        where: { postId: id },
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Failed to delete post:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
