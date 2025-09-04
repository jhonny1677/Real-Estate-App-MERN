# 🏗️ Real Estate App - Project Structure

## 📁 Directory Structure

```
real-estate-app/
├── 📄 README.md                    # Main project documentation
├── 📄 DEPLOYMENT_GUIDE.md          # Complete deployment instructions
├── 📄 PROJECT_STRUCTURE.md         # This file - project structure guide
├── 📄 package.json                 # Root package with scripts for all services
├── 📄 .env.example                 # Environment variables template
├── 📄 .gitignore                   # Git ignore rules
│
├── 🚀 api/                         # Backend API Server (Node.js + Express)
│   ├── 📄 package.json             # Backend dependencies
│   ├── 📄 vercel.json              # Vercel deployment config
│   ├── 📄 app.js                   # Main Express application
│   ├── 📄 .env                     # Environment variables (create from .env.example)
│   │
│   ├── 📁 controllers/             # Request handlers
│   │   ├── auth.controller.js      # Authentication logic
│   │   ├── user.controller.js      # User management
│   │   ├── post.controller.js      # Property listings
│   │   ├── chat.controller.js      # Chat functionality
│   │   └── message.controller.js   # Message handling
│   │
│   ├── 📁 routes/                  # API endpoints
│   │   ├── auth.route.js           # /api/auth/* endpoints
│   │   ├── user.route.js           # /api/users/* endpoints
│   │   ├── post.route.js           # /api/posts/* endpoints
│   │   ├── chat.route.js           # /api/chats/* endpoints
│   │   └── message.route.js        # /api/messages/* endpoints
│   │
│   ├── 📁 middleware/              # Express middleware
│   │   └── verifyToken.js          # JWT authentication middleware
│   │
│   ├── 📁 lib/                     # Utility libraries
│   │   ├── prisma.js              # Database client
│   │   └── emailService.js        # Email functionality
│   │
│   ├── 📁 prisma/                  # Database schema and migrations
│   │   └── schema.prisma          # Prisma database schema
│   │
│   └── 📁 scripts/                 # Utility scripts
│       ├── seed.js                # Database seeding
│       ├── create-admin.js        # Create admin user
│       └── add-sample-data.js     # Add sample properties
│
├── 🎨 client/                      # Frontend Application (React + Vite)
│   ├── 📄 package.json             # Frontend dependencies
│   ├── 📄 vercel.json              # Vercel deployment config
│   ├── 📄 vite.config.js           # Vite build configuration
│   ├── 📄 index.html               # Main HTML template
│   │
│   ├── 📁 src/                     # React source code
│   │   ├── 📄 App.jsx              # Main App component
│   │   ├── 📄 main.jsx             # React entry point
│   │   ├── 📄 index.scss           # Global styles
│   │   │
│   │   ├── 📁 components/          # Reusable React components
│   │   │   ├── navbar/             # Navigation bar
│   │   │   ├── card/               # Property cards
│   │   │   ├── map/                # Interactive maps
│   │   │   ├── chat/               # Chat interface
│   │   │   ├── filter/             # Search filters
│   │   │   ├── slider/             # Image slider
│   │   │   └── uploadWidget/       # File upload
│   │   │
│   │   ├── 📁 routes/              # Page components
│   │   │   ├── homePage/           # Landing page
│   │   │   ├── listPage/           # Property listings
│   │   │   ├── singlePage/         # Property details
│   │   │   ├── profilePage/        # User profile
│   │   │   ├── login/              # Login page
│   │   │   ├── register/           # Registration page
│   │   │   └── adminDashboard/     # Admin panel
│   │   │
│   │   ├── 📁 context/             # React Context providers
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   ├── SocketContext.jsx   # Socket.io connection
│   │   │   ├── ChatContext.jsx     # Chat state management
│   │   │   └── ThemeContext.jsx    # Theme switching
│   │   │
│   │   ├── 📁 lib/                 # Utility functions
│   │   │   ├── apiRequest.js       # Axios HTTP client
│   │   │   ├── dummydata.js        # Sample data
│   │   │   └── loaders.js          # React Router loaders
│   │   │
│   │   └── 📁 i18n/                # Internationalization
│   │       ├── index.js            # i18n configuration
│   │       └── locales/            # Translation files
│   │           ├── en/             # English
│   │           ├── es/             # Spanish
│   │           ├── fr/             # French
│   │           └── de/             # German
│   │
│   └── 📁 public/                  # Static assets
│       ├── images/                 # Property images
│       ├── icons/                  # UI icons
│       └── favicon.png             # Site favicon
│
└── ⚡ socket/                      # WebSocket Server (Socket.io)
    ├── 📄 package.json             # Socket server dependencies
    ├── 📄 vercel.json              # Vercel deployment config (alternative)
    └── 📄 app.js                   # Socket.io server implementation
```

## 🚀 Getting Started

### 1. Prerequisites
```bash
Node.js 18+
MongoDB Atlas account
Gmail account for email services
```

### 2. Installation
```bash
# Install all dependencies
npm run install-all

# Or install manually
npm install          # Root dependencies
cd api && npm install         # Backend dependencies  
cd ../client && npm install   # Frontend dependencies
cd ../socket && npm install   # Socket server dependencies
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual credentials
# - MongoDB connection string
# - JWT secret key
# - Email credentials
```

### 4. Database Setup
```bash
cd api
npx prisma generate
npx prisma db push
node seed.js  # Optional: Add sample data
```

### 5. Development
```bash
# Start all services concurrently
npm run dev

# Or start individually
npm run dev:api      # Backend API on :8800
npm run dev:client   # Frontend on :5174  
npm run dev:socket   # Socket server on :4000
```

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
POST /api/auth/refresh      # Refresh JWT token
```

### Users
```
GET    /api/users           # Get all users (admin)
GET    /api/users/:id       # Get user profile
PUT    /api/users/:id       # Update user profile
DELETE /api/users/:id       # Delete user account
```

### Properties
```
GET    /api/posts           # Get property listings
GET    /api/posts/:id       # Get property details
POST   /api/posts           # Create new property
PUT    /api/posts/:id       # Update property
DELETE /api/posts/:id       # Delete property
```

### Chat & Messages
```
GET    /api/chats           # Get user's chats
POST   /api/chats           # Create new chat
GET    /api/messages/:chatId # Get chat messages
POST   /api/messages        # Send message
```

## 💾 Database Schema

### User Model
```prisma
model User {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  email    String @unique
  username String @unique
  password String
  avatar   String?
  posts    Post[]
  chats    Chat[]
  messages Message[]
  createdAt DateTime @default(now())
}
```

### Post (Property) Model
```prisma
model Post {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
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
  user        User @relation(fields: [userId], references: [id])
  userId      String @db.ObjectId
  createdAt   DateTime @default(now())
}
```

## 🔧 Development Scripts

### Root Level
```bash
npm run dev           # Start all services in development
npm run start         # Start all services in production
npm run build         # Build client for production
npm run install-all   # Install all dependencies
```

### API Level
```bash
cd api
npm start             # Start API server
npm run dev           # Start with nodemon
npx prisma studio     # Open database browser
npx prisma db push    # Push schema changes
```

### Client Level  
```bash
cd client
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
```

### Socket Level
```bash
cd socket
npm start             # Start socket server
```

## 🚀 Deployment Commands

### Vercel Deployment
```bash
# Deploy frontend
cd client && vercel --prod

# Deploy API
cd api && vercel --prod

# Deploy socket (alternative to Railway)
cd socket && vercel --prod
```

### Railway Deployment (Recommended for Socket)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy socket server
cd socket && railway deploy
```

This structure provides a scalable, maintainable codebase with clear separation of concerns and modern development practices.