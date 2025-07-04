// 🚀 REAL-TIME TRIP AUTO-COMPLETION SERVICE
// Automatically completes trips when their end date is reached

const Trip = require('../models/Trip');
const User = require('../models/User');
const JoinedTrip = require('../models/JoinedTrip');

class TripAutoCompletionService {
  constructor(io) {
    this.io = io;
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = 60000; // Check every 1 minute (60 seconds)
  }

  // 🚀 START THE AUTO-COMPLETION SERVICE
  start() {
    if (this.isRunning) {
      console.log('🔄 Trip auto-completion service is already running');
      return;
    }

    console.log('🚀 Starting trip auto-completion service...');
    this.isRunning = true;
    
    // Run initial check
    this.checkAndCompleteTrips();
    
    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.checkAndCompleteTrips();
    }, this.checkInterval);

    console.log(`✅ Trip auto-completion service started (checking every ${this.checkInterval/1000} seconds)`);
  }

  // 🛑 STOP THE AUTO-COMPLETION SERVICE
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Trip auto-completion service is not running');
      return;
    }

    console.log('🛑 Stopping trip auto-completion service...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('✅ Trip auto-completion service stopped');
  }

  // 🔍 CHECK AND COMPLETE EXPIRED TRIPS
  async checkAndCompleteTrips() {
    try {
      const now = new Date();
      console.log(`🔍 Checking for expired trips at ${now.toISOString()}`);

      // Find all trips that should be completed (end date has passed)
      const expiredTrips = await Trip.find({
        toDate: { $lt: now }, // End date is less than current time
        status: { $in: ['upcoming', 'ongoing'] }, // Only active trips
        autoCompleted: { $ne: true } // Not already auto-completed
      }).populate('createdBy', 'fullName email');

      if (expiredTrips.length === 0) {
        console.log('✅ No trips to auto-complete');
        return;
      }

      console.log(`🎯 Found ${expiredTrips.length} trips to auto-complete`);

      for (const trip of expiredTrips) {
        await this.completeTrip(trip);
      }

    } catch (error) {
      console.error('❌ Error in trip auto-completion check:', error);
    }
  }

  // 🎯 COMPLETE A SINGLE TRIP
  async completeTrip(trip) {
    try {
      console.log(`🎯 Auto-completing trip: ${trip.destination} (ID: ${trip._id})`);

      // Update trip status
      trip.status = 'completed';
      trip.completedAt = new Date();
      trip.autoCompleted = true;
      await trip.save();

      // Get all participants
      const participants = await JoinedTrip.find({ tripId: trip._id })
        .populate('userId', 'fullName email');

      // 🏆 REWARD COMPLETION BONUS (+10 coins for organizer, +5 for participants)
      await this.rewardCompletionBonus(trip, participants);

      // 📱 SEND COMPLETION NOTIFICATIONS
      await this.sendCompletionNotifications(trip, participants);

      // 🔄 EMIT REAL-TIME UPDATES
      this.emitTripCompletionUpdates(trip, participants);

      console.log(`✅ Successfully auto-completed trip: ${trip.destination}`);

    } catch (error) {
      console.error(`❌ Error completing trip ${trip._id}:`, error);
    }
  }

  // 🏆 REWARD COMPLETION BONUS
  async rewardCompletionBonus(trip, participants) {
    try {
      // Reward trip organizer (+10 coins)
      const organizer = await User.findById(trip.createdBy._id);
      if (organizer) {
        organizer.coins += 10;
        organizer.experience += 10;
        organizer.level = organizer.calculatedLevel;
        organizer.lastActive = new Date();
        await organizer.save();
        
        console.log(`🏆 Rewarded organizer ${organizer.fullName} with 10 coins for trip completion`);
      }

      // Reward participants (+5 coins each)
      for (const participant of participants) {
        if (participant.userId) {
          const user = await User.findById(participant.userId._id);
          if (user) {
            user.coins += 5;
            user.experience += 5;
            user.level = user.calculatedLevel;
            user.lastActive = new Date();
            await user.save();
            
            console.log(`🏆 Rewarded participant ${user.fullName} with 5 coins for trip completion`);
          }
        }
      }

    } catch (error) {
      console.error('❌ Error rewarding completion bonus:', error);
    }
  }

  // 📱 SEND COMPLETION NOTIFICATIONS
  async sendCompletionNotifications(trip, participants) {
    try {
      const Notification = require('../models/Notification');

      // Create notification for organizer
      const organizerNotification = new Notification({
        userId: trip.createdBy._id,
        type: 'trip_completed',
        title: '🎉 Trip Completed!',
        message: `Your trip to ${trip.destination} has been automatically completed! You earned 10 bonus coins.`,
        tripDestination: trip.destination,
        metadata: {
          tripId: trip._id,
          completionBonus: 10,
          autoCompleted: true
        }
      });
      await organizerNotification.save();

      // Create notifications for participants
      for (const participant of participants) {
        if (participant.userId) {
          const participantNotification = new Notification({
            userId: participant.userId._id,
            type: 'trip_completed',
            title: '🎉 Trip Completed!',
            message: `The trip to ${trip.destination} has been completed! You earned 5 bonus coins.`,
            tripDestination: trip.destination,
            metadata: {
              tripId: trip._id,
              completionBonus: 5,
              autoCompleted: true
            }
          });
          await participantNotification.save();
        }
      }

      console.log(`📱 Sent completion notifications for trip: ${trip.destination}`);

    } catch (error) {
      console.error('❌ Error sending completion notifications:', error);
    }
  }

  // 🔄 EMIT REAL-TIME UPDATES
  emitTripCompletionUpdates(trip, participants) {
    try {
      if (!this.io) return;

      // Emit trip completion event
      this.io.emit('tripCompleted', {
        tripId: trip._id,
        destination: trip.destination,
        completedAt: trip.completedAt,
        autoCompleted: true,
        organizer: trip.createdBy.fullName,
        participantCount: participants.length
      });

      // Emit leaderboard updates for organizer
      this.io.emit('leaderboardUpdate', {
        userId: trip.createdBy._id,
        action: 'trip_completed',
        coins: 10,
        message: `Earned 10 coins for completing trip to ${trip.destination}!`,
        bonus: true
      });

      // Emit leaderboard updates for participants
      participants.forEach(participant => {
        if (participant.userId) {
          this.io.emit('leaderboardUpdate', {
            userId: participant.userId._id,
            action: 'trip_completed',
            coins: 5,
            message: `Earned 5 coins for completing trip to ${trip.destination}!`,
            bonus: true
          });
        }
      });

      // Emit notification updates
      this.io.emit('newNotification', {
        type: 'trip_completed',
        message: `Trip to ${trip.destination} has been completed!`,
        tripId: trip._id
      });

      console.log(`🔄 Emitted real-time updates for trip completion: ${trip.destination}`);

    } catch (error) {
      console.error('❌ Error emitting trip completion updates:', error);
    }
  }

  // 📊 GET SERVICE STATUS
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      lastCheck: new Date().toISOString()
    };
  }
}

module.exports = TripAutoCompletionService;
