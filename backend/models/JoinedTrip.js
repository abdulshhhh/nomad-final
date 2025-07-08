const mongoose = require('mongoose');

const JoinedTripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  googleAccountName: String, // Google account name of the user who joined
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JoinedTrip', JoinedTripSchema);