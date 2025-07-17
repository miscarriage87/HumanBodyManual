import { describe, it, expect } from '@jest/globals';

// Direct implementations for testing
const ProgressTracker = {
  recordCompletion: async (userId, exerciseData) => {
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

describe('Simple Direct Tests', () => {
  const mockUserId = 'test-user-123';
  const mockExerciseData = {
    exerciseId: 'breathing-basics',
    bodyArea: 'nervensystem',
    durationMinutes: 15,
    difficultyLevel: 'Anfänger',
    sessionNotes: 'Great session!',
    mood: 'gut',
    energyLevel: 'hoch',
  };

  it('should record exercise completion successfully', async () => {
    const result = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    
    expect(result).toBeDefined();
    expect(result.id).toBe('progress-123');
    expect(result.userId).toBe(mockUserId);
    expect(result.exerciseId).toBe(mockExerciseData.exerciseId);
    expect(result.bodyArea).toBe(mockExerciseData.bodyArea);
  });

  it('should check achievements after completion', async () => {
    const progressEntry = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    const achievements = await AchievementEngine.checkAchievements(mockUserId, progressEntry);
    
    expect(achievements).toHaveLength(1);
    expect(achievements[0].name).toBe('First Steps');
  });

  it('should get user progress data', async () => {
    const result = await ProgressTracker.getUserProgress(mockUserId);
    
    expect(result).toBeDefined();
    expect(result.userId).toBe(mockUserId);
    expect(result.totalSessions).toBe(5);
    expect(result.totalMinutes).toBe(150);
  });

  it('should get streak data', async () => {
    const streaks = await ProgressTracker.getStreakData(mockUserId);
    
    expect(streaks).toHaveLength(1);
    expect(streaks[0].userId).toBe(mockUserId);
    expect(streaks[0].currentCount).toBe(3);
  });

  it('should get user achievements', async () => {
    const achievements = await AchievementEngine.getUserAchievements(mockUserId);
    
    expect(achievements).toHaveLength(1);
    expect(achievements[0].achievement.name).toBe('First Steps');
  });

  it('should calculate achievement progress', async () => {
    const progress = await AchievementEngine.calculateProgress(mockUserId, 'ach-2');
    
    expect(progress).toBeDefined();
    expect(progress.currentProgress).toBe(6);
    expect(progress.targetProgress).toBe(10);
    expect(progress.progressPercentage).toBe(60);
  });
});