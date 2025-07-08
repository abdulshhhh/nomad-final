// routes/trips.js
const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { createNotification } = require('./notification');

// Get Socket.IO instance from app
let io;
const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();
const { authenticateAdmin } = require('./auth');

// Import authenticate middleware from a separate file or define it here
const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Simple health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Multer setup for file uploads with proper limits
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    fieldSize: 2 * 1024 * 1024,  // 2MB field size limit (for long descriptions)
    fields: 20,                   // Maximum number of non-file fields
    files: 1                      // Maximum number of file fields
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Input validation middleware
const validateTripInput = [
  body('destination').notEmpty().withMessage('Destination is required'),
  body('departure').notEmpty().withMessage('Departure is required'),
  body('fromDate').isISO8601().withMessage('Valid from date is required'),
  body('toDate').isISO8601().withMessage('Valid to date is required'),
  body('transport').notEmpty().withMessage('Transport method is required'),
  body('currency').notEmpty().withMessage('Currency is required'),
  body('budget').isNumeric().withMessage('Budget must be a number'),
  body('numberOfPeople').isInt({ min: 1 }).withMessage('Number of people must be at least 1'),
  body('maxPeople').isInt({ min: 1 }).withMessage('Max people must be at least 1'),
  body('genderPreference').notEmpty().withMessage('Gender preference is required'),
  body('category').notEmpty().withMessage('Category is required'),
  // description and coverImage are optional
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// GET /api/trips - Fetch active trips only (not completed)
router.get('/', async (req, res) => {
  try {
    // Only fetch trips that are not completed
    const trips = await Trip.find({
      $and: [
        { status: { $ne: 'completed' } }, // Not manually completed
        { toDate: { $gte: new Date() } } // End date hasn't passed
      ]
    })
      .populate('createdBy', 'fullName email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      trips
    });
  } catch (err) {
    console.error("Error fetching trips:", err.message);
    res.status(500).json({
      error: 'Server error while fetching trips',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// POST /api/trips/:tripId/join - Join a trip
router.post('/:tripId/join', authenticate, async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.userId; // Get from auth middleware

    if (!userId || !tripId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId and tripId'
      });
    }

    // Forward to the joined trips route
    const JoinedTrip = require('../models/JoinedTrip');
    const Trip = require('../models/Trip');

    // Get trip details first to validate ownership
    const trip = await Trip.findById(tripId).populate('createdBy', 'fullName avatar');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check if user is trying to join their own trip
    const tripCreatorId = trip.createdBy._id ? trip.createdBy._id.toString() : trip.createdBy.toString();
    const joiningUserId = userId.toString();

    if (tripCreatorId === joiningUserId) {
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

    // Update trip participant count
    await Trip.findByIdAndUpdate(tripId, {
      $inc: { numberOfPeople: 1 }
    });

    res.json({
      success: true,
      message: `Successfully joined trip to ${trip.destination}!`,
      trip: {
        id: trip._id,
        destination: trip.destination,
        organizer: trip.createdBy?.fullName || 'Trip Organizer'
      }
    });

  } catch (error) {
    console.error('Error joining trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join trip',
      message: 'An unexpected error occurred while joining the trip.'
    });
  }
});

// GET /api/trips/:tripId/participants - Get trip participants for trip management
router.get('/:tripId/participants', async (req, res) => {
  try {
    const { tripId } = req.params;

    // Find the trip and verify the user is the creator
    const trip = await Trip.findById(tripId).populate('createdBy', 'fullName email avatar');

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found'
      });
    }

    // For development purposes, allow access if no authentication or if user is trip creator
    const userId = req.userId || req.headers['x-user-id'] || 'development-user';

    // In production, uncomment this check:
    // if (trip.createdBy._id.toString() !== userId) {
    //   return res.status(403).json({
    //     error: 'Access denied. Only trip creators can view participants.'
    //   });
    // }

    // Get all joined trips for this trip
    const JoinedTrip = require('../models/JoinedTrip');
    const User = require('../models/User');

    const joinedTrips = await JoinedTrip.find({ tripId: tripId })
      .populate('userId', 'fullName email avatar createdAt bio location phone verified level coins tripsCompleted');

    const participants = joinedTrips.map(joinedTrip => ({
      id: joinedTrip.userId._id,
      _id: joinedTrip.userId._id,
      name: joinedTrip.userId.fullName,
      fullName: joinedTrip.userId.fullName,
      email: joinedTrip.userId.email,
      avatar: joinedTrip.userId.avatar,
      joinedDate: joinedTrip.createdAt,
      joinedAt: joinedTrip.createdAt,
      memberSince: joinedTrip.userId.createdAt,
      createdAt: joinedTrip.userId.createdAt,
      // Add additional profile fields if available
      bio: joinedTrip.userId.bio,
      location: joinedTrip.userId.location,
      phone: joinedTrip.userId.phone,
      verified: joinedTrip.userId.verified || false,
      level: joinedTrip.userId.level || 1,
      coins: joinedTrip.userId.coins || 0,
      tripsCompleted: joinedTrip.userId.tripsCompleted || 0
    }));

    res.json({
      success: true,
      trip: {
        id: trip._id,
        title: trip.destination,
        destination: trip.destination,
        fromDate: trip.fromDate,
        toDate: trip.toDate,
        maxPeople: trip.maxPeople,
        currentParticipants: participants.length
      },
      participants: participants
    });

  } catch (error) {
    console.error('Error fetching trip participants:', error);
    res.status(500).json({
      error: 'Failed to fetch trip participants',
      details: error.message
    });
  }
});

// POST /api/trips - Create new trip with file upload
router.post(
  '/',
  authenticate,
  upload.single('coverImage'),
  async (req, res) => {
    try {
      // Parse fields from form-data
      const {
        destination,
        departure,
        fromDate,
        toDate,
        transport,
        currency,
        budget,
        numberOfPeople,
        maxPeople,
        genderPreference,
        category,
        description,
        googleAccountName,
        accommodation
      } = req.body;

      // Validate required fields
      if (!destination || !departure || !fromDate || !toDate || !transport || !currency || !budget || !numberOfPeople || !maxPeople || !genderPreference || !category) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['destination', 'departure', 'fromDate', 'toDate', 'transport', 'currency', 'budget', 'numberOfPeople', 'maxPeople', 'genderPreference', 'category']
        });
      }

      // 🗓️ ROBUST DATE VALIDATION ON BACKEND
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const tripFromDate = new Date(fromDate);
      const tripToDate = new Date(toDate);

      // Check if fromDate is in the future (at least tomorrow)
      if (tripFromDate <= today) {
        return res.status(400).json({
          error: 'Invalid trip start date',
          message: 'Trip start date must be at least tomorrow. You cannot create trips for today or past dates.'
        });
      }

      // Check if toDate is after fromDate
      if (tripToDate <= tripFromDate) {
        return res.status(400).json({
          error: 'Invalid trip end date',
          message: 'Trip end date must be after the start date.'
        });
      }

      // Check minimum trip duration (at least 1 day)
      const tripDurationMs = tripToDate.getTime() - tripFromDate.getTime();
      const tripDurationDays = tripDurationMs / (1000 * 60 * 60 * 24);

      if (tripDurationDays < 1) {
        return res.status(400).json({
          error: 'Invalid trip duration',
          message: 'Trip must be at least 1 day long.'
        });
      }

      // Check if trip is not too far in the future (2 years max)
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);

      if (tripFromDate > maxFutureDate) {
        return res.status(400).json({
          error: 'Invalid trip start date',
          message: 'Trip start date cannot be more than 2 years in the future.'
        });
      }

      console.log('✅ Backend date validation passed:', {
        fromDate: tripFromDate.toLocaleDateString(),
        toDate: tripToDate.toLocaleDateString(),
        duration: `${Math.ceil(tripDurationDays)} days`
      });

      // Prepare trip data for schema
      const tripData = {
        destination,
        departure,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        transport,
        budget: {
          amount: Number(budget),
          currency: currency
        },
        numberOfPeople: Number(numberOfPeople),
        maxPeople: Number(maxPeople),
        genderPreference,
        category,
        description: description || "",
        coverImage: req.file
          ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
          : null,
        createdBy: req.userId,
        googleAccountName: googleAccountName || null,
        createdAt: new Date(),
        status: 'upcoming', // 🚀 Set initial status
        autoCompleted: false,
        accommodation: accommodation || 'Will discuss further'
      };

      const newTrip = new Trip(tripData);
      await newTrip.save();

      // Populate the createdBy field for the response
      await newTrip.populate('createdBy', 'fullName email avatar');

      // 🪙 REWARD COINS FOR HOSTING TRIP (+5 coins)
      try {
        const axios = require('axios');
        await axios.post('http://localhost:5000/api/leaderboard/update-trip-stats', {
          userId: req.userId,
          action: 'host',
          tripId: newTrip._id,
          tripDestination: newTrip.destination
        });

        // Emit real-time leaderboard update
        if (io) {
          io.emit('leaderboardUpdate', {
            userId: req.userId,
            action: 'host',
            coins: 5,
            message: `Earned 5 coins for hosting a trip to ${newTrip.destination}!`,
            tripId: newTrip._id,
            tripDestination: newTrip.destination
          });
        }
      } catch (coinError) {
        console.error('Error updating coins for hosting trip:', coinError);
        // Don't fail the trip creation if coin update fails
      }

      // Create notification for trip posting
      await createNotification(
        req.userId,
        'trip_posted',
        'Trip Posted Successfully! 🎉',
        `Your trip to ${destination} has been posted and is now visible to other travelers. Get ready for an amazing adventure!`,
        newTrip._id,
        destination,
        {
          departure,
          fromDate,
          toDate,
          budget: `${currency} ${budget}`,
          maxPeople
        }
      );

      // Emit real-time event for new trip
      if (io) {
        io.emit('newTrip', {
          trip: newTrip,
          message: `New trip to ${destination} is now available!`
        });
      }

      res.status(201).json({
        success: true,
        trip: newTrip,
        message: 'Trip created successfully'
      });
    } catch (err) {
      console.error("Trip creation error:", err);

      // Handle Multer errors specifically
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large. Maximum size is 10MB.'
          });
        }
        if (err.code === 'LIMIT_FIELD_VALUE') {
          return res.status(400).json({
            error: 'Field value too long. Please reduce the length of your input.'
          });
        }
        return res.status(400).json({
          error: 'File upload error: ' + err.message
        });
      }

      res.status(500).json({
        error: 'Server error while creating trip',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// POST /api/trips/seed-dummy - Add dummy trips for testing
router.post('/seed-dummy', async (req, res) => {
  try {
    // Check if dummy trips already exist
    const existingDummy = await Trip.findOne({ description: { $regex: 'DUMMY_TRIP' } });
    if (existingDummy) {
      return res.json({
        success: true,
        message: 'Dummy trips already exist',
        trips: await Trip.find({ description: { $regex: 'DUMMY_TRIP' } })
      });
    }

    const User = require('../models/User');

    // Create a dummy user if it doesn't exist
    let dummyUser = await User.findOne({ email: 'dummy@example.com' });
    if (!dummyUser) {
      dummyUser = new User({
        fullName: 'Travel Explorer',
        email: 'dummy@example.com',
        password: 'dummy123', // In real app, this would be hashed
        avatar: '/assets/images/Alexrivera.jpeg'
      });
      await dummyUser.save();
    }

    const dummyTrips = [
      {
        destination: 'Bali, Indonesia',
        departure: 'Mumbai, India',
        fromDate: new Date('2025-02-15'),
        toDate: new Date('2025-02-22'),
        transport: 'Flight',
        budget: {
          amount: 85000,
          currency: 'INR'
        },
        numberOfPeople: 1,
        maxPeople: 6,
        genderPreference: 'anyone',
        category: 'Adventure',
        description: 'DUMMY_TRIP: Explore the beautiful temples, beaches, and culture of Bali. Perfect for adventure seekers and culture enthusiasts!',
        coverImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        createdBy: dummyUser._id,
        createdAt: new Date()
      },
      {
        destination: 'Manali, Himachal Pradesh',
        departure: 'Delhi, India',
        fromDate: new Date('2025-03-10'),
        toDate: new Date('2025-03-17'),
        transport: 'Bus',
        budget: {
          amount: 25000,
          currency: 'INR'
        },
        numberOfPeople: 2,
        maxPeople: 8,
        genderPreference: 'anyone',
        category: 'Mountain',
        description: 'DUMMY_TRIP: Experience the snow-capped mountains and adventure sports in Manali. Great for groups and solo travelers!',
        coverImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        createdBy: dummyUser._id,
        createdAt: new Date()
      },
      {
        destination: 'Goa Beaches',
        departure: 'Bangalore, India',
        fromDate: new Date('2025-04-05'),
        toDate: new Date('2025-04-10'),
        transport: 'Train',
        budget: {
          amount: 18000,
          currency: 'INR'
        },
        numberOfPeople: 3,
        maxPeople: 10,
        genderPreference: 'anyone',
        category: 'Beach',
        description: 'DUMMY_TRIP: Relax on pristine beaches, enjoy water sports, and experience the vibrant nightlife of Goa!',
        coverImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        createdBy: dummyUser._id,
        createdAt: new Date()
      }
    ];

    const createdTrips = await Trip.insertMany(dummyTrips);

    res.status(201).json({
      success: true,
      message: 'Dummy trips created successfully',
      trips: createdTrips
    });

  } catch (error) {
    console.error('Error creating dummy trips:', error);
    res.status(500).json({
      error: 'Failed to create dummy trips',
      details: error.message
    });
  }
});

// DELETE /api/trips/:tripId/abandon - Abandon/delete a trip
router.delete('/:tripId/abandon', async (req, res) => {
  try {
    const { tripId } = req.params;

    // Find the trip
    const trip = await Trip.findById(tripId).populate('createdBy', 'fullName email avatar');
    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found'
      });
    }

    // Get the trip creator ID for points deduction
    const tripCreatorId = trip.createdBy._id || trip.createdBy;

    // 🚨 DEDUCT POINTS FOR TRIP ABANDONMENT (-5 coins penalty)
    try {
      const User = require('../models/User');
      const tripCreator = await User.findById(tripCreatorId);

      if (tripCreator) {
        // Deduct 5 coins as penalty for abandoning trip
        tripCreator.coins = Math.max(0, tripCreator.coins - 5); // Ensure coins don't go below 0
        tripCreator.tripsHosted = Math.max(0, tripCreator.tripsHosted - 1); // Reduce hosted count
        tripCreator.totalTrips = Math.max(0, tripCreator.totalTrips - 1); // Reduce total trips
        tripCreator.experience = Math.max(0, tripCreator.experience - 5); // Reduce experience
        tripCreator.level = tripCreator.calculatedLevel; // Recalculate level
        tripCreator.lastActive = new Date();

        await tripCreator.save();

        console.log(`🚨 Deducted 5 coins from user ${tripCreator.fullName} for abandoning trip to ${trip.destination}`);

        // Emit real-time leaderboard update for penalty
        if (io) {
          io.emit('leaderboardUpdate', {
            userId: tripCreatorId,
            action: 'abandon',
            coins: -5,
            message: 'Lost 5 coins for abandoning a trip',
            penalty: true
          });
        }
      }
    } catch (pointsError) {
      console.error('Error deducting points for trip abandonment:', pointsError);
      // Continue with trip deletion even if points deduction fails
    }

    // Get all participants before deleting joined trips (for notifications)
    const JoinedTrip = require('../models/JoinedTrip');
    const joinedTrips = await JoinedTrip.find({ tripId }).populate('userId', 'fullName email');

    // 🚨 DEDUCT POINTS FROM ALL PARTICIPANTS (-5 coins penalty for each)
    try {
      const User = require('../models/User');

      for (const joinedTrip of joinedTrips) {
        if (joinedTrip.userId) {
          const participant = await User.findById(joinedTrip.userId._id);
          if (participant) {
            // Deduct 5 coins as penalty for being part of abandoned trip
            participant.coins = Math.max(0, participant.coins - 5);
            participant.tripsJoined = Math.max(0, participant.tripsJoined - 1);
            participant.totalTrips = Math.max(0, participant.totalTrips - 1);
            participant.experience = Math.max(0, participant.experience - 5);
            participant.level = participant.calculatedLevel;
            participant.lastActive = new Date();

            await participant.save();

            console.log(`🚨 Deducted 5 coins from participant ${participant.fullName} for abandoned trip`);

            // Emit real-time leaderboard update for participant penalty
            if (io) {
              io.emit('leaderboardUpdate', {
                userId: participant._id,
                action: 'abandon_participant',
                coins: -5,
                message: 'Lost 5 coins due to trip abandonment',
                penalty: true
              });
            }

            // Create notification for each participant about the abandonment
            await createNotification(
              participant._id,
              'trip_abandoned',
              'Trip Abandoned 🚨',
              `The trip to ${trip.destination} you joined has been abandoned by the organizer. You have been refunded and received a -5 coin penalty.`,
              null,
              trip.destination,
              {
                originalDeparture: trip.departure,
                originalDate: trip.fromDate,
                reason: 'Trip abandoned by organizer',
                penalty: true
              }
            );
          }
        }
      }
    } catch (participantPointsError) {
      console.error('Error deducting points from participants:', participantPointsError);
      // Continue with trip deletion
    }

    // Delete all joined trips for this trip
    await JoinedTrip.deleteMany({ tripId: tripId });

    // Create notification for trip abandonment (organizer)
    const userId = req.userId || req.headers['x-user-id'] || 'development-user';
    await createNotification(
      userId,
      'trip_abandoned',
      'Trip Abandoned 🚨',
      `Your trip to ${trip.destination} has been abandoned and removed from the platform. All participants have been notified. You received a -5 coin penalty.`,
      null,
      trip.destination,
      {
        originalDeparture: trip.departure,
        originalDate: trip.fromDate,
        reason: 'Emergency abandonment',
        penalty: true,
        participantsAffected: joinedTrips.length
      }
    );

    // Delete the trip itself
    await Trip.findByIdAndDelete(tripId);

    res.json({
      success: true,
      message: 'Trip abandoned successfully',
      penalty: {
        organizer: -5,
        participants: joinedTrips.length,
        totalPenalty: (joinedTrips.length + 1) * 5
      }
    });

  } catch (error) {
    console.error('Error abandoning trip:', error);
    res.status(500).json({
      error: 'Failed to abandon trip',
      details: error.message
    });
  }
});

// 🏁 GET COMPLETED TRIPS - For "The road so far" section
router.get('/completed', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Get completed trips (either manually marked or auto-completed)
    const completedTrips = await Trip.find({
      $or: [
        { status: 'completed' },
        { toDate: { $lt: new Date() } } // Also include trips that should be completed based on date
      ]
    })
    .populate('createdBy', 'fullName avatar')
    .sort({ completedAt: -1, toDate: -1 }) // Sort by completion date, then end date
    .limit(parseInt(limit))
    .skip(skip);

    // Get participant counts for each trip
    const JoinedTrip = require('../models/JoinedTrip');
    const tripsWithDetails = await Promise.all(completedTrips.map(async (trip) => {
      const participantCount = await JoinedTrip.countDocuments({ tripId: trip._id });

      // Calculate trip duration
      const fromDate = new Date(trip.fromDate);
      const toDate = new Date(trip.toDate);
      const duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

      return {
        id: trip._id,
        destination: trip.destination,
        departure: trip.departure,
        fromDate: trip.fromDate,
        toDate: trip.toDate,
        duration: `${duration} day${duration > 1 ? 's' : ''}`,
        category: trip.category,
        transport: trip.transport,
        budget: trip.budget,
        coverImage: trip.coverImage,
        organizer: trip.createdBy?.fullName || 'Unknown',
        organizerAvatar: trip.createdBy?.avatar,
        participantCount,
        maxPeople: trip.maxPeople,
        status: trip.currentStatus, // Use virtual property
        completedAt: trip.completedAt,
        autoCompleted: trip.autoCompleted || false,
        createdAt: trip.createdAt
      };
    }));

    // Get total count for pagination
    const totalCount = await Trip.countDocuments({
      $or: [
        { status: 'completed' },
        { toDate: { $lt: new Date() } }
      ]
    });

    res.json({
      success: true,
      trips: tripsWithDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalTrips: totalCount,
        hasMore: skip + tripsWithDetails.length < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching completed trips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch completed trips'
    });
  }
});

// 📊 GET TRIP STATISTICS - Real-time trip stats
router.get('/statistics/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;

    // Get trip details
    const trip = await Trip.findById(tripId).populate('createdBy', 'fullName avatar');
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Get current participants count
    const JoinedTrip = require('../models/JoinedTrip');
    const currentParticipants = await JoinedTrip.countDocuments({ tripId });

    // Calculate statistics
    const availableSpots = trip.maxPeople - currentParticipants;
    const occupancyRate = Math.round((currentParticipants / trip.maxPeople) * 100);

    // Calculate days until trip
    const now = new Date();
    const tripStart = new Date(trip.fromDate);
    const daysUntilTrip = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));

    // Trip duration
    const tripEnd = new Date(trip.toDate);
    const duration = Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24));

    const statistics = {
      tripId: trip._id,
      destination: trip.destination,
      organizer: trip.createdBy?.fullName || 'Unknown',
      currentParticipants,
      maxParticipants: trip.maxPeople,
      availableSpots,
      occupancyRate,
      isFull: currentParticipants >= trip.maxPeople,
      daysUntilTrip,
      duration,
      budget: trip.budget,
      transport: trip.transport,
      category: trip.category,
      fromDate: trip.fromDate,
      toDate: trip.toDate,
      createdAt: trip.createdAt
    };

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Error fetching trip statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trip statistics'
    });
  }
});

// Add this route to get trip details by ID
router.get('/:tripId', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    console.log(`Fetching trip details for ID: ${tripId}`);
    
    // Find the trip by ID
    const trip = await Trip.findById(tripId)
      .populate('createdBy', 'fullName email avatar')
      .exec();
    
    if (!trip) {
      console.log(`Trip with ID ${tripId} not found`);
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    // Find participants who have joined this trip
    const joinedTrips = await JoinedTrip.find({ tripId: tripId })
      .populate('userId', 'fullName email avatar')
      .exec();
    
    // Extract participant information
    const participants = joinedTrips.map(joinedTrip => ({
      id: joinedTrip.userId._id,
      name: joinedTrip.userId.fullName,
      email: joinedTrip.userId.email,
      avatar: joinedTrip.userId.avatar || "/assets/images/default-avatar.webp",
      joinedAt: joinedTrip.joinedAt
    }));
    
    // Format the response
    const tripDetails = {
      id: trip._id,
      destination: trip.destination,
      departure: trip.departure,
      fromDate: trip.fromDate,
      toDate: trip.toDate,
      description: trip.description,
      coverImage: trip.coverImage,
      budget: trip.budget,
      transport: trip.transport,
      category: trip.category,
      maxPeople: trip.maxPeople,
      createdAt: trip.createdAt,
      organizer: trip.createdBy.fullName,
      organizerId: trip.createdBy._id,
      organizerEmail: trip.createdBy.email,
      organizerAvatar: trip.createdBy.avatar || "/assets/images/default-avatar.webp",
      joinedMembers: participants
    };
    
    res.json({
      success: true,
      trip: tripDetails
    });
  } catch (error) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trip details',
      details: error.message
    });
  }
});

module.exports = { router, setSocketIO };
