import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";

async function addSampleData() {
  console.log("🌱 Adding sample real estate data...");

  try {
    // Create a sample user for the new properties
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const sampleUser = await prisma.user.upsert({
      where: { email: "sarah@realestate.com" },
      update: {},
      create: {
        username: "sarah_realtor",
        email: "sarah@realestate.com", 
        password: hashedPassword,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b9de3c01?w=150&h=150&fit=crop&crop=face",
        isEmailVerified: true
      }
    });
    
    console.log(`✅ User ready: ${sampleUser.username}`);

    // Sample properties with comprehensive data
    const properties = [
      {
        title: "Luxury Downtown Penthouse",
        price: 850000,
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1616593871999-03e2e4c0beea?w=800&h=600&fit=crop"
        ],
        address: "1200 Fifth Avenue, Unit 45A",
        city: "New York",
        bedroom: 3,
        bathroom: 2,
        latitude: "40.7831",
        longitude: "-73.9712",
        type: "buy",
        property: "condo",
        postDetail: {
          desc: "Stunning penthouse with panoramic city views, floor-to-ceiling windows, and premium finishes throughout. Features a gourmet kitchen with marble countertops, spacious master suite, and private terrace.",
          utilities: "included",
          pet: "cats",
          income: "3x",
          size: 1800,
          school: 1,
          bus: 1,
          restaurant: 1
        }
      },
      {
        title: "Cozy Studio Apartment",
        price: 2200,
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e1a5b6e8b5c3?w=800&h=600&fit=crop"
        ],
        address: "456 West 23rd Street, Apt 3B",
        city: "New York",
        bedroom: 1,
        bathroom: 1,
        latitude: "40.7450",
        longitude: "-73.9958",
        type: "rent",
        property: "apartment",
        postDetail: {
          desc: "Bright and modern studio in prime Chelsea location. High ceilings, exposed brick, hardwood floors, and updated kitchen. Perfect for professionals.",
          utilities: "tenant",
          pet: "cats",
          income: "3x",
          size: 450,
          school: 2,
          bus: 1,
          restaurant: 1
        }
      },
      {
        title: "Victorian Family Home",
        price: 675000,
        images: [
          "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
        ],
        address: "789 Oak Street",
        city: "San Francisco",
        bedroom: 4,
        bathroom: 3,
        latitude: "37.7749",
        longitude: "-122.4194",
        type: "buy",
        property: "house",
        postDetail: {
          desc: "Beautifully restored Victorian home in prestigious neighborhood. Original hardwood floors, ornate moldings, and modern updates. Spacious kitchen with island and private garden.",
          utilities: "tenant",
          pet: "allowed",
          income: "2x",
          size: 2400,
          school: 2,
          bus: 2,
          restaurant: 1
        }
      },
      {
        title: "Beachfront Luxury Condo",
        price: 1200000,
        images: [
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&h=600&fit=crop"
        ],
        address: "2500 Ocean Drive, Unit 12B",
        city: "Miami",
        bedroom: 2,
        bathroom: 2,
        latitude: "25.7617",
        longitude: "-80.1918",
        type: "buy",
        property: "condo",
        postDetail: {
          desc: "Breathtaking oceanfront condominium with direct beach access. Floor-to-ceiling windows showcase endless ocean views. Resort-style amenities include pool, spa, and fitness center.",
          utilities: "included",
          pet: "none",
          income: "4x",
          size: 1400,
          school: 3,
          bus: 2,
          restaurant: 1
        }
      },
      {
        title: "Garden Apartment Rental",
        price: 3500,
        images: [
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-444ca7b14fd6?w=800&h=600&fit=crop"
        ],
        address: "123 Grove Street",
        city: "Portland",
        bedroom: 2,
        bathroom: 1,
        latitude: "45.5152",
        longitude: "-122.6784",
        type: "rent",
        property: "apartment",
        postDetail: {
          desc: "Light-filled garden apartment with private patio. Open floor plan, updated kitchen with granite counters, in-unit laundry, and parking included.",
          utilities: "shared",
          pet: "allowed",
          income: "2x",
          size: 900,
          school: 2,
          bus: 3,
          restaurant: 2
        }
      }
    ];

    // Add each property
    for (const propData of properties) {
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
          userId: sampleUser.id,
          postDetail: {
            create: propData.postDetail
          }
        }
      });
      
      console.log(`✅ Added: ${property.title} - $${property.price.toLocaleString()}`);
    }

    console.log("🎉 Sample data added successfully!");
    
  } catch (error) {
    console.error("❌ Error adding sample data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData();