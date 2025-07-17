
// Mock implementation for progress tracker tests
const mockProgressTracker = {
  recordCompletion: jest.fn().mockImplementation((userId, exerciseData) => {
    return Promise.resolve({
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
    });
  }),
  getUserProgress: jest.fn().mockImplementation((userId) => {
    return Promise.resolve({
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
    });
  }),
  getStreakData: jest.fn().mockImplementation((userId) => {
    return Promise.resolve([{
      userId,
      streakType: 'daily',
      currentCount: 3,
      bestCount: 7,
      lastActivityDate: new Date(),
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isActive: true,
    }]);
  }),
  getBodyAreaStats: jest.fn().mockImplementation((userId) => {
    return Promise.resolve([
      {
        bodyArea: 'nervensystem',
        totalSessions: 3,
        totalMinutes: 45,
        averageSessionDuration: 15,
        completionRate: 1,
        lastPracticed: new Date(),
        favoriteExercises: ['breathing-basics'],
        consistencyScore: 0.1,
        masteryLevel: 'beginner',
      },
      // Add other body areas with default values
    ]);
  }),
  getProgressEntries: jest.fn().mockImplementation((userId, timeRange, bodyArea) => {
    return Promise.resolve([{
      id: 'entry-1',
      userId,
      exerciseId: 'breathing-basics',
      bodyArea: bodyArea || 'nervensystem',
      completedAt: new Date(),
      durationMinutes: 15,
      difficultyLevel: 'Anfänger',
      sessionNotes: 'Great session!',
      mood: 'gut',
      energyLevel: 'hoch',
      createdAt: new Date(),
    }]);
  }),
  markExerciseCompleted: jest.fn().mockImplementation((userId, exerciseId, bodyArea, durationMinutes, difficultyLevel) => {
    return Promise.resolve({
      id: 'progress-123',
      userId,
      exerciseId,
      bodyArea,
      completedAt: new Date(),
      durationMinutes,
      difficultyLevel,
      sessionNotes: undefined,
      biometricData: undefined,
      mood: undefined,
      energyLevel: undefined,
      createdAt: new Date(),
    });
  }),
  getProgressData: jest.fn().mockImplementation((userId) => {
    return Promise.resolve({
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
    });
  }),
};

// Export the mock
module.exports = { mockProgressTracker };
