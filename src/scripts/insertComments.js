import mongoose from "mongoose";
import dotenv from "dotenv";
import { Comment } from "../models/Comment.js";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";

dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err);
    process.exit(1);
  }
};

// Function to fetch random users and posts
const fetchRandomData = async () => {
  try {
    const users = await User.aggregate([{ $sample: { size: 10 } }]);
    const posts = await Post.aggregate([{ $sample: { size: 10 } }]);

    const userIds = users.map(user => user._id);
    const postIds = posts.map(post => post._id);

    return { userIds, postIds };
  } catch (error) {
    console.error("Error fetching test data:", error);
    return { userIds: [], postIds: [] };
  }
};

// Function to generate dummy comments
const generateComments = async () => {
  const { userIds, postIds } = await fetchRandomData();

  if (userIds.length === 0 || postIds.length === 0) {
    console.log("No users or posts found! Add some users and posts first.");
    return [];
  }

  const comments = [
    "Great post!",
    "I totally agree with you.",
    "This is amazing!",
    "Couldn’t have said it better myself.",
    "Nice picture!",
    "Love this content!",
    "Very inspiring!",
    "Where did you take this photo?",
    "Keep up the great work!",
    "Awesome perspective!"
  ];

  return comments.map(content => {
    const randomAuthor = userIds[Math.floor(Math.random() * userIds.length)];
    const randomPost = postIds[Math.floor(Math.random() * postIds.length)];
    return {
      content,
      author: randomAuthor,
      post: randomPost,
      image: ""
    };
  });
};

// Function to insert comments
const insertComments = async () => {
  await connectDB();
  try {
    const comments = await generateComments();
    if (comments.length === 0) {
      console.log("No valid comments to insert.");
      return;
    }

    await Comment.insertMany(comments);
    console.log("Comments inserted successfully!");
  } catch (error) {
    console.error("Error inserting comments:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
insertComments();
