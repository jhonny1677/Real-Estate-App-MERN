import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";

async function createAdminUser() {
  console.log("👑 Creating admin user...");

  try {
    // Admin user credentials
    const adminData = {
      username: "admin",
      email: "admin@realestate.com",
      password: "admin123",
      role: "admin"
    };

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { username: adminData.username },
          { email: adminData.email },
          { role: "admin" }
        ]
      }
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: adminData.username,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
        isEmailVerified: true,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      }
    });

    console.log("✅ Admin user created successfully!");
    console.log("📋 Admin Login Credentials:");
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Role: ${adminData.role}`);
    console.log("\n🌐 Admin Dashboard URL: /admin-dashboard");
    console.log("\n⚠️  IMPORTANT: Change the default password after first login!");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();