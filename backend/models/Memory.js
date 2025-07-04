const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  images: [{ type: String, required: true }], // Changed from imageUrl to images array
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  pinned: { type: Boolean, default: false },
  userId: { 
    type: String, 
    required: true,
    index: true // Add index for faster queries
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true }); // Add timestamps option

// Add a pre-save hook for debugging
memorySchema.pre('save', function(next) {
  console.log(`Saving memory with ID: ${this._id}, userId: ${this.userId}`);
  next();
});

module.exports = mongoose.model('Memory', memorySchema);
