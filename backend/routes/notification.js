const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get Socket.IO instance from app
let io;
const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

// Helper function to create notification
const createNotification = async (userId, type, title, message, tripId = null, tripDestination = null, metadata = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      tripId,
      tripDestination,
      metadata
    });
    await notification.save();

    // Emit real-time notification to specific user
    if (io) {
      io.emit('newNotification', {
        userId,
        notification: {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          tripDestination: notification.tripDestination,
          read: notification.read,
          createdAt: notification.createdAt,
          metadata: notification.metadata
        }
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Get notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const notifications = await Notification.find({ userId })
      .populate('tripId', 'destination title departure date budget')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({
      success: true,
      notifications: notifications.map(notification => ({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        tripDestination: notification.tripDestination,
        read: notification.read,
        date: notification.createdAt,
        trip: notification.tripId,
        metadata: notification.metadata
      }))
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.updateMany({ userId, read: false }, { read: true });
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await Notification.findByIdAndDelete(notificationId);
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

// Clear all notifications for a user
router.delete('/user/:userId/clear-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.deleteMany({ userId });
    
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to clear all notifications' });
  }
});

// Create notification (for internal use and testing)
router.post('/create', async (req, res) => {
  try {
    const { userId, type, title, message, tripId, tripDestination, metadata } = req.body;

    const notification = await createNotification(userId, type, title, message, tripId, tripDestination, metadata);

    if (notification) {
      res.json({ success: true, notification });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create notification' });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

// Create test notification for development
router.post('/test', async (req, res) => {
  try {
    const userId = 'development-user';

    const testNotifications = [
      {
        type: 'trip_posted',
        title: 'Trip Posted Successfully! 🎉',
        message: 'Your trip to Bali has been posted and is now visible to other travelers. Get ready for an amazing adventure!',
        tripDestination: 'Bali, Indonesia'
      },
      {
        type: 'trip_joined',
        title: 'Trip Joined Successfully! 🎒',
        message: 'You\'ve successfully joined the trip to Tokyo. Get ready for an amazing adventure!',
        tripDestination: 'Tokyo, Japan'
      },
      {
        type: 'join_request',
        title: 'New Traveler Joined! 👥',
        message: 'Someone has joined your trip to Paris. Check your trip management for details.',
        tripDestination: 'Paris, France'
      }
    ];

    const createdNotifications = [];
    for (const notif of testNotifications) {
      const notification = await createNotification(
        userId,
        notif.type,
        notif.title,
        notif.message,
        null,
        notif.tripDestination,
        { testData: true }
      );
      if (notification) {
        createdNotifications.push(notification);
      }
    }

    res.json({
      success: true,
      message: `Created ${createdNotifications.length} test notifications`,
      notifications: createdNotifications
    });
  } catch (error) {
    console.error('Error creating test notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to create test notifications' });
  }
});

module.exports = { router, createNotification, setSocketIO };
