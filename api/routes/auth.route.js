import express from "express";
import {
  login,
  logout,
  register,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  getMe,
  clerkSync,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

router.get("/me", getMe);
router.post("/clerk-sync", clerkSync);

export default router;
