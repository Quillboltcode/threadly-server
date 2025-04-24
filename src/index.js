import express from "express";

import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import morgan from "morgan";
import { setupSwagger } from "./swagger.js";
import { initializePassport } from "./middleware/auth.middleware.js";
import { Limiter } from "./middleware/limit.middleware.js";
// import { uploadImage } from "./middleware/upload.middleware";
console.log(process.env.NODE_ENV);
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }
});
console.log(io);

initializePassport(app);
// Setup Limiter 
app.use(Limiter);

// Log HTTP requests
app.use(morgan(process.env.NODE_ENV === "production" ? "common" : "combined"));

// Static file for image upload
app.use('/uploads', express.static('uploads'));

// USE HELMET AND CORS MIDDLEWARES
// app.use(
//   cors({
//     origin: ["*"], // Comma separated list of your urls to access your api. * means allow everything
//     credentials: true, // Allow cookies to be sent with requests
//   })
// );

app.use(
  cors({
    origin: ["http://localhost:3000",process.env.FRONTEND_URL], // Allow frontend origin
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);
// Middleware to parse JSON requests
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For URL-encoded requests

// app.use(express.urlencoded({ extended: true }));

// DB CONNECTION

if (!process.env.MONGODB_URL) {
  throw new Error("MONGO_URL environment variable is not defined");
}

mongoose
  .connect(process.env.MONGODB_URL,{
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB connected to the backend successfully");
  })
  .catch((err) =>{ console.log(err); console.log(process.env.MONGODB_URL);
});

import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/users.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import searchRoutes from './routes/search.routes.js'
// Add routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/api/search',searchRoutes)
// Socket.io logic 
// Store online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  
  // User authentication and storing user information
  socket.on("user_connected", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online with socket ID: ${socket.id}`);
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Export the Socket.IO instance to use in other files
export const socketIO = io;

// Start backend server
const PORT = process.env.PORT || 8500;

// Check if it's not a test environment before starting the server

// app.listen(PORT, () => {
//   console.log(`Backend server is running at port ${PORT}`);
//   console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
// });

// Change to this for socket io server enable
httpServer.listen(PORT, () => {
  console.log(`Backend server is running at port ${PORT}`);
  console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});



export default app;

setupSwagger(app);