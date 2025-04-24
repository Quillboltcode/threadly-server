// services/notification.service.js
import { socketIO } from '../index.js';
import { onlineUsers } from '../index.js';
export class NotificationService {
  /**
   * Send a notification to a specific user
   * @param {string} userId - The ID of the recipient user
   * @param {object} notification - The notification object
   */
  static sendToUser(userId, notification) {
    // Get the socket ID for the user if they're online
    const socketId = this.getUserSocketId(userId);

    if (socketId) {
      socketIO.to(socketId).emit('notification', notification);
      return true;
    }
    return false;
  }

  /**
   * Send notifications to multiple users
   * @param {string[]} userIds - Array of user IDs to notify
   * @param {object} notification - The notification object
   */
  // services/notification.service.js
  static sendToUsers(userIds, notification) {
    userIds.forEach(userId => {
      const socketId = this.getUserSocketId(userId);
      if (socketId) {
        socketIO.to(socketId).emit('notification', notification);
      } else {
        console.warn(`User ${userId} is offline. Notification not sent.`);
      }
    });
  }

  /**
   * Broadcast a notification to all connected clients
   * @param {object} notification - The notification object
   */
  static broadcast(notification) {
    socketIO.emit('notification', notification);
  }

  /**
   * Get the socket ID for a user
   * @param {string} userId - The user ID
   * @returns {string|null} The socket ID or null if not online
   */
  static getUserSocketId(userId) {
    // This uses the onlineUsers map from index.js
    return onlineUsers.get(userId);
  }

  /**
   * Create a post comment notification
   * @param {string} postId - ID of the post
   * @param {string} postOwnerId - ID of the post owner
   * @param {string} commenterId - ID of the commenter
   * @param {string} commenterName - Name of the commenter
   */
  static async createCommentNotification(postId, postOwnerId, commenterId, commenterName) {
    // Don't notify the user of their own comments
    if (postOwnerId === commenterId) return;

    const notification = {
      type: 'comment',
      message: `${commenterName} commented on your post`,
      postId,
      commenterId,
      createdAt: new Date(),
      read: false
    };

    this.sendToUser(postOwnerId, notification);
  }

  /**
   * Create a post edit notification
   * @param {string} postId - ID of the post
   * @param {string[]} subscriberIds - IDs of users following/interested in the post
   * @param {string} editorName - Name of the person who edited
   */
  static async createPostEditNotification(postId, subscriberIds, editorName) {
    const notification = {
      type: 'post_edit',
      message: `${editorName} updated their post`,
      postId,
      createdAt: new Date(),
      read: false
    };

    this.sendToUsers(subscriberIds, notification);
  }

  /**
   * Create a post deletion notification
   * @param {string} postId - ID of the deleted post
   * @param {string[]} subscriberIds - IDs of users following the post
   * @param {string} deleterName - Name of the person who deleted
   */
  static async createPostDeleteNotification(postId, subscriberIds, deleterName) {
    const notification = {
      type: 'post_delete',
      message: `${deleterName} deleted a post you were following`,
      createdAt: new Date(),
      read: false
    };

    this.sendToUsers(subscriberIds, notification);
  }
}