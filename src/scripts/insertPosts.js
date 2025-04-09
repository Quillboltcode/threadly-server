import mongoose from "mongoose";
import dotenv from "dotenv";
import { Post } from "../models/Post.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Failed:', err);
    process.exit(1);
  }
};

// Known user IDs for testing (replace with real IDs from your database)
const knownUserIds = [
  "67e4ac8b47024bd2b1c81a58",
  "67e4ac8b47024bd2b1c81a59",
  "67e4ac8b47024bd2b1c81a5a",
  "67e4ac8b47024bd2b1c81a5b",
  "67e4ac8b47024bd2b1c81a5c"
];

// Function to get a random element from an array
const getRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];

// Function to generate dummy posts
const generatePosts = () => {
  const posts = [
    { content: "Exploring the beauty of nature 🌿", tags: ["nature", "travel"], image: ["uploads/nature1.jpg"] },
    { content: "Just finished a 10K run! 🏃‍♂️", tags: ["fitness", "running"], image: [] },
    { content: "Coding late at night, who else? 👨‍💻", tags: ["coding", "programming"], image: ["uploads/code.jpg"] },
    { content: "Delicious homemade pizza! 🍕", tags: ["food", "homemade"], image: ["uploads/pizza.jpg"] },
    { content: "Sunset views from the beach 🌅", tags: ["sunset", "beach"], image: ["uploads/beach.jpg"] }
  ];

  return posts.map(post => ({
    ...post,
    author: getRandomElement(knownUserIds),
    comments: [], // No comments yet
    commentCount: 0,
    likeCount: Math.floor(Math.random() * 100) // Random likes between 0-99
  }));
};

// Function to insert posts
const insertPosts = async () => {
  try {
    await connectDB();
    const posts =  generatePosts();
    await Post.insertMany(posts);
    console.log("Posts inserted successfully!");
    process.exit();
  } catch (error) {
    console.error("Error inserting posts:", error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

insertPosts();
