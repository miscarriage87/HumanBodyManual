
// Test helper functions and utilities
import { ProgressEntry, UserProgress, StreakData, BodyAreaStats } from '../lib/types';
import { jest } from '@jest/globals';

// Mock data generators
export const createMockProgressEntry = (overrides = {}): ProgressEntry => ({
  id: 'progress-1',
  userId: 'test-user-123',
  exerciseId: 'breathing-basics',
  bodyArea: 'nervensystem',
  completedAt: new Date(),
  durationMinutes: 15,
  difficultyLevel: 'Anfänger',
  sessionNotes: 'Great session!',
  mood: 'gut',
  energyLevel: 'hoch',
  createdAt: new Date(),
  ...overrides,
});

export const createMockUserProgress = (overrides = {}): UserProgress => ({
  userId: 'test-user-123',
  totalSessions: 5,
  totalMinutes: 150,
  currentStreak: 3,
  longestStreak: 7,
  bodyAreaStats: [],
  recentAchievements: [],
  weeklyGoal: 7,
  weeklyProgress: 3,
  lastActivity: new Date(),
  ...overrides,
});

export const createMockStreakData = (overrides = {}): StreakData => ({
  userId: 'test-user-123',
  streakType: 'daily',
  currentCount: 3,
  bestCount: 7,
  lastActivityDate: new Date(),
  startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  isActive: true,
  ...overrides,
});

export const createMockBodyAreaStats = (bodyArea = 'nervensystem', overrides = {}): BodyAreaStats => ({
  bodyArea,
  totalSessions: 3,
  totalMinutes: 45,
  averageSessionDuration: 15,
  completionRate: 1,
  lastPracticed: new Date(),
  favoriteExercises: ['breathing-basics'],
  consistencyScore: 0.1,
  masteryLevel: 'beginner',
  ...overrides,
});

// Mock achievement data
export const createMockAchievement = (overrides = {}) => ({
  id: 'ach-1',
  name: 'First Steps',
  description: 'Complete your first exercise',
  category: 'milestone',
  criteria: { type: 'total_sessions', target: 1 },
  badgeIcon: 'star',
  points: 10,
  rarity: 'common',
  createdAt: new Date(),
  ...overrides,
});

export const createMockUserAchievement = (overrides = {}) => ({
  id: 'ua-1',
  userId: 'test-user-123',
  achievementId: 'ach-1',
  achievement: createMockAchievement(),
  earnedAt: new Date(),
  progressSnapshot: {},
  ...overrides,
});

export const createMockAchievementProgress = (achievementId = 'ach-1', overrides = {}) => ({
  achievementId,
  achievement: createMockAchievement({ id: achievementId }),
  currentProgress: 1,
  targetProgress: 1,
  progressPercentage: 100,
  isCompleted: true,
  ...overrides,
});

// Setup mock functions for Prisma
export const setupMockPrisma = () => {
  const mockPrisma = {
    userProgress: {
      create: jest.fn().mockImplementation((data) => {
        return Promise.resolve({
          id: 'progress-1',
          ...data.data,
          completedAt: new Date(),
          createdAt: new Date(),
        });
      }),
      findMany: jest.fn().mockResolvedValue([createMockProgressEntry()]),
      findFirst: jest.fn().mockResolvedValue(createMockProgressEntry()),
      count: jest.fn().mockResolvedValue(5),
      aggregate: jest.fn().mockResolvedValue({ _sum: { durationMinutes: 150 } }),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    userStreak: {
      findMany: jest.fn().mockResolvedValue([createMockStreakData()]),
      findUnique: jest.fn().mockResolvedValue(createMockStreakData()),
      create: jest.fn().mockImplementation((data) => {
        return Promise.resolve({
          id: 'streak-1',
          ...data.data,
        });
      }),
      update: jest.fn().mockImplementation((data) => {
        return Promise.resolve({
          id: data.where.id,
          ...data.data,
        });
      }),
    },
    userAchievement: {
      findMany: jest.fn().mockResolvedValue([createMockUserAchievement()]),
      findUnique: jest.fn().mockResolvedValue(createMockUserAchievement()),
      create: jest.fn().mockImplementation((data) => {
        return Promise.resolve({
          id: 'ua-1',
          ...data.data,
          earnedAt: new Date(),
        });
      }),
      count: jest.fn().mockResolvedValue(1),
      groupBy: jest.fn().mockResolvedValue([{ _count: { achievementId: 50 }, achievementId: 'ach-1' }]),
    },
    achievement: {
      findMany: jest.fn().mockResolvedValue([createMockAchievement()]),
      findUnique: jest.fn().mockResolvedValue(createMockAchievement()),
      count: jest.fn().mockResolvedValue(25),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      if (typeof callback === 'function') {
        return callback(mockPrisma);
      }
      return Promise.all(callback);
    }),
    $queryRaw: jest.fn().mockResolvedValue([]),
  };
  
  return mockPrisma;
};

// Setup mock functions for cache service
export const setupMockCacheService = () => {
  const mockCacheStorage = new Map();
  
  const mockCacheService = {
    get: jest.fn().mockImplementation(async (key) => {
      return mockCacheStorage.get(key) || null;
    }),
    set: jest.fn().mockImplementation(async (key, value, ttl) => {
      mockCacheStorage.set(key, value);
      return true;
    }),
    deletePattern: jest.fn().mockImplementation(async (pattern) => {
      let count = 0;
      for (const key of mockCacheStorage.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          mockCacheStorage.delete(key);
          count++;
        }
      }
      return count;
    }),
  };
  
  return { mockCacheService, mockCacheStorage };
};

// Setup mock functions for job scheduler
export const setupMockJobScheduler = () => {
  return {
    scheduleUserAnalytics: jest.fn().mockResolvedValue(undefined),
    scheduleBodyAreaAnalytics: jest.fn().mockResolvedValue(undefined),
    scheduleInsightsGeneration: jest.fn().mockResolvedValue(undefined),
  };
};

// Setup mock functions for query optimizer
export const setupMockQueryOptimizer = () => {
  return {
    getUserStatsOptimized: jest.fn().mockResolvedValue({
      totalSessions: 5,
      totalMinutes: 150,
      averageSessionDuration: 30,
    }),
    getStreaksOptimized: jest.fn().mockResolvedValue({
      streaks: [createMockStreakData()],
    }),
    getUserAchievementsOptimized: jest.fn().mockResolvedValue({
      earned: [createMockUserAchievement()],
    }),
    invalidateUserCaches: jest.fn().mockResolvedValue(undefined),
  };
};
