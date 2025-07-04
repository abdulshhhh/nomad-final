const mongoose = require('mongoose');

const JoinedTripSchema = new mongoose.Schema({
  userId: String,
  tripId: String,
  googleAccountName: String, // Google account name of the user who joined
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JoinedTrip', JoinedTripSchema);