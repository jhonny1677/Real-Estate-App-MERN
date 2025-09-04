import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import listingRoute from "./routes/listings.route.js"; // ✅ NEW

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Serve static files (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ROUTES
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/listings", listingRoute); // ✅ NEW

// Optional DB check route
// app.get('/check-db', async (req, res) => {
//   try {
//     const users = await prisma.user.findMany();
//     res.send(`✅ Connected to MongoDB! Found ${users.length} user(s).`);
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error);
//     res.status(500).send("❌ MongoDB connection failed");
//   }
// });

app.listen(8800, () => {
  console.log("🚀 Server is running on port 8800!");
});
