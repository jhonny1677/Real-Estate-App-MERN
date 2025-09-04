import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";

const sampleUsers = [
  {
    username: "sarah_realtor",
    email: "sarah@realestate.com", 
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b9de3c01?w=150&h=150&fit=crop&crop=face"
  },
  {
    username: "mike_properties",
    email: "mike@properties.com",
    password: "password123", 
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    username: "emma_homes",
    email: "emma@homes.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    username: "david_estates",
    email: "david@estates.com", 
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  }
];

const sampleProperties = [
  // Luxury Properties
  {
    title: "Modern Downtown Penthouse",
    price: 850000,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1616593871999-03e2e4c0beea?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=600&fit=crop"
    ],
    address: "1200 Fifth Avenue, Unit 45A",
    city: "New York",
    bedroom: 3,
    bathroom: 2,
    latitude: "40.7831",
    longitude: "-73.9712",
    type: "buy",
    property: "condo",
    amenities: ["concierge", "gym", "elevator", "security", "parking"],
    features: ["modern kitchen", "marble bathroom", "hardwood floors", "city views", "private terrace"],
    yearBuilt: 2018,
    sqft: 1800,
    neighborhood: {
      schools: [
        { name: "PS 183 Robert L. Stevenson", distance: "0.2 km", rating: "8.5" },
        { name: "Manhattan School for Children", distance: "0.5 km", rating: "9.2" }
      ],
      healthcare: [
        { name: "Mount Sinai Hospital", distance: "1.2 km", type: "Hospital" },
        { name: "Central Park Medical", distance: "0.3 km", type: "Clinic" }
      ],
      transport: [
        { name: "59th St-Columbus Circle", distance: "0.4 km", type: "Subway" },
        { name: "Central Park West Bus", distance: "0.1 km", type: "Bus Stop" }
      ],
      shopping: [
        { name: "Whole Foods Market", distance: "0.3 km", type: "Grocery" },
        { name: "Columbus Circle Shops", distance: "0.4 km", type: "Mall" }
      ],
      safetyScore: 9,
      walkScore: 98,
      transitScore: 95
    },
    floorPlan: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
    virtualTour: "https://my.matterport.com/show/?m=sample-tour",
    postDetail: {
      desc: "Stunning penthouse with panoramic city views, floor-to-ceiling windows, and premium finishes throughout. Features a gourmet kitchen with marble countertops, spacious master suite, and private terrace. Building amenities include 24/7 concierge, fitness center, and rooftop garden.",
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
    title: "Charming Victorian House",
    price: 675000,
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop", 
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"
    ],
    address: "789 Oak Street",
    city: "San Francisco",
    bedroom: 4,
    bathroom: 3,
    latitude: "37.7749",
    longitude: "-122.4194",
    type: "buy",
    property: "house",
    amenities: ["garden", "parking", "fireplace", "storage"],
    features: ["hardwood floors", "original moldings", "updated kitchen", "formal dining", "private garden"],
    yearBuilt: 1895,
    sqft: 2400,
    neighborhood: {
      schools: [
        { name: "Francis Scott Key Elementary", distance: "0.3 km", rating: "8.8" },
        { name: "Lick-Wilmerding High School", distance: "1.1 km", rating: "9.0" }
      ],
      healthcare: [
        { name: "UCSF Medical Center", distance: "2.5 km", type: "Hospital" },
        { name: "Castro Mission Health Center", distance: "0.8 km", type: "Clinic" }
      ],
      transport: [
        { name: "Castro St Station", distance: "0.6 km", type: "Metro" },
        { name: "18th & Castro Bus", distance: "0.2 km", type: "Bus Stop" }
      ],
      shopping: [
        { name: "Castro Farmers Market", distance: "0.4 km", type: "Market" },
        { name: "Noe Valley Shopping", distance: "0.7 km", type: "District" }
      ],
      safetyScore: 8,
      walkScore: 92,
      transitScore: 88
    },
    floorPlan: "https://images.unsplash.com/photo-1560448204-444ca7b14fd6?w=600&h=400&fit=crop",
    virtualTour: "https://my.matterport.com/show/?m=victorian-tour",
    postDetail: {
      desc: "Beautifully restored Victorian home in prestigious neighborhood. Original hardwood floors, ornate moldings, and modern updates. Spacious kitchen with island, formal dining room, and private garden. Walk to parks, shops, and public transportation.",
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
    title: "Luxury Beachfront Condo",
    price: 1200000,
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
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
      desc: "Breathtaking oceanfront condominium with direct beach access. Floor-to-ceiling windows showcase endless ocean views. Modern kitchen with stainless steel appliances, marble bathrooms, and private balcony. Resort-style amenities include pool, spa, and fitness center.",
      utilities: "included",
      pet: "none",
      income: "4x",
      size: 1400,
      school: 3,
      bus: 2,
      restaurant: 1
    }
  },
  
  // Rental Properties
  {
    title: "Cozy Studio Apartment",
    price: 2200,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e1a5b6e8b5c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
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
      desc: "Bright and modern studio in prime Chelsea location. High ceilings, exposed brick, hardwood floors, and updated kitchen. Perfect for professionals. Excellent transportation links and close to parks, restaurants, and nightlife.",
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
    title: "Spacious 2BR Garden Apartment",
    price: 3500,
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-444ca7b14fd6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop"
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
      desc: "Light-filled garden apartment with private patio. Open floor plan, updated kitchen with granite counters, in-unit laundry, and parking included. Quiet residential street near coffee shops, breweries, and parks.",
      utilities: "shared",
      pet: "allowed",
      income: "2x",
      size: 900,
      school: 2,
      bus: 3,
      restaurant: 2
    }
  },
  {
    title: "Luxury High-Rise 1BR",
    price: 4200,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560449752-54b2c73ceca8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
    ],
    address: "1500 Lake Shore Drive, Unit 28F",
    city: "Chicago",
    bedroom: 1,
    bathroom: 1,
    latitude: "41.8781",
    longitude: "-87.6298",
    type: "rent",
    property: "apartment",
    postDetail: {
      desc: "Designer one-bedroom with stunning lake views. Floor-to-ceiling windows, premium appliances, marble bathroom, and walk-in closet. Building features doorman, pool, fitness center, and business center. Minutes from downtown.",
      utilities: "included",
      pet: "dogs",
      income: "3x",
      size: 750,
      school: 1,
      bus: 1,
      restaurant: 1
    }
  },

  // Mid-Range Properties
  {
    title: "Updated Ranch Home",
    price: 425000,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop"
    ],
    address: "2847 Maple Avenue",
    city: "Austin",
    bedroom: 3,
    bathroom: 2,
    latitude: "30.2672",
    longitude: "-97.7431",
    type: "buy",
    property: "house",
    postDetail: {
      desc: "Move-in ready ranch home in established neighborhood. Recently updated kitchen and bathrooms, new flooring throughout, and fresh interior paint. Large backyard with mature trees, two-car garage, and excellent schools nearby.",
      utilities: "tenant",
      pet: "allowed",
      income: "2x",
      size: 1650,
      school: 1,
      bus: 3,
      restaurant: 2
    }
  },
  {
    title: "Historic Townhouse",
    price: 3800,
    images: [
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
    ],
    address: "876 Federal Hill",
    city: "Boston",
    bedroom: 3,
    bathroom: 2,
    latitude: "42.3601",
    longitude: "-71.0589",
    type: "rent",
    property: "house",
    postDetail: {
      desc: "Charming historic townhouse in Federal Hill. Original features include hardwood floors, brick walls, and working fireplace. Modern kitchen, updated bathrooms, private deck, and off-street parking. Walk to Freedom Trail and North End.",
      utilities: "tenant",
      pet: "cats",
      income: "3x",
      size: 1400,
      school: 2,
      bus: 1,
      restaurant: 1
    }
  },

  // Affordable Options
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
    postDetail: {
      desc: "Great starter home or investment property. Solid bones with room for updates. Large lot with desert landscaping, covered patio, and mountain views. Quiet neighborhood with easy access to shopping and schools.",
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
    title: "Budget-Friendly 1BR",
    price: 1800,
    images: [
      "https://images.unsplash.com/photo-1560448204-e1a5b6e8b5c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop"
    ],
    address: "567 Second Street, Unit 2A",
    city: "Nashville",
    bedroom: 1,
    bathroom: 1,
    latitude: "36.1627",
    longitude: "-86.7816",
    type: "rent",
    property: "apartment",
    postDetail: {
      desc: "Affordable one-bedroom in up-and-coming neighborhood. Clean and well-maintained with good natural light, updated appliances, and on-site laundry. Close to music venues, restaurants, and public transportation.",
      utilities: "shared",
      pet: "allowed",
      income: "2x",
      size: 600,
      school: 2,
      bus: 2,
      restaurant: 2
    }
  },

  // Premium Land/Villa
  {
    title: "Waterfront Building Lot",
    price: 450000,
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop"
    ],
    address: "Lake View Drive, Lot 15",
    city: "Seattle",
    bedroom: 0,
    bathroom: 0,
    latitude: "47.6062",
    longitude: "-122.3321",
    type: "buy",
    property: "land",
    postDetail: {
      desc: "Prime waterfront building lot with 150 feet of lake frontage. Gently sloping terrain with mature trees and stunning water views. All utilities available at street. Perfect for custom dream home in exclusive community.",
      utilities: "tenant",
      pet: "allowed",
      income: "none",
      size: 0,
      school: 2,
      bus: 3,
      restaurant: 3
    }
  },
  {
    title: "Mediterranean Villa",
    price: 1850000,
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop"
    ],
    address: "1255 Hillside Drive",
    city: "Los Angeles",
    bedroom: 5,
    bathroom: 4,
    latitude: "34.0522",
    longitude: "-118.2437",
    type: "buy",
    property: "villa",
    postDetail: {
      desc: "Spectacular Mediterranean villa with panoramic city and ocean views. Grand foyer, formal living and dining rooms, gourmet kitchen, master suite with spa bath and walk-in closet. Resort-style backyard with pool, spa, and outdoor kitchen. Three-car garage and circular driveway.",
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

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check existing users first
    const existingUsers = await prisma.user.findMany({
      select: { username: true, email: true }
    });
    console.log(`📊 Found ${existingUsers.length} existing users`);

    // Don't clear existing data - just add new data

    // Create users (skip if already exist)
    console.log("👥 Creating new users...");
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: userData.username },
            { email: userData.email }
          ]
        }
      });
      
      if (existingUser) {
        console.log(`⏭️  User ${userData.username} already exists, skipping...`);
        createdUsers.push(existingUser);
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await prisma.user.create({
          data: {
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            avatar: userData.avatar,
            isEmailVerified: true // Mark as verified for demo purposes
          }
        });
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.username}`);
      }
    }

    // Create properties
    console.log("🏠 Creating properties...");
    
    for (let i = 0; i < sampleProperties.length; i++) {
      const propertyData = sampleProperties[i];
      const randomUser = createdUsers[i % createdUsers.length]; // Cycle through users
      
      const property = await prisma.post.create({
        data: {
          title: propertyData.title,
          price: propertyData.price,
          images: propertyData.images,
          address: propertyData.address,
          city: propertyData.city,
          bedroom: propertyData.bedroom,
          bathroom: propertyData.bathroom,
          latitude: propertyData.latitude,
          longitude: propertyData.longitude,
          type: propertyData.type,
          property: propertyData.property,
          userId: randomUser.id,
          // Enhanced property fields
          amenities: propertyData.amenities || [],
          features: propertyData.features || [],
          neighborhood: propertyData.neighborhood || null,
          floorPlan: propertyData.floorPlan || null,
          virtualTour: propertyData.virtualTour || null,
          yearBuilt: propertyData.yearBuilt || null,
          sqft: propertyData.sqft || null,
          postDetail: {
            create: propertyData.postDetail
          }
        },
        include: {
          postDetail: true,
          user: {
            select: {
              username: true,
              avatar: true
            }
          }
        }
      });
      
      console.log(`✅ Created property: ${property.title} (${property.city}) - Owner: ${randomUser.username}`);
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - ${createdUsers.length} users created`);
    console.log(`   - ${sampleProperties.length} properties created`);
    console.log(`   - All properties have complete details and valid images`);
    console.log(`   - Properties distributed among users`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding process failed:", error);
      process.exit(1);
    });
}

export default seedDatabase;