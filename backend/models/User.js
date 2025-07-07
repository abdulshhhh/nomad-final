const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:false},
    phone:{type:String}, // Phone number for contact
    googleId:{type:String},
    googleAccountName:{type:String}, // Google account name for verification
    avatar:{type:String},
    createdAt:{type:Date,default:Date.now},

    // 🏆 DYNAMIC LEADERBOARD SYSTEM
    coins: {
        type: Number,
        default: 0
    },
    tripsHosted: {
        type: Number,
        default: 0
    },
    tripsJoined: {
        type: Number,
        default: 0
    },
    totalTrips: {
        type: Number,
        default: 0
    },
    countries: { type: [String], default: [] }, // Array of unique country names
    countriesCount: { type: Number, default: 0 }, // Count of unique countries
    achievements: [{
        type: {
            type: String,
            enum: ['first_trip', 'social_butterfly', 'explorer', 'host_master', 'coin_collector']
        },
        title: String,
        description: String,
        earnedAt: {
            type: Date,
            default: Date.now
        },
        coins: Number
    }],
    level: {
        type: Number,
        default: 1
    },
    experience: {
        type: Number,
        default: 0
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    // 🏅 NOMADNOVA TITLE SYSTEM
    title: {
        type: String,
        default: 'New Traveler'
    }
});

// Calculate user level based on coins
userSchema.virtual('calculatedLevel').get(function() {
    return Math.floor(this.coins / 50) + 1; // Level up every 50 coins
});

// Calculate progress to next level
userSchema.virtual('levelProgress').get(function() {
    const coinsForCurrentLevel = (this.calculatedLevel - 1) * 50;
    const coinsForNextLevel = this.calculatedLevel * 50;
    const progress = this.coins - coinsForCurrentLevel;
    const total = coinsForNextLevel - coinsForCurrentLevel;
    return { progress, total, percentage: Math.round((progress / total) * 100) };
});

// 🏅 CALCULATE NOMADNOVA TITLE BASED ON TOTAL TRIPS
userSchema.virtual('calculatedTitle').get(function() {
    const trips = this.totalTrips || 0;

    if (trips >= 150) return 'NomadNova Elite';
    if (trips >= 100) return 'NomadNova';
    if (trips >= 85) return 'Realm Roamer';
    if (trips >= 75) return 'Sky Conqueror';
    if (trips >= 50) return 'Globe Guru';
    if (trips >= 45) return 'Border Breaker';
    if (trips >= 35) return 'Continental Hopper';
    if (trips >= 20) return 'Jetsetter Junior';
    if (trips >= 15) return 'Route Rookie';
    if (trips >= 10) return 'City Sampler';
    if (trips >= 5) return 'Map Marker';

    return 'New Traveler';
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User',userSchema);
