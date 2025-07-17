// Debug script to test the progress tracker and achievement engine
console.log('Testing progress tracker and achievement engine...');

// Import the modules directly
const { ProgressTracker } = require('./test-impl/progress-tracker');
const { AchievementEngine } = require('./test-impl/achievement-engine');

async function runTests() {
  try {
    const userId = 'test-user-123';
    const exerciseData = {
      exerciseId: 'breathing-basics',
      bodyArea: 'nervensystem',
      durationMinutes: 15,
      difficultyLevel: 'Anfänger',
      sessionNotes: 'Great session!',
      mood: 'gut',
      energyLevel: 'hoch',
    };
    
    console.log('\nTesting ProgressTracker.recordCompletion...');
    const result = await ProgressTracker.recordCompletion(userId, exerciseData);
    console.log('Result:', result);
    
    console.log('\nTesting AchievementEngine.checkAchievements...');
    const achievements = await AchievementEngine.checkAchievements(userId, result);
    console.log('Achievements:', achievements);
    
    console.log('\nTesting ProgressTracker.getUserProgress...');
    const progress = await ProgressTracker.getUserProgress(userId);
    console.log('Progress:', progress);
    
    console.log('\nTesting ProgressTracker.getStreakData...');
    const streaks = await ProgressTracker.getStreakData(userId);
    console.log('Streaks:', streaks);
    
    console.log('\nTesting AchievementEngine.getUserAchievements...');
    const userAchievements = await AchievementEngine.getUserAchievements(userId);
    console.log('User Achievements:', userAchievements);
    
    console.log('\nTesting AchievementEngine.calculateProgress...');
    const achievementProgress = await AchievementEngine.calculateProgress(userId, 'ach-2');
    console.log('Achievement Progress:', achievementProgress);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

runTests();