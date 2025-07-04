// seedTrips.js
// Run this script with: node seedTrips.js

const mongoose = require('mongoose');
const Trip = require('./models/Trip');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const createdBy = '6858461917508c30255e45ca'; // Abdul's user ObjectId

const trips = [
  {
    title: 'Tokyo Explorer',
    destination: 'Tokyo, Japan',
    fromDate: '2025-04-10',
    toDate: '2025-04-15',
    maxPeople: 10,
    numberOfPeople: 1,
    description: 'Experience the vibrant city of Tokyo with fellow travelers.',
    coverImage: '/assets/images/Tokyo.jpeg',
    category: 'Adventure',
    genderPreference: 'anyone',
    budget: { amount: 1200, currency: 'USD' },
    transport: 'Flight',
    departure: 'San Francisco, CA',
    createdBy
  },
  {
    title: 'Swiss Alps Hiking',
    destination: 'Zermatt, Switzerland',
    fromDate: '2025-07-01',
    toDate: '2025-07-10',
    maxPeople: 8,
    numberOfPeople: 1,
    description: 'Hike the beautiful Swiss Alps and enjoy breathtaking views.',
    coverImage: '/assets/images/swissmount.jpeg',
    category: 'Mountain', // changed from 'Nature' to 'Mountain'
    genderPreference: 'anyone',
    budget: { amount: 1500, currency: 'USD' },
    transport: 'Train',
    departure: 'Zurich, Switzerland',
    createdBy
  },
  {
    title: 'Bali Beach Retreat',
    destination: 'Bali, Indonesia',
    fromDate: '2025-08-15',
    toDate: '2025-08-22',
    maxPeople: 12,
    numberOfPeople: 1,
    description: 'Relax on the beaches of Bali and explore local culture.',
    coverImage: '/assets/images/BaliBeach.jpeg',
    category: 'Beach', // changed from 'Relaxation' to 'Beach'
    genderPreference: 'anyone',
    budget: { amount: 900, currency: 'USD' },
    transport: 'Flight',
    departure: 'Los Angeles, CA',
    createdBy
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await Trip.deleteMany({});
    const result = await Trip.insertMany(trips);
    console.log('Seeded trips:', result);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
