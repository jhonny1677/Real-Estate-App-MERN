import express from "express";
import { shouldBeAdmin, shouldBeLoggedIn } from "../controllers/test.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Basic API test endpoint
router.get("/", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// Database test endpoint
router.get("/db", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { username: true, email: true, isEmailVerified: true }
    });
    res.json({ 
      message: "Database connected!", 
      userCount: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

router.get("/should-be-logged-in", verifyToken, shouldBeLoggedIn);

router.get("/should-be-admin", shouldBeAdmin);

export default router;
