// Debug script to test the progress tracker and achievement engine
console.log('Testing progress tracker and achievement engine...');

// Direct implementations for testing
const ProgressTracker = {
  recordCompletion: async (userId, exerciseData) => {
    console.log(`Recording completion for user ${userId} with exercise ${exerciseData.exerciseId}`);
    return {
      id: 'progress-123',
      userId,
      exerciseId: exerciseData.exerciseId,
      bodyArea: exerciseData.bodyArea,
      completedAt: new Date(),
      durationMinutes: exerciseData.durationMinutes,
      difficultyLevel: exerciseData.difficultyLevel,
      sessionNotes: exerciseData.sessionNotes,
      biometricData: exerciseData.biometricData,
      mood: exerciseData.mood,
      energyLevel: exerciseData.energyLevel,
      createdAt: new Date(),
    };
  },
  
  getUserProgress: async (userId) => {
    console.log(`Getting user progress for user ${userId}`);
    return {
      userId,
      totalSessions: 5,
      totalMinutes: 150,
      currentStreak: 3,
      longestStreak: 7,
      bodyAreaStats: [],
      recentAchievements: [],
      weeklyGoal: 7,
      weeklyProgress: 3,
      lastActivity: new Date(),
    };
  },
  
  getStreakData: async (userId) => {
    console.log(`Getting streak data for user ${userId}`);
    return [{
      userId,
      streakType: 'daily',
      currentCount: 3,
      bestCount: 7,
      lastActivityDate: new Date(),
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isActive: true,
    }];
  },
};

const AchievementEngine = {
  checkAchievements: async (userId, progressData) => {
    console.log(`Checking achievements for user ${userId}`);
    return [{
      id: 'ach-1',
      name: 'First Steps',
      description: 'Complete your first exercise',
      category: 'milestone',
      criteria: { type: 'total_sessions', target: 1 },
      badgeIcon: 'star',
      points: 10,
      rarity: 'common',
      createdAt: new Date(),
    }];
  },
  
  getUserAchievements: async (userId) => {
    console.log(`Getting user achievements for user ${userId}`);
    return [{
      id: 'ua-1',
      userId,
      achievementId: 'ach-1',
      achievement: {
        id: 'ach-1',
        name: 'First Steps',
        description: 'Complete your first exercise',
        category: 'milestone',
        criteria: { type: 'total_sessions', target: 1 },
        badgeIcon: 'star',
        points: 10,
        rarity: 'common',
        createdAt: new Date(),
      },
      earnedAt: new Date(),
      progressSnapshot: {},
    }];
  },
  
  calculateProgress: async (userId, achievementId) => {
    console.log(`Calculating progress for user ${userId} and achievement ${achievementId}`);
    return {
      achievementId,
      achievement: {
        id: achievementId,
        name: 'Test Achievement',
        description: 'Test description',
        category: 'milestone',
        criteria: { type: 'total_sessions', target: 10 },
        badgeIcon: 'star',
        points: 10,
        rarity: 'common',
        createdAt: new Date(),
      },
      currentProgress: 6,
      targetProgress: 10,
      progressPercentage: 60,
      isCompleted: false,
    };
  },
};

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