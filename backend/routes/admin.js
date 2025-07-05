const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('./auth');
const User = require('../models/User');
const Trip = require('../models/Trip');
const JoinedTrip = require('../models/JoinedTrip');

// 👥 GET ALL USERS FOR ADMIN DASHBOARD
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('fullName email phone createdAt coins tripsHosted tripsJoined totalTrips level avatar googleAccountName gender')
      .sort({ createdAt: -1 });

    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      phone: user.phone || 'Not provided',
      joinDate: user.createdAt,
      coins: user.coins || 0,
      tripsHosted: user.tripsHosted || 0,
      tripsJoined: user.tripsJoined || 0,
      totalTrips: user.totalTrips || 0,
      level: user.level || 'Explorer',
      status: 'Active',
      avatar: user.avatar,
      googleAccountName: user.googleAccountName,
      gender: user.gender || 'Not specified'
    }));

    res.status(200).json({
      success: true,
      users: transformedUsers
    });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// 🗺️ GET ALL TRIPS FOR ADMIN DASHBOARD WITH REAL-TIME DATA
router.get('/trips', authenticateAdmin, async (req, res) => {
  try {
    // Fetch all trips with creator information
    const trips = await Trip.find({})
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    // Get joined trip counts for each trip
    const tripsWithDetails = await Promise.all(trips.map(async (trip) => {
      const joinedCount = await JoinedTrip.countDocuments({ tripId: trip._id });
      
      // Calculate trip status
      const now = new Date();
      const fromDate = new Date(trip.fromDate);
      const toDate = new Date(trip.toDate);
      
      let status = 'Upcoming';
      if (now > toDate) {
        status = 'Completed';
      } else if (now >= fromDate && now <= toDate) {
        status = 'Ongoing';
      }

      // Format dates
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      };

      const duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
      const dateRange = `${formatDate(fromDate)} - ${formatDate(toDate)}, ${fromDate.getFullYear()}`;

      return {
        id: trip._id.toString(),
        _id: trip._id,
        title: trip.destination,
        destination: trip.destination,
        departure: trip.departure,
        fromDate: trip.fromDate,
        toDate: trip.toDate,
        duration: duration,
        date: dateRange,
        status: status,
        price: `${trip.budget?.currency || 'USD'} ${(trip.budget?.amount || 0).toLocaleString()}`,
        image: trip.coverImage || '/assets/images/default-trip.jpg',
        organizer: trip.createdBy?.fullName || 'Unknown',
        organizerId: trip.createdBy?._id,
        maxPeople: trip.maxPeople,
        numberOfPeople: trip.numberOfPeople,
        currentParticipants: joinedCount,
        category: trip.category,
        transport: trip.transport,
        genderPreference: trip.genderPreference,
        description: trip.description,
        createdAt: trip.createdAt,
        budget: trip.budget
      };
    }));

    res.status(200).json({
      success: true,
      trips: tripsWithDetails
    });
  } catch (error) {
    console.error('Error fetching trips for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trips'
    });
  }
});

// 🗑️ DELETE TRIP (ADMIN ONLY)
router.delete('/trips/:tripId', authenticateAdmin, async (req, res) => {
  try {
    const { tripId } = req.params;

    // Delete the trip
    const deletedTrip = await Trip.findByIdAndDelete(tripId);
    
    if (!deletedTrip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Also delete all joined trip records for this trip
    await JoinedTrip.deleteMany({ tripId: tripId });

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete trip'
    });
  }
});

// 🗑️ DELETE USER (ADMIN ONLY)
router.delete('/users/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Also delete all trips created by this user
    await Trip.deleteMany({ createdBy: userId });
    
    // And all joined trip records by this user
    await JoinedTrip.deleteMany({ userId: userId });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// 📊 GET ADMIN DASHBOARD STATS
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTrips = await Trip.countDocuments({});
    const totalJoinedTrips = await JoinedTrip.countDocuments({});
    
    // Get trips by status
    const now = new Date();
    const upcomingTrips = await Trip.countDocuments({ fromDate: { $gt: now } });
    const ongoingTrips = await Trip.countDocuments({ 
      fromDate: { $lte: now }, 
      toDate: { $gte: now } 
    });
    const completedTrips = await Trip.countDocuments({ toDate: { $lt: now } });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTrips,
        totalJoinedTrips,
        upcomingTrips,
        ongoingTrips,
        completedTrips
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Add these routes to handle destinations

// Get all destinations
router.get('/destinations', authenticateAdmin, async (req, res) => {
  try {
    const Destination = require('../models/Destination');
    const destinations = await Destination.find({}).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      destinations
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destinations',
      error: error.message
    });
  }
});

// Add a new destination
router.post('/destinations', authenticateAdmin, async (req, res) => {
  try {
    const { name, country, visits, image } = req.body;
    
    if (!name || !country || !image) {
      return res.status(400).json({
        success: false,
        message: 'Name, country, and image are required'
      });
    }
    
    const Destination = require('../models/Destination');
    const newDestination = new Destination({
      name,
      country,
      visits: visits || "0",
      image
    });
    
    await newDestination.save();
    
    res.status(201).json({
      success: true,
      message: 'Destination added successfully',
      destination: newDestination
    });
  } catch (error) {
    console.error('Error adding destination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add destination',
      error: error.message
    });
  }
});

// Update a destination
router.put('/destinations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, country, visits, image } = req.body;
    const destinationId = req.params.id;
    
    const Destination = require('../models/Destination');
    const destination = await Destination.findById(destinationId);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }
    
    // Update fields if provided
    if (name) destination.name = name;
    if (country) destination.country = country;
    if (visits) destination.visits = visits;
    if (image) destination.image = image;
    
    await destination.save();
    
    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      destination
    });
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update destination',
      error: error.message
    });
  }
});

// Delete a destination
router.delete('/destinations/:id', authenticateAdmin, async (req, res) => {
  try {
    const destinationId = req.params.id;
    
    const Destination = require('../models/Destination');
    const destination = await Destination.findByIdAndDelete(destinationId);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete destination',
      error: error.message
    });
  }
});

module.exports = router;
