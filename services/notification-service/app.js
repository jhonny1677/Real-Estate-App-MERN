import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../api/.env") });

import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { connectBroker, subscribe } from "../broker/index.js";

const app = express();
app.use(cors({ origin: ["http://localhost:8800","http://localhost:3001","http://localhost:3002","http://localhost:5174"] }));
app.use(express.json());

// ── Mailer ────────────────────────────────────────────────────────────────────
const getTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || "smtp.gmail.com",
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const sendMail = async (opts) => {
  try {
    await getTransporter().sendMail(opts);
    return true;
  } catch (err) {
    console.warn("[notification] sendMail failed:", err.message);
    return false;
  }
};

// ── RabbitMQ subscriber ───────────────────────────────────────────────────────
async function startSubscriber() {
  await connectBroker("notification-service");

  await subscribe(
    "notification.queue",
    ["listing.#", "user.savedProperty", "booking.created"],
    async ({ routingKey, data }) => {
      console.log(`[notification] ← ${routingKey}`, JSON.stringify(data).slice(0, 80));

      switch (routingKey) {
        case "booking.created":
          if (data.email) {
            await sendMail({
              from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
              to:      data.email,
              subject: `Booking Confirmed — ${data.confirmationNumber}`,
              html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;">
                  <h2 style="color:#28a745;">Booking Confirmed!</h2>
                  <p>Hi ${data.username || "there"},</p>
                  <p>Your visit to <strong>${data.postTitle || "a property"}</strong> has been confirmed.</p>
                  <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Confirmation #</strong></td><td style="padding:8px;border:1px solid #ddd;">${data.confirmationNumber}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Date</strong></td><td style="padding:8px;border:1px solid #ddd;">${data.date}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Time</strong></td><td style="padding:8px;border:1px solid #ddd;">${data.time}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Visit Type</strong></td><td style="padding:8px;border:1px solid #ddd;">${data.visitType}</td></tr>
                  </table>
                </div>`,
            });
          }
          break;

        case "listing.priceChanged":
          // In a full system: look up users who saved this post and email them
          console.log(`[notification] price drop: ${data.title} — $${data.oldPrice} → $${data.newPrice} (${data.percentage}% off)`);
          break;

        case "listing.created":
          console.log(`[notification] new listing: ${data.title} in ${data.city}`);
          break;

        default:
          // Other listing events — log only
          break;
      }
    },
  );
}

// ── PUBLIC: contact form  POST /api/contact ───────────────────────────────────
app.post("/api/contact", async (req, res) => {
  const { name, email, message, postId, agentUsername } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ message: "Name, email, and message are required." });

  await sendMail({
    from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to:      process.env.EMAIL_USER,
    replyTo: email,
    subject: `Property Enquiry from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;">
        <h2 style="color:#1a1a2e;">New Property Enquiry</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        ${agentUsername ? `<p><strong>To Agent:</strong> ${agentUsername}</p>` : ""}
        ${postId ? `<p><strong>Property ID:</strong> ${postId}</p>` : ""}
        <hr style="border:1px solid #eee;margin:20px 0;"/>
        <p><strong>Message:</strong></p>
        <p style="background:#f9f9f9;padding:16px;border-radius:8px;">${message}</p>
      </div>`,
  });

  res.json({ message: "Message sent successfully!" });
});

// ── INTERNAL email endpoints (called by auth-service via HTTP) ────────────────
app.post("/internal/email/verification", async (req, res) => {
  const { email, username, token } = req.body;
  if (!email || !token) return res.status(400).json({ message: "Missing fields" });
  const url  = `${process.env.CLIENT_URL || "http://localhost:5174"}/verify-email?token=${token}`;
  const sent = await sendMail({
    from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to:      email,
    subject: "Verify Your Email - EstateHub",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
      <h2>Welcome to EstateHub!</h2>
      <p>Hi ${username},</p>
      <p>Please verify your email:</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${url}" style="background:#007bff;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;">Verify Email</a>
      </div>
      <p>Or copy: <a href="${url}">${url}</a></p>
      <p>Expires in 24 hours.</p></div>`,
  });
  res.json({ sent });
});

app.post("/internal/email/reset", async (req, res) => {
  const { email, username, token } = req.body;
  if (!email || !token) return res.status(400).json({ message: "Missing fields" });
  const url  = `${process.env.CLIENT_URL || "http://localhost:5174"}/reset-password?token=${token}`;
  const sent = await sendMail({
    from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to:      email,
    subject: "Reset Your Password - EstateHub",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
      <h2>Password Reset</h2>
      <p>Hi ${username},</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${url}" style="background:#dc3545;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;">Reset Password</a>
      </div>
      <p>Expires in 1 hour.</p></div>`,
  });
  res.json({ sent });
});

app.post("/internal/email/booking", async (req, res) => {
  const { email, username, confirmationNumber, property, date, time, visitType } = req.body;
  if (!email || !confirmationNumber) return res.status(400).json({ message: "Missing fields" });
  const sent = await sendMail({
    from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to:      email,
    subject: `Booking Confirmed — ${confirmationNumber}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
      <h2 style="color:#28a745;">Booking Confirmed!</h2>
      <p>Hi ${username || "there"},</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Confirmation #</strong></td><td style="padding:8px;border:1px solid #ddd;">${confirmationNumber}</td></tr>
        ${property ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Property</strong></td><td style="padding:8px;border:1px solid #ddd;">${property}</td></tr>` : ""}
        ${date ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Date</strong></td><td style="padding:8px;border:1px solid #ddd;">${date}</td></tr>` : ""}
        ${time ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Time</strong></td><td style="padding:8px;border:1px solid #ddd;">${time}</td></tr>` : ""}
        ${visitType ? `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>Visit Type</strong></td><td style="padding:8px;border:1px solid #ddd;">${visitType}</td></tr>` : ""}
      </table>
    </div>`,
  });
  res.json({ sent });
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ service: "notification-service", status: "ok", emailConfigured: !!process.env.EMAIL_USER, ts: new Date().toISOString() })
);

// ── Boot ──────────────────────────────────────────────────────────────────────
startSubscriber().catch((err) => console.error("[notification] subscriber failed:", err.message));
app.listen(3004, () => console.log("📧 notification-service → http://localhost:3004  (RabbitMQ subscriber active)"));
