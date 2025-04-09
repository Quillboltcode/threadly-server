import { User } from '../models/User.js';
import mongoose from "mongoose";
import dotenv from "dotenv";
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

try {
    await connectDB();
    const userId = '67e4ac8b47024bd2b1c81a58'

    // Fetch current user's following list
    const currentUser = await User.findById(userId).select('following');
    const followingIds = currentUser.following.map(id => id.toString());

    // Fetch suggested users
    const suggestedUsers = await User.find({
    _id: { $nin: followingIds },
    isActive: true,
    role: 'user'
    })
    .select('username avatar bio followers')
    .sort({ followers: -1 })
    .limit(10);

    console.log(suggestedUsers);
} catch (error) {
    console.log(error);
}
