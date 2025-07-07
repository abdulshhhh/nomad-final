// Quick test script to demonstrate NomadNova title system
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testTitleSystem() {
    try {
        console.log('🧪 Testing NomadNova Title System...\n');
        
        // 1. Fetch current users
        console.log('📊 Fetching current users...');
        const usersResponse = await axios.get(`${API_BASE}/leaderboard`);
        const users = usersResponse.data.leaderboard;
        
        console.log(`Found ${users.length} users:\n`);
        users.forEach(user => {
            console.log(`👤 ${user.name}: ${user.totalTrips || 0} trips - "${user.title || 'New Traveler'}"`);
        });
        
        if (users.length === 0) {
            console.log('❌ No users found to test with');
            return;
        }
        
        // 2. Test title progression with first user
        const testUser = users[0];
        console.log(`\n🎯 Testing title progression with: ${testUser.name}\n`);
        
        // Test different trip counts to show title progression
        const testCounts = [5, 10, 15, 20, 35, 50, 75, 100, 150];
        
        for (const tripCount of testCounts) {
            console.log(`🔄 Setting ${testUser.name} to ${tripCount} trips...`);
            
            const updateResponse = await axios.post(`${API_BASE}/leaderboard/test-update-trips`, {
                userId: testUser._id,
                totalTrips: tripCount
            });
            
            if (updateResponse.data.success) {
                const result = updateResponse.data.user;
                console.log(`✅ ${result.name}: ${result.oldTitle} → ${result.newTitle} ${result.titleChanged ? '🎉' : '📝'}`);
            } else {
                console.log(`❌ Failed to update: ${updateResponse.data.message}`);
            }
            
            // Small delay to see progression
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\n🎉 Title system test completed!');
        console.log('\n📋 NomadNova Title Hierarchy:');
        console.log('🌱 New Traveler (0-4 trips)');
        console.log('📍 Map Marker (5 trips)');
        console.log('🏙️ City Sampler (10 trips)');
        console.log('🗺️ Route Rookie (15 trips)');
        console.log('🛩️ Jetsetter Junior (20 trips)');
        console.log('✈️ Continental Hopper (35 trips)');
        console.log('🔥 Border Breaker (45 trips)');
        console.log('🌟 Globe Guru (50 trips)');
        console.log('🚀 Sky Conqueror (75 trips)');
        console.log('🌍 Realm Roamer (85 trips)');
        console.log('👑 NomadNova (100 trips)');
        console.log('🏆 NomadNova Elite (150 trips)');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

// Run the test
testTitleSystem();
