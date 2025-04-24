import { Post } from '../models/Post.model.js';
import { Like } from '../models/Like.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import { NotificationService } from '../services/notification.service.js';

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

      // Get user information
      const user = await User.findById(userId).select('username');

      // Only notify if this is a new like (not an unlike)
      if (!existingLike) {
        // Create a new like
        await Like.create({
          post: post._id,
          user: userId
        });
        post.likeCount++;
        await post.save();

        // Send notification to post author (if author is not the same as liker)
        if (post.author.toString() !== userId.toString()) {
          const notificationMessage = `${user.username || 'Someone'} liked your post`;
          const notification = {
            id : 'like',
            title: 'New Like',
            message: notificationMessage,
            type: 'like',
            postId: post._id,
            senderId: userId,
            createdAt: new Date(),
            read: false
          }

          // Send real-time notification
          NotificationService.sendToUser(
            post.author.toString(),
            {
              type: 'like',
              message: notificationMessage,
              postId: post._id,
              senderId: userId,
              createdAt: new Date(),
              
            }
          );
          console.log("Send real-time notification");// Debugging only

          // Save notification to database
          await new Notification({
            recipient: post.author,
            sender: userId,
            type: 'like',
            post: post._id,
            message: notificationMessage
          }).save();
        }

        res.status(200).json({ message: 'Like+ successfully', likeCount: post.likeCount });
      } else {
        // Remove the like
        await existingLike.deleteOne();
        post.likeCount--;
        await post.save();
        res.status(200).json({ message: 'Like- successfully', likeCount: post.likeCount });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

