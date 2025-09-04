import prisma from "./lib/prisma.js";

async function checkUsers() {
  console.log("👥 Checking existing users in database...");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Found ${users.length} users:`);
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Email Verified: ${user.isEmailVerified ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log('   ' + '-'.repeat(50));
    });

    console.log('\n🔐 To test login, try these credentials:');
    users.forEach(user => {
      if (user.username === 'admin') {
        console.log(`   Username: ${user.username} | Password: admin123`);
      } else {
        console.log(`   Username: ${user.username} | Password: password123`);
      }
    });

  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();