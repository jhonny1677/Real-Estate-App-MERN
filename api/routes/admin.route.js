import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// All admin routes require auth + admin role
const requireAdmin = [verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
}];

// GET /api/admin/stats
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalBookings] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.booking.count(),
    ]);
    res.json({ totalUsers, totalPosts, totalBookings });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// GET /api/admin/users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, username: true, email: true, role: true,
        isBanned: true, isEmailVerified: true, createdAt: true, avatar: true,
        _count: { select: { posts: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// PUT /api/admin/users/:id  (update role or ban status)
router.put("/users/:id", requireAdmin, async (req, res) => {
  const { role, isBanned } = req.body;
  try {
    const update = {};
    if (role !== undefined) update.role = role;
    if (isBanned !== undefined) update.isBanned = isBanned;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: update,
      select: { id: true, username: true, role: true, isBanned: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// GET /api/admin/posts
router.get("/posts", requireAdmin, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// DELETE /api/admin/posts/:id
router.delete("/posts/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post" });
  }
});

export default router;
