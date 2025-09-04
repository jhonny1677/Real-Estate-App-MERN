import prisma from "../lib/prisma.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/chat-files/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and common document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: File type not allowed!');
    }
  }
});

export const uploadMiddleware = upload.single('file');

export const addMessage = async (req, res) => {
  const tokenUserId = req.user?.id; // ✅ updated
  const chatId = req.params.chatId;
  const text = req.body.text;

  if (!tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    // ✅ Check if the current user is part of the chat
    if (!chat || !chat.userIDs.includes(tokenUserId)) {
      return res.status(404).json({ message: "Chat not found or unauthorized!" });
    }

    // ✅ Create the new message
    const message = await prisma.message.create({
      data: {
        text,
        chatId,
        userId: tokenUserId,
      },
    });

    // ✅ Update the chat's last message and reset seenBy to only this user
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: [tokenUserId],
        lastMessage: text,
      },
    });

    res.status(200).json(message);
  } catch (err) {
    console.error("addMessage error:", err);
    res.status(500).json({ message: "Failed to add message!" });
  }
};

export const addMessageWithFile = async (req, res) => {
  const tokenUserId = req.user?.id;
  const chatId = req.params.chatId;
  const text = req.body.text || "";

  if (!tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    if (!chat || !chat.userIDs.includes(tokenUserId)) {
      return res.status(404).json({ message: "Chat not found or unauthorized!" });
    }

    let messageData = {
      text,
      chatId,
      userId: tokenUserId,
    };

    // Add file information if file was uploaded
    if (req.file) {
      messageData.fileUrl = `/uploads/chat-files/${req.file.filename}`;
      messageData.fileName = req.file.originalname;
      messageData.fileType = req.file.mimetype;
      messageData.fileSize = req.file.size;
    }

    const message = await prisma.message.create({
      data: messageData,
    });

    // Update the chat's last message
    const lastMessage = req.file ? 
      (text ? `${text} [File: ${req.file.originalname}]` : `[File: ${req.file.originalname}]`) : 
      text;

    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: [tokenUserId],
        lastMessage: lastMessage,
      },
    });

    res.status(200).json(message);
  } catch (err) {
    console.error("addMessageWithFile error:", err);
    res.status(500).json({ message: "Failed to add message with file!" });
  }
};
