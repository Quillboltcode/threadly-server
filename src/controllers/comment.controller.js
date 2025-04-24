import { Post } from '../models/Post.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/User.model.js';
import { Comment } from '../models/Comment.model.js';
import Notification from '../models/Notification.model.js';
import { NotificationService } from '../services/notification.service.js';
// Add comment to post
// param: postId, content, author.
// Add comment to post
export const addComment = asyncHandler(
    async (req, res) => {
      const { content } = req.body;
      const postId = req.params.id;
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      console.log("User object in request:", req.user);
  
      // Ensure correct extraction of user ID
      const userId = req.user.userId || req.user._id || req.user.user?._id;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID missing" });
      }
  
      // Get commenter information
      const user = await User.findById(userId).select('username avatar');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Create a new comment using Mongoose model
      const newComment = await Comment.create({
        content,
        image: req.file ? req.file.path : null,
        author: userId, // Ensure ObjectId type
        post: post._id,  // Ensure 'post' field is set correctly
        createdAt: new Date(),
      });
  
      // Update post's comments array and commentCount
      post.comments.push(newComment._id);
      post.commentCount = (post.commentCount || 0) + 1;
      await post.save();
  
      // Only send notification if commenter is not post author
      if (post.author.toString() !== userId.toString()) {
        // Create notification message
        const notificationMessage = `${user.username || 'Someone'} commented on your post`;
        
        // Send real-time notification
        NotificationService.sendToUser(
          post.author.toString(),
          {
            type: 'comment',
            message: notificationMessage,
            postId: post._id,
            commentId: newComment._id,
            senderId: userId,
            createdAt: new Date(),
            read: false
          }
        );
        
        // Save notification to database
        await new Notification({
          recipient: post.author,
          sender: userId,
          type: 'comment',
          post: post._id,
          message: notificationMessage
        }).save();
      }
  
      // Also notify other commenters about new activity on the post they commented on
      // First, find all unique commenters except the current user and post author
      const otherCommenters = await Comment.find({ 
        post: post._id,
        author: { $nin: [userId, post.author] }
      }).distinct('author');
      
      if (otherCommenters.length > 0) {
        // Create notification message
        const notificationMessage = `${user.username || 'Someone'} also commented on a post you commented on`;
        
        // Send real-time notifications
        NotificationService.sendToUsers(
          otherCommenters.map(id => id.toString()),
          {
            type: 'comment_activity',
            message: notificationMessage,
            postId: post._id,
            commentId: newComment._id,
            senderId: userId,
            createdAt: new Date(),
            read: false
          }
        );
        
        // Save notifications to database
        const notificationPromises = otherCommenters.map(recipientId => {
          return new Notification({
            recipient: recipientId,
            sender: userId,
            type: 'comment_activity',
            post: post._id,
            message: notificationMessage
          }).save();
        });
        
        await Promise.all(notificationPromises);
      }
  
      // Populate author information for the response
      const populatedComment = await Comment.findById(newComment._id)
        .populate('author', 'username avatar');
  
      res.status(201).json(populatedComment);
    }
  );