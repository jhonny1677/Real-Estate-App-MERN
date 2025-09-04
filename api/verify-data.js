import prisma from "./lib/prisma.js";

async function verifyData() {
  try {
    console.log("🔍 Checking database contents...");
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isEmailVerified: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    });
    
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        city: true,
        type: true,
        property: true,
        user: {
          select: {
            username: true
          }
        }
      }
    });

    console.log(`📊 Database Status:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏠 Properties: ${posts.length}`);
    
    if (users.length > 0) {
      console.log(`\n👥 Users in database:`);
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user._count.posts} properties`);
      });
    }
    
    if (posts.length > 0) {
      console.log(`\n🏠 Properties in database:`);
      posts.forEach(post => {
        console.log(`   - ${post.title} - $${post.price.toLocaleString()} (${post.city}) - Owner: ${post.user.username}`);
      });
    }
    
    if (users.length === 0 && posts.length === 0) {
      console.log("❌ Database is empty - seeding may have failed");
    } else {
      console.log("✅ Database contains data!");
    }
    
  } catch (error) {
    console.error("❌ Error checking data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();