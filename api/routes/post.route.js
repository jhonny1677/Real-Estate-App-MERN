import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { addPost, deletePost, getPost, getPosts, updatePost, getCities, getPriceHistory } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/cities", getCities);
router.get("/", getPosts);
router.get("/:id/price-history", getPriceHistory);
router.get("/:id", getPost);
router.post("/", verifyToken, addPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

export default router;

