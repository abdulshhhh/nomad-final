// Test script to verify the enhanced profile API
const axios = require('axios');

async function testProfileAPI() {
    try {
        console.log('🧪 Testing Enhanced Profile API...');
        
        // Test with a sample user ID (you can replace this with an actual user ID from your database)
        const testUserId = '6858461917508c30255e45ca'; // Abdul's user ID from seedTrips.js
        
        const response = await axios.get(`http://localhost:5000/api/leaderboard/profile/${testUserId}`);
        
        if (response.data.success) {
            console.log('✅ Profile API working successfully!');
            console.log('\n📊 Dynamic Profile Data:');
            console.log('- Rank:', response.data.profile.rank);
            console.log('- Coins:', response.data.profile.coins);
            console.log('- Total Trips:', response.data.profile.totalTrips);
            console.log('- Trips Hosted:', response.data.profile.tripsHosted);
            console.log('- Trips Joined:', response.data.profile.tripsJoined);
            console.log('- Total Countries:', response.data.profile.totalCountries);
            console.log('- Total Cities:', response.data.profile.totalCities);
            console.log('- Connections:', response.data.profile.connections);
            console.log('- Total Photos:', response.data.profile.totalPhotos);
            console.log('- Total Videos:', response.data.profile.totalVideos);
            console.log('- Rating:', response.data.profile.rating);
            console.log('- Verified:', response.data.profile.verified);
            console.log('- Travel Categories:', response.data.profile.travelCategories);
            
            console.log('\n🎯 All dynamic content is now database-driven!');
        } else {
            console.log('❌ Profile API failed:', response.data.error);
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Backend server is not running. Please start it with: cd backend && npm start');
        } else {
            console.log('❌ Error testing profile API:', error.message);
        }
    }
}

testProfileAPI();
