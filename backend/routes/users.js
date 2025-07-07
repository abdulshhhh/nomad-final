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
    
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Return user profile with avatar
    return res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      // Add other non-sensitive profile fields
      joinedDate: user.createdAt,
      // Don't include sensitive information like email, password, etc.
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
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

module.exports = router;
