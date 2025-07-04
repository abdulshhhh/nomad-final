const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🏆 GET DYNAMIC LEADERBOARD (TOP 10 ONLY)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({})
            .select('fullName email avatar coins tripsHosted tripsJoined totalTrips level experience lastActive')
            .sort({ coins: -1, tripsHosted: -1, tripsJoined: -1 })
            .limit(10);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            id: user._id,
            name: user.fullName,
            email: user.email,
            avatar: user.avatar,
            coins: user.coins,
            tripsHosted: user.tripsHosted,
            tripsJoined: user.tripsJoined,
            totalTrips: user.totalTrips,
            level: user.calculatedLevel,
            experience: user.experience,
            lastActive: user.lastActive
        }));

        res.json({
            success: true,
            leaderboard,
            totalUsers: users.length
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard'
        });
    }
});

// 🪙 ADD COINS TO USER
router.post('/add-coins', async (req, res) => {
    try {
        const { userId, coins, reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Add coins
        user.coins += coins;
        user.experience += coins;
        user.lastActive = new Date();

        // Update level
        user.level = user.calculatedLevel;

        // Check for achievements
        const newAchievements = [];

        // First Trip Achievement
        if (user.totalTrips === 1 && !user.achievements.some(a => a.type === 'first_trip')) {
            newAchievements.push({
                type: 'first_trip',
                title: '🎉 First Adventure',
                description: 'Completed your first trip!',
                coins: 10
            });
            user.coins += 10;
        }

        // Social Butterfly Achievement (5 trips joined)
        if (user.tripsJoined >= 5 && !user.achievements.some(a => a.type === 'social_butterfly')) {
            newAchievements.push({
                type: 'social_butterfly',
                title: '🦋 Social Butterfly',
                description: 'Joined 5 trips!',
                coins: 25
            });
            user.coins += 25;
        }

        // Host Master Achievement (3 trips hosted)
        if (user.tripsHosted >= 3 && !user.achievements.some(a => a.type === 'host_master')) {
            newAchievements.push({
                type: 'host_master',
                title: '👑 Host Master',
                description: 'Hosted 3 trips!',
                coins: 30
            });
            user.coins += 30;
        }

        // Coin Collector Achievement (100 coins)
        if (user.coins >= 100 && !user.achievements.some(a => a.type === 'coin_collector')) {
            newAchievements.push({
                type: 'coin_collector',
                title: '💰 Coin Collector',
                description: 'Earned 100 coins!',
                coins: 50
            });
            user.coins += 50;
        }

        // Add new achievements
        user.achievements.push(...newAchievements);

        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                coins: user.coins,
                level: user.calculatedLevel,
                levelProgress: user.levelProgress,
                newAchievements
            },
            message: `Added ${coins} coins for ${reason}`
        });
    } catch (error) {
        console.error('Error adding coins:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add coins'
        });
    }
});

// 🎯 UPDATE TRIP STATS
router.post('/update-trip-stats', async (req, res) => {
    try {
        const { userId, action, tripId, tripDestination } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let coinChange = 0;
        let message = '';
        let countryAdded = false;

        // Extract country from destination (assuming format like "Paris, France")
        let country = '';
        if (tripDestination) {
            const parts = tripDestination.split(',');
            if (parts.length > 1) {
                country = parts[parts.length - 1].trim();
            } else {
                country = tripDestination.trim(); // Use full destination if no comma
            }
        }

        // Check if this is a new country for the user
        if (country && !user.countries.includes(country)) {
            user.countries.push(country);
            user.countriesCount = user.countries.length;
            countryAdded = true;
        }

        if (action === 'host') {
            user.tripsHosted += 1;
            user.totalTrips += 1;
            user.coins += 5;
            user.experience += 5;
            coinChange = 5;
            message = tripDestination 
                ? `Earned 5 coins for hosting a trip to ${tripDestination}!` 
                : 'Earned 5 coins for hosting a trip!';
            
            // Add bonus for new country
            if (countryAdded) {
                user.coins += 3;
                user.experience += 3;
                coinChange += 3;
                message += ` +3 bonus coins for new country (${country})!`;
            }
        } else if (action === 'join') {
            user.tripsJoined += 1;
            user.totalTrips += 1;
            user.coins += 5;
            user.experience += 5;
            coinChange = 5;
            message = tripDestination 
                ? `Earned 5 coins for joining a trip to ${tripDestination}!` 
                : 'Earned 5 coins for joining a trip!';
            
            // Add bonus for new country
            if (countryAdded) {
                user.coins += 3;
                user.experience += 3;
                coinChange += 3;
                message += ` +3 bonus coins for new country (${country})!`;
            }
        } else if (action === 'abandon' || action === 'abandon_participant') {
            // For abandonment, we don't remove countries from the list
            // as the user has still "experienced" that country
            
            if (action === 'abandon') {
                user.tripsHosted = Math.max(0, user.tripsHosted - 1);
            } else {
                user.tripsJoined = Math.max(0, user.tripsJoined - 1);
            }
            
            user.totalTrips = Math.max(0, user.totalTrips - 1);
            user.coins = Math.max(0, user.coins - 5);
            user.experience = Math.max(0, user.experience - 5);
            coinChange = -5;
            message = tripDestination 
                ? `Lost 5 coins for ${action === 'abandon' ? 'abandoning' : 'leaving'} trip to ${tripDestination}` 
                : `Lost 5 coins for ${action === 'abandon' ? 'abandoning' : 'leaving'} a trip`;
        }

        user.level = user.calculatedLevel;
        user.lastActive = new Date();

        await user.save();

        // Emit more detailed leaderboard update
        if (req.io) {
            req.io.emit('leaderboardUpdate', {
                userId: user._id,
                action: action,
                coins: coinChange,
                message: message,
                penalty: action.includes('abandon'),
                tripId: tripId,
                tripDestination: tripDestination,
                countryAdded: countryAdded ? country : null,
                userStats: {
                    tripsHosted: user.tripsHosted,
                    tripsJoined: user.tripsJoined,
                    totalTrips: user.totalTrips,
                    countries: user.countries,
                    countriesCount: user.countriesCount,
                    coins: user.coins,
                    level: user.calculatedLevel,
                    levelProgress: user.levelProgress
                }
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                coins: user.coins,
                tripsHosted: user.tripsHosted,
                tripsJoined: user.tripsJoined,
                totalTrips: user.totalTrips,
                countries: user.countries,
                countriesCount: user.countriesCount,
                level: user.calculatedLevel,
                levelProgress: user.levelProgress
            },
            message: `Updated stats for ${action}ing trip`,
            countryAdded: countryAdded ? country : null,
            penalty: action.includes('abandon') ? -5 : (action === 'host' || action === 'join' ? 5 : 0)
        });
    } catch (error) {
        console.error('Error updating trip stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update trip stats'
        });
    }
});

// 👤 GET USER PROFILE WITH COMPREHENSIVE DYNAMIC STATS
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find user with all profile data
        const user = await User.findById(userId)
            .select('fullName email avatar coins tripsHosted tripsJoined totalTrips level experience lastActive achievements');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Get user's rank in leaderboard with proper tie-breaking
        const usersAbove = await User.countDocuments({
            $or: [
                { coins: { $gt: user.coins } },
                {
                    coins: user.coins,
                    tripsHosted: { $gt: user.tripsHosted }
                },
                {
                    coins: user.coins,
                    tripsHosted: user.tripsHosted,
                    tripsJoined: { $gt: user.tripsJoined }
                }
            ]
        });

        const rank = usersAbove + 1;

        // Calculate level progress
        const currentLevelCoins = (user.calculatedLevel - 1) * 50;
        const nextLevelCoins = user.calculatedLevel * 50;
        const levelProgress = ((user.coins - currentLevelCoins) / (nextLevelCoins - currentLevelCoins)) * 100;

        // 🌍 GET DYNAMIC TRAVEL STATS FROM DATABASE COLLECTIONS
        const Trip = require('../models/Trip');
        const JoinedTrip = require('../models/JoinedTrip');
        const Notification = require('../models/Notification');

        // Get unique countries and cities from user's trips
        const hostedTrips = await Trip.find({ createdBy: userId }).select('destination category');
        const joinedTripRecords = await JoinedTrip.find({ userId: userId });
        const joinedTripIds = joinedTripRecords.map(jt => jt.tripId);
        const joinedTrips = await Trip.find({ _id: { $in: joinedTripIds } }).select('destination category');

        // Combine all trips for comprehensive stats
        const allUserTrips = [...hostedTrips, ...joinedTrips];

        // Extract unique countries and cities
        const uniqueDestinations = [...new Set(allUserTrips.map(trip => trip.destination))];
        const countries = [...new Set(uniqueDestinations.map(dest => {
            // Extract country from destination (assuming format: "City, Country")
            const parts = dest.split(',');
            return parts.length > 1 ? parts[parts.length - 1].trim() : dest;
        }))];

        const cities = [...new Set(uniqueDestinations.map(dest => {
            // Extract city from destination
            const parts = dest.split(',');
            return parts[0].trim();
        }))];

        // Get travel categories from trips
        const travelCategories = [...new Set(allUserTrips.map(trip => trip.category).filter(Boolean))];

        // Get notification count for activity level
        const notificationCount = await Notification.countDocuments({ userId: userId });

        // Calculate connections (users who joined same trips or whose trips user joined)
        const connectionUserIds = new Set();

        // Users who joined trips hosted by this user
        const hostedTripIds = hostedTrips.map(trip => trip._id);
        const joinersOfHostedTrips = await JoinedTrip.find({ tripId: { $in: hostedTripIds } });
        joinersOfHostedTrips.forEach(jt => connectionUserIds.add(jt.userId));

        // Users who hosted trips that this user joined
        const hostsOfJoinedTrips = await Trip.find({ _id: { $in: joinedTripIds } }).select('createdBy');
        hostsOfJoinedTrips.forEach(trip => connectionUserIds.add(trip.createdBy.toString()));

        // Remove self from connections
        connectionUserIds.delete(userId);
        const connections = connectionUserIds.size;

        // Mock data for photos/videos (in real app, you'd have a Media collection)
        const mockPhotos = Math.min(Math.max(allUserTrips.length * 8, 12), 200); // 8 photos per trip, min 12, max 200
        const mockVideos = Math.min(Math.max(allUserTrips.length * 2, 3), 50); // 2 videos per trip, min 3, max 50

        const profileData = {
            id: user._id,
            name: user.fullName,
            email: user.email,
            avatar: user.avatar,
            coins: user.coins,
            tripsHosted: user.tripsHosted,
            tripsJoined: user.tripsJoined,
            totalTrips: user.totalTrips,
            level: user.calculatedLevel,
            experience: user.experience,
            lastActive: user.lastActive,
            achievements: user.achievements || [],
            rank: rank,
            levelProgress: Math.round(levelProgress),

            // 🌍 DYNAMIC TRAVEL STATISTICS
            totalCountries: countries.length,
            totalCities: cities.length,
            travelCategories: travelCategories.length > 0 ? travelCategories : ["Adventure", "Culture"],
            connections: connections,
            followers: Math.max(connections - 10, 0), // Followers slightly less than connections
            following: Math.max(connections - 5, 0),  // Following slightly less than connections

            // 📸 DYNAMIC MEDIA STATISTICS
            totalPhotos: mockPhotos,
            totalVideos: mockVideos,

            // 📊 ACTIVITY STATISTICS
            notificationCount: notificationCount,
            responseRate: user.totalTrips > 0 ? "95%" : "New User",
            responseTime: user.totalTrips > 2 ? "Within 2 hours" : "Within 1 day",

            // 🏆 PERFORMANCE METRICS
            rating: user.totalTrips > 0 ? Math.min(4.2 + (user.totalTrips * 0.1), 5.0) : 4.0,
            verified: user.totalTrips >= 3 || user.coins >= 50
        };

        res.json({ success: true, profile: profileData });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

// 📝 GET USER'S POSTED TRIPS (TRIPS THEY CREATED/HOSTED)
router.get('/user-posted-trips/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const Trip = require('../models/Trip');

        // Find all trips created by this user
        const postedTrips = await Trip.find({ createdBy: userId })
            .populate('createdBy', 'fullName email avatar')
            .sort({ createdAt: -1 });

        // Transform trips data for frontend consumption
        const transformedTrips = postedTrips.map(trip => {
            const fromDate = new Date(trip.fromDate);
            const toDate = new Date(trip.toDate);
            const now = new Date();

            // Calculate duration
            const diffTime = Math.abs(toDate - fromDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const duration = `${diffDays} day${diffDays > 1 ? 's' : ''}`;

            // Determine status
            let status = 'upcoming';
            if (now >= fromDate && now <= toDate) {
                status = 'ongoing';
            } else if (now > toDate) {
                status = 'completed';
            }

            // Format date range
            const formatDate = (date) => {
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            };
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
                price: `${trip.budget.currency} ${trip.budget.amount.toLocaleString()}`,
                image: trip.coverImage || '/assets/images/default-trip.jpg',
                organizer: trip.createdBy?.fullName || 'You',
                organizerId: trip.createdBy?._id,
                maxPeople: trip.maxPeople,
                numberOfPeople: trip.numberOfPeople,
                category: trip.category,
                transport: trip.transport,
                genderPreference: trip.genderPreference,
                description: trip.description,
                createdAt: trip.createdAt
            };
        });

        res.json({
            success: true,
            trips: transformedTrips,
            count: transformedTrips.length
        });

    } catch (error) {
        console.error('Error fetching user posted trips:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch posted trips',
            details: error.message
        });
    }
});

// 🎒 GET USER'S JOINED TRIPS (TRIPS THEY PARTICIPATED IN)
router.get('/user-joined-trips/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const Trip = require('../models/Trip');
        const JoinedTrip = require('../models/JoinedTrip');

        // Find all trips this user has joined
        const joinedTripRecords = await JoinedTrip.find({ userId: userId });
        const joinedTripIds = joinedTripRecords.map(record => record.tripId);

        // Get full trip details for joined trips
        const joinedTrips = await Trip.find({ _id: { $in: joinedTripIds } })
            .populate('createdBy', 'fullName email avatar')
            .sort({ createdAt: -1 });

        // Transform trips data for frontend consumption
        const transformedTrips = joinedTrips.map(trip => {
            const fromDate = new Date(trip.fromDate);
            const toDate = new Date(trip.toDate);
            const now = new Date();

            // Calculate duration
            const diffTime = Math.abs(toDate - fromDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const duration = `${diffDays} day${diffDays > 1 ? 's' : ''}`;

            // Determine status
            let status = 'upcoming';
            if (now >= fromDate && now <= toDate) {
                status = 'ongoing';
            } else if (now > toDate) {
                status = 'completed';
            }

            // Format date range
            const formatDate = (date) => {
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            };
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
                price: `${trip.budget.currency} ${trip.budget.amount.toLocaleString()}`,
                image: trip.coverImage || '/assets/images/default-trip.jpg',
                organizer: trip.createdBy?.fullName || 'Unknown',
                organizerId: trip.createdBy?._id,
                maxPeople: trip.maxPeople,
                numberOfPeople: trip.numberOfPeople,
                category: trip.category,
                transport: trip.transport,
                genderPreference: trip.genderPreference,
                description: trip.description,
                createdAt: trip.createdAt
            };
        });

        res.json({
            success: true,
            trips: transformedTrips,
            count: transformedTrips.length
        });

    } catch (error) {
        console.error('Error fetching user joined trips:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch joined trips',
            details: error.message
        });
    }
});

// 📊 GET COMPREHENSIVE TRIP DETAILS WITH REAL-TIME DATA
router.get('/trip-details/:tripId', async (req, res) => {
    try {
        const { tripId } = req.params;
        const Trip = require('../models/Trip');
        const JoinedTrip = require('../models/JoinedTrip');

        // Get trip details with creator info
        const trip = await Trip.findById(tripId)
            .populate('createdBy', 'fullName email avatar coins tripsHosted totalTrips level');

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        // Get all joined trip records for this trip
        const joinedTripRecords = await JoinedTrip.find({ tripId: tripId })
            .populate('userId', 'fullName email avatar coins tripsHosted tripsJoined totalTrips level createdAt');

        // Calculate trip statistics
        const currentParticipants = joinedTripRecords.length;
        const spotsRemaining = trip.maxPeople - currentParticipants;

        // Calculate duration
        const fromDate = new Date(trip.fromDate);
        const toDate = new Date(trip.toDate);
        const diffTime = Math.abs(toDate - fromDate);
        const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate trip rating based on participants' experience levels
        let averageRating = 4.0; // Base rating
        if (currentParticipants > 0) {
            const totalExperience = joinedTripRecords.reduce((sum, record) => {
                return sum + (record.userId.totalTrips || 0);
            }, 0);
            const avgExperience = totalExperience / currentParticipants;
            // Higher experience participants tend to rate trips better
            averageRating = Math.min(4.0 + (avgExperience * 0.1), 5.0);
        }

        // Calculate organizer rating based on their hosting experience
        const organizerRating = trip.createdBy ?
            Math.min(4.2 + (trip.createdBy.tripsHosted * 0.1), 5.0) : 4.0;

        // Prepare members list with real data
        const members = [
            // Trip organizer
            {
                id: trip.createdBy._id,
                name: trip.createdBy.fullName,
                email: trip.createdBy.email,
                avatar: trip.createdBy.avatar || '/assets/images/default-avatar.webp',
                role: 'organizer',
                joinedDate: trip.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                coins: trip.createdBy.coins,
                level: trip.createdBy.level,
                tripsHosted: trip.createdBy.tripsHosted,
                totalTrips: trip.createdBy.totalTrips,
                rating: organizerRating,
                verified: trip.createdBy.totalTrips >= 3 || trip.createdBy.coins >= 50
            },
            // Joined members
            ...joinedTripRecords.map(record => ({
                id: record.userId._id,
                name: record.userId.fullName,
                email: record.userId.email,
                avatar: record.userId.avatar || '/assets/images/default-avatar.webp',
                role: 'member',
                joinedDate: record.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                coins: record.userId.coins,
                level: record.userId.level,
                tripsHosted: record.userId.tripsHosted,
                tripsJoined: record.userId.tripsJoined,
                totalTrips: record.userId.totalTrips,
                rating: Math.min(4.0 + (record.userId.totalTrips * 0.1), 5.0),
                verified: record.userId.totalTrips >= 3 || record.userId.coins >= 50
            }))
        ];

        // Calculate cost breakdown based on trip details
        const baseBudget = trip.budget.amount;
        const perPersonCost = Math.round(baseBudget / trip.maxPeople);

        const costBreakdown = {
            basePrice: {
                amount: perPersonCost,
                currency: trip.budget.currency,
                description: 'Per person base cost'
            },
            accommodation: {
                amount: Math.round(perPersonCost * 0.4), // 40% of budget typically for accommodation
                currency: trip.budget.currency,
                description: 'Shared accommodation costs'
            },
            transport: {
                amount: Math.round(perPersonCost * 0.3), // 30% for transport
                currency: trip.budget.currency,
                description: `${trip.transport} transportation`
            },
            meals: {
                amount: Math.round(perPersonCost * 0.2), // 20% for meals
                currency: trip.budget.currency,
                description: 'Meals and dining'
            },
            activities: {
                amount: Math.round(perPersonCost * 0.1), // 10% for activities
                currency: trip.budget.currency,
                description: 'Activities and experiences'
            },
            total: {
                amount: perPersonCost,
                currency: trip.budget.currency,
                description: 'Total per person'
            }
        };

        // Trip statistics
        const statistics = {
            participantsJoined: currentParticipants,
            spotsRemaining: spotsRemaining,
            durationDays: durationDays,
            averageRating: Math.round(averageRating * 10) / 10,
            organizerRating: Math.round(organizerRating * 10) / 10,
            totalBudget: trip.budget.amount,
            perPersonCost: perPersonCost,
            currency: trip.budget.currency,
            category: trip.category,
            transport: trip.transport,
            genderPreference: trip.genderPreference
        };

        res.json({
            success: true,
            trip: {
                id: trip._id,
                destination: trip.destination,
                departure: trip.departure,
                fromDate: trip.fromDate,
                toDate: trip.toDate,
                description: trip.description,
                coverImage: trip.coverImage,
                maxPeople: trip.maxPeople,
                currentParticipants: currentParticipants,
                createdAt: trip.createdAt
            },
            statistics: statistics,
            members: members,
            costBreakdown: costBreakdown
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

module.exports = router;




