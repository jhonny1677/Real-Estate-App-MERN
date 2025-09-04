import express from "express";
import {
  addMessage,
  addMessageWithFile,
  uploadMiddleware
} from "../controllers/message.controller.js";
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/:chatId", verifyToken, addMessage);
router.post("/:chatId/with-file", verifyToken, uploadMiddleware, addMessageWithFile);

export default router;
