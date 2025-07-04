// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('./auth');

// PUT /api/users/:id - Update user profile (supports profile picture upload)
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put('/:id', authenticate, upload.single('profilePicture'), async (req, res) => {
  console.log('PUT /api/users/:id', req.params.id);
  try {
    const userId = req.params.id;
    const updateData = req.body;
    // Prevent updating email or password directly for security
    delete updateData.email;
    delete updateData.password;

    // If a profile picture is uploaded, store as base64 string
    if (req.file) {
      updateData.profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
