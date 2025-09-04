import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

// ✅ GET ALL POSTS with filtering support and debug logging
export const getPosts = async (req, res) => {
  const { 
    city, type, property, bedroom, bathroom, minPrice, maxPrice,
    minSize, maxSize, utilities, pet, income, nearSchool, nearBus, nearRestaurant, sortBy
  } = req.query;

  try {
    const filters = {};
    const postDetailFilters = {};

    // 🔍 Log raw incoming query
    console.log("✅ Incoming query:", req.query);

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

    // Add postDetail filters if any exist
    if (Object.keys(postDetailFilters).length > 0) {
      filters.postDetail = postDetailFilters;
    }

    // 🔍 Log final Prisma filters being applied
    console.log("✅ Applied filters:", filters);

    // Add sorting
    let orderBy = {};
    if (sortBy) {
      switch (sortBy) {
        case "price-asc":
          orderBy = { price: "asc" };
          break;
        case "price-desc":
          orderBy = { price: "desc" };
          break;
        case "size-asc":
          orderBy = { postDetail: { size: "asc" } };
          break;
        case "size-desc":
          orderBy = { postDetail: { size: "desc" } };
          break;
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        default:
          orderBy = { price: "asc" };
      }
    } else {
      orderBy = { price: "asc" };
    }

    console.log("✅ Applied sorting:", orderBy);

    const posts = await prisma.post.findMany({
      where: filters,
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        postDetail: true,
      },
      orderBy: orderBy,
    });

    console.log(`✅ Posts found: ${posts.length}`);
    res.status(200).json(posts);
  } catch (err) {
    console.error("❌ getPosts error:", err);
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

    if (existingPost.userId !== tokenUserId) {
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

    // Check for price drop and emit event if price decreased
    if (newPrice < originalPrice) {
      console.log(`🚨 Price drop detected: ${existingPost.title} - $${originalPrice} → $${newPrice}`);
      
      // Add price drop notification flag to response
      updatedPost.priceDropDetected = {
        oldPrice: originalPrice,
        newPrice: newPrice,
        savings: originalPrice - newPrice,
        percentage: (((originalPrice - newPrice) / originalPrice) * 100).toFixed(1)
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

    if (!post || post.userId !== tokenUserId) {
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
