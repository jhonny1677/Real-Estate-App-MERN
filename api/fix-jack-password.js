import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";

async function fixJackPassword() {
  console.log("🔧 Fixing Jack's password...");

  try {
    // Check if jack user exists
    const jackUser = await prisma.user.findUnique({
      where: { username: 'jack' }
    });

    if (!jackUser) {
      console.log("❌ Jack user not found!");
      return;
    }

    console.log(`✅ Found Jack user: ${jackUser.username} (${jackUser.email})`);
    console.log(`   Current verified status: ${jackUser.isEmailVerified}`);

    // Hash the new password
    const newPassword = "password123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Jack's password and ensure email is verified
    const updatedUser = await prisma.user.update({
      where: { username: 'jack' },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        emailVerificationToken: null
      }
    });

    console.log("✅ Jack's password has been reset!");
    console.log("📋 Updated Login Credentials:");
    console.log(`   Username: jack`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Verified: ${updatedUser.isEmailVerified}`);

    // Test the password hashing
    const testPassword = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`🧪 Password hash test: ${testPassword ? 'PASS' : 'FAIL'}`);

  } catch (error) {
    console.error("❌ Error fixing Jack's password:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixJackPassword();