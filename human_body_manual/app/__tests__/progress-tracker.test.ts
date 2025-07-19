import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Use global mocks from jest.setup.js
const mockPrisma = global.mockPrisma;
const mockCacheService = global.mockCacheService;
const mockQueryOptimizer = global.mockQueryOptimizer;
const mockJobScheduler = global.mockJobScheduler;

// Set up mocks before importing the module
jest.mock('../lib/prisma', () => ({
  prisma: mockPrisma,
}));

jest.mock('../lib/cache', () => ({
  cacheService: mockCacheService,
}));

jest.mock('../lib/query-optimizer', () => ({
  QueryOptimizer: mockQueryOptimizer,
}));

jest.mock('../lib/job-queue', () => ({
  JobScheduler: mockJobScheduler,
}));

// Import after mocks are set up
import { ProgressTracker } from '../lib/progress-tracker';
import { ExerciseCompletion, BodyAreaType, DifficultyLevel } from '../lib/types';

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

      mockPrisma.userProgress.create.mockResolvedValue(mockProgressEntry);
      mockPrisma.userStreak.findUnique.mockResolvedValue(null);
      mockPrisma.userStreak.create.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 1,
        bestCount: 1,
        lastActivityDate: new Date(),
      });

      const result = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);

      expect(mockPrisma.userProgress.create).toHaveBeenCalledWith({
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
      expect(mockJobScheduler.scheduleUserAnalytics).toHaveBeenCalledWith(mockUserId);
      expect(mockJobScheduler.scheduleBodyAreaAnalytics).toHaveBeenCalledWith(mockUserId, mockExerciseData.bodyArea);
      expect(mockJobScheduler.scheduleInsightsGeneration).toHaveBeenCalledWith(mockUserId);

      // Verify cache invalidation
      expect(mockQueryOptimizer.invalidateUserCaches).toHaveBeenCalledWith(mockUserId, mockExerciseData.bodyArea);
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

      mockPrisma.userProgress.create.mockResolvedValue(mockProgressEntry);
      mockPrisma.userStreak.findUnique.mockResolvedValue(null);
      mockPrisma.userStreak.create.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 1,
        bestCount: 1,
        lastActivityDate: new Date(),
      });

      const result = await ProgressTracker.recordCompletion(mockUserId, exerciseWithBiometrics);

      // Biometric data should be present but timestamp might be serialized as string
      expect(result.biometricData).toBeDefined();
      expect(result.biometricData.heartRate).toBe(exerciseWithBiometrics.biometricData.heartRate);
      expect(result.biometricData.hrv).toBe(exerciseWithBiometrics.biometricData.hrv);
      expect(result.biometricData.stressLevel).toBe(exerciseWithBiometrics.biometricData.stressLevel);
      expect(result.biometricData.source).toBe(exerciseWithBiometrics.biometricData.source);
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

      mockCacheService.get.mockResolvedValue(mockCachedProgress);

      const result = await ProgressTracker.getUserProgress(mockUserId);

      expect(mockCacheService.get).toHaveBeenCalled();
      expect(result).toEqual(mockCachedProgress);
      expect(mockQueryOptimizer.getUserStatsOptimized).not.toHaveBeenCalled();
    });

    it('should fetch and cache progress when not cached', async () => {
      mockCacheService.get.mockResolvedValue(null);

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

      // Mock the direct database calls that getUserProgress now uses
      mockPrisma.userProgress.count
        .mockResolvedValueOnce(15) // Total sessions
        .mockResolvedValueOnce(3); // Weekly progress
      mockPrisma.userProgress.aggregate.mockResolvedValue({
        _sum: { durationMinutes: 450 }
      });
      mockPrisma.userStreak.findUnique.mockResolvedValue({
        currentCount: 7,
        bestCount: 12,
      });
      mockPrisma.userProgress.findMany.mockResolvedValue([]);
      mockPrisma.userProgress.findFirst.mockResolvedValue({
        completedAt: new Date(),
      });
      mockPrisma.userAchievement.findMany.mockResolvedValue([]);

      const result = await ProgressTracker.getUserProgress(mockUserId);

      expect(result.totalSessions).toBe(mockUserStats.totalSessions);
      expect(result.totalMinutes).toBe(mockUserStats.totalMinutes);
      expect(result.currentStreak).toBe(7);
      expect(result.longestStreak).toBe(12);
      expect(result.weeklyProgress).toBe(3);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('user_progress_comprehensive'),
        result,
        900
      );
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

      mockPrisma.userStreak.findMany.mockResolvedValue(mockStreaks);

      const result = await ProgressTracker.getStreakData(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(mockUserId);
      expect(result[0].streakType).toBe('daily');
      expect(result[0].currentCount).toBe(5);
      expect(result[0].bestCount).toBe(10);
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
      mockPrisma.userProgress.findMany.mockImplementation((args: any) => {
        if (args.where?.bodyArea === 'nervensystem') {
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

      mockPrisma.userProgress.findMany.mockResolvedValue(mockEntries);

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

      mockPrisma.userProgress.findMany.mockResolvedValue([]);

      await ProgressTracker.getProgressEntries(mockUserId, timeRange, bodyArea);

      expect(mockPrisma.userProgress.findMany).toHaveBeenCalledWith({
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

      mockPrisma.userProgress.create.mockResolvedValue(mockProgressEntry);
      mockPrisma.userStreak.findUnique.mockResolvedValue(null);

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
      mockCacheService.get.mockResolvedValue(null);

      mockQueryOptimizer.getUserStatsOptimized.mockResolvedValue({
        totalSessions: 5,
        totalMinutes: 150,
        averageSessionDuration: 30,
      });
      mockQueryOptimizer.getStreaksOptimized.mockResolvedValue({ streaks: [] });
      mockQueryOptimizer.getUserAchievementsOptimized.mockResolvedValue({ earned: [] });

      mockPrisma.userProgress.findMany.mockResolvedValue([]);
      mockPrisma.userProgress.count.mockResolvedValue(5);
      mockPrisma.userProgress.aggregate.mockResolvedValue({
        _sum: { durationMinutes: 150 }
      });
      mockPrisma.userStreak.findUnique.mockResolvedValue(null);
      mockPrisma.userProgress.findFirst.mockResolvedValue({
        completedAt: new Date(),
      });
      mockPrisma.userAchievement.findMany.mockResolvedValue([]);

      const result = await ProgressTracker.getProgressData(mockUserId);

      expect(result.totalSessions).toBe(5);
      expect(result.totalMinutes).toBe(150);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.userProgress.create.mockRejectedValue(new Error('Database error'));

      await expect(
        ProgressTracker.recordCompletion(mockUserId, mockExerciseData)
      ).rejects.toThrow('Database error');
    });

    it('should handle missing streak data', async () => {
      mockPrisma.userStreak.findMany.mockResolvedValue([]);

      const result = await ProgressTracker.getStreakData(mockUserId);

      expect(result).toEqual([]);
    });

    it('should handle cache failures gracefully', async () => {
      mockCacheService.get.mockRejectedValue(new Error('Cache error'));

      // Should fall back to database queries
      mockPrisma.userProgress.findMany.mockResolvedValue([]);
      mockPrisma.userProgress.count
        .mockResolvedValueOnce(5) // Total sessions
        .mockResolvedValueOnce(2); // Weekly progress
      mockPrisma.userProgress.aggregate.mockResolvedValue({
        _sum: { durationMinutes: 150 }
      });
      mockPrisma.userStreak.findUnique.mockResolvedValue(null);
      mockPrisma.userProgress.findFirst.mockResolvedValue({
        completedAt: new Date(),
      });
      mockPrisma.userAchievement.findMany.mockResolvedValue([]);

      const result = await ProgressTracker.getUserProgress(mockUserId);

      expect(result.totalSessions).toBe(5);
    });

    it('should handle invalid user IDs', async () => {
      const invalidUserId = '';

      await expect(
        ProgressTracker.recordCompletion(invalidUserId, mockExerciseData)
      ).rejects.toThrow();
    });
  });
});