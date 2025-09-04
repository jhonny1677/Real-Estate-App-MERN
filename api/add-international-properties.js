import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";

async function addInternationalProperties() {
  console.log("🌍 Adding international real estate properties...");

  try {
    // Create international property agents
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const agents = [
      {
        username: "emma_homes",
        email: "emma@homes.com",
        password: hashedPassword,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        isEmailVerified: true
      },
      {
        username: "mike_properties",
        email: "mike@properties.com", 
        password: hashedPassword,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        isEmailVerified: true
      }
    ];

    const createdAgents = [];
    for (const agent of agents) {
      const createdAgent = await prisma.user.upsert({
        where: { email: agent.email },
        update: {},
        create: agent
      });
      createdAgents.push(createdAgent);
      console.log(`✅ Agent ready: ${createdAgent.username}`);
    }

    // International properties with villa and condo types
    const internationalProperties = [
      // AFRICA
      {
        title: "Luxury Beach Villa in Cape Town",
        price: 475000,
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
        ],
        address: "12 Victoria Road, Camps Bay",
        city: "Cape Town",
        bedroom: 4,
        bathroom: 3,
        latitude: "-33.9558",
        longitude: "18.3772",
        type: "buy",
        property: "villa",
        userId: createdAgents[0].id,
        postDetail: {
          desc: "Stunning oceanfront villa with panoramic views of the Atlantic Ocean and Twelve Apostles. Features open-plan living, infinity pool, and direct beach access. Perfect for luxury coastal living.",
          utilities: "included",
          pet: "allowed",
          income: "2x",
          size: 3200,
          school: 800,
          bus: 600,
          restaurant: 300
        }
      },
      {
        title: "Modern Condo in Lagos Victoria Island",
        price: 285000,
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
        ],
        address: "Eko Atlantic City, Plot 15",
        city: "Lagos",
        bedroom: 2,
        bathroom: 2,
        latitude: "6.4281",
        longitude: "3.4219",
        type: "buy",
        property: "condo",
        userId: createdAgents[1].id,
        postDetail: {
          desc: "Contemporary waterfront condo in Nigeria's premier financial district. High-end finishes, 24/7 security, gym, and pool. Walking distance to business centers and entertainment.",
          utilities: "included",
          pet: "cats",
          income: "3x",
          size: 1400,
          school: 1200,
          bus: 200,
          restaurant: 150
        }
      },

      // SOUTH AMERICA
      {
        title: "Penthouse Villa in Rio de Janeiro",
        price: 620000,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
        ],
        address: "Rua Joana Angélica, 450, Ipanema",
        city: "Rio de Janeiro",
        bedroom: 3,
        bathroom: 4,
        latitude: "-22.9868",
        longitude: "-43.2048",
        type: "buy",
        property: "villa",
        userId: createdAgents[0].id,
        postDetail: {
          desc: "Spectacular penthouse villa overlooking Ipanema Beach and Sugarloaf Mountain. Features rooftop terrace, private elevator, and Brazilian hardwood floors throughout.",
          utilities: "tenant",
          pet: "allowed",
          income: "2x",
          size: 2800,
          school: 400,
          bus: 100,
          restaurant: 50
        }
      },
      {
        title: "Modern Condo in Buenos Aires Palermo",
        price: 195000,
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
        ],
        address: "Av. Santa Fe 3200, Palermo",
        city: "Buenos Aires",
        bedroom: 2,
        bathroom: 2,
        latitude: "-34.5886",
        longitude: "-58.4024",
        type: "buy",
        property: "condo",
        userId: createdAgents[1].id,
        postDetail: {
          desc: "Stylish condo in trendy Palermo neighborhood. Close to parks, cafes, and nightlife. Features balcony, modern kitchen, and building amenities including gym and rooftop.",
          utilities: "shared",
          pet: "cats",
          income: "2x",
          size: 1200,
          school: 600,
          bus: 150,
          restaurant: 80
        }
      },

      // ASIA
      {
        title: "Luxury Villa in Bali Seminyak",
        price: 385000,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
        ],
        address: "Jl. Kayu Aya No. 88, Seminyak",
        city: "Bali",
        bedroom: 4,
        bathroom: 5,
        latitude: "-8.6862",
        longitude: "115.1529",
        type: "buy",
        property: "villa",
        userId: createdAgents[0].id,
        postDetail: {
          desc: "Tropical paradise villa with private pool, lush gardens, and traditional Balinese architecture. Minutes from Seminyak Beach and world-class restaurants.",
          utilities: "included",
          pet: "allowed",
          income: "2x",
          size: 3500,
          school: 2000,
          bus: 800,
          restaurant: 200
        }
      },
      {
        title: "High-Rise Condo in Singapore Marina Bay",
        price: 1250000,
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1616593871999-03e2e4c0beea?w=800&h=600&fit=crop"
        ],
        address: "Marina Bay Residences, Tower 2",
        city: "Singapore",
        bedroom: 2,
        bathroom: 2,
        latitude: "1.2825",
        longitude: "103.8607",
        type: "buy",
        property: "condo",
        userId: createdAgents[1].id,
        postDetail: {
          desc: "Ultra-modern condo with stunning city skyline views. Premium amenities include infinity pool, concierge, and direct MRT access. Heart of Singapore's financial district.",
          utilities: "included",
          pet: "cats",
          income: "4x",
          size: 1100,
          school: 300,
          bus: 50,
          restaurant: 100
        }
      },
      {
        title: "Traditional Villa in Kyoto Historic District",
        price: 580000,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
        ],
        address: "35 Shimogamo Miyazaki-cho, Sakyo-ku",
        city: "Kyoto",
        bedroom: 3,
        bathroom: 2,
        latitude: "35.0462",
        longitude: "135.7681",
        type: "buy",
        property: "villa",
        userId: createdAgents[0].id,
        postDetail: {
          desc: "Beautifully preserved traditional Japanese villa with zen garden, tea room, and tatami floors. Walking distance to temples and historic sites.",
          utilities: "tenant",
          pet: "none",
          income: "3x",
          size: 2200,
          school: 500,
          bus: 300,
          restaurant: 250
        }
      },

      // OCEANIA
      {
        title: "Beachfront Villa in Gold Coast",
        price: 890000,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
        ],
        address: "123 Hedges Avenue, Mermaid Beach",
        city: "Gold Coast",
        bedroom: 5,
        bathroom: 4,
        latitude: "-28.0451",
        longitude: "153.4309",
        type: "buy",
        property: "villa",
        userId: createdAgents[1].id,
        postDetail: {
          desc: "Stunning beachfront villa with direct beach access, pool, outdoor entertaining area, and panoramic ocean views. Close to Surfers Paradise and theme parks.",
          utilities: "included",
          pet: "allowed",
          income: "2x",
          size: 4200,
          school: 800,
          bus: 400,
          restaurant: 200
        }
      },
      {
        title: "Harbourside Condo in Auckland",
        price: 425000,
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
        ],
        address: "88 Quay Street, Auckland Central",
        city: "Auckland",
        bedroom: 2,
        bathroom: 2,
        latitude: "-36.8442",
        longitude: "174.7633",
        type: "buy",
        property: "condo",
        userId: createdAgents[0].id,
        postDetail: {
          desc: "Modern harbourfront condo with stunning views of Auckland Harbour Bridge and Waitemata Harbour. Walking distance to Viaduct and CBD.",
          utilities: "shared",
          pet: "cats",
          income: "3x",
          size: 1300,
          school: 600,
          bus: 100,
          restaurant: 150
        }
      },

      // RENTAL PROPERTIES
      {
        title: "Luxury Condo Rental in Dubai Marina",
        price: 3800,
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1616593871999-03e2e4c0beea?w=800&h=600&fit=crop"
        ],
        address: "Dubai Marina Walk, Building 5",
        city: "Dubai",
        bedroom: 2,
        bathroom: 2,
        latitude: "25.0772",
        longitude: "55.1390",
        type: "rent",
        property: "condo",
        userId: createdAgents[1].id,
        postDetail: {
          desc: "Furnished luxury condo with marina views, gym, pool, and beach access. Walking distance to restaurants, shops, and metro station.",
          utilities: "included",
          pet: "cats",
          income: "3x",
          size: 1500,
          school: 1000,
          bus: 200,
          restaurant: 100
        }
      },
      {
        title: "Villa Rental in Santorini Oia",
        price: 4500,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop"
        ],
        address: "Oia Village, Cyclades",
        city: "Santorini",
        bedroom: 3,
        bathroom: 2,
        latitude: "36.4618",
        longitude: "25.3753",
        type: "rent",
        property: "villa",
        userId: createdAgents[0].id,
        postDetail: {
          desc: "Traditional Cycladic villa with caldera views, infinity pool, and sunset terrace. Perfect for luxury vacation rental in iconic Greek island setting.",
          utilities: "included",
          pet: "none",
          income: "2x",
          size: 2400,
          school: 5000,
          bus: 1000,
          restaurant: 300
        }
      }
    ];

    console.log(`📝 Adding ${internationalProperties.length} international properties...`);
    
    let addedCount = 0;
    for (const propertyData of internationalProperties) {
      const { postDetail, userId, ...postData } = propertyData;
      
      try {
        const property = await prisma.post.create({
          data: {
            ...postData,
            userId: userId,
            postDetail: {
              create: postDetail
            }
          },
          include: {
            postDetail: true,
            user: {
              select: {
                username: true,
                email: true
              }
            }
          }
        });
        
        addedCount++;
        console.log(`✅ ${addedCount}. ${property.title} - ${property.city} (${property.type}) - $${property.price.toLocaleString()}`);
      } catch (error) {
        console.error(`❌ Failed to add property: ${propertyData.title}`, error.message);
      }
    }

    console.log(`\n🎉 Successfully added ${addedCount} international properties!`);
    console.log("\n📊 New Property Distribution:");
    console.log("🌍 Africa: Cape Town, Lagos");
    console.log("🌎 South America: Rio de Janeiro, Buenos Aires");
    console.log("🌏 Asia: Bali, Singapore, Kyoto, Dubai");
    console.log("🌊 Oceania: Gold Coast, Auckland, Santorini");
    console.log("\n🏠 Property Types: Villas, Condos");
    console.log("💰 Price Range: $195,000 - $1,250,000 (sales), $3,800 - $4,500/month (rentals)");

  } catch (error) {
    console.error("❌ Error adding international properties:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addInternationalProperties();