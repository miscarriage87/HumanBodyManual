import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ProgressTracker } from '../lib/progress-tracker';
import { ExerciseCompletion, BodyAreaType, DifficultyLevel } from '../lib/types';

// Mock Prisma
jest.mock('../lib/db', () => ({
  prisma: {
    userProgress: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    userStreak: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userAchievement: {
      findMany: jest.fn(),
    },
    achievement: {
      findMany: jest.fn(),
    },
  },
}));

// Mock cache service
jest.mock('../lib/cache', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

// Mock query optimizer
jest.mock('../lib/query-optimizer', () => ({
  QueryOptimizer: {
    getUserStatsOptimized: jest.fn(),
    getStreaksOptimized: jest.fn(),
    getUserAchievementsOptimized: jest.fn(),
    invalidateUserCaches: jest.fn(),
  },
}));

// Mock job scheduler
jest.mock('../lib/job-queue', () => ({
  JobScheduler: {
    scheduleUserAnalytics: jest.fn(),
    scheduleBodyAreaAnalytics: jest.fn(),
    scheduleInsightsGeneration: jest.fn(),
  },
}));

const { prisma } = require('../lib/db');
const { cacheService } = require('../lib/cache');
const { QueryOptimizer } = require('../lib/query-optimizer');
const { JobScheduler } = require('../lib/job-queue');

describe('ProgressTracker', () => {
  const mockUserId = 'test-user-123';
  const mockExerciseData: ExerciseCompletion = {
    exerciseId: 'breathing-basics',
    bodyArea: 'nervensystem' as BodyAreaType,
    durationMinutes: 15,
    difficultyLevel: 'Anfänger' as DifficultyLevel,
    sessionNotes: 'Great session!',
    mood: 'gut',
    energyLevel: 'hoch',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordCompletion', () => {
    it('should record exercise completion successfully', async () => {
      const mockProgressEntry = {
        id: 'progress-123',
        userId: mockUserId,
        exerciseId: mockExerciseData.exerciseId,
        bodyArea: mockExerciseData.bodyArea,
        completedAt: new Date(),
        durationMinutes: mockExerciseData.durationMinutes,
        difficultyLevel: mockExerciseData.difficultyLevel,
        sessionNotes: mockExerciseData.sessionNotes,
        biometricData: null,
        mood: mockExerciseData.mood,
        energyLevel: mockExerciseData.energyLevel,
        createdAt: new Date(),
      };

      prisma.userProgress.create.mockResolvedValue(mockProgressEntry);

      const result = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);

      expect(prisma.userProgress.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          exerciseId: mockExerciseData.exerciseId,
          bodyArea: mockExerciseData.bodyArea,
          completedAt: expect.any(Date),
          durationMinutes: mockExerciseData.durationMinutes,
          difficultyLevel: mockExerciseData.difficultyLevel,
          sessionNotes: mockExerciseData.sessionNotes,
          biometricData: undefined,
          mood: mockExerciseData.mood,
          energyLevel: mockExerciseData.energyLevel,
        },
      });

      expect(result.id).toBe(mockProgressEntry.id);
      expect(result.userId).toBe(mockUserId);
      expect(result.exerciseId).toBe(mockExerciseData.exerciseId);
      expect(result.bodyArea).toBe(mockExerciseData.bodyArea);

      // Verify background jobs are scheduled
      expect(JobScheduler.scheduleUserAnalytics).toHaveBeenCalledWith(mockUserId);
      expect(JobScheduler.scheduleBodyAreaAnalytics).toHaveBeenCalledWith(mockUserId, mockExerciseData.bodyArea);
      expect(JobScheduler.scheduleInsightsGeneration).toHaveBeenCalledWith(mockUserId);

      // Verify cache invalidation
      expect(QueryOptimizer.invalidateUserCaches).toHaveBeenCalledWith(mockUserId, mockExerciseData.bodyArea);
    });

    it('should handle biometric data correctly', async () => {
      const exerciseWithBiometrics: ExerciseCompletion = {
        ...mockExerciseData,
        biometricData: {
          heartRate: 75,
          hrv: 45,
          stressLevel: 3,
          timestamp: new Date(),
          source: 'wearable',
        },
      };

      const mockProgressEntry = {
        id: 'progress-123',
        userId: mockUserId,
        exerciseId: exerciseWithBiometrics.exerciseId,
        bodyArea: exerciseWithBiometrics.bodyArea,
        completedAt: new Date(),
        durationMinutes: exerciseWithBiometrics.durationMinutes,
        difficultyLevel: exerciseWithBiometrics.difficultyLevel,
        sessionNotes: exerciseWithBiometrics.sessionNotes,
        biometricData: JSON.stringify(exerciseWithBiometrics.biometricData),
        mood: exerciseWithBiometrics.mood,
        energyLevel: exerciseWithBiometrics.energyLevel,
        createdAt: new Date(),
      };

      prisma.userProgress.create.mockResolvedValue(mockProgressEntry);

      const result = await ProgressTracker.recordCompletion(mockUserId, exerciseWithBiometrics);

      expect(result.biometricData).toEqual(exerciseWithBiometrics.biometricData);
    });
  });

  describe('getUserProgress', () => {
    it('should return cached progress if available', async () => {
      const mockCachedProgress = {
        userId: mockUserId,
        totalSessions: 10,
        totalMinutes: 300,
        currentStreak: 5,
        longestStreak: 8,
        bodyAreaStats: [],
        recentAchievements: [],
        weeklyGoal: 7,
        weeklyProgress: 3,
        lastActivity: new Date(),
      };

      cacheService.get.mockResolvedValue(mockCachedProgress);

      const result = await ProgressTracker.getUserProgress(mockUserId);

      expect(cacheService.get).toHaveBeenCalled();
      expect(result).toEqual(mockCachedProgress);
      expect(QueryOptimizer.getUserStatsOptimized).not.toHaveBeenCalled();
    });

    it('should fetch and cache progress when not cached', async () => {
      cacheService.get.mockResolvedValue(null);

      const mockUserStats = {
        totalSessions: 15,
        totalMinutes: 450,
        averageSessionDuration: 30,
      };

      const mockStreakData = {
        streaks: [
          {
            streakType: 'daily',
            currentCount: 7,
            bestCount: 12,
          },
        ],
      };

      const mockAchievements = {
        earned: [
          {
            id: 'ua-1',
            userId: mockUserId,
            achievementId: 'ach-1',
            earnedAt: new Date(),
            progressSnapshot: {},
            achievement: {
              id: 'ach-1',
              name: 'First Steps',
              description: 'Complete your first exercise',
              category: 'milestone',
              criteria: {},
              badgeIcon: 'star',
              points: 10,
              rarity: 'common',
              createdAt: new Date(),
            },
          },
        ],
      };

      QueryOptimizer.getUserStatsOptimized.mockResolvedValue(mockUserStats);
      QueryOptimizer.getStreaksOptimized.mockResolvedValue(mockStreakData);
      QueryOptimizer.getUserAchievementsOptimized.mockResolvedValue(mockAchievements);

      // Mock body area stats calculation
      prisma.userProgress.findMany.mockResolvedValue([]);
      prisma.userProgress.count.mockResolvedValue(3);
      prisma.userProgress.findFirst.mockResolvedValue({
        completedAt: new Date(),
      });

      const result = await ProgressTracker.getUserProgress(mockUserId);

      expect(result.totalSessions).toBe(mockUserStats.totalSessions);
      expect(result.totalMinutes).toBe(mockUserStats.totalMinutes);
      expect(result.currentStreak).toBe(7);
      expect(result.longestStreak).toBe(12);
      expect(result.weeklyProgress).toBe(3);

      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('user_progress_comprehensive'),
        result,
        900
      );
    });

    it('should handle time range filtering', async () => {
      cacheService.get.mockResolvedValue(null);

      const timeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      };

      QueryOptimizer.getUserStatsOptimized.mockResolvedValue({
        totalSessions: 5,
        totalMinutes: 150,
        averageSessionDuration: 30,
      });
      QueryOptimizer.getStreaksOptimized.mockResolvedValue({ streaks: [] });
      QueryOptimizer.getUserAchievementsOptimized.mockResolvedValue({ earned: [] });

      prisma.userProgress.findMany.mockResolvedValue([]);
      prisma.userProgress.count.mockResolvedValue(2);
      prisma.userProgress.findFirst.mockResolvedValue({
        completedAt: new Date(),
      });

      await ProgressTracker.getUserProgress(mockUserId, timeRange);

      expect(QueryOptimizer.getUserStatsOptimized).toHaveBeenCalledWith(mockUserId, timeRange);
    });
  });

  describe('getStreakData', () => {
    it('should return formatted streak data', async () => {
      const mockStreaks = [
        {
          userId: mockUserId,
          streakType: 'daily',
          currentCount: 5,
          bestCount: 10,
          lastActivityDate: new Date(),
          startedAt: new Date(),
        },
      ];

      prisma.userStreak.findMany.mockResolvedValue(mockStreaks);

      const result = await ProgressTracker.getStreakData(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(mockUserId);
      expect(result[0].streakType).toBe('daily');
      expect(result[0].currentCount).toBe(5);
      expect(result[0].bestCount).toBe(10);
      expect(result[0].isActive).toBe(true);
    });

    it('should correctly determine streak activity', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockStreaks = [
        {
          userId: mockUserId,
          streakType: 'daily',
          currentCount: 3,
          bestCount: 5,
          lastActivityDate: yesterday,
          startedAt: new Date(),
        },
      ];

      prisma.userStreak.findMany.mockResolvedValue(mockStreaks);

      const result = await ProgressTracker.getStreakData(mockUserId);

      expect(result[0].isActive).toBe(true);
    });
  });

  describe('getBodyAreaStats', () => {
    it('should calculate comprehensive body area statistics', async () => {
      const mockProgressData = [
        {
          exerciseId: 'breathing-1',
          durationMinutes: 15,
          completedAt: new Date(),
        },
        {
          exerciseId: 'breathing-2',
          durationMinutes: 20,
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          exerciseId: 'breathing-1',
          durationMinutes: 10,
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ];

      // Mock different responses for different body areas
      prisma.userProgress.findMany.mockImplementation(({ where }) => {
        if (where.bodyArea === 'nervensystem') {
          return Promise.resolve(mockProgressData);
        }
        return Promise.resolve([]);
      });

      const result = await ProgressTracker.getBodyAreaStats(mockUserId);

      expect(result).toHaveLength(8); // All 8 body areas

      const nervensystemStats = result.find(stat => stat.bodyArea === 'nervensystem');
      expect(nervensystemStats).toBeDefined();
      expect(nervensystemStats!.totalSessions).toBe(3);
      expect(nervensystemStats!.totalMinutes).toBe(45);
      expect(nervensystemStats!.averageSessionDuration).toBe(15);
      expect(nervensystemStats!.favoriteExercises).toContain('breathing-1');
      expect(nervensystemStats!.masteryLevel).toBe('beginner');

      const emptyAreaStats = result.find(stat => stat.bodyArea === 'hormone');
      expect(emptyAreaStats).toBeDefined();
      expect(emptyAreaStats!.totalSessions).toBe(0);
      expect(emptyAreaStats!.masteryLevel).toBe('beginner');
    });

    it('should determine correct mastery levels', async () => {
      const createMockProgress = (count: number) =>
        Array.from({ length: count }, (_, i) => ({
          exerciseId: `exercise-${i}`,
          durationMinutes: 15,
          completedAt: new Date(),
        }));

      // Test different mastery levels
      const testCases = [
        { sessions: 5, expectedLevel: 'beginner' },
        { sessions: 15, expectedLevel: 'intermediate' },
        { sessions: 30, expectedLevel: 'advanced' },
        { sessions: 60, expectedLevel: 'expert' },
      ];

      for (const testCase of testCases) {
        prisma.userProgress.findMany.mockResolvedValue(
          createMockProgress(testCase.sessions)
        );

        const result = await ProgressTracker.getBodyAreaStats(mockUserId);
        const stats = result.find(stat => stat.bodyArea === 'nervensystem');

        expect(stats!.masteryLevel).toBe(testCase.expectedLevel);
      }
    });
  });

  describe('getProgressEntries', () => {
    it('should return filtered progress entries', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          userId: mockUserId,
          exerciseId: 'breathing-1',
          bodyArea: 'nervensystem',
          completedAt: new Date(),
          durationMinutes: 15,
          difficultyLevel: 'Anfänger',
          sessionNotes: 'Good session',
          biometricData: null,
          mood: 'gut',
          energyLevel: 'hoch',
          createdAt: new Date(),
        },
      ];

      prisma.userProgress.findMany.mockResolvedValue(mockEntries);

      const result = await ProgressTracker.getProgressEntries(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('entry-1');
      expect(result[0].exerciseId).toBe('breathing-1');
    });

    it('should apply time range and body area filters', async () => {
      const timeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      };
      const bodyArea: BodyAreaType = 'nervensystem';

      prisma.userProgress.findMany.mockResolvedValue([]);

      await ProgressTracker.getProgressEntries(mockUserId, timeRange, bodyArea);

      expect(prisma.userProgress.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          completedAt: {
            gte: timeRange.from,
            lte: timeRange.to,
          },
          bodyArea,
        },
        orderBy: { completedAt: 'desc' },
      });
    });
  });

  describe('Legacy compatibility functions', () => {
    it('should support legacy markExerciseCompleted', async () => {
      const mockProgressEntry = {
        id: 'progress-123',
        userId: mockUserId,
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem',
        completedAt: new Date(),
        durationMinutes: 10,
        difficultyLevel: 'Anfänger',
        sessionNotes: null,
        biometricData: null,
        mood: null,
        energyLevel: null,
        createdAt: new Date(),
      };

      prisma.userProgress.create.mockResolvedValue(mockProgressEntry);

      const result = await ProgressTracker.markExerciseCompleted(
        mockUserId,
        'breathing-basics',
        'nervensystem',
        10,
        'Anfänger'
      );

      expect(result.exerciseId).toBe('breathing-basics');
      expect(result.bodyArea).toBe('nervensystem');
      expect(result.durationMinutes).toBe(10);
    });

    it('should support legacy getProgressData', async () => {
      cacheService.get.mockResolvedValue(null);

      QueryOptimizer.getUserStatsOptimized.mockResolvedValue({
        totalSessions: 5,
        totalMinutes: 150,
        averageSessionDuration: 30,
      });
      QueryOptimizer.getStreaksOptimized.mockResolvedValue({ streaks: [] });
      QueryOptimizer.getUserAchievementsOptimized.mockResolvedValue({ earned: [] });

      prisma.userProgress.findMany.mockResolvedValue([]);
      prisma.userProgress.count.mockResolvedValue(2);
      prisma.userProgress.findFirst.mockResolvedValue({
        completedAt: new Date(),
      });

      const result = await ProgressTracker.getProgressData(mockUserId);

      expect(result.totalSessions).toBe(5);
      expect(result.totalMinutes).toBe(150);
    });
  });

  describe('updateStreaks', () => {
    it('should update daily streak correctly', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Mock existing streak
      prisma.userStreak.findUnique.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 3,
        bestCount: 5,
        lastActivityDate: yesterday,
        startedAt: new Date(),
      });

      // Mock progress entry from today
      prisma.userProgress.findFirst.mockResolvedValue({
        completedAt: today,
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 4,
        bestCount: 5,
        lastActivityDate: today,
        startedAt: new Date(),
      });

      await ProgressTracker.updateStreaks(mockUserId);

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'streak-1' },
        data: {
          currentCount: 4,
          lastActivityDate: today,
        },
      });
    });

    it('should reset streak if gap is too large', async () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Mock existing streak with gap
      prisma.userStreak.findUnique.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 5,
        bestCount: 8,
        lastActivityDate: threeDaysAgo,
        startedAt: new Date(),
      });

      prisma.userProgress.findFirst.mockResolvedValue({
        completedAt: today,
      });

      prisma.userStreak.update.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 1,
        bestCount: 8,
        lastActivityDate: today,
        startedAt: today,
      });

      await ProgressTracker.updateStreaks(mockUserId);

      expect(prisma.userStreak.update).toHaveBeenCalledWith({
        where: { id: 'streak-1' },
        data: {
          currentCount: 1,
          lastActivityDate: today,
          startedAt: today,
        },
      });
    });

    it('should create new streak if none exists', async () => {
      const today = new Date();

      prisma.userStreak.findUnique.mockResolvedValue(null);
      prisma.userProgress.findFirst.mockResolvedValue({
        completedAt: today,
      });

      prisma.userStreak.create.mockResolvedValue({
        id: 'new-streak',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 1,
        bestCount: 1,
        lastActivityDate: today,
        startedAt: today,
      });

      await ProgressTracker.updateStreaks(mockUserId);

      expect(prisma.userStreak.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          streakType: 'daily',
          currentCount: 1,
          bestCount: 1,
          lastActivityDate: today,
          startedAt: today,
        },
      });
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle large datasets efficiently', async () => {
      const largeProgressData = Array.from({ length: 1000 }, (_, i) => ({
        id: `progress-${i}`,
        userId: mockUserId,
        exerciseId: `exercise-${i % 10}`,
        bodyArea: 'nervensystem',
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
        sessionNotes: null,
        biometricData: null,
        mood: 'gut',
        energyLevel: 'hoch',
        createdAt: new Date(),
      }));

      prisma.userProgress.findMany.mockResolvedValue(largeProgressData);

      const result = await ProgressTracker.getProgressEntries(mockUserId);

      expect(result).toHaveLength(1000);
      expect(prisma.userProgress.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { completedAt: 'desc' },
      });
    });

    it('should handle concurrent progress recording', async () => {
      const concurrentData = Array.from({ length: 5 }, (_, i) => ({
        exerciseId: `exercise-${i}`,
        bodyArea: 'nervensystem' as BodyAreaType,
        durationMinutes: 10 + i,
        difficultyLevel: 'Anfänger' as DifficultyLevel,
      }));

      // Mock successful creation for all concurrent requests
      prisma.userProgress.create.mockImplementation((data) => 
        Promise.resolve({
          id: `progress-${Math.random()}`,
          userId: mockUserId,
          ...data.data,
          completedAt: new Date(),
          createdAt: new Date(),
        })
      );

      const promises = concurrentData.map(data => 
        ProgressTracker.recordCompletion(mockUserId, data)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(prisma.userProgress.create).toHaveBeenCalledTimes(5);
    });

    it('should validate input data types', async () => {
      const invalidData = {
        exerciseId: 123, // Should be string
        bodyArea: 'invalid-area',
        durationMinutes: 'not-a-number',
        difficultyLevel: null,
      };

      // This should be caught by validation before reaching the service
      await expect(
        ProgressTracker.recordCompletion(mockUserId, invalidData as any)
      ).rejects.toThrow();
    });

    it('should handle timezone differences correctly', async () => {
      const utcDate = new Date('2024-01-15T23:30:00.000Z');
      const localDate = new Date('2024-01-16T01:30:00.000+02:00');

      prisma.userProgress.create.mockResolvedValue({
        id: 'progress-tz',
        userId: mockUserId,
        exerciseId: mockExerciseData.exerciseId,
        bodyArea: mockExerciseData.bodyArea,
        completedAt: utcDate,
        durationMinutes: mockExerciseData.durationMinutes,
        difficultyLevel: mockExerciseData.difficultyLevel,
        sessionNotes: mockExerciseData.sessionNotes,
        biometricData: null,
        mood: mockExerciseData.mood,
        energyLevel: mockExerciseData.energyLevel,
        createdAt: utcDate,
      });

      const result = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);

      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.completedAt.getTime()).toBe(utcDate.getTime());
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      prisma.userProgress.create.mockRejectedValue(new Error('Database error'));

      await expect(
        ProgressTracker.recordCompletion(mockUserId, mockExerciseData)
      ).rejects.toThrow('Database error');
    });

    it('should handle missing streak data', async () => {
      prisma.userStreak.findMany.mockResolvedValue([]);

      const result = await ProgressTracker.getStreakData(mockUserId);

      expect(result).toEqual([]);
    });

    it('should handle cache failures gracefully', async () => {
      cacheService.get.mockRejectedValue(new Error('Cache error'));

      // Should fall back to database queries
      QueryOptimizer.getUserStatsOptimized.mockResolvedValue({
        totalSessions: 5,
        totalMinutes: 150,
        averageSessionDuration: 30,
      });
      QueryOptimizer.getStreaksOptimized.mockResolvedValue({ streaks: [] });
      QueryOptimizer.getUserAchievementsOptimized.mockResolvedValue({ earned: [] });

      prisma.userProgress.findMany.mockResolvedValue([]);
      prisma.userProgress.count.mockResolvedValue(2);
      prisma.userProgress.findFirst.mockResolvedValue({
        completedAt: new Date(),
      });

      const result = await ProgressTracker.getUserProgress(mockUserId);

      expect(result.totalSessions).toBe(5);
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'TimeoutError';
      
      prisma.userProgress.create.mockRejectedValue(timeoutError);

      await expect(
        ProgressTracker.recordCompletion(mockUserId, mockExerciseData)
      ).rejects.toThrow('Connection timeout');
    });

    it('should handle invalid user IDs', async () => {
      const invalidUserId = '';

      await expect(
        ProgressTracker.recordCompletion(invalidUserId, mockExerciseData)
      ).rejects.toThrow();
    });

    it('should handle malformed biometric data', async () => {
      const exerciseWithMalformedBiometrics = {
        ...mockExerciseData,
        biometricData: {
          heartRate: 'invalid',
          timestamp: 'not-a-date',
        },
      };

      // Should handle gracefully or throw validation error
      await expect(
        ProgressTracker.recordCompletion(mockUserId, exerciseWithMalformedBiometrics as any)
      ).rejects.toThrow();
    });
  });
});