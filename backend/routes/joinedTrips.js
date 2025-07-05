const express = require('express');
const router = express.Router();
const JoinedTrip = require('../models/JoinedTrip');
const Trip = require('../models/Trip');
const { createNotification } = require('./notification');
const authenticate = require('../middleware/auth'); // Import the auth middleware

// Get Socket.IO instance from app
let io;
const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

// Get all joined trips for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching joined trips for user:', userId);

    const joined = await JoinedTrip.find({ userId: userId });
    console.log('Found joined trip records:', joined.length);

    const tripIds = joined.map(j => j.tripId);
    const trips = await Trip.find({ _id: { $in: tripIds } })
      .populate('createdBy', 'fullName email');

    console.log('Found trips:', trips.length);

    // Transform trips to match frontend expectations
    const transformedTrips = trips.map(trip => ({
      id: trip._id.toString(),
      _id: trip._id,
      title: trip.destination,
      tripTitle: trip.destination, // For profile compatibility
      destination: trip.destination,
      date: trip.fromDate,
      fromDate: trip.fromDate,
      toDate: trip.toDate,
      image: trip.image || '/assets/images/default-trip.jpeg',
      organizer: trip.createdBy?.fullName || 'Unknown',
      organizerId: trip.createdBy?._id,
      budget: trip.budget,
      currency: trip.currency,
      maxPeople: trip.maxPeople,
      departure: trip.departure,
      category: trip.category,
      transport: trip.transport,
      createdAt: trip.createdAt
    }));

    res.json(transformedTrips);
  } catch (err) {
    console.error('Error fetching joined trips:', err);
    res.status(500).json({ error: 'Failed to fetch joined trips' });
  }
});

// Add this endpoint to get count of trips joined by a user
router.get('/count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const count = await JoinedTrip.countDocuments({ userId });
    
    res.json({ count });
  } catch (error) {
    console.error('Error counting joined trips:', error);
    res.status(500).json({ error: 'Failed to count joined trips' });
  }
});

// POST route to join a trip
router.post('/', authenticate, async (req, res) => {
  const { userId, tripId, googleAccountName } = req.body;

  if (!userId || !tripId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: userId and tripId'
    });
  }

  try {
    // Get trip details first to validate ownership
    const trip = await Trip.findById(tripId).populate('createdBy', 'fullName');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // 🚫 PREVENT SELF-JOIN: Check if user is trying to join their own trip
    // Get the trip creator ID - handle both populated and non-populated cases
    let tripCreatorId = null;

    if (trip.createdBy) {
      // If createdBy is populated (object with _id), use _id
      if (typeof trip.createdBy === 'object' && trip.createdBy._id) {
        tripCreatorId = trip.createdBy._id.toString();
      }
      // If createdBy is just an ObjectId string
      else if (typeof trip.createdBy === 'string' || trip.createdBy.toString) {
        tripCreatorId = trip.createdBy.toString();
      }
    }

    const joiningUserId = userId.toString();

    if (tripCreatorId && tripCreatorId === joiningUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot join your own trip',
        message: 'You cannot join a trip that you created. Use trip management to see participants.'
      });
    }

    // Check if user has already joined this trip
    const exists = await JoinedTrip.findOne({ userId, tripId });
    if (exists) {
      return res.status(400).json({
        success: false,
        error: 'Already joined this trip'
      });
    }

    // Check if trip is full before joining
    const currentParticipants = await JoinedTrip.countDocuments({ tripId });
    if (currentParticipants >= trip.maxPeople) {
      return res.status(400).json({
        success: false,
        error: 'Trip is full',
        message: `This trip is already full (${trip.maxPeople}/${trip.maxPeople} participants).`
      });
    }

    // Create the joined trip record
    await JoinedTrip.create({
      userId,
      tripId,
      googleAccountName: googleAccountName || null
    });

    // 📊 UPDATE TRIP PARTICIPANT COUNT
    // Increment numberOfPeople in the trip document
    await Trip.findByIdAndUpdate(tripId, {
      $inc: { numberOfPeople: 1 }
    });

      // 🪙 REWARD COINS FOR JOINING TRIP (+5 coins)
      try {
        const axios = require('axios');
        await axios.post('http://localhost:5000/api/leaderboard/update-trip-stats', {
          userId: userId,
          action: 'join',
          tripId: tripId,
          tripDestination: trip.destination
        });

        // Emit real-time leaderboard update
        if (io) {
          io.emit('leaderboardUpdate', {
            userId: userId,
            action: 'join',
            coins: 5,
            message: `Earned 5 coins for joining a trip to ${trip.destination}!`,
            tripId: tripId,
            tripDestination: trip.destination
          });
        }
      } catch (coinError) {
        console.error('Error updating coins for joining trip:', coinError);
        // Don't fail the trip joining if coin update fails
      }

      // Create notification for the user who joined
      await createNotification(
        userId,
        'trip_joined',
        'Trip Joined Successfully! 🎒',
        `You've successfully joined the trip to ${trip.destination}. Get ready for an amazing adventure!`,
        tripId,
        trip.destination,
        {
          departure: trip.departure,
          fromDate: trip.fromDate,
          toDate: trip.toDate,
          organizer: trip.createdBy?.fullName || 'Trip Organizer'
        }
      );

      // Create notification for trip organizer (only if createdBy exists)
      if (trip.createdBy) {
        const organizerId = trip.createdBy._id ? trip.createdBy._id : trip.createdBy;
        await createNotification(
          organizerId,
          'join_request',
          'New Traveler Joined! 👥',
          `Someone has joined your trip to ${trip.destination}. Check your trip management for details.`,
          tripId,
          trip.destination,
          {
            joinedUserId: userId,
            totalParticipants: await JoinedTrip.countDocuments({ tripId })
          }
        );
      }

    res.json({
      success: true,
      message: `Successfully joined trip to ${trip.destination}!`,
      trip: {
        id: trip._id,
        destination: trip.destination,
        organizer: trip.createdBy?.fullName || 'Trip Organizer'
      }
    });
  } catch (err) {
    console.error('Error joining trip:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to join trip',
      message: 'An unexpected error occurred while joining the trip.'
    });
  }
});

module.exports = { router, setSocketIO };
