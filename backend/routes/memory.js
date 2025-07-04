const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const authenticate = require('../middleware/auth');
const multer = require('multer');
const mongoose = require('mongoose');

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/memories - Create a new memory
router.post('/', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    console.log('Memory upload request received');
    console.log('Request body:', req.body);
    console.log('Files:', req.files ? `${req.files.length} files uploaded` : 'No files uploaded');
    console.log('User ID from auth:', req.userId);
    
    const { description, location } = req.body;
    
    // Handle image uploads
    const images = req.files && req.files.length > 0
      ? req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`)
      : [];
    
    if (images.length === 0) {
      console.log('At least one image is required but not provided');
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }
    
    // Validate userId
    if (!req.userId) {
      console.log('User ID is missing');
      return res.status(401).json({ success: false, message: 'User ID is required' });
    }
    
    // Create new memory document
    const newMemory = new Memory({
      images,
      description: description || '',
      location: location || '',
      userId: req.userId,
      createdAt: new Date()
    });
    
    console.log('Saving memory:', {
      description: newMemory.description,
      location: newMemory.location,
      userId: newMemory.userId,
      imageCount: images.length
    });
    
    // Save to database
    const savedMemory = await newMemory.save();
    console.log('Memory saved successfully with ID:', savedMemory._id);
    
    res.status(201).json({
      success: true,
      memory: savedMemory
    });
  } catch (err) {
    console.error('Error creating memory:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/memories/:userId - Get all memories for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching memories for user: ${userId}`);
    
    const memories = await Memory.find({ userId }).sort({ createdAt: -1 });
    console.log(`Found ${memories.length} memories`);
    
    // Ensure each memory has the correct image format
    const formattedMemories = memories.map(memory => {
      // Make sure we're returning the full image data including the data:image prefix
      return {
        ...memory.toObject(),
        images: memory.images.map(img => {
          // If the image doesn't start with 'data:image', it might be missing the prefix
          if (img && !img.startsWith('data:image')) {
            // Try to determine the image type or default to jpeg
            const imageType = img.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
            return `data:${imageType};base64,${img}`;
          }
          return img;
        })
      };
    });
    
    res.json({ success: true, memories: formattedMemories });
  } catch (err) {
    console.error('Error fetching memories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/memories/pin/:id - Toggle pin status
router.put('/pin/:id', authenticate, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }
    
    // Ensure user owns this memory
    if (memory.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Toggle pinned status
    memory.pinned = !memory.pinned;
    await memory.save();
    
    res.json({ success: true, memory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/memories/detail/:memoryId - Get a single memory by ID
router.get('/detail/:memoryId', authenticate, async (req, res) => {
  try {
    const { memoryId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(memoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid memory ID format' });
    }
    
    console.log(`Fetching memory details for ID: ${memoryId}`);
    
    const memory = await Memory.findById(memoryId);
    
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }
    
    // For backward compatibility with older memories that have imageUrl instead of images array
    if (memory.imageUrl && !memory.images) {
      memory.images = [memory.imageUrl];
    }
    
    res.json({ success: true, memory });
  } catch (err) {
    console.error('Error fetching memory details:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/memories/:id - Delete a memory
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const memoryId = req.params.id;
    console.log(`Attempting to delete memory with ID: ${memoryId}`);
    
    // Find the memory
    const memory = await Memory.findById(memoryId);
    
    if (!memory) {
      console.log(`Memory with ID ${memoryId} not found`);
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }
    
    // Ensure user owns this memory
    if (memory.userId.toString() !== req.userId) {
      console.log(`Unauthorized deletion attempt. Memory belongs to ${memory.userId}, request from ${req.userId}`);
      return res.status(403).json({ success: false, message: 'Not authorized to delete this memory' });
    }
    
    // Delete the memory
    await Memory.findByIdAndDelete(memoryId);
    console.log(`Memory with ID ${memoryId} successfully deleted`);
    
    res.json({ success: true, message: 'Memory deleted successfully' });
  } catch (err) {
    console.error('Error deleting memory:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

