// routes/notification.routes.js
import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import Notification from '../models/Notification.model.js';

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', authenticate('jwt'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 }) // Newest first
      .populate('sender', 'username profilePicture')
      .populate('post', 'title content')
      .limit(50); // Limit to last 50 notifications
      
    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark a notification as read
router.put('/:notificationId/read', authenticate('jwt'), async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure the notification belongs to the authenticated user
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    notification.read = true;
    await notification.save();
    
    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate('jwt'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a notification
router.delete('/:notificationId', authenticate('jwt'), async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure the notification belongs to the authenticated user
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await Notification.findByIdAndDelete(notificationId);
    
    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;