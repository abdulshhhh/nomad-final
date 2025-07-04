const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  destination:     { type: String, required: true },
  departure:       { type: String, required: true },
  fromDate:        { type: Date,   required: true },
  toDate:          { type: Date,   required: true },
  transport:       { type: String, enum: ['Flight','Train','Bus','Car','Cruise','Multiple'], required: true },
  budget: {
    amount:        { type: Number, required: true },
    currency:      { type: String, enum: ['USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','INR','SGD'], required: true }
  },
  numberOfPeople:  { type: Number, min: 1, required: true },
  maxPeople:       { type: Number, min: 1, required: true },
  genderPreference:{ type: String, enum: ['anyone','menOnly','womenOnly'], default: 'anyone' },
  category:        { type: String, enum: ['Adventure','Beach','City','Cultural','Mountain','Road Trip'], required: true },
  description:     { type: String },
  coverImage:      { type: String }, // store a URL or base64 string
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  googleAccountName: { type: String }, // Google account name of the trip creator
  createdAt:       { type: Date, default: Date.now },

  // 🚀 REAL-TIME TRIP STATUS SYSTEM
  status:          { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  completedAt:     { type: Date }, // When trip was automatically completed
  autoCompleted:   { type: Boolean, default: false } // Whether trip was auto-completed by system
});

// 🚀 VIRTUAL PROPERTIES FOR REAL-TIME STATUS CALCULATION
tripSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  const fromDate = new Date(this.fromDate);
  const toDate = new Date(this.toDate);

  if (this.status === 'cancelled') return 'cancelled';
  if (now > toDate) return 'completed';
  if (now >= fromDate && now <= toDate) return 'ongoing';
  return 'upcoming';
});

tripSchema.virtual('isExpired').get(function() {
  const now = new Date();
  const toDate = new Date(this.toDate);
  return now > toDate;
});

tripSchema.virtual('daysUntilStart').get(function() {
  const now = new Date();
  const fromDate = new Date(this.fromDate);
  return Math.ceil((fromDate - now) / (1000 * 60 * 60 * 24));
});

tripSchema.virtual('daysUntilEnd').get(function() {
  const now = new Date();
  const toDate = new Date(this.toDate);
  return Math.ceil((toDate - now) / (1000 * 60 * 60 * 24));
});

tripSchema.virtual('tripDuration').get(function() {
  const fromDate = new Date(this.fromDate);
  const toDate = new Date(this.toDate);
  return Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Trip', tripSchema);
