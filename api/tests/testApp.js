import express from 'express';
import cookieParser from 'cookie-parser';
import authRoute from '../routes/auth.route.js';
import postRoute from '../routes/post.route.js';
import userRoute from '../routes/user.route.js';
import bookingRoute from '../routes/booking.route.js';
import chatRoute from '../routes/chat.route.js';
import adminRoute from '../routes/admin.route.js';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoute);
  app.use('/api/posts', postRoute);
  app.use('/api/users', userRoute);
  app.use('/api/bookings', bookingRoute);
  app.use('/api/chats', chatRoute);
  app.use('/api/admin', adminRoute);
  return app;
}
