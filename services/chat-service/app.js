import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../api/.env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";
import multer from "multer";
import fs from "fs";
import prisma from "../../api/lib/prisma.js";
const app = express();

const ALLOWED_ORIGINS = ["http://localhost:5174","http://localhost:5175","http://localhost:5176","http://localhost:8800"];

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve chat file attachments
const uploadsDir = path.resolve(__dirname, "uploads/chat-files");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

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

// ── File upload config ─────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `file-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype));
  },
});

// ── CHAT ROUTES  /api/chats/* ─────────────────────────────────────────────────
const chatRouter = express.Router();

// GET /api/chats
chatRouter.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const chats = await prisma.chat.findMany({ where: { userIDs: { hasSome: [userId] } }, orderBy: { updatedAt: "desc" } });
    const enriched = await Promise.all(
      chats.map(async (chat) => {
        const receiverId = chat.userIDs.find((id) => id !== userId);
        const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, username: true, avatar: true } });
        return { ...chat, receiver, isSeen: chat.seenBy.includes(userId) };
      })
    );
    res.json(enriched);
  } catch { res.status(500).json({ message: "Failed to get chats!" }); }
});

// GET /api/chats/:id
chatRouter.get("/:id", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const chat = await prisma.chat.findUnique({ where: { id: req.params.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
    if (!chat || !chat.userIDs.includes(userId)) return res.status(404).json({ message: "Chat not found!" });
    if (!chat.seenBy.includes(userId)) {
      await prisma.chat.update({ where: { id: req.params.id }, data: { seenBy: { push: userId } } });
    }
    res.json(chat);
  } catch { res.status(500).json({ message: "Failed to get chat!" }); }
});

// POST /api/chats
chatRouter.post("/", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { receiverId } = req.body;
  if (!receiverId || receiverId === userId) return res.status(400).json({ message: "Invalid user info" });
  try {
    const existing = await prisma.chat.findFirst({ where: { userIDs: { hasEvery: [userId, receiverId] } } });
    if (existing) return res.json(existing);
    const newChat = await prisma.chat.create({ data: { userIDs: [userId, receiverId], seenBy: [userId] } });
    res.status(201).json(newChat);
  } catch { res.status(500).json({ message: "Failed to create chat!" }); }
});

// PUT /api/chats/read/:id
chatRouter.put("/read/:id", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const chat = await prisma.chat.findUnique({ where: { id: req.params.id } });
    if (!chat || !chat.userIDs.includes(userId)) return res.status(403).json({ message: "Not authorized!" });
    if (!chat.seenBy.includes(userId)) {
      await prisma.chat.update({ where: { id: req.params.id }, data: { seenBy: { push: userId } } });
    }
    res.json({ message: "Chat marked as read." });
  } catch { res.status(500).json({ message: "Failed to mark chat as read!" }); }
});

app.use("/api/chats", chatRouter);

// ── MESSAGE ROUTES  /api/messages/* ───────────────────────────────────────────
const messageRouter = express.Router();

// POST /api/messages/:chatId
messageRouter.post("/:chatId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const { text } = req.body;
  try {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || !chat.userIDs.includes(userId)) return res.status(404).json({ message: "Chat not found!" });
    const message = await prisma.message.create({ data: { text, chatId, userId } });
    await prisma.chat.update({ where: { id: chatId }, data: { seenBy: [userId], lastMessage: text } });
    res.json(message);
  } catch { res.status(500).json({ message: "Failed to add message!" }); }
});

// POST /api/messages/:chatId/with-file
messageRouter.post("/:chatId/with-file", verifyToken, upload.single("file"), async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const text = req.body.text || "";
  try {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || !chat.userIDs.includes(userId)) return res.status(404).json({ message: "Chat not found!" });
    const data = { text, chatId, userId };
    if (req.file) {
      data.fileUrl = `/uploads/chat-files/${req.file.filename}`;
      data.fileName = req.file.originalname;
      data.fileType = req.file.mimetype;
      data.fileSize = req.file.size;
    }
    const message = await prisma.message.create({ data });
    const lastMessage = req.file ? (text ? `${text} [File: ${req.file.originalname}]` : `[File: ${req.file.originalname}]`) : text;
    await prisma.chat.update({ where: { id: chatId }, data: { seenBy: [userId], lastMessage } });
    res.json(message);
  } catch { res.status(500).json({ message: "Failed to add message with file!" }); }
});

app.use("/api/messages", messageRouter);

// ── Socket.io real-time layer ─────────────────────────────────────────────────
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, methods: ["GET", "POST"] },
});

let onlineUsers = [];

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    if (!onlineUsers.find((u) => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = onlineUsers.find((u) => u.userId === receiverId);
    if (receiver) io.to(receiver.socketId).emit("getMessage", data);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
  });
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ service: "chat-service", status: "ok", onlineUsers: onlineUsers.length, ts: new Date().toISOString() }));

httpServer.listen(3003, () => console.log("💬 chat-service        → http://localhost:3003  (socket.io included)"));
