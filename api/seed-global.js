import prisma from "./lib/prisma.js";

const globalProperties = [
  // ── EUROPE ──────────────────────────────────────────────
  {
    title: "Georgian Townhouse in Mayfair",
    price: 4200000, city: "London", address: "14 Grosvenor Square, Mayfair",
    bedroom: 5, bathroom: 4, latitude: "51.5074", longitude: "-0.1506",
    type: "buy", property: "house", sqft: 3800, yearBuilt: 1820,
    amenities: ["parking", "garden", "fireplace", "security"],
    features: ["original cornicing", "wine cellar", "staff quarters", "private garden"],
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Magnificent Grade I listed Georgian townhouse in the heart of Mayfair. Original period features throughout, including ornate cornicing and marble fireplaces. Five generous bedrooms, private rear garden, and a rare double garage.", utilities: "tenant", pet: "none", income: "5x", size: 3800, school: 3, bus: 1, restaurant: 1 }
  },
  {
    title: "Haussmann Apartment near Eiffel Tower",
    price: 2800000, city: "Paris", address: "18 Avenue de la Bourdonnais, 7ème",
    bedroom: 3, bathroom: 2, latitude: "48.8566", longitude: "2.2986",
    type: "buy", property: "apartment", sqft: 1600, yearBuilt: 1890,
    amenities: ["elevator", "concierge", "balcony"],
    features: ["Eiffel Tower view", "herringbone parquet", "period mouldings", "grand salon"],
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549517045-bc93de075e53?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Exceptional Haussmann-era apartment with direct Eiffel Tower views. Stunning herringbone parquet floors, ornate period mouldings, and a grand salon flooded with natural light. Steps from the Champ de Mars.", utilities: "tenant", pet: "cats", income: "4x", size: 1600, school: 2, bus: 1, restaurant: 1 }
  },
  {
    title: "Penthouse in Mitte with Rooftop Terrace",
    price: 1850000, city: "Berlin", address: "Unter den Linden 12, Mitte",
    bedroom: 3, bathroom: 2, latitude: "52.5200", longitude: "13.4050",
    type: "buy", property: "apartment", sqft: 2100, yearBuilt: 2019,
    amenities: ["rooftop terrace", "gym", "elevator", "parking"],
    features: ["360° city views", "designer kitchen", "floor-to-ceiling windows", "smart home"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560449752-54b2c73ceca8?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Ultra-modern penthouse atop a landmark building in central Berlin. The sprawling rooftop terrace offers 360° views of the city skyline. Smart home automation, designer kitchen with Miele appliances, and bespoke interiors throughout.", utilities: "included", pet: "none", income: "3x", size: 2100, school: 2, bus: 1, restaurant: 1 }
  },
  {
    title: "Modernist Villa on Costa Brava",
    price: 3500000, city: "Barcelona", address: "Carrer de la Diputació 211, Sant Feliu",
    bedroom: 6, bathroom: 5, latitude: "41.3851", longitude: "2.1734",
    type: "buy", property: "villa", sqft: 5200, yearBuilt: 2015,
    amenities: ["pool", "garden", "parking", "gym", "security"],
    features: ["infinity pool", "Mediterranean sea views", "wine cellar", "outdoor kitchen"],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Breathtaking modernist villa with infinity pool overlooking the Mediterranean. Six en-suite bedrooms, professional-grade outdoor kitchen, and a private vineyard. A short drive from Barcelona.", utilities: "tenant", pet: "allowed", income: "4x", size: 5200, school: 5, bus: 5, restaurant: 3 }
  },
  {
    title: "Canal House in Jordaan District",
    price: 1650000, city: "Amsterdam", address: "Prinsengracht 263, Jordaan",
    bedroom: 4, bathroom: 2, latitude: "52.3676", longitude: "4.9041",
    type: "buy", property: "house", sqft: 2200, yearBuilt: 1680,
    amenities: ["canal view", "private boat dock", "storage"],
    features: ["original beam ceilings", "canal views", "restored facade", "private dock"],
    images: [
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Rare 17th-century canal house in the iconic Jordaan district. Original exposed beam ceilings, wide-plank floors, and a private boat dock. Fully modernised interiors while preserving historic character.", utilities: "tenant", pet: "cats", income: "3x", size: 2200, school: 3, bus: 1, restaurant: 1 }
  },
  {
    title: "Luxury Apartment near Colosseum",
    price: 980000, city: "Rome", address: "Via Sacra 5, Centro Storico",
    bedroom: 2, bathroom: 2, latitude: "41.9028", longitude: "12.4964",
    type: "buy", property: "apartment", sqft: 1100, yearBuilt: 2010,
    amenities: ["rooftop terrace", "concierge", "elevator"],
    features: ["Colosseum views", "travertine floors", "private terrace", "historic building"],
    images: [
      "https://images.unsplash.com/photo-1515542622106-078bda69bf98?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-444ca7b14fd6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Stunning apartment steps from the Colosseum with unobstructed views of ancient Rome. Travertine floors, bespoke Italian kitchen, and a private terrace where you watch the sunrise over the Forum.", utilities: "tenant", pet: "none", income: "3x", size: 1100, school: 4, bus: 1, restaurant: 1 }
  },
  {
    title: "Modern Flat in Shoreditch",
    price: 4500, city: "London", address: "Shoreditch High Street 78, EC1",
    bedroom: 2, bathroom: 1, latitude: "51.5227", longitude: "-0.0782",
    type: "rent", property: "apartment", sqft: 900, yearBuilt: 2018,
    amenities: ["gym", "concierge", "rooftop", "bike storage"],
    features: ["exposed brick", "industrial design", "open plan", "city views"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560449752-54b2c73ceca8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Stylish industrial-chic apartment in London's creative hub. Exposed brick walls, polished concrete floors, and floor-to-ceiling windows with city views. Minutes from Spitalfields Market and Liverpool Street.", utilities: "tenant", pet: "cats", income: "3x", size: 900, school: 2, bus: 1, restaurant: 1 }
  },

  // ── ASIA ─────────────────────────────────────────────────
  {
    title: "Sky Villa in Marina Bay",
    price: 5800000, city: "Singapore", address: "10 Bayfront Avenue, Marina Bay",
    bedroom: 4, bathroom: 4, latitude: "1.2839", longitude: "103.8607",
    type: "buy", property: "apartment", sqft: 3200, yearBuilt: 2021,
    amenities: ["infinity pool", "gym", "concierge", "valet", "spa"],
    features: ["panoramic bay views", "private lift", "smart home", "designer interiors"],
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Ultra-luxury sky villa above Marina Bay Sands with sweeping views of the bay and city skyline. Private lift access, bespoke furnishings, and world-class building amenities including a sky-level infinity pool.", utilities: "included", pet: "none", income: "5x", size: 3200, school: 2, bus: 1, restaurant: 1 }
  },
  {
    title: "Traditional Machiya in Gion",
    price: 1200000, city: "Tokyo", address: "Gion-machi Minamigawa, Higashiyama-ku",
    bedroom: 3, bathroom: 2, latitude: "35.0116", longitude: "135.7681",
    type: "buy", property: "house", sqft: 1800, yearBuilt: 1920,
    amenities: ["zen garden", "engawa", "tea room"],
    features: ["traditional machiya", "zen garden", "bamboo courtyard", "cedar interiors"],
    images: [
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Exquisite century-old machiya townhouse in Kyoto's famed Gion district. Lovingly restored with traditional Japanese craftsmanship — cedar beams, shoji screens, and a serene bamboo garden. Steps from historic temples.", utilities: "tenant", pet: "none", income: "3x", size: 1800, school: 3, bus: 2, restaurant: 1 }
  },
  {
    title: "Burj Khalifa View Penthouse",
    price: 6500000, city: "Dubai", address: "Downtown Boulevard, Sheikh Mohammed Blvd",
    bedroom: 5, bathroom: 5, latitude: "25.2048", longitude: "55.2708",
    type: "buy", property: "apartment", sqft: 7000, yearBuilt: 2022,
    amenities: ["private pool", "gym", "concierge", "valet", "spa", "home cinema"],
    features: ["Burj Khalifa views", "private pool", "gold fixtures", "home automation"],
    images: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "The pinnacle of luxury living in Downtown Dubai. This ultra-prime penthouse commands sweeping views of the Burj Khalifa and Dubai Fountain. Private rooftop pool, home cinema, and bespoke Italian furnishings throughout.", utilities: "included", pet: "none", income: "5x", size: 7000, school: 3, bus: 2, restaurant: 1 }
  },
  {
    title: "Sea-View Villa on Seminyak Beach",
    price: 8500, city: "Bali", address: "Jl. Petitenget No.100, Seminyak",
    bedroom: 4, bathroom: 4, latitude: "-8.1742", longitude: "115.1623",
    type: "rent", property: "villa", sqft: 4500, yearBuilt: 2017,
    amenities: ["private pool", "garden", "staff", "gym", "outdoor dining"],
    features: ["beachfront access", "private pool", "tropical gardens", "staff included"],
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Spectacular beachfront villa in Bali's most coveted address. Four en-suite pavilions set amid lush tropical gardens, a 20m private pool, and your own beach entrance. Full staff including chef, butler, and housekeeper included.", utilities: "included", pet: "none", income: "none", size: 4500, school: 5, bus: 4, restaurant: 2 }
  },
  {
    title: "High-Rise Studio in Gangnam",
    price: 3200, city: "Seoul", address: "Teheran-ro 87, Gangnam-gu",
    bedroom: 1, bathroom: 1, latitude: "37.5013", longitude: "127.0240",
    type: "rent", property: "apartment", sqft: 520, yearBuilt: 2020,
    amenities: ["gym", "rooftop", "concierge", "laundry"],
    features: ["city views", "modern design", "smart controls", "high-speed internet"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e1a5b6e8b5c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Sleek studio in the heart of Gangnam — Seoul's most dynamic district. Smart home controls, designer fixtures, and sweeping city views. Walk to COEX Mall, world-class dining, and the subway.", utilities: "included", pet: "none", income: "2x", size: 520, school: 1, bus: 1, restaurant: 1 }
  },
  {
    title: "Heritage Apartment in South Mumbai",
    price: 2200000, city: "Mumbai", address: "Malabar Hill, Walkeshwar Road",
    bedroom: 3, bathroom: 3, latitude: "18.9551", longitude: "72.8130",
    type: "buy", property: "apartment", sqft: 2400, yearBuilt: 1965,
    amenities: ["sea view", "garden", "security", "parking"],
    features: ["Arabian Sea views", "art deco details", "large balcony", "teak floors"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560449752-54b2c73ceca8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Rare art deco apartment on prestigious Malabar Hill with breathtaking Arabian Sea views. Original teak floors, generous balconies, and a coveted Hanging Gardens address. A true piece of Mumbai history.", utilities: "tenant", pet: "allowed", income: "3x", size: 2400, school: 2, bus: 2, restaurant: 2 }
  },

  // ── NORTH AMERICA (additional) ────────────────────────────
  {
    title: "Waterfront Condo in Coal Harbour",
    price: 3200000, city: "Vancouver", address: "1211 Melville Street, Coal Harbour",
    bedroom: 3, bathroom: 2, latitude: "49.2827", longitude: "-123.1207",
    type: "buy", property: "condo", sqft: 1900, yearBuilt: 2018,
    amenities: ["concierge", "pool", "gym", "valet", "spa"],
    features: ["ocean & mountain views", "private balcony", "chef's kitchen", "air conditioning"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560449752-54b2c73ceca8?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Spectacular waterfront condo in Vancouver's premier Coal Harbour neighbourhood. Sweeping views of Burrard Inlet and the North Shore mountains from every room. Steps to Stanley Park and the seawall.", utilities: "included", pet: "cats", income: "3x", size: 1900, school: 2, bus: 1, restaurant: 1 }
  },
  {
    title: "Penthouse in Le Plateau-Mont-Royal",
    price: 5200, city: "Montreal", address: "4481 Rue Saint-Denis, Plateau",
    bedroom: 2, bathroom: 2, latitude: "45.5231", longitude: "-73.5815",
    type: "rent", property: "apartment", sqft: 1200, yearBuilt: 2016,
    amenities: ["rooftop terrace", "gym", "bike storage"],
    features: ["rooftop access", "exposed brick", "loft ceilings", "designer finishes"],
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-444ca7b14fd6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Chic penthouse loft in Montreal's hippest neighbourhood. Exposed brick, soaring ceilings, and private rooftop terrace with panoramic views. Walk to the Jean-Talon Market, galleries, and the best brunch spots in the city.", utilities: "tenant", pet: "allowed", income: "2x", size: 1200, school: 2, bus: 1, restaurant: 1 }
  },
  {
    title: "Historic Brownstone in Back Bay",
    price: 3800000, city: "Boston", address: "202 Commonwealth Avenue, Back Bay",
    bedroom: 5, bathroom: 4, latitude: "42.3488", longitude: "-71.0820",
    type: "buy", property: "house", sqft: 4600, yearBuilt: 1878,
    amenities: ["garden", "parking", "fireplace", "wine cellar"],
    features: ["original brownstone facade", "four fireplaces", "formal dining", "private garden"],
    images: [
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Magnificent Victorian brownstone on Boston's most prestigious boulevard. Four working fireplaces, a formal dining room for 20, and a private garden. Walking distance to the Charles River Esplanade and Newbury Street boutiques.", utilities: "tenant", pet: "allowed", income: "4x", size: 4600, school: 1, bus: 1, restaurant: 1 }
  },

  // ── SOUTH AMERICA ────────────────────────────────────────
  {
    title: "Luxury Apartment in Ipanema",
    price: 1400000, city: "Rio de Janeiro", address: "Rua Barão da Torre 550, Ipanema",
    bedroom: 3, bathroom: 3, latitude: "-22.9857", longitude: "-43.1996",
    type: "buy", property: "apartment", sqft: 2000, yearBuilt: 2014,
    amenities: ["pool", "gym", "concierge", "beach access"],
    features: ["ocean views", "large balcony", "doorman", "prime Ipanema location"],
    images: [
      "https://images.unsplash.com/photo-1544989164-31c6ff5cf66d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Prime Ipanema apartment just steps from the world's most famous beach. Sweeping ocean and mountain views, generous wrap-around balcony, and resort-style building amenities. The ultimate Rio lifestyle.", utilities: "included", pet: "cats", income: "3x", size: 2000, school: 2, bus: 1, restaurant: 1 }
  },
  {
    title: "Modern Loft in Palermo Soho",
    price: 3800, city: "Buenos Aires", address: "Thames 1890, Palermo Soho",
    bedroom: 2, bathroom: 1, latitude: "-34.5851", longitude: "-58.4313",
    type: "rent", property: "apartment", sqft: 950, yearBuilt: 2019,
    amenities: ["rooftop pool", "gym", "bike storage"],
    features: ["double-height ceilings", "rooftop pool access", "designer kitchen", "artwork included"],
    images: [
      "https://images.unsplash.com/photo-1560449752-54b2c73ceca8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Stylish loft in Buenos Aires' most fashionable barrio. Double-height ceilings, designer furnishings, and rooftop pool access. Surrounded by boutiques, restaurants, and weekend fairs.", utilities: "included", pet: "allowed", income: "2x", size: 950, school: 3, bus: 1, restaurant: 1 }
  },
  {
    title: "Penthouse in Vitacura",
    price: 1800000, city: "Santiago", address: "Av. Alonso de Córdova 5151, Vitacura",
    bedroom: 4, bathroom: 3, latitude: "-33.3983", longitude: "-70.5981",
    type: "buy", property: "apartment", sqft: 2800, yearBuilt: 2020,
    amenities: ["pool", "gym", "concierge", "parking", "rooftop terrace"],
    features: ["Andes views", "private terrace", "smart home", "premium finishes"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Exceptional penthouse in Santiago's premier residential district with spectacular Andes mountain views. Private rooftop terrace, smart home system, and top-of-the-line finishes throughout.", utilities: "tenant", pet: "none", income: "4x", size: 2800, school: 1, bus: 2, restaurant: 1 }
  },

  // ── AFRICA ───────────────────────────────────────────────
  {
    title: "Clifton Beachfront Villa",
    price: 4200000, city: "Cape Town", address: "4th Beach Road, Clifton",
    bedroom: 5, bathroom: 5, latitude: "-33.9249", longitude: "18.4241",
    type: "buy", property: "villa", sqft: 5800, yearBuilt: 2016,
    amenities: ["private pool", "gym", "beach access", "security", "garden"],
    features: ["private beach access", "infinity pool", "Table Mountain views", "smart home"],
    images: [
      "https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Iconic villa on Cape Town's most exclusive beach. Private steps to Clifton 4th Beach, infinity pool, and uninterrupted views of Table Mountain and the Atlantic Ocean. World-class luxury in South Africa's most sought-after address.", utilities: "tenant", pet: "allowed", income: "5x", size: 5800, school: 3, bus: 3, restaurant: 2 }
  },
  {
    title: "Garden Apartment in Lekki Phase 1",
    price: 280000, city: "Lagos", address: "Admiralty Way, Lekki Phase 1",
    bedroom: 3, bathroom: 3, latitude: "6.4281", longitude: "3.4219",
    type: "buy", property: "apartment", sqft: 1800, yearBuilt: 2021,
    amenities: ["pool", "gym", "security", "generator", "parking"],
    features: ["24/7 security", "backup power", "modern finishes", "private garden"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Contemporary apartment in Lagos' most prestigious residential enclave. High-spec finishes, private garden, and 24/7 security. Walk to Victoria Island's best restaurants and the marina.", utilities: "included", pet: "none", income: "2x", size: 1800, school: 2, bus: 2, restaurant: 2 }
  },
  {
    title: "Boutique Villa in Karen",
    price: 650000, city: "Nairobi", address: "Karen Road, Karen",
    bedroom: 4, bathroom: 4, latitude: "-1.3209", longitude: "36.7099",
    type: "buy", property: "villa", sqft: 3600, yearBuilt: 2018,
    amenities: ["garden", "pool", "security", "servant quarters", "parking"],
    features: ["1-acre garden", "mountain views", "staff quarters", "solar power"],
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Beautiful villa set on one acre of lush gardens in Karen — Nairobi's most desirable leafy suburb. Named after Karen Blixen, this tranquil neighbourhood offers Ngong Hills views, birdsong, and a true out-of-Africa atmosphere.", utilities: "tenant", pet: "allowed", income: "3x", size: 3600, school: 2, bus: 3, restaurant: 3 }
  },
  {
    title: "Nile-View Apartment in Zamalek",
    price: 180000, city: "Cairo", address: "26th of July Corridor, Zamalek",
    bedroom: 3, bathroom: 2, latitude: "30.0626", longitude: "31.2197",
    type: "buy", property: "apartment", sqft: 2100, yearBuilt: 1960,
    amenities: ["Nile view", "concierge", "parking", "elevator"],
    features: ["Nile views", "high ceilings", "art deco details", "island location"],
    images: [
      "https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Elegant apartment on Zamalek Island — Cairo's most prestigious address. Direct Nile views, soaring ceilings, and art deco character throughout. A tranquil oasis in the heart of the Egyptian capital.", utilities: "tenant", pet: "cats", income: "2x", size: 2100, school: 2, bus: 2, restaurant: 1 }
  },

  // ── OCEANIA ──────────────────────────────────────────────
  {
    title: "Bondi Beachside Apartment",
    price: 2800000, city: "Sydney", address: "12 Campbell Parade, Bondi Beach",
    bedroom: 3, bathroom: 2, latitude: "-33.8908", longitude: "151.2743",
    type: "buy", property: "apartment", sqft: 1500, yearBuilt: 2017,
    amenities: ["rooftop pool", "gym", "parking", "beachside"],
    features: ["ocean views", "beachfront location", "large balcony", "open plan"],
    images: [
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Prime beachfront apartment steps from iconic Bondi Beach. Watch the sunrise over the Pacific from your private balcony. Open-plan living, chef's kitchen, and rooftop pool. The ultimate Sydney lifestyle.", utilities: "tenant", pet: "none", income: "4x", size: 1500, school: 2, bus: 1, restaurant: 1 }
  },
  {
    title: "Fitzroy Terrace House",
    price: 5500, city: "Melbourne", address: "218 Smith Street, Fitzroy",
    bedroom: 3, bathroom: 2, latitude: "-37.8136", longitude: "144.9631",
    type: "rent", property: "house", sqft: 1600, yearBuilt: 1895,
    amenities: ["garden", "parking", "fireplace", "storage"],
    features: ["original Victorian facade", "open fireplace", "private courtyard", "period features"],
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Charming Victorian terrace in Melbourne's most vibrant inner-city suburb. Beautifully restored period features, open fireplace, and a private north-facing courtyard. Walk to Collingwood's galleries, cafes, and Smith Street boutiques.", utilities: "tenant", pet: "allowed", income: "2x", size: 1600, school: 2, bus: 1, restaurant: 1 }
  },
  {
    title: "Harbourfront Apartment in Viaduct",
    price: 1950000, city: "Auckland", address: "Viaduct Harbour Avenue, Viaduct",
    bedroom: 2, bathroom: 2, latitude: "-36.8485", longitude: "174.7633",
    type: "buy", property: "apartment", sqft: 1100, yearBuilt: 2015,
    amenities: ["marina views", "gym", "concierge", "parking"],
    features: ["harbour views", "marina frontage", "modern kitchen", "city skyline"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Stunning harbourfront apartment in Auckland's Viaduct — New Zealand's most glamorous waterfront precinct. Watch superyachts from your living room. Walk to fine dining, bars, and the ferry terminal.", utilities: "included", pet: "none", income: "3x", size: 1100, school: 2, bus: 1, restaurant: 1 }
  },

  // ── MIDDLE EAST (additional) ──────────────────────────────
  {
    title: "Palm Jumeirah Beach Villa",
    price: 9500000, city: "Dubai", address: "Frond K, Palm Jumeirah",
    bedroom: 6, bathroom: 7, latitude: "25.1124", longitude: "55.1390",
    type: "buy", property: "villa", sqft: 8500, yearBuilt: 2021,
    amenities: ["private beach", "pool", "home cinema", "gym", "security", "staff quarters"],
    features: ["private beach", "2 pools", "Atlantis views", "smart home", "6-car garage"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop"
    ],
    postDetail: { desc: "Trophy villa on the world's most iconic man-made island. This exceptional estate features 50m of private beachfront, two swimming pools, a home cinema, and direct views of the Atlantis resort. Ultimate Dubai luxury.", utilities: "included", pet: "allowed", income: "none", size: 8500, school: 5, bus: 5, restaurant: 3 }
  }
];

async function seedGlobal() {
  try {
    console.log("🌍 Seeding global properties...");

    const users = await prisma.user.findMany({ select: { id: true, username: true } });
    if (users.length === 0) {
      console.error("No users found. Run seed.js first.");
      return;
    }

    let created = 0;
    for (let i = 0; i < globalProperties.length; i++) {
      const p = globalProperties[i];
      const user = users[i % users.length];
      const { postDetail, ...rest } = p;

      await prisma.post.create({
        data: {
          ...rest,
          userId: user.id,
          amenities: rest.amenities || [],
          features: rest.features || [],
          postDetail: { create: postDetail }
        }
      });
      console.log(`${p.city}: ${p.title}`);
      created++;
    }

    console.log(`\n🎉 Done! Added ${created} global properties.`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedGlobal();
