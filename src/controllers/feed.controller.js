import { Post } from '../models/Post.model.js';
import { Like } from '../models/Like.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/User.model.js';
import { Comment } from '../models/Comment.model.js'
import { sanitizeUser, sanitizePost, sanitizeComment } from '../utils/sanitizerObj.js';

export const getFeedPosts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user.userId || req.user._id || req.user.user?._id;
  
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }
    const currentUser = await User.findById(userId);
  
    // Get posts from current user and followed users
    const posts = await Post.find({
      $or: [
        { author: userId }, // Current user's posts
        { author: { $in: currentUser.following } } // Posts from followed users
      ]
    })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar');
  
    const total = await Post.countDocuments({
      $or: [
        { author: userId },
        { author: { $in: currentUser.following } }
      ]
    });
  
    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  });