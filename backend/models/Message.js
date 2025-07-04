// filepath: travel-app/backend/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  tripId: String,
  userId: String,
  userName: String,
  userAvatar: String,
  googleAccountName: String, // Google account name of the message sender
  message: String,
  timestamp: String,
  type: String
});

module.exports = mongoose.model('Message', MessageSchema);