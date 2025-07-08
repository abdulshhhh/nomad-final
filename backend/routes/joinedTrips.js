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
      image: trip.coverImage || trip.image || '/assets/images/default-trip.jpeg',
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
  const { userId, tripId } = req.body;

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
      googleAccountName: null // No longer required
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

        // 🚀 EMIT REAL-TIME PARTICIPANT UPDATE
      if (io) {
        // Get user details for the participant update
        const User = require('../models/User');
        const userDetails = await User.findById(userId).select('fullName email avatar name');

        const participantData = {
          id: userId,
          _id: userId,
          name: userDetails?.fullName || userDetails?.name || 'Anonymous User',
          fullName: userDetails?.fullName || userDetails?.name || 'Anonymous User',
          email: userDetails?.email || '',
          avatar: userDetails?.avatar || "/assets/images/Alexrivera.jpeg",
          joinedDate: new Date(),
          joinedAt: new Date(),
          memberSince: userDetails?.createdAt || new Date(),
          createdAt: userDetails?.createdAt || new Date(),
          role: 'participant',
          isHost: false,
          bio: userDetails?.bio || '',
          location: userDetails?.location || '',
          phone: userDetails?.phone || '',
          verified: userDetails?.verified || false,
          level: userDetails?.level || 1,
          coins: userDetails?.coins || 0,
          tripsCompleted: userDetails?.tripsCompleted || 0
        };

        console.log('Emitting participantJoined event:', { tripId, participant: participantData });

        // Emit to all clients in the trip room
        io.to(`trip_${tripId}`).emit('participantJoined', {
          tripId: tripId,
          participant: participantData,
          message: `${participantData.name} joined the trip!`
        });

        // Also emit general update
        io.emit('tripParticipantUpdate', {
          tripId: tripId,
          action: 'joined',
          participant: participantData
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

// 🚪 LEAVE TRIP ENDPOINT - Remove user from trip and deduct 5 points
router.delete('/leave-trip', authenticate, async (req, res) => {
  try {
    const { userId, tripId } = req.body;

    if (!userId || !tripId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Trip ID are required'
      });
    }

    // Check if user has actually joined this trip
    const existingJoin = await JoinedTrip.findOne({ userId, tripId });
    if (!existingJoin) {
      return res.status(404).json({
        success: false,
        error: 'You have not joined this trip'
      });
    }

    // Get trip details for notifications
    const Trip = require('../models/Trip');
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Remove the user from the trip
    await JoinedTrip.deleteOne({ userId, tripId });

    // 💰 DEDUCT POINTS FOR LEAVING TRIP (-5 coins penalty)
    try {
      const axios = require('axios');
      await axios.post('http://localhost:5000/api/leaderboard/update-trip-stats', {
        userId: userId,
        action: 'leave', // New action for leaving trips
        tripId: tripId,
        tripDestination: trip.destination
      });

      // Emit real-time leaderboard update for penalty
      if (io) {
        io.emit('leaderboardUpdate', {
          userId: userId,
          action: 'leave',
          coins: -5,
          message: `Lost 5 coins for leaving trip to ${trip.destination}`,
          penalty: true,
          tripId: tripId,
          tripDestination: trip.destination
        });
      }
    } catch (coinError) {
      console.error('Error deducting coins for leaving trip:', coinError);
      // Continue with trip leaving even if coin deduction fails
    }

    // 📝 CREATE NOTIFICATIONS
    const { createNotification } = require('./notification');

    // Notify the user who left
    await createNotification(
      userId,
      'trip_left',
      'Trip Left 🚪',
      `You have left the trip to ${trip.destination}. 5 coins have been deducted as penalty.`,
      tripId,
      trip.destination,
      {
        penalty: -5,
        departure: trip.departure,
        fromDate: trip.fromDate,
        toDate: trip.toDate
      }
    );

    // Notify trip organizer (only if createdBy exists)
    if (trip.createdBy) {
      const organizerId = trip.createdBy._id ? trip.createdBy._id : trip.createdBy;
      await createNotification(
        organizerId,
        'participant_left',
        'Participant Left Trip 👋',
        `A participant has left your trip to ${trip.destination}.`,
        tripId,
        trip.destination,
        {
          leftUserId: userId,
          totalParticipants: await JoinedTrip.countDocuments({ tripId })
        }
      );
    }

    // 🔄 UPDATE TRIP STATISTICS
    const remainingParticipants = await JoinedTrip.countDocuments({ tripId });

    // Emit real-time trip update
    if (io) {
      io.emit('tripUpdate', {
        tripId: tripId,
        action: 'participant_left',
        participantCount: remainingParticipants,
        userId: userId,
        message: `User left trip to ${trip.destination}`
      });
    }

    res.json({
      success: true,
      message: `Successfully left trip to ${trip.destination}`,
      penalty: -5,
      remainingParticipants: remainingParticipants
    });

  } catch (error) {
    console.error('Error leaving trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave trip'
    });
  }
});

module.exports = { router, setSocketIO };
