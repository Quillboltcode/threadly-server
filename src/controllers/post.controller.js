
import { Post } from '../models/Post.js';
import { Like } from '../models/Like.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/User.js';
import { Comment } from '../models/Comment.js'
import { sanitizeUser, sanitizePost, sanitizeComment } from '../utils/sanitizerObj.js';
import { extractTags } from '../utils/tagParser.js';

// Get all posts based on time created (maybe need to change to most popular)
export const getAllPosts = asyncHandler(
  async (req, res, next) => {
    // Get query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page

    // Ensure page and limit are valid
    if (page < 1 || limit < 1) {
      return res.status(400).json({ message: "Page and limit must be positive numbers" });
    }

    const skip = (page - 1) * limit;

    // Fetch posts with pagination
    const posts = await Post.find()
      .select("_id content tags author image comments commentCount likeCount createdAt updatedAt")
      .populate("author","avatar username firstName lastName isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec()
      .catch((err) =>{ 
        if (err.name === 'CastError') {
          return res.status(400).json({ message: "Invalid page or limit" });
        } else {
          throw err;
        }
        })
      .then((posts) => {
        if (!posts) {
          return res.status(404).json({ message: "No posts found" });
        }
        return posts;
      })
      .catch((err) =>
        {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      });


    // Get total count for pagination info
    const totalPosts = await Post.countDocuments();
    // console.log(posts)
    // console.log(posts.map((post) => sanitizePost(post)))
    res.status(200).json({
      totalPosts,
      page, 
      totalPages: Math.ceil(totalPosts / limit),
      limit,
      posts: posts.map((post) => sanitizePost(post))
    });
  }
);

// Get single post
 // Populate with selected fields only
export const getPost = asyncHandler(async (req, res) => {

  const post = await Post.findById(req.params.id)
    .select('content tags author image comments commentCount likeCount createdAt updatedAt')
    .populate('author', 'avatar username firstName lastName isVerified');

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }


  const comments = await Comment.find({ post: post._id })
    .populate('author', 'avatar username firstName lastName isVerified');

  res.status(200).json({ ...post.toObject(), 
    comments: sanitizeComment(comments) });
});



// Create Post
export const createPost = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user._id || req.user.user?._id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }
  
  console.log("Request Body:", req.body); // Debugging
  console.log("Request Files:", req.files); // Debugging
  const { content } = req.body;

  if(!content) {
    return res.status(401).json({ message: "content is required" });
  }
  // Getting tag[] from post
  const tags = extractTags(content);


  const post = new Post({
    content,
    author: userId,
    tags,
    image: req.files ? req.files.map(file => file.path) : [] // Store multiple image paths
  });

  try {
    // Save the post to the database
    const savePost = await post.save();

    // Exclude `_id` and `__v` from response
    const { __v, ...postWithoutVersion } = savePost.toObject();

    res.status(201).json(postWithoutVersion);
  } catch (error) {
    console.error("Error saving post:", error); // Log the error
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
});


// Update post
export const updatePost = asyncHandler(
  async (req, res) => {
    const userId = req.user.userId || req.user._id || req.user.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }


    
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this post' });
    }
    
    post.content = content;
    post.updatedAt = Date.now();
    post.image = req.file ? req.file.path : post.image;
    await post.save();
    res.status(200).json(post);
  }
);

// Delete post
export const deletePost = asyncHandler(
  async (req, res) => {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const userId = req.user.userId || req.user._id || req.user.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }
    
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  }
);

// Like/Unlike post
export const toggleLike = asyncHandler(
  async (req, res) => {
    try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const userId = req.user.userId || req.user._id || req.user.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const existingLike = await Like.findOne({ 
      post: post._id, 
      user: userId
    });

    if (existingLike) {
      await existingLike.deleteOne();
      post.likeCount--;
      res.status(200).json({ message: 'Like- successfully' });
    } else {
      await Like.create({ 
        post: post._id, 
        user: userId
      });
      post.likeCount++;
    }

    await post.save();
    res.status(200).json({ message: 'Like+ successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

// Add comment to post
// param: postId, content, author.
export const addComment = asyncHandler(
  async (req, res) => {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    console.log("User object in request:", req.user); 
    
        // Ensure correct extraction of user ID
    const userId = req.user.userId || req.user._id || req.user.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    // Create a new comment using Mongoose model
    const newComment = await Comment.create({
      content,
      image: req.file ? req.file.path : null,
      author: userId, // Ensure ObjectId type
      post: post._id,  // Ensure 'post' field is set correctly
      createdAt: new Date(),
    });
    
    post.comments.push(newComment);
    
    await post.save();
    res.status(201).json(newComment);
  }
);

// Get all posts from current user and followed of current user
export const getFeedPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page)  || 1 ;
  const limit = parseInt(req.query.limit ) || 10;
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


// Get most popular tags
export const getMostFrequentTag = async (req, res) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const result = await Post.aggregate([
      { $unwind: "$tags" }, // Flatten the tags array
      { 
        $group: { 
          _id: "$tags", 
          count: { $sum: 1 } // Count occurrences
        }
      },
      { $sort: { count: -1 } }, // Sort by highest count
      { $limit: 5 } // Get the top 5 tags
    ]).exec(); // Ensure execution

    // console.log("Top Tags:", result);
 

    if (result.length === 0) {
      return res.status(200).json({ message: "No tags found for today." });
    }
/* 
    res.status(200).json({ mostFrequentTag: result[0]._id, count: result[0].count }) */;
    res.status(200).json(result.map((tag) => ({ tag: tag._id, count: tag.count })));
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
