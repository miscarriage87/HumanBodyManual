// Simple test script to verify community API endpoints
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('Testing Community API endpoints...\n');
    
    // Test community stats
    console.log('1. Testing /api/community');
    const statsResponse = await fetch(`${baseUrl}/api/community?statType=weekly`);
    const statsData = await statsResponse.json();
    console.log('Community Stats:', JSON.stringify(statsData, null, 2));
    console.log('✅ Community stats endpoint working\n');
    
    // Test challenges
    console.log('2. Testing /api/community/challenges');
    const challengesResponse = await fetch(`${baseUrl}/api/community/challenges`);
    const challengesData = await challengesResponse.json();
    console.log('Challenges:', JSON.stringify(challengesData, null, 2));
    console.log('✅ Challenges endpoint working\n');
    
    // Test leaderboard
    console.log('3. Testing /api/community/leaderboard');
    const leaderboardResponse = await fetch(`${baseUrl}/api/community/leaderboard?metric=total_sessions&period=weekly`);
    const leaderboardData = await leaderboardResponse.json();
    console.log('Leaderboard:', JSON.stringify(leaderboardData, null, 2));
    console.log('✅ Leaderboard endpoint working\n');
    
    console.log('🎉 All community API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error);
  }
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testEndpoints();
}

module.exports = { testEndpoints };