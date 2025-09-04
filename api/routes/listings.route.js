import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/verifyToken.js"; // 🔐 assuming you have this
const router = express.Router();
const prisma = new PrismaClient();

// ✅ DELETE a listing by ID (Only owner can delete)
router.delete("/:id", verifyToken, async (req, res) => {
  const listingId = parseInt(req.params.id);
  const userId = req.user.id; // from verifyToken

  try {
    const listing = await prisma.post.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    if (listing.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized." });
    }

    await prisma.post.delete({
      where: { id: listingId },
    });

    res.status(200).json({ message: "Listing deleted successfully." });
  } catch (err) {
    console.error("Error deleting listing:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// ✅ UPDATE listing (only fields you want to allow)
router.put("/:id", verifyToken, async (req, res) => {
  const listingId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const listing = await prisma.post.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    if (listing.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized." });
    }

    const updatedListing = await prisma.post.update({
      where: { id: listingId },
      data: {
        title: req.body.title,
        price: req.body.price,
        address: req.body.address,
        images: req.body.images, // optional
        bedroom: req.body.bedroom,
        bathroom: req.body.bathroom,
        postDetail: {
          update: {
            desc: req.body.desc,
            utilities: req.body.utilities,
            pet: req.body.pet,
            income: req.body.income,
            school: req.body.school,
            bus: req.body.bus,
            restaurant: req.body.restaurant,
            size: req.body.size,
          },
        },
      },
      include: { postDetail: true },
    });

    res.status(200).json(updatedListing);
  } catch (err) {
    console.error("Error updating listing:", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
