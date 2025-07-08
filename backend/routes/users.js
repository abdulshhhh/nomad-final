// Add the delete user endpoint here if it doesn't exist
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Attempting to delete user with ID: ${userId}`);
    
    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log(`Successfully deleted user: ${deletedUser.email}`);
    
    // Delete related data
    try {
      // Delete user profile if it exists
      const Profile = require('../models/Profile');
      await Profile.findOneAndDelete({ userId: userId });
      
      // Delete user memories if they exist
      const Memory = require('../models/Memory');
      await Memory.deleteMany({ userId: userId });
      
      // Update trips if they exist
      try {
        const Trip = require('../models/Trip');
        await Trip.updateMany({ createdBy: userId }, { $set: { status: 'cancelled' } });
        await Trip.updateMany({ joinedMembers: userId }, { $pull: { joinedMembers: userId } });
      } catch (tripErr) {
        console.log("Trip model not found or error updating trips:", tripErr.message);
      }
    } catch (relatedErr) {
      console.log("Error cleaning up related data:", relatedErr.message);
      // Continue with the response even if related data cleanup fails
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Add this route to fetch a single user's profile with avatar
router.get('/:userId/profile', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`🔍 Users API: Looking for user with ID: ${userId}`);

    // Validate ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`❌ Invalid ObjectId format: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      console.log(`❌ User not found for ID: ${userId}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ Found user for profile request: ${user.fullName || user.name} (${userId})`);
    console.log(`📊 User data: coins=${user.coins}, level=${user.level}, title=${user.title}, totalTrips=${user.totalTrips}`);
    
    // Return user profile with comprehensive data
    return res.json({
      _id: user._id,
      name: user.fullName || user.name || "User",
      fullName: user.fullName || user.name || "User",
      avatar: user.avatar,
      email: user.email, // Include email for profile display
      phone: user.phone,
      joinedDate: user.createdAt,
      memberSince: user.createdAt,
      // Leaderboard data
      coins: user.coins || 0,
      level: user.level || 1,
      title: user.title || "New Traveler",
      tripsHosted: user.tripsHosted || 0,
      tripsJoined: user.tripsJoined || 0,
      totalTrips: user.totalTrips || 0,
      countries: user.countries || [],
      countriesCount: user.countriesCount || 0,
      achievements: user.achievements || [],
      experience: user.experience || 0,
      lastActive: user.lastActive,
      verified: false // Default for privacy
    });
  } catch (error) {
    console.error(`Error fetching user profile for ${userId}:`, error);
    console.error('Error details:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add this route to fetch multiple user profiles at once
router.get('/profiles', async (req, res) => {
  try {
    const userIds = req.query.userIds ? req.query.userIds.split(',') : [];
    
    if (!userIds.length) {
      return res.status(400).json({ success: false, message: 'No user IDs provided' });
    }
    
    // Find all users by IDs
    const users = await User.find({ _id: { $in: userIds } });
    
    // Map to return only necessary profile data
    const profiles = users.map(user => ({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      joinedDate: user.createdAt,
      // Add other non-sensitive fields as needed
    }));
    
    return res.json(profiles);
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add this route to serve user avatars
router.get('/:userId/avatar', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (user && user.avatar) {
      // If avatar is a full URL, redirect to it
      if (user.avatar.startsWith('http')) {
        return res.redirect(user.avatar);
      }
      
      // If avatar is a base64 string, send it directly
      if (user.avatar.startsWith('data:')) {
        return res.send(user.avatar);
      }
    }
    
    // If no avatar or user found, return default avatar
    res.redirect('/assets/images/default-avatar.webp');
  } catch (error) {
    console.error('Error serving user avatar:', error);
    res.redirect('/assets/images/default-avatar.webp');
  }
});

module.exports = router;
