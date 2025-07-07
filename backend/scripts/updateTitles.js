// 🏅 NOMADNOVA TITLE MIGRATION SCRIPT
// Updates all existing users with their appropriate titles based on totalTrips

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// 🏅 CALCULATE NOMADNOVA TITLE BASED ON TOTAL TRIPS
const calculateTitle = (totalTrips) => {
    const trips = totalTrips || 0;
    
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
};

// Main migration function
const updateAllUserTitles = async () => {
    try {
        console.log('🚀 Starting NomadNova title migration...');
        
        // Get all users
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users to update`);
        
        let updatedCount = 0;
        let titleChanges = {};
        
        for (const user of users) {
            const newTitle = calculateTitle(user.totalTrips);
            const oldTitle = user.title || 'New Traveler';
            
            if (newTitle !== oldTitle) {
                user.title = newTitle;
                await user.save();
                updatedCount++;
                
                // Track title changes for reporting
                if (!titleChanges[newTitle]) {
                    titleChanges[newTitle] = 0;
                }
                titleChanges[newTitle]++;
                
                console.log(`🏅 Updated ${user.fullName}: ${oldTitle} → ${newTitle} (${user.totalTrips} trips)`);
            } else {
                console.log(`✅ ${user.fullName}: Already has correct title "${newTitle}" (${user.totalTrips} trips)`);
            }
        }
        
        console.log('\n🎉 Migration completed!');
        console.log(`📊 Updated ${updatedCount} out of ${users.length} users`);
        console.log('\n📈 Title distribution:');
        
        // Show title distribution
        const allTitles = [
            'New Traveler', 'Map Marker', 'City Sampler', 'Route Rookie',
            'Jetsetter Junior', 'Continental Hopper', 'Border Breaker',
            'Globe Guru', 'Sky Conqueror', 'Realm Roamer', 'NomadNova', 'NomadNova Elite'
        ];
        
        for (const title of allTitles) {
            const count = await User.countDocuments({ title: title });
            if (count > 0) {
                console.log(`  ${title}: ${count} users`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Run the migration
const runMigration = async () => {
    await connectDB();
    await updateAllUserTitles();
};

// Execute if run directly
if (require.main === module) {
    runMigration();
}

module.exports = { updateAllUserTitles, calculateTitle };
