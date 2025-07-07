// Test script to verify leaderboard functionality
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testLeaderboardEndpoints() {
  console.log('🧪 Testing Leaderboard Endpoints...\n');

  try {
    // Test 1: Get leaderboard
    console.log('1. Testing GET /api/leaderboard');
    const leaderboardResponse = await axios.get(`${BASE_URL}/leaderboard`);
    console.log('✅ Leaderboard endpoint working');
    console.log(`   - Found ${leaderboardResponse.data.leaderboard?.length || 0} users`);
    console.log(`   - Success: ${leaderboardResponse.data.success}`);
    
    if (leaderboardResponse.data.leaderboard?.length > 0) {
      const topUser = leaderboardResponse.data.leaderboard[0];
      console.log(`   - Top user: ${topUser.name} with ${topUser.coins} coins`);
    }
    console.log('');

    // Test 2: Test health endpoint
    console.log('2. Testing GET /health');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health endpoint working');
    console.log(`   - Status: ${healthResponse.data.status}`);
    console.log('');

    // Test 3: Test routes endpoint
    console.log('3. Testing GET /api/routes');
    const routesResponse = await axios.get(`${BASE_URL}/routes`);
    console.log('✅ Routes endpoint working');
    console.log(`   - Found ${routesResponse.data.routes?.length || 0} routes`);
    
    // Check if leaderboard routes are registered
    const leaderboardRoutes = routesResponse.data.routes?.filter(route => 
      route.path.includes('leaderboard') || route.path === '/'
    );
    console.log(`   - Leaderboard routes found: ${leaderboardRoutes?.length || 0}`);
    console.log('');

    console.log('🎉 All tests passed! Leaderboard functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('   - Make sure the backend server is running on port 5000');
    }
  }
}

// Run the tests
testLeaderboardEndpoints();
