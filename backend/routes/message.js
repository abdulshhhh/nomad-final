const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

let io = null;

// Function to set Socket.IO instance
const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Get messages for a specific trip
router.get('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const messages = await Message.find({ tripId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  try {
    const { tripId, userId, userName, userAvatar, message, type = 'text' } = req.body;
    
    const newMessage = new Message({
      tripId,
      userId,
      userName,
      userAvatar,
      message,
      timestamp: new Date().toISOString(),
      type
    });
    
    await newMessage.save();
    
    // Emit real-time message to all users in the trip room
    if (io) {
      io.to(`trip_${tripId}`).emit('receiveMessage', newMessage);
    }
    
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Delete a message (optional feature)
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndDelete(messageId);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = { router, setSocketIO };
