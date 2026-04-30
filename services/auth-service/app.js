import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../api/.env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import prisma from "../../api/lib/prisma.js";
import { connectBroker, publish } from "../broker/index.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:5174","http://localhost:5175","http://localhost:5176","http://localhost:8800"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Shared middleware ──────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateToken = () => crypto.randomBytes(32).toString("hex");

// Call notification-service to send an email (fire-and-forget, won't crash auth)
const notifyEmail = async (type, payload) => {
  try {
    await fetch(`http://localhost:3004/internal/email/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    console.warn(`[auth] notification-service unreachable for type="${type}" — email skipped`);
  }
};

// ── AUTH ROUTES  /api/auth/* ───────────────────────────────────────────────────
const authRouter = express.Router();

// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, emailVerificationToken: verificationToken },
    });
    await notifyEmail("verification", { email, username, token: verificationToken });
    res.status(201).json({ message: "User created. Check your email to verify your account." });
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ message: "Username or email already exists!" });
    res.status(500).json({ message: "Failed to create user!" });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ message: "Invalid Credentials!" });
    if (!user.isEmailVerified) {
      return res.status(400).json({ message: "Please verify your email before logging in.", needsVerification: true });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid Credentials!" });

    const age = 1000 * 60 * 60 * 24 * 7;
    const token = jwt.sign({ id: user.id, isAdmin: user.role === "admin", role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: age });
    const { password: _pw, ...userInfo } = user;
    res.cookie("token", token, { httpOnly: true, maxAge: age }).status(200).json(userInfo);
  } catch {
    res.status(500).json({ message: "Failed to login!" });
  }
});

// POST /api/auth/logout
authRouter.post("/logout", (_req, res) => res.clearCookie("token").status(200).json({ message: "Logout Successful" }));

// POST /api/auth/verify-email
authRouter.post("/verify-email", async (req, res) => {
  const { token } = req.body;
  try {
    const user = await prisma.user.findFirst({ where: { emailVerificationToken: token } });
    if (!user) return res.status(400).json({ message: "Invalid or expired token!" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Already verified!" });
    await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true, emailVerificationToken: null } });
    res.status(200).json({ message: "Email verified successfully!" });
  } catch {
    res.status(500).json({ message: "Failed to verify email!" });
  }
});

// POST /api/auth/resend-verification
authRouter.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Already verified!" });
    const newToken = generateToken();
    await prisma.user.update({ where: { id: user.id }, data: { emailVerificationToken: newToken } });
    await notifyEmail("verification", { email, username: user.username, token: newToken });
    res.status(200).json({ message: "Verification email sent!" });
  } catch {
    res.status(500).json({ message: "Failed to resend verification email!" });
  }
});

// POST /api/auth/request-reset
authRouter.post("/request-reset", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = generateToken();
      const resetExpiry = new Date(Date.now() + 3_600_000);
      await prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: resetToken, passwordResetExpiry: resetExpiry } });
      await notifyEmail("reset", { email, username: user.username, token: resetToken });
    }
    res.status(200).json({ message: "If the email exists, a reset link has been sent." });
  } catch {
    res.status(500).json({ message: "Failed to process reset request!" });
  }
});

// POST /api/auth/reset-password
authRouter.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await prisma.user.findFirst({ where: { passwordResetToken: token, passwordResetExpiry: { gt: new Date() } } });
    if (!user) return res.status(400).json({ message: "Invalid or expired reset token!" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed, passwordResetToken: null, passwordResetExpiry: null } });
    res.status(200).json({ message: "Password reset successfully!" });
  } catch {
    res.status(500).json({ message: "Failed to reset password!" });
  }
});

// GET /api/auth/me
authRouter.get("/me", async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, email: true, avatar: true, role: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

// POST /api/auth/clerk-sync
authRouter.post("/clerk-sync", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "No token provided" });
  try {
    const { createClerkClient } = await import("@clerk/backend");
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const payload = await clerk.verifyToken(token);
    const clerkUser = await clerk.users.getUser(payload.sub);
    const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
    if (!email) return res.status(400).json({ message: "No email from provider" });
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || email.split("@")[0];
    const clerkId = clerkUser.id;
    let user = await prisma.user.findFirst({ where: { OR: [{ oauthId: clerkId, oauthProvider: "clerk" }, { email }] } });
    if (!user) {
      let base = name.replace(/\s+/g, "").toLowerCase();
      let username = base;
      let n = 1;
      while (await prisma.user.findUnique({ where: { username } })) username = `${base}${n++}`;
      user = await prisma.user.create({ data: { email, username, avatar: clerkUser.imageUrl, oauthProvider: "clerk", oauthId: clerkId, isEmailVerified: true } });
    } else if (!user.oauthId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { oauthProvider: "clerk", oauthId: clerkId, avatar: clerkUser.imageUrl } });
    }
    const jwtToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
    res.cookie("token", jwtToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "lax" });
    res.json({ id: user.id, username: user.username, email: user.email, avatar: user.avatar, role: user.role });
  } catch (err) {
    console.error("Clerk sync error:", err.message);
    res.status(401).json({ message: "Authentication failed" });
  }
});

app.use("/api/auth", authRouter);

// ── USER ROUTES  /api/users/* ─────────────────────────────────────────────────
const userRouter = express.Router();

// GET /api/users
userRouter.get("/", async (req, res) => {
  const { search } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: search ? { username: { contains: search, mode: "insensitive" } } : undefined,
      select: { id: true, username: true, avatar: true, email: true },
    });
    res.json(users);
  } catch { res.status(500).json({ message: "Failed to get users!" }); }
});

// PUT /api/users/:id
userRouter.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (id !== req.user.id) return res.status(403).json({ message: "Not Authorized!" });
  const { password, avatar, ...inputs } = req.body;
  try {
    let updatedPassword;
    if (password) updatedPassword = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({
      where: { id },
      data: { ...inputs, ...(updatedPassword && { password: updatedPassword }), ...(avatar && { avatar }) },
    });
    const { password: _pw, ...safe } = updated;
    res.json(safe);
  } catch { res.status(500).json({ message: "Failed to update user!" }); }
});

// DELETE /api/users/:id
userRouter.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (id !== req.user.id) return res.status(403).json({ message: "Not Authorized!" });
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch { res.status(500).json({ message: "Failed to delete user!" }); }
});

// POST /api/users/save  — save/unsave a post
userRouter.post("/save", verifyToken, async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.id;
  try {
    const existing = await prisma.savedPost.findUnique({ where: { userId_postId: { userId, postId } } });
    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } });
      await publish("user.unsavedProperty", { userId, postId });
      return res.json({ message: "Post removed from saved list" });
    }
    await prisma.savedPost.create({ data: { userId, postId } });
    await publish("user.savedProperty", { userId, postId });
    res.json({ message: "Post saved" });
  } catch { res.status(500).json({ message: "Failed to save/unsave post!" }); }
});

// GET /api/users/profilePosts
userRouter.get("/profilePosts", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [userPosts, saved] = await Promise.all([
      prisma.post.findMany({ where: { userId } }),
      prisma.savedPost.findMany({ where: { userId }, include: { post: true } }),
    ]);
    const savedPosts = saved.filter((s) => s.post !== null).map((s) => s.post);
    res.json({ userPosts, savedPosts });
  } catch { res.status(500).json({ message: "Failed to get profile posts!" }); }
});

// GET /api/users/notification  — unseen chat count
userRouter.get("/notification", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const count = await prisma.chat.count({
      where: { userIDs: { hasSome: [userId] }, NOT: { seenBy: { hasSome: [userId] } } },
    });
    res.json(count);
  } catch { res.status(500).json({ message: "Failed to get notifications!" }); }
});

app.use("/api/users", userRouter);

// ── ADMIN USER ROUTES  /api/admin/users/* ────────────────────────────────────
const adminUserRouter = express.Router();

adminUserRouter.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, isBanned: true, isEmailVerified: true, createdAt: true, avatar: true, _count: { select: { posts: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch { res.status(500).json({ message: "Failed to fetch users" }); }
});

adminUserRouter.put("/:id", requireAdmin, async (req, res) => {
  const { role, isBanned } = req.body;
  try {
    const data = {};
    if (role !== undefined) data.role = role;
    if (isBanned !== undefined) data.isBanned = isBanned;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, username: true, role: true, isBanned: true },
    });
    res.json(user);
  } catch { res.status(500).json({ message: "Failed to update user" }); }
});

adminUserRouter.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch { res.status(500).json({ message: "Failed to delete user" }); }
});

app.use("/api/admin/users", adminUserRouter);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ service: "auth-service", status: "ok", ts: new Date().toISOString() }));

connectBroker("auth-service").catch(() => {});
app.listen(3001, () => console.log("🔐 auth-service        → http://localhost:3001"));
