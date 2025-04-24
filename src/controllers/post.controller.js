
import { Post } from '../models/Post.model.js';
import { Like } from '../models/Like.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/User.model.js';
import { Comment } from '../models/Comment.model.js';
import { sanitizePost, sanitizeComment } from '../utils/sanitizerObj.js';
import { extractTags } from '../utils/tagParser.js';
import Notification from '../models/Notification.model.js';
import { NotificationService } from '../services/notification.service.js';

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
      .populate("author", "avatar username firstName lastName isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec()
      .catch((err) => {
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
      .catch((err) => {
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

  res.status(200).json({
    ...post.toObject(),
    comments: sanitizeComment(comments)
  });
});



// Create Post
export const createPost = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user._id || req.user.user?._id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  console.log("Request Body:", req.body); // Debugging

  const { content } = req.body;

  if (!content) {
    return res.status(401).json({ message: "content is required" });
  }
  // Getting tag[] from post
  const tags = extractTags(content);
  // Access images from req.files
  const images = req.files?.images ? req.files.images.map(file => file.path) : [];
  console.log("Request Files:", images); // Debugging
  const post = new Post({
    content,
    author: userId,
    tags,
    image: images// Store multiple image paths
  });

  try {
    // Save the post to the database
    const savePost = await post.save();
    // Get user information for notifications
    const user = await User.findById(userId).select('username followers');

    // Send notifications to followers about new post
    if (user && user.followers && user.followers.length > 0) {
      // Create notification message
      const notificationMessage = `${user.username || 'Someone'} created a new post`;

      // Send real-time notifications to online followers
      NotificationService.sendToUsers(
        user.followers.map(follower => follower.toString()),
        {
          type: 'new_post',
          message: notificationMessage,
          postId: savePost._id,
          senderId: userId,
          createdAt: new Date(),
          read: false
        }
      );

      // Save notifications to database for all followers
      const notificationPromises = user.followers.map(followerId => {
        return new Notification({
          recipient: followerId,
          sender: userId,
          type: 'new_post',
          post: savePost._id,
          message: notificationMessage
        }).save();
      });

      await Promise.all(notificationPromises);
    }
    // Exclude `_id` and `__v` from response
    const { __v, ...postWithoutVersion } = savePost.toObject();

    res.status(201).json(postWithoutVersion);
  } catch (error) {
    console.error("Error saving post:", error); // Log the error
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
});


// Update post controller
export const updatePost = asyncHandler(async (req, res) => {
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

  // Prepare updated data
  const updatedData = {
    content,
    updatedAt: Date.now(),
  };

  // Handle multiple file uploads
  if (req.files && req.files.length > 0) {
    // Map uploaded files to their paths
    const newImages = req.files.map((file) => file.path);

    // Combine existing images with new ones (if any)
    updatedData.image = post.image ? [...post.image, ...newImages] : newImages;
  }
  console.log("Updated Data:", updatedData); // Debugging
  // Update the post in the database
  const updatedPost = await Post.findOneAndUpdate(
    { _id: req.params.id },
    { $set: updatedData },
    { new: true }
  );

  if (!updatedPost) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Get user information for notification
  const user = await User.findById(userId).select('username');

  // Find users who should be notified (commenters and likers)
  // Find commenters
  const commenters = await Comment.find({ post: post._id })
    .distinct('author')
    .where('author').ne(userId); // Exclude post owner

  // Find users who liked the post
  const likers = await Like.find({ post: post._id })
    .distinct('user')
    .where('user').ne(userId); // Exclude post owner

  // Combine and deduplicate users to notify
  const usersToNotify = Array.from(new Set([...commenters, ...likers]));

  if (usersToNotify.length > 0) {
    // Create notification message
    const notificationMessage = `${user.username || 'Someone'} updated a post you interacted with`;

    // Send real-time notifications
    NotificationService.sendToUsers(
      usersToNotify.map(id => id.toString()),
      {
        type: 'post_edit',
        message: notificationMessage,
        postId: post._id,
        senderId: userId,
        createdAt: new Date(),
        read: false
      }
    );

    // Save notifications to database
    const notificationPromises = usersToNotify.map(recipientId => {
      return new Notification({
        recipient: recipientId,
        sender: userId,
        type: 'post_edit',
        post: post._id,
        message: notificationMessage
      }).save();
    });

    await Promise.all(notificationPromises);
  }

  res.status(200).json(updatedPost);
});

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
    // Get user information for notification
    const user = await User.findById(userId).select('username');

    // Find users who should be notified (commenters and likers)
    // Find commenters
    const commenters = await Comment.find({ post: post._id })
      .distinct('author')
      .where('author').ne(userId); // Exclude post owner

    // Find users who liked the post
    const likers = await Like.find({ post: post._id })
      .distinct('user')
      .where('user').ne(userId); // Exclude post owner

    // Combine and deduplicate users to notify
    const usersToNotify = Array.from(new Set([...commenters, ...likers]));

    if (usersToNotify.length > 0) {
      // Create notification message
      const notificationMessage = `${user.username || 'Someone'} deleted a post you interacted with`;

      // Send real-time notifications before deleting
      NotificationService.sendToUsers(
        usersToNotify.map(id => id.toString()),
        {
          type: 'post_delete',
          message: notificationMessage,
          senderId: userId,
          createdAt: new Date(),
          read: false
        }
      );

      // Save notifications to database
      const notificationPromises = usersToNotify.map(recipientId => {
        return new Notification({
          recipient: recipientId,
          sender: userId,
          type: 'post_delete',
          message: notificationMessage
        }).save();
      });

      await Promise.all(notificationPromises);
    }

    // Clean up comments associated with the post
    await Comment.deleteMany({ post: post._id });

    // Clean up likes associated with the post
    await Like.deleteMany({ post: post._id });

    // Delete the post
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  }
);




