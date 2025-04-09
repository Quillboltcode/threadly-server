import express from "express";

import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import morgan from "morgan";
import { setupSwagger } from "./swagger.js";
import { initializePassport } from "./middleware/auth.middleware.js";
import { Limiter } from "./middleware/limit.middleware.js";
// import { uploadImage } from "./middleware/upload.middleware";
console.log(process.env.NODE_ENV);
const app = express();


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
    origin: ["http://localhost:3000"], // Allow frontend origin
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

app.use(express.json());

// DB CONNECTION

if (!process.env.MONGODB_URL) {
  throw new Error("MONGO_URL environment variable is not defined");
}

mongoose
  .connect(process.env.MONGODB_URL,{
    serverSelectionTimeoutMS: 50000,
    connectTimeoutMS: 50000,
  })
  .then(() => {
    console.log("MongoDB connected to the backend successfully");
  })
  .catch((err) =>{ console.log(err); console.log(process.env.MONGODB_URL);
});

import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/users.routes.js';

// Add routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);


// Start backend server
const PORT = process.env.PORT || 8500;

// Check if it's not a test environment before starting the server

app.listen(PORT, () => {
  console.log(`Backend server is running at port ${PORT}`);
  console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});

export default app;

setupSwagger(app);