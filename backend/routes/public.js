const express = require('express');
const router = express.Router();

// Get all destinations for public access
router.get('/destinations', async (req, res) => {
  try {
    const Destination = require('../models/Destination');
    const destinations = await Destination.find({}).sort({ createdAt: -1 }).limit(8);
    
    res.status(200).json({
      success: true,
      destinations
    });
  } catch (error) {
    console.error('Error fetching public destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destinations',
      error: error.message
    });
  }
});

module.exports = router;
