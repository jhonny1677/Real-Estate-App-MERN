import express from "express";
import prisma from "../lib/prisma.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message, postId, agentUsername } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `Property Enquiry from ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#1a1a2e;">New Property Enquiry</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            ${agentUsername ? `<p><strong>To Agent:</strong> ${agentUsername}</p>` : ""}
            ${postId ? `<p><strong>Property ID:</strong> ${postId}</p>` : ""}
            <hr style="border:1px solid #eee;margin:20px 0;"/>
            <p><strong>Message:</strong></p>
            <p style="background:#f9f9f9;padding:16px;border-radius:8px;">${message}</p>
          </div>
        `,
      });
    } catch (emailErr) {
      // Log enquiry even when email isn't configured
      console.log("📩 Contact enquiry (email not configured):");
      console.log(`  From: ${name} <${email}>`);
      console.log(`  Agent: ${agentUsername || "N/A"} | Post: ${postId || "N/A"}`);
      console.log(`  Message: ${message}`);
    }

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Contact error:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
});

export default router;
