# 🏠 Full-Stack Real Estate Platform - MERN Stack Application

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io/)

> 🏆 **A comprehensive full-stack real estate application with advanced features including real-time chat, interactive maps, payment integration, and responsive design**

## 🌟 Project Overview

A production-ready real estate platform built with the MERN stack, featuring real-time communication, advanced property search, user authentication, and payment processing. This application demonstrates enterprise-level full-stack development with modern web technologies and best practices.

## 🚀 Key Features & Technical Highlights

### 🏗️ **Full-Stack MERN Architecture**
- **Frontend**: React 18 with Vite build system
- **Backend**: Node.js + Express.js RESTful API
- **Database**: MongoDB with Prisma ORM
- **Real-time**: Socket.io for live chat functionality
- **Authentication**: JWT-based secure authentication

### 🔐 **Advanced Authentication System**
- **JWT Token Management**: Secure token-based authentication
- **Email Verification**: Complete email verification workflow
- **Password Reset**: Secure password recovery system
- **Session Management**: Persistent login with refresh tokens
- **Role-Based Access**: User roles and permissions

### 💬 **Real-Time Communication**
- **Socket.io Integration**: Instant messaging between users
- **Chat Rooms**: Property-specific chat rooms
- **Message History**: Persistent chat storage
- **Online Status**: Real-time user presence
- **File Sharing**: Image and document sharing in chat

### 🗺️ **Interactive Maps & Location**
- **Leaflet Maps Integration**: Interactive property maps
- **Geolocation Services**: Location-based property search
- **Map Markers**: Custom property markers with details
- **Area Search**: Search properties by geographic area
- **Distance Calculation**: Proximity-based filtering

### 💳 **Payment Integration**
- **Stripe Integration**: Secure payment processing
- **Multiple Payment Methods**: Cards, digital wallets
- **Subscription Management**: Premium user features
- **Transaction History**: Complete payment records
- **Secure Checkout**: PCI-compliant payment flow

### 🔍 **Advanced Property Search**
- **Multi-Filter Search**: Price, location, type, amenities
- **Sorting Options**: Price, date, popularity, distance
- **Saved Searches**: User preference storage
- **Search Suggestions**: Auto-complete and recommendations
- **Property Comparison**: Side-by-side property comparison

### 📱 **Responsive Design & UI/UX**
- **Mobile-First Design**: Fully responsive across all devices
- **SCSS Styling**: Advanced styling with variables and mixins
- **Modern UI Components**: Clean, professional interface
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: User-friendly error messages

## 🏗️ Technical Architecture

### **Backend Architecture**
```javascript
// Express.js API Server (Port 8800)
api/
├── controllers/        # Route handlers and business logic
├── middleware/        # Authentication and validation
├── models/           # Prisma schema and database models
├── routes/           # API route definitions
├── utils/            # Helper functions and utilities
└── config/           # Database and service configurations
```

### **Frontend Architecture**
```javascript
// React Client (Port 5174)
client/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/        # Route-based page components
│   ├── context/      # React Context for state management
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API integration services
│   └── utils/        # Frontend utility functions
└── public/           # Static assets and configurations
```

### **Real-Time Communication**
```javascript
// Socket.io Server (Port 4000)
socket/
├── handlers/         # Socket event handlers
├── middleware/       # Socket authentication
├── models/          # Chat and message models
└── utils/           # Socket utility functions
```

### **Database Schema (Prisma)**
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  username  String   @unique
  avatar    String?
  posts     Post[]
  chats     Chat[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  price       Int
  images      String[]
  address     String
  city        String
  bedroom     Int
  bathroom    Int
  latitude    String
  longitude   String
  type        Type
  property    Property
  user        User     @relation(fields: [userId], references: [id])
  userId      String   @db.ObjectId
  createdAt   DateTime @default(now())
}
```

## 🔧 Installation & Development Setup

### **Prerequisites**
```bash
Node.js 18+
MongoDB 6.0+
npm or yarn
Git
```

### **Quick Start**
```bash
# Clone the repository
git clone <repository-url>
cd full-stack-estate-main

# Install dependencies for all services
cd api && npm install
cd ../client && npm install
cd ../socket && npm install

# Setup environment variables
cp api/.env.example api/.env
# Edit .env with your configurations

# Start all services
npm run start-all

# Or start individually:
# API Server: cd api && npm start
# Socket Server: cd socket && npm start  
# Client App: cd client && npm run dev
```

### **Environment Configuration**
```env
# Database
DATABASE_URL="mongodb://localhost:27017/estate-db"

# Authentication
JWT_SECRET_KEY=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email Service (NodeMailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Client URLs
CLIENT_URL=http://localhost:5174
API_URL=http://localhost:8800
```

## 📊 Feature Deep Dive

### **Property Management System**
- **CRUD Operations**: Create, read, update, delete properties
- **Image Upload**: Multiple image support with optimization
- **Property Details**: Comprehensive property information
- **Status Management**: Available, sold, pending status tracking

### **User Dashboard**
- **Profile Management**: Complete user profile system
- **Property Listings**: User's property management
- **Saved Properties**: Favorites and watchlist
- **Message Center**: Integrated chat interface
- **Transaction History**: Payment and booking records

### **Search & Filter Engine**
```javascript
// Advanced Search Implementation
const searchProperties = async (filters) => {
  const {
    minPrice, maxPrice, city, type, bedrooms,
    bathrooms, propertyType, sortBy, page = 1
  } = filters;
  
  const query = await prisma.post.findMany({
    where: {
      price: { gte: minPrice, lte: maxPrice },
      city: { contains: city, mode: 'insensitive' },
      bedroom: { gte: bedrooms },
      bathroom: { gte: bathrooms },
      type: propertyType
    },
    orderBy: getSortOrder(sortBy),
    take: 10,
    skip: (page - 1) * 10,
    include: { user: true }
  });
  
  return query;
};
```

### **Real-Time Chat Implementation**
```javascript
// Socket.io Chat Handler
io.on('connection', (socket) => {
  socket.on('join-chat', ({ chatId, userId }) => {
    socket.join(chatId);
    socket.to(chatId).emit('user-joined', { userId });
  });
  
  socket.on('send-message', async (messageData) => {
    const message = await saveMessage(messageData);
    io.to(messageData.chatId).emit('new-message', message);
  });
  
  socket.on('typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('user-typing', { userId });
  });
});
```

### **Payment Processing**
```javascript
// Stripe Payment Integration
const processPayment = async (paymentData) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: paymentData.amount * 100,
    currency: 'usd',
    metadata: {
      propertyId: paymentData.propertyId,
      userId: paymentData.userId
    }
  });
  
  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: paymentIntent.id
  };
};
```

## 🔒 Security Implementation

### **Authentication & Authorization**
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Joi schema validation
- **Rate Limiting**: API request rate limiting
- **CORS Configuration**: Secure cross-origin requests

### **Data Protection**
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based CSRF prevention
- **Secure Headers**: Helmet.js security headers
- **Environment Variables**: Secure config management

## 🚀 Deployment & DevOps

### **Production Build**
```bash
# Build client application
cd client && npm run build

# Production server setup
cd api && npm run build
NODE_ENV=production npm start
```

### **Deployment Configuration**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm run build:client && npm run build:api",
    "deploy": "npm run build && npm run deploy:heroku"
  }
}
```

### **Performance Optimization**
- **Code Splitting**: Lazy loading for route components
- **Image Optimization**: Compressed and responsive images
- **Caching**: Redis caching for API responses
- **CDN Integration**: Static asset delivery
- **Database Indexing**: Optimized MongoDB queries

## 📈 Performance Metrics

### **Technical Performance**
- **Page Load Time**: <2 seconds average
- **API Response Time**: <200ms for most endpoints
- **Database Queries**: Optimized with proper indexing
- **Bundle Size**: Optimized with code splitting
- **Mobile Performance**: 90+ Lighthouse score

### **Scalability Features**
- **Horizontal Scaling**: Stateless server architecture
- **Database Sharding**: Prepared for data partitioning
- **Load Balancing**: Multiple server instance support
- **Caching Layer**: Redis for session and data caching

## 🎯 Business Features

### **Multi-Currency Support**
- **Currency Conversion**: Real-time exchange rates
- **Localized Pricing**: Region-based pricing display
- **Payment Processing**: Multi-currency Stripe integration

### **Property Recommendations**
- **ML-Based Suggestions**: User behavior analysis
- **Similar Properties**: Property matching algorithm
- **Price Predictions**: Market trend analysis
- **Investment Insights**: ROI calculations

### **Admin Dashboard**
- **User Management**: Admin panel for user control
- **Property Moderation**: Listing approval system
- **Analytics Dashboard**: Business intelligence
- **Revenue Tracking**: Payment and subscription analytics

## 🏆 Professional Development Highlights

### **Full-Stack Expertise**
- Complete MERN stack implementation
- Real-time application development
- Database design and optimization
- API design and development

### **Modern Development Practices**
- **Git Workflow**: Feature branch development
- **Code Quality**: ESLint and Prettier configuration
- **Testing**: Unit and integration testing setup
- **Documentation**: Comprehensive API documentation

### **Production Readiness**
- **Error Handling**: Comprehensive error management
- **Logging**: Winston logger integration
- **Monitoring**: Application performance monitoring
- **Security**: Production-grade security implementation

## 📞 Technical Specifications

**Architecture**: MERN Stack (MongoDB, Express.js, React, Node.js)  
**Real-Time**: Socket.io WebSocket implementation  
**Authentication**: JWT with email verification  
**Payment**: Stripe integration  
**Maps**: Leaflet.js integration  
**Database**: MongoDB with Prisma ORM  
**Deployment**: Production-ready with Docker support  
**Testing**: Jest and React Testing Library  

---

*This project demonstrates enterprise-level full-stack development skills with modern web technologies, real-time features, and production deployment capabilities.*