# 🏠 Modern Real Estate Application - MERN Stack

[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7+-orange.svg)](https://socket.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

A comprehensive, production-ready real estate platform featuring advanced property management, real-time messaging, multi-language support, and modern UI/UX. Built with the MERN stack and deployed on modern cloud infrastructure.

## 🌐 Live Demo

- **🏠 Frontend**: [https://real-estate-app-frontend.vercel.app](https://real-estate-app-frontend.vercel.app)
- **⚡ Backend API**: [https://real-estate-api.vercel.app](https://real-estate-api.vercel.app)
- **💬 Socket Server**: [https://real-estate-chat.railway.app](https://real-estate-chat.railway.app)

### Demo Accounts
```
Admin: admin@realestate.com / password123
User: john@example.com / password123
Agent: agent@realestate.com / password123
```

## Fixed Issues

✅ **Security vulnerabilities** - Updated all dependencies and fixed security issues
✅ **Prisma client** - Generated Prisma client for database operations  
✅ **Environment configuration** - Updated email configuration with placeholder values
✅ **Development setup** - Added nodemon for better development experience
✅ **Database connection** - MongoDB connection configured and tested
✅ **Authentication system** - Complete auth with JWT, email verification, and password reset

## Quick Start

### Option 1: Use the startup script (Windows)
```bash
# Run the batch file to start all services
start-all.bat
```

### Option 2: Manual startup
```bash
# Terminal 1 - API Server
cd api
npm start

# Terminal 2 - Socket Server  
cd socket
npm start

# Terminal 3 - Client App
cd client
npm run dev
```

## Services

- **API Server**: http://localhost:8800
- **Socket Server**: http://localhost:4000
- **Client App**: http://localhost:5174

## ✨ Key Features

### 🏢 Property Management
- **Advanced Property Listings**: Comprehensive property details with high-quality images
- **Smart Search & Filters**: Location, price range, property type, amenities filtering
- **Interactive Maps**: Leaflet integration with property markers and neighborhood info
- **Property Comparisons**: Side-by-side property comparison functionality
- **Saved Searches**: Users can save and receive alerts for matching properties
- **Property Recommendations**: AI-powered property suggestions based on user preferences

### 👥 User Management & Authentication
- **Multi-Role System**: Admin, Agent, and User roles with different permissions
- **Secure Authentication**: JWT-based auth with refresh token rotation
- **Email Verification**: Account verification via secure email links
- **Password Reset**: Secure password recovery with temporary tokens
- **Profile Management**: Complete user profiles with preferences and history
- **Social Authentication**: Google and Facebook login integration

### 💬 Real-Time Communication
- **Live Chat System**: Real-time messaging between users and agents
- **Message History**: Persistent chat history with timestamps
- **Online Status**: User presence indicators and typing indicators
- **File Sharing**: Image and document sharing in chat
- **Notification System**: Push notifications for new messages
- **Chat Rooms**: Group discussions for property inquiries

### 💳 Payment & Transactions
- **Stripe Integration**: Secure payment processing for deposits and fees
- **Multi-Currency Support**: Dynamic currency conversion (USD, EUR, GBP, CAD)
- **Payment History**: Complete transaction records and receipts
- **Subscription Plans**: Premium features for agents and users
- **Escrow Services**: Secure payment holding for property transactions

### 🌍 Internationalization & Accessibility
- **Multi-Language Support**: 8 languages (English, Spanish, French, German, Arabic, Japanese, Chinese, Hebrew)
- **RTL Support**: Right-to-left layout for Arabic and Hebrew
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Dark/Light Theme**: User preference-based theme switching
- **Accessibility**: WCAG 2.1 compliant with screen reader support

### 📊 Analytics & Admin Features
- **Admin Dashboard**: Comprehensive analytics and user management
- **Property Analytics**: Views, inquiries, and performance metrics
- **User Behavior Tracking**: Engagement and conversion analytics
- **Content Management**: Dynamic content and property management
- **Reporting System**: Automated reports and data exports

## Email Configuration

To enable email functionality, update the `.env` file in the `api` directory with your email credentials:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Real Estate App <your-email@gmail.com>
```

## 🏗️ Technical Architecture

### Backend Stack
- **Runtime**: Node.js 18+ with Express.js framework
- **Database**: MongoDB Atlas with Prisma ORM for type-safe queries
- **Authentication**: JWT tokens with refresh token rotation and bcrypt hashing
- **Real-time Communication**: Socket.io server for live chat and notifications
- **Email Service**: Nodemailer with Gmail SMTP integration
- **File Uploads**: Multer for handling property images and documents
- **Payment Processing**: Stripe API for secure transactions
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling

### Frontend Stack
- **Framework**: React 18 with modern hooks and concurrent features
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router v6 with nested routing and code splitting
- **State Management**: Zustand for global state with Context API for specific features
- **Styling**: SCSS with modular component-based architecture
- **Maps**: Leaflet with React-Leaflet for interactive property maps
- **Real-time**: Socket.io Client for live chat and notifications
- **Internationalization**: i18next with 8 language translations
- **UI Components**: Custom component library with responsive design

### DevOps & Deployment
- **Frontend Hosting**: Vercel with automatic deployments and edge caching
- **Backend API**: Vercel serverless functions with 30s execution limit
- **Socket Server**: Railway for persistent WebSocket connections
- **Database**: MongoDB Atlas with automatic scaling and backups
- **CDN**: Vercel Edge Network for global content delivery
- **Monitoring**: Vercel Analytics and Railway metrics for performance tracking

### Security & Performance
- **Authentication**: JWT with HttpOnly cookies and CSRF protection
- **Data Validation**: Input sanitization and schema validation
- **Rate Limiting**: API endpoint protection against abuse
- **CORS**: Properly configured cross-origin resource sharing
- **HTTPS**: SSL/TLS encryption for all data transmission
- **Code Splitting**: Dynamic imports for optimized bundle sizes
- **Image Optimization**: Lazy loading and responsive images
- **Caching**: API response caching and browser cache optimization

## 🚀 Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │  Socket Server  │
│   (Vercel)      │◄──►│   (Vercel)       │◄──►│   (Railway)     │
│   React + Vite  │    │   Node.js + API  │    │   Socket.io     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Database       │    │   File Storage  │
│   (Vercel CDN)  │    │   (MongoDB Atlas)│    │   (Cloudinary)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Portfolio Highlights

### Technical Skills Demonstrated
- **Full-Stack Development**: Complete MERN stack implementation with modern practices
- **Real-Time Features**: WebSocket implementation for live chat and notifications
- **API Design**: RESTful API with proper authentication, validation, and error handling
- **Database Design**: Complex relational data modeling with Prisma and MongoDB
- **State Management**: Advanced React patterns with context and custom hooks
- **Performance Optimization**: Code splitting, lazy loading, and caching strategies
- **Internationalization**: Multi-language support with RTL layout capabilities
- **Payment Integration**: Secure payment processing with Stripe API
- **DevOps**: Modern deployment pipeline with automatic CI/CD

### Business Logic Implementation
- **Multi-Role Authorization**: Complex user permission system
- **Property Management**: Advanced search, filtering, and recommendation algorithms
- **Real-Time Messaging**: Scalable chat system with persistent message history
- **Payment Processing**: Secure transaction handling with proper error recovery
- **Email Automation**: Automated notifications and verification systems
- **Analytics Integration**: User behavior tracking and business intelligence

### Production-Ready Features
- **Error Handling**: Comprehensive error boundaries and graceful fallbacks
- **Loading States**: Skeleton screens and progressive loading indicators
- **Responsive Design**: Mobile-first approach with modern UI/UX patterns
- **Accessibility**: WCAG compliance with keyboard navigation and screen reader support
- **SEO Optimization**: Meta tags, Open Graph, and structured data
- **Security**: Input validation, XSS protection, and secure authentication

## 🧪 Testing & Quality Assurance

### Automated Testing
- **API Testing**: Endpoint validation and integration tests
- **Frontend Testing**: Component testing with React Testing Library
- **E2E Testing**: User journey testing with automated browser tests
- **Performance Testing**: Load testing and performance monitoring
- **Security Testing**: Vulnerability scanning and penetration testing

### Code Quality
- **ESLint**: JavaScript/React linting with strict rules
- **Prettier**: Consistent code formatting across the project
- **TypeScript**: Type safety for critical components and utilities
- **Husky**: Pre-commit hooks for code quality enforcement
- **SonarQube**: Code quality analysis and technical debt tracking

This project demonstrates professional-level full-stack development skills suitable for senior developer positions and showcases the ability to build complex, scalable web applications with modern technologies and best practices.