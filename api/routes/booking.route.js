import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

// POST /api/bookings/create-payment-intent
router.post("/create-payment-intent", verifyToken, async (req, res) => {
  const { amount, currency = "usd" } = req.body;

  if (!STRIPE_SECRET) {
    // Demo mode — return a fake client secret
    return res.json({ clientSecret: null, demo: true });
  }

  try {
    const stripe = (await import("stripe")).default(STRIPE_SECRET);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret, demo: false });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
});

// GET /api/bookings/slots/:postId  — return booked time slots for a property on a date
router.get("/slots/:postId", async (req, res) => {
  const { postId } = req.params;
  const { date } = req.query;
  if (!date) return res.json({ bookedSlots: [] });

  try {
    const bookings = await prisma.booking.findMany({
      where: { postId, date, status: { not: "cancelled" } },
      select: { time: true },
    });
    res.json({ bookedSlots: bookings.map(b => b.time) });
  } catch (err) {
    console.error("Slots error:", err);
    res.json({ bookedSlots: [] });
  }
});

// POST /api/bookings/confirm  — save booking after payment
router.post("/confirm", verifyToken, async (req, res) => {
  const { postId, visitType, date, time, fee, contactInfo, notes, paymentId, paymentMethod } = req.body;

  // Reject past dates
  if (date) {
    const visitDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (visitDate < today) {
      return res.status(400).json({ message: "Cannot schedule a visit for a past date." });
    }
  }

  try {
    // Prevent double-booking the same slot
    const existing = await prisma.booking.findFirst({
      where: { postId, date, time, status: { not: "cancelled" } },
    });
    if (existing) {
      return res.status(409).json({ message: "This time slot is already booked. Please choose another." });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        postId,
        visitType,
        date,
        time,
        fee,
        contactName: contactInfo.name,
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
        notes: notes || "",
        paymentId: paymentId || null,
        paymentMethod: paymentMethod || "demo",
        confirmationNumber: `CONF_${Date.now()}`,
        status: "confirmed",
      },
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Failed to save booking" });
  }
});

// GET /api/bookings/my  — get current user's bookings
router.get("/my", verifyToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// DELETE /api/bookings/:id  — cancel a booking (owner only)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }
    await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });
    res.status(200).json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

export default router;
