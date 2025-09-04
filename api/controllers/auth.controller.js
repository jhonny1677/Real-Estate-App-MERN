import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail } from "../lib/emailService.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // HASH THE PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // GENERATE EMAIL VERIFICATION TOKEN
    const verificationToken = generateVerificationToken();

    // CREATE A NEW USER AND SAVE TO DB
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
      },
    });

    // SEND VERIFICATION EMAIL
    const emailSent = await sendVerificationEmail(email, username, verificationToken);
    
    if (!emailSent) {
      console.warn("Failed to send verification email, but user was created");
    }

    res.status(201).json({ 
      message: "User created successfully. Please check your email to verify your account.",
      emailSent: emailSent
    });
  } catch (err) {
    console.log(err);
    if (err.code === 'P2002') {
      return res.status(400).json({ message: "Username or email already exists!" });
    }
    res.status(500).json({ message: "Failed to create user!" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // CHECK IF THE USER EXISTS

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) return res.status(400).json({ message: "Invalid Credentials!" });

    // CHECK IF EMAIL IS VERIFIED
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: "Please verify your email before logging in. Check your inbox for the verification email.",
        needsVerification: true 
      });
    }

    // CHECK IF THE PASSWORD IS CORRECT

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid Credentials!" });

    // GENERATE COOKIE TOKEN AND SEND TO THE USER

    // res.setHeader("Set-Cookie", "test=" + "myValue").json("success")
    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: user.role === 'admin',
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const { password: userPassword, ...userInfo } = user;

    res
      .cookie("token", token, {
        httpOnly: true,
        // secure:true,
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to login!" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};

// EMAIL VERIFICATION
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token!" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified!" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to verify email!" });
  }
};

// RESEND VERIFICATION EMAIL
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified!" });
    }

    const newToken = generateVerificationToken();
    
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: newToken },
    });

    const emailSent = await sendVerificationEmail(email, user.username, newToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email!" });
    }

    res.status(200).json({ message: "Verification email sent!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to resend verification email!" });
  }
};

// REQUEST PASSWORD RESET
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({ message: "If the email exists, a reset link has been sent." });
    }

    const resetToken = generateVerificationToken();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      },
    });

    const emailSent = await sendPasswordResetEmail(email, user.username, resetToken);
    
    res.status(200).json({ message: "If the email exists, a reset link has been sent." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to process password reset request!" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to reset password!" });
  }
};
