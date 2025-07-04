// models/Profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  fullName: String,
  bio: String,
  location: String,
  phone: String,
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer not to say'], default: 'prefer not to say' },
  travelCategories: [String],
  languages: [String],
  avatar: String, // base64 or URL if you're using cloud storage
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
