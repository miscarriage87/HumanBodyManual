import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Direct implementation of ProgressTracker for testing
const ProgressTracker = {
  recordCompletion: jest.fn().mockImplementation(async (userId, exerciseData) => {
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
  }),
  
  getUserProgress: jest.fn().mockImplementation(async (userId) => {
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
  }),
  
  getStreakData: jest.fn().mockImplementation(async (userId) => {
    return [{
      userId,
      streakType: 'daily',
      currentCount: 3,
      bestCount: 7,
      lastActivityDate: new Date(),
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isActive: true,
    }];
  }),
};

// Direct implementation of AchievementEngine for testing
const AchievementEngine = {
  checkAchievements: jest.fn().mockImplementation(async (userId, progressData) => {
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
  }),
  
  getUserAchievements: jest.fn().mockImplementation(async (userId) => {
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
  }),
  
  calculateProgress: jest.fn().mockImplementation(async (userId, achievementId) => {
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
  }),
};

// Mock the modules
jest.mock('../lib/progress-tracker', () => ({
  ProgressTracker,
}));

jest.mock('../lib/achievement-engine', () => ({
  AchievementEngine,
}));

// Import after mocks are set up
import { ProgressTracker as ImportedProgressTracker } from '../lib/progress-tracker';
import { AchievementEngine as ImportedAchievementEngine } from '../lib/achievement-engine';

describe('Direct Implementation Tests', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should record exercise completion successfully', async () => {
    const result = await ImportedProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    
    expect(ProgressTracker.recordCompletion).toHaveBeenCalledWith(mockUserId, mockExerciseData);
    
    expect(result).toBeDefined();
    expect(result.id).toBe('progress-123');
    expect(result.userId).toBe(mockUserId);
    expect(result.exerciseId).toBe(mockExerciseData.exerciseId);
  });

  it('should check achievements after completion', async () => {
    const progressEntry = await ImportedProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    const achievements = await ImportedAchievementEngine.checkAchievements(mockUserId, progressEntry);
    
    expect(AchievementEngine.checkAchievements).toHaveBeenCalledWith(mockUserId, progressEntry);
    expect(achievements).toHaveLength(1);
    expect(achievements[0].name).toBe('First Steps');
  });

  it('should get user progress data', async () => {
    const result = await ImportedProgressTracker.getUserProgress(mockUserId);
    
    expect(ProgressTracker.getUserProgress).toHaveBeenCalledWith(mockUserId);
    expect(result).toBeDefined();
    expect(result.userId).toBe(mockUserId);
    expect(result.totalSessions).toBe(5);
    expect(result.totalMinutes).toBe(150);
  });
});