import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";

async function addMoreProperties() {
  console.log("🏠 Adding more diverse properties...");

  try {
    // Create additional users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const mikeUser = await prisma.user.upsert({
      where: { email: "mike@properties.com" },
      update: {},
      create: {
        username: "mike_properties",
        email: "mike@properties.com",
        password: hashedPassword,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        isEmailVerified: true
      }
    });

    const emmaUser = await prisma.user.upsert({
      where: { email: "emma@homes.com" },
      update: {},
      create: {
        username: "emma_homes",
        email: "emma@homes.com",
        password: hashedPassword,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        isEmailVerified: true
      }
    });

    console.log(`✅ Users ready: ${mikeUser.username}, ${emmaUser.username}`);

    const moreProperties = [
      // Mike's properties
      {
        title: "Modern High-Rise Apartment",
        price: 4200,
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560449752-54b2c73ceca8?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop"
        ],
        address: "1500 Lake Shore Drive, Unit 28F",
        city: "Chicago",
        bedroom: 1,
        bathroom: 1,
        latitude: "41.8781",
        longitude: "-87.6298",
        type: "rent",
        property: "apartment",
        userId: mikeUser.id,
        postDetail: {
          desc: "Designer one-bedroom with stunning lake views. Floor-to-ceiling windows, premium appliances, marble bathroom, and walk-in closet. Building features doorman, pool, fitness center.",
          utilities: "included",
          pet: "dogs",
          income: "3x",
          size: 750,
          school: 1,
          bus: 1,
          restaurant: 1
        }
      },
      {
        title: "Ranch Style Family Home",
        price: 425000,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"
        ],
        address: "2847 Maple Avenue",
        city: "Austin",
        bedroom: 3,
        bathroom: 2,
        latitude: "30.2672",
        longitude: "-97.7431",
        type: "buy",
        property: "house",
        userId: mikeUser.id,
        postDetail: {
          desc: "Move-in ready ranch home in established neighborhood. Recently updated kitchen and bathrooms, new flooring throughout, and fresh interior paint. Large backyard with mature trees.",
          utilities: "tenant",
          pet: "allowed",
          income: "2x",
          size: 1650,
          school: 1,
          bus: 3,
          restaurant: 2
        }
      },
      
      // Emma's properties
      {
        title: "Charming Townhouse",
        price: 3800,
        images: [
          "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
        ],
        address: "876 Federal Hill",
        city: "Boston",
        bedroom: 3,
        bathroom: 2,
        latitude: "42.3601",
        longitude: "-71.0589",
        type: "rent",
        property: "house",
        userId: emmaUser.id,
        postDetail: {
          desc: "Historic townhouse in Federal Hill. Original features include hardwood floors, brick walls, and working fireplace. Modern kitchen, updated bathrooms, private deck, and off-street parking.",
          utilities: "tenant",
          pet: "cats",
          income: "3x",
          size: 1400,
          school: 2,
          bus: 1,
          restaurant: 1
        }
      },
      {
        title: "Starter Home with Potential",
        price: 225000,
        images: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop"
        ],
        address: "1643 Pine Street",
        city: "Phoenix",
        bedroom: 2,
        bathroom: 1,
        latitude: "33.4484",
        longitude: "-112.0740",
        type: "buy",
        property: "house",
        userId: emmaUser.id,
        postDetail: {
          desc: "Great starter home or investment property. Solid bones with room for updates. Large lot with desert landscaping, covered patio, and mountain views. Quiet neighborhood.",
          utilities: "tenant",
          pet: "allowed",
          income: "none",
          size: 1100,
          school: 3,
          bus: 3,
          restaurant: 3
        }
      },
      {
        title: "Budget-Friendly Downtown Loft",
        price: 1800,
        images: [
          "https://images.unsplash.com/photo-1560448204-e1a5b6e8b5c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
        ],
        address: "567 Second Street, Unit 2A",
        city: "Nashville",
        bedroom: 1,
        bathroom: 1,
        latitude: "36.1627",
        longitude: "-86.7816",
        type: "rent",
        property: "apartment",
        userId: emmaUser.id,
        postDetail: {
          desc: "Affordable loft in up-and-coming neighborhood. Clean and well-maintained with good natural light, updated appliances, and on-site laundry. Close to music venues and restaurants.",
          utilities: "shared",
          pet: "allowed",
          income: "2x",
          size: 600,
          school: 2,
          bus: 2,
          restaurant: 2
        }
      },
      {
        title: "Mediterranean Villa Estate",
        price: 1850000,
        images: [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"
        ],
        address: "1255 Hillside Drive",
        city: "Los Angeles",
        bedroom: 5,
        bathroom: 4,
        latitude: "34.0522",
        longitude: "-118.2437",
        type: "buy",
        property: "villa",
        userId: emmaUser.id,
        postDetail: {
          desc: "Spectacular Mediterranean villa with panoramic city and ocean views. Grand foyer, formal living and dining rooms, gourmet kitchen, master suite with spa bath. Resort-style backyard with pool, spa, and outdoor kitchen.",
          utilities: "included",
          pet: "allowed",
          income: "4x",
          size: 4200,
          school: 1,
          bus: 3,
          restaurant: 2
        }
      }
    ];

    // Add each property
    for (const propData of moreProperties) {
      const property = await prisma.post.create({
        data: {
          title: propData.title,
          price: propData.price,
          images: propData.images,
          address: propData.address,
          city: propData.city,
          bedroom: propData.bedroom,
          bathroom: propData.bathroom,
          latitude: propData.latitude,
          longitude: propData.longitude,
          type: propData.type,
          property: propData.property,
          userId: propData.userId,
          postDetail: {
            create: propData.postDetail
          }
        }
      });
      
      console.log(`✅ Added: ${property.title} - $${property.price.toLocaleString()}`);
    }

    console.log("🎉 Additional properties added successfully!");
    
  } catch (error) {
    console.error("❌ Error adding properties:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreProperties();