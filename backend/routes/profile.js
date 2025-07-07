// routes/profile.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

const upload = multer(); // or configure to handle files

// Add authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Log token for debugging (first few characters only)
    console.log("Authenticating with token:", token.substring(0, 10) + "...");
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    console.log("Authentication successful for user:", decoded.id);
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

router.post('/update', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const {
      fullName,
      bio,
      location,
      phone,
      gender,
      travelCategories,
      languages,
    } = req.body;

    // Use the actual user ID from authentication
    const userId = req.user?.id;
    
    // Check if userId exists
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
    }

    // Create update data object
    const updateData = {
      userId,
      fullName,
      bio,
      location,
      phone,
      gender,
      travelCategories: JSON.parse(travelCategories || '[]'),
      languages: JSON.parse(languages || '[]'),
    };

    // Handle avatar image
    if (req.file) {
      // Convert image to base64 string with proper format
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      updateData.avatar = base64Image;
      console.log("Avatar image processed");
    } else {
      console.log("No new avatar image provided");
      // Don't update avatar if no new image is provided
      // This prevents overwriting existing avatar with undefined
    }

    console.log("Update data prepared:", { ...updateData, avatar: updateData.avatar ? 'base64_data' : undefined });

    // Find the existing profile first
    const existingProfile = await Profile.findOne({ userId });
    
    // If there's an existing profile and no new avatar was provided, keep the existing avatar
    if (existingProfile && !req.file) {
      delete updateData.avatar; // Don't update the avatar field
    }

    // Save to MongoDB (upsert)
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    console.log("Profile updated successfully");
    res.json({ 
      success: true, 
      profile: {
        ...updatedProfile.toObject(),
        id: updatedProfile._id // Include id for frontend consistency
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add a GET route to fetch profile data
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    // Convert MongoDB document to plain object and ensure avatar is included
    const profileData = profile.toObject();
    
    // Log the avatar data (length only to avoid console spam)
    console.log("Sending profile with avatar:", 
      profileData.avatar ? `[Base64 data: ${profileData.avatar.substring(0, 30)}...]` : "No avatar");
    
    res.json({ success: true, profile: profileData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
