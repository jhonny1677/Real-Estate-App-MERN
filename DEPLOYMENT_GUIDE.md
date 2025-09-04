# 🚀 Real Estate App - Complete Deployment Guide

## 📋 Overview

This guide covers the complete deployment of the Real Estate MERN application across three components:

1. **Backend API** (Node.js + Express + Prisma + MongoDB)
2. **Frontend Client** (React + Vite)  
3. **Socket Server** (Socket.io for real-time chat)

## 🏗️ Architecture

```
Frontend (Vercel) ↔ Backend API (Vercel) ↔ Database (MongoDB Atlas)
                    ↕
            Socket Server (Railway)
```

## 🚀 1. Backend API Deployment (Vercel)

### Prerequisites
- Vercel CLI: `npm i -g vercel`
- MongoDB Atlas account
- Email service account (Gmail/SendGrid)

### Step 1: Environment Setup

Create `.env` in `/api` directory:
```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/realestate"

# JWT
JWT_SECRET_KEY="your-super-secret-jwt-key-here"

# Email Configuration  
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Real Estate App <your-email@gmail.com>"

# CORS
CLIENT_URL=https://your-frontend-domain.vercel.app
SOCKET_URL=https://your-socket-server.railway.app

# Environment
NODE_ENV=production
```

### Step 2: Prepare for Deployment

```bash
cd api
npm install
npx prisma generate
npx prisma db push
```

### Step 3: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET_KEY
# ... add all env variables
```

### Expected Result
- API URL: `https://your-api-name.vercel.app`
- Test endpoint: `https://your-api-name.vercel.app/api/auth/login`

## 🎨 2. Frontend Deployment (Vercel)

### Step 1: Update API Endpoints

Update `client/src/lib/apiRequest.js`:
```javascript
const apiRequest = axios.create({
  baseURL: "https://your-api-name.vercel.app/api",
  withCredentials: true,
});
```

### Step 2: Update Socket Connection

Update `client/src/context/SocketContext.jsx`:
```javascript
const socket = io("https://your-socket-server.railway.app");
```

### Step 3: Build and Deploy

```bash
cd client
npm install
npm run build

# Deploy to Vercel
vercel --prod
```

### Expected Result
- Frontend URL: `https://your-frontend-name.vercel.app`

## ⚡ 3. Socket Server Deployment (Railway)

### Why Railway?
- Free tier available
- Perfect for Socket.io servers
- Easy deployment process
- Persistent WebSocket connections

### Step 1: Prepare Socket Server

Update `socket/app.js` for production:
```javascript
import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://your-frontend-name.vercel.app",
      "http://localhost:5174"
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  socket.on("newUser", (userId) => {
    socket.userId = userId;
    console.log(`User ${userId} connected`);
  });

  socket.on("sendMessage", (data) => {
    const receiverSocket = [...io.sockets.sockets.values()]
      .find(s => s.userId === data.receiverId);
    
    if (receiverSocket) {
      receiverSocket.emit("getMessage", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Real Estate Socket Server is running!");
});

server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Connect your GitHub repository
5. Select the `socket` folder
6. Deploy automatically

### Step 3: Environment Variables

Set in Railway dashboard:
```
NODE_ENV=production
PORT=4000
```

### Expected Result
- Socket URL: `https://your-project.railway.app`

## 🗄️ 4. Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string

### Step 2: Initialize Database

```bash
cd api
npx prisma db push
node seed.js  # If you have seed data
```

## 🔧 5. Testing Deployment

### Health Check Endpoints

1. **Backend API**: `GET https://your-api-name.vercel.app/`
2. **Socket Server**: `GET https://your-project.railway.app/`
3. **Frontend**: `https://your-frontend-name.vercel.app`

### Feature Testing

1. **User Registration**: Create new account
2. **Authentication**: Login/logout functionality
3. **Property Listings**: View and search properties
4. **Real-time Chat**: Test messaging between users
5. **Image Uploads**: Test property image uploads
6. **Email Notifications**: Verify email sending

## 📱 6. Domain Configuration (Optional)

### Custom Domains

1. **Frontend**: Vercel → Settings → Domains
2. **Backend**: Vercel → Settings → Domains  
3. **Socket**: Railway → Settings → Networking

### Update CORS Settings

Update all CORS origins with your custom domains.

## 🔒 7. Security Considerations

### Production Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] Secure email credentials (app passwords)
- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database connection secured
- [ ] Input validation enabled
- [ ] Rate limiting implemented (optional)

## 🐛 8. Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check all Origin URLs
   - Verify environment variables
   - Test with exact domain names

2. **Database Connection**
   - Verify MongoDB Atlas IP whitelist
   - Check connection string format
   - Ensure database user permissions

3. **Socket Connection**
   - Check Railway deployment logs
   - Verify frontend Socket.io client URL
   - Test WebSocket connectivity

4. **Build Errors**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Review build logs on Vercel

### Debug Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Test API endpoints
curl https://your-api-name.vercel.app/
curl https://your-project.railway.app/
```

## 📊 9. Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics**: Built-in performance monitoring
2. **Railway Metrics**: Server performance and uptime
3. **MongoDB Atlas Monitoring**: Database performance
4. **Google Analytics**: User behavior tracking

## 🚀 10. Performance Optimization

### Frontend Optimizations

- Enable Vercel Edge Functions
- Implement React.lazy for code splitting
- Optimize images with Vercel Image Optimization
- Enable Vercel Analytics

### Backend Optimizations

- Implement API response caching
- Database query optimization
- Compress API responses
- Use CDN for static assets

## 📈 11. Scaling Considerations

### Free Tier Limits

- **Vercel**: 100GB bandwidth/month
- **Railway**: 500 hours/month
- **MongoDB Atlas**: 512MB storage

### Upgrade Path

1. **Vercel Pro**: $20/month
2. **Railway Hobby**: $5/month
3. **MongoDB Atlas M10**: $9/month

This deployment setup provides a production-ready Real Estate application with all modern features including real-time chat, secure authentication, and scalable architecture.