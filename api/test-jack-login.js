import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma.js";

async function testJackLogin() {
  console.log("🧪 Testing Jack's login process...");

  try {
    const username = "jack";
    const password = "password123";

    console.log(`\n1️⃣ Looking for user: ${username}`);
    
    // Step 1: Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log(`✅ User found: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Email verified: ${user.isEmailVerified}`);
    console.log(`   Role: ${user.role || 'user'}`);

    // Step 2: Check email verification
    if (!user.isEmailVerified) {
      console.log("❌ Email not verified!");
      return;
    }

    console.log(`\n2️⃣ Checking password...`);
    
    // Step 3: Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("❌ Invalid password!");
      return;
    }

    console.log("✅ Password is valid!");

    console.log(`\n3️⃣ Generating JWT token...`);
    
    // Step 4: Generate token
    const age = 1000 * 60 * 60 * 24 * 7; // 7 days
    
    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: user.role === 'admin',
        role: user.role || 'user'
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    console.log("✅ JWT token generated successfully!");
    console.log(`   Token length: ${token.length} characters`);

    // Remove password from user object
    const { password: userPassword, ...userInfo } = user;

    console.log(`\n🎉 LOGIN TEST SUCCESSFUL!`);
    console.log(`\n📋 Use these credentials to login:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`\n🔗 Login URL: http://localhost:5180/login`);

  } catch (error) {
    console.error("❌ Login test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testJackLogin();