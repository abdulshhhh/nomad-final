const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String, // Changed to String to support development-user
    required: true
  },
  type: {
    type: String,
    enum: ['trip_posted', 'trip_joined', 'trip_abandoned', 'trip_left', 'participant_left', 'join_request', 'trip_reminder', 'trip_completed', 'success', 'error', 'info'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: false
  },
  tripDestination: {
    type: String,
    required: false
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
