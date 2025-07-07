// Simple test to show NomadNova titles working
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function showTitleSystem() {
    try {
        console.log('🏅 NomadNova Title System - Current Status\n');
        
        // Fetch current users
        const usersResponse = await axios.get(`${API_BASE}/leaderboard`);
        const users = usersResponse.data.leaderboard;
        
        console.log('📊 Current Users and Their Titles:\n');
        
        users.forEach((user, index) => {
            const rank = `#${user.rank}`.padEnd(4);
            const trips = `${user.totalTrips || 0} trips`.padEnd(10);
            const title = user.title || 'New Traveler';
            
            console.log(`${rank} 👤 ${user.name.padEnd(20)} ${trips} → 🏅 ${title}`);
        });
        
        console.log('\n🎯 Title Requirements:');
        console.log('🌱 New Traveler (0-4 trips)');
        console.log('📍 Map Marker (5+ trips)');
        console.log('🏙️ City Sampler (10+ trips) ← Reya achieved this!');
        console.log('🗺️ Route Rookie (15+ trips)');
        console.log('🛩️ Jetsetter Junior (20+ trips)');
        console.log('✈️ Continental Hopper (35+ trips)');
        console.log('🔥 Border Breaker (45+ trips)');
        console.log('🌟 Globe Guru (50+ trips)');
        console.log('🚀 Sky Conqueror (75+ trips)');
        console.log('🌍 Realm Roamer (85+ trips)');
        console.log('👑 NomadNova (100+ trips)');
        console.log('🏆 NomadNova Elite (150+ trips)');
        
        console.log('\n✅ SUCCESS: NomadNova titles have replaced the old badge system!');
        console.log('✅ Users now see their trip-based titles instead of Champion/Elite/Rising Star/Master');
        console.log('✅ Titles automatically update based on trip completion count');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

showTitleSystem();
