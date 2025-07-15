import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ProgressTracker } from '../lib/progress-tracker';
import { AchievementEngine } from '../lib/achievement-engine';
import { AnalyticsService } from '../lib/analytics-service';
import { ExportService } from '../lib/export-service';
import { ExerciseCompletion, BodyAreaType, DifficultyLevel } from '../lib/types';

// Mock all dependencies
jest.mock('../lib/db', () => ({
  prisma: {
    userProgress: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    userStreak: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userAchievement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    achievement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    userInsight: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    userCommunityAchievement: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    challengeParticipant: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../lib/cache', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('../lib/query-optimizer', () => ({
  QueryOptimizer: {
    getUserStatsOptimized: jest.fn(),
    getStreaksOptimized: jest.fn(),
    getUserAchievementsOptimized: jest.fn(),
    invalidateUserCaches: jest.fn(),
  },
}));

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

describe('End-to-End Progress Tracking Workflows', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    cacheService.get.mockResolvedValue(null);
    cacheService.set.mockResolvedValue(true);
    
    QueryOptimizer.getUserStatsOptimized.mockResolvedValue({
      totalSessions: 0,
      totalMinutes: 0,
      averageSessionDuration: 0,
    });
    QueryOptimizer.getStreaksOptimized.mockResolvedValue({ streaks: [] });
    QueryOptimizer.getUserAchievementsOptimized.mockResolvedValue({ earned: [] });
    
    JobScheduler.scheduleUserAnalytics.mockResolvedValue(undefined);
    JobScheduler.scheduleBodyAreaAnalytics.mockResolvedValue(undefined);
    JobScheduler.scheduleInsightsGeneration.mockResolvedValue(undefined);
  });

  describe('Complete Exercise Completion Workflow', () => {
    it('should handle complete exercise completion from start to finish', async () => {
      // Step 1: User completes their first exercise
      const exerciseCompletion: ExerciseCompletion = {
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem' as BodyAreaType,
        durationMinutes: 15,
        difficultyLevel: 'Anfänger' as DifficultyLevel,
        sessionNotes: 'First time trying this exercise',
        mood: 'gut',
        energyLevel: 'mittel',
      };

      const mockProgressEntry = {
        id: 'progress-1',
        userId: mockUserId,
        exerciseId: exerciseCompletion.exerciseId,
        bodyArea: exerciseCompletion.bodyArea,
        completedAt: new Date(),
        durationMinutes: exerciseCompletion.durationMinutes,
        difficultyLevel: exerciseCompletion.difficultyLevel,
        sessionNotes: exerciseCompletion.sessionNotes,
        mood: exerciseCompletion.mood,
        energyLevel: exerciseCompletion.energyLevel,
        createdAt: new Date(),
      };

      prisma.userProgress.create.mockResolvedValue(mockProgressEntry);
      prisma.userStreak.findUnique.mockResolvedValue(null); // No existing streak

      // Mock streak creation
      prisma.userStreak.create.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 1,
        bestCount: 1,
        lastActivityDate: new Date(),
        startedAt: new Date(),
      });

      // Step 2: Record the completion
      const progressEntry = await ProgressTracker.recordCompletion(mockUserId, exerciseCompletion);

      expect(progressEntry.id).toBe('progress-1');
      expect(progressEntry.exerciseId).toBe('breathing-basics');
      expect(progressEntry.bodyArea).toBe('nervensystem');

      // Verify database operations
      expect(prisma.userProgress.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          exerciseId: exerciseCompletion.exerciseId,
          bodyArea: exerciseCompletion.bodyArea,
          completedAt: expect.any(Date),
          durationMinutes: exerciseCompletion.durationMinutes,
          difficultyLevel: exerciseCompletion.difficultyLevel,
          sessionNotes: exerciseCompletion.sessionNotes,
          biometricData: undefined,
          mood: exerciseCompletion.mood,
          energyLevel: exerciseCompletion.energyLevel,
        },
      });

      // Verify streak was created
      expect(prisma.userStreak.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          streakType: 'daily',
          currentCount: 1,
          bestCount: 1,
          lastActivityDate: expect.any(Date),
        },
      });

      // Verify background jobs were scheduled
      expect(JobScheduler.scheduleUserAnalytics).toHaveBeenCalledWith(mockUserId);
      expect(JobScheduler.scheduleBodyAreaAnalytics).toHaveBeenCalledWith(mockUserId, 'nervensystem');
      expect(JobScheduler.scheduleInsightsGeneration).toHaveBeenCalledWith(mockUserId);

      // Verify cache invalidation
      expect(QueryOptimizer.invalidateUserCaches).toHaveBeenCalledWith(mockUserId, 'nervensystem');
    });

    it('should handle achievement unlocking during exercise completion', async () => {
      const exerciseCompletion: ExerciseCompletion = {
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem' as BodyAreaType,
        durationMinutes: 15,
        difficultyLevel: 'Anfänger' as DifficultyLevel,
      };

      const mockProgressEntry = {
        id: 'progress-1',
        userId: mockUserId,
        exerciseId: exerciseCompletion.exerciseId,
        bodyArea: exerciseCompletion.bodyArea,
        completedAt: new Date(),
        durationMinutes: exerciseCompletion.durationMinutes,
        difficultyLevel: exerciseCompletion.difficultyLevel,
        createdAt: new Date(),
      };

      const mockAchievement = {
        id: 'ach-first-steps',
        name: 'First Steps',
        description: 'Complete your first exercise',
        category: 'milestone',
        criteria: { type: 'total_sessions', target: 1 },
        badgeIcon: 'star',
        points: 10,
        rarity: 'common',
        createdAt: new Date(),
      };

      // Setup mocks
      prisma.userProgress.create.mockResolvedValue(mockProgressEntry);
      prisma.userStreak.findUnique.mockResolvedValue(null);
      prisma.userStreak.create.mockResolvedValue({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 1,
        bestCount: 1,
        lastActivityDate: new Date(),
        startedAt: new Date(),
      });

      // Mock achievement checking
      prisma.userAchievement.findMany.mockResolvedValue([]); // No earned achievements
      prisma.achievement.findMany.mockResolvedValue([mockAchievement]);
      prisma.userProgress.count.mockResolvedValue(1); // First session
      prisma.userAchievement.create.mockResolvedValue({
        id: 'ua-1',
        userId: mockUserId,
        achievementId: mockAchievement.id,
        earnedAt: new Date(),
        progressSnapshot: { totalSessions: 1 },
      });

      // Step 1: Record completion
      const progressEntry = await ProgressTracker.recordCompletion(mockUserId, exerciseCompletion);

      // Step 2: Check achievements
      const newAchievements = await AchievementEngine.checkAchievements(mockUserId, progressEntry);

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].name).toBe('First Steps');
      expect(prisma.userAchievement.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          achievementId: mockAchievement.id,
          progressSnapshot: expect.any(Object),
        },
      });
    });
  });

  describe('Multi-Day Progress Tracking Workflow', () => {
    it('should handle a week-long progress tracking scenario', async () => {
      const exercises = [
        { day: 1, exerciseId: 'breathing-basics', bodyArea: 'nervensystem' as BodyAreaType },
        { day: 2, exerciseId: 'cold-shower', bodyArea: 'kaelte' as BodyAreaType },
        { day: 3, exerciseId: 'morning-light', bodyArea: 'licht' as BodyAreaType },
        { day: 4, exerciseId: 'breathing-advanced', bodyArea: 'nervensystem' as BodyAreaType },
        { day: 5, exerciseId: 'movement-stretch', bodyArea: 'bewegung' as BodyAreaType },
        { day: 6, exerciseId: 'fasting-16-8', bodyArea: 'fasten' as BodyAreaType },
        { day: 7, exerciseId: 'gut-health', bodyArea: 'mikrobiom' as BodyAreaType },
      ];

      const progressEntries = [];
      let currentStreak = 0;

      for (const exercise of exercises) {
        currentStreak++;
        const exerciseCompletion: ExerciseCompletion = {
          exerciseId: exercise.exerciseId,
          bodyArea: exercise.bodyArea,
          durationMinutes: 15,
          difficultyLevel: 'Anfänger' as DifficultyLevel,
        };

        const mockProgressEntry = {
          id: `progress-${exercise.day}`,
          userId: mockUserId,
          exerciseId: exercise.exerciseId,
          bodyArea: exercise.bodyArea,
          completedAt: new Date(Date.now() - (7 - exercise.day) * 24 * 60 * 60 * 1000),
          durationMinutes: 15,
          difficultyLevel: 'Anfänger',
          createdAt: new Date(),
        };

        progressEntries.push(mockProgressEntry);

        // Mock database responses for this iteration
        prisma.userProgress.create.mockResolvedValueOnce(mockProgressEntry);
        
        // Mock streak update
        prisma.userStreak.findUnique.mockResolvedValueOnce({
          id: 'streak-1',
          userId: mockUserId,
          streakType: 'daily',
          currentCount: currentStreak - 1,
          bestCount: Math.max(currentStreak - 1, 1),
          lastActivityDate: exercise.day === 1 ? null : new Date(Date.now() - (8 - exercise.day) * 24 * 60 * 60 * 1000),
          startedAt: new Date(),
        });

        prisma.userStreak.update.mockResolvedValueOnce({
          id: 'streak-1',
          userId: mockUserId,
          streakType: 'daily',
          currentCount: currentStreak,
          bestCount: Math.max(currentStreak, 1),
          lastActivityDate: new Date(Date.now() - (7 - exercise.day) * 24 * 60 * 60 * 1000),
          startedAt: new Date(),
        });

        // Record the exercise
        const result = await ProgressTracker.recordCompletion(mockUserId, exerciseCompletion);
        expect(result.exerciseId).toBe(exercise.exerciseId);
      }

      // Verify final streak count
      expect(currentStreak).toBe(7);

      // Verify all exercises were recorded
      expect(prisma.userProgress.create).toHaveBeenCalledTimes(7);
      expect(prisma.userStreak.update).toHaveBeenCalledTimes(7);
    });

    it('should handle streak breaking and recovery', async () => {
      // Day 1-3: Build streak
      for (let day = 1; day <= 3; day++) {
        const exerciseCompletion: ExerciseCompletion = {
          exerciseId: 'breathing-basics',
          bodyArea: 'nervensystem' as BodyAreaType,
          durationMinutes: 15,
          difficultyLevel: 'Anfänger' as DifficultyLevel,
        };

        const mockProgressEntry = {
          id: `progress-${day}`,
          userId: mockUserId,
          exerciseId: 'breathing-basics',
          bodyArea: 'nervensystem',
          completedAt: new Date(Date.now() - (4 - day) * 24 * 60 * 60 * 1000),
          durationMinutes: 15,
          difficultyLevel: 'Anfänger',
          createdAt: new Date(),
        };

        prisma.userProgress.create.mockResolvedValueOnce(mockProgressEntry);
        
        if (day === 1) {
          prisma.userStreak.findUnique.mockResolvedValueOnce(null);
          prisma.userStreak.create.mockResolvedValueOnce({
            id: 'streak-1',
            userId: mockUserId,
            streakType: 'daily',
            currentCount: 1,
            bestCount: 1,
            lastActivityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            startedAt: new Date(),
          });
        } else {
          prisma.userStreak.findUnique.mockResolvedValueOnce({
            id: 'streak-1',
            userId: mockUserId,
            streakType: 'daily',
            currentCount: day - 1,
            bestCount: day - 1,
            lastActivityDate: new Date(Date.now() - (5 - day) * 24 * 60 * 60 * 1000),
            startedAt: new Date(),
          });
          prisma.userStreak.update.mockResolvedValueOnce({
            id: 'streak-1',
            userId: mockUserId,
            streakType: 'daily',
            currentCount: day,
            bestCount: day,
            lastActivityDate: new Date(Date.now() - (4 - day) * 24 * 60 * 60 * 1000),
            startedAt: new Date(),
          });
        }

        await ProgressTracker.recordCompletion(mockUserId, exerciseCompletion);
      }

      // Day 5: Resume after missing day 4 (streak should reset)
      const resumeExercise: ExerciseCompletion = {
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem' as BodyAreaType,
        durationMinutes: 15,
        difficultyLevel: 'Anfänger' as DifficultyLevel,
      };

      const resumeProgressEntry = {
        id: 'progress-5',
        userId: mockUserId,
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem',
        completedAt: new Date(), // Today
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
        createdAt: new Date(),
      };

      prisma.userProgress.create.mockResolvedValueOnce(resumeProgressEntry);
      
      // Mock existing streak (last activity was 2 days ago)
      prisma.userStreak.findUnique.mockResolvedValueOnce({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 3,
        bestCount: 3,
        lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        startedAt: new Date(),
      });

      // Streak should reset to 1
      prisma.userStreak.update.mockResolvedValueOnce({
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 1, // Reset
        bestCount: 3, // Keep best
        lastActivityDate: new Date(),
        startedAt: new Date(),
      });

      await ProgressTracker.recordCompletion(mockUserId, resumeExercise);

      // Verify streak was reset but best count preserved
      expect(prisma.userStreak.update).toHaveBeenLastCalledWith({
        where: { id: 'streak-1' },
        data: {
          currentCount: 1,
          lastActivityDate: expect.any(Date),
        },
      });
    });
  });

  describe('Analytics and Insights Generation Workflow', () => {
    it('should generate comprehensive insights after sufficient data', async () => {
      // Setup user with 30 days of progress data
      const mockRecentProgress = Array.from({ length: 20 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        exerciseId: `exercise-${i % 5}`,
        bodyArea: ['nervensystem', 'bewegung', 'kaelte'][i % 3],
        durationMinutes: 15 + (i % 10),
        difficultyLevel: i < 10 ? 'Anfänger' : 'Fortgeschritten',
      }));

      const mockAllProgress = Array.from({ length: 50 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        exerciseId: `exercise-${i % 8}`,
        bodyArea: ['nervensystem', 'bewegung', 'kaelte', 'licht'][i % 4],
        durationMinutes: 15 + (i % 15),
        difficultyLevel: i < 25 ? 'Anfänger' : 'Fortgeschritten',
      }));

      prisma.userProgress.findMany
        .mockResolvedValueOnce(mockRecentProgress) // Recent progress
        .mockResolvedValueOnce(mockAllProgress); // All progress

      prisma.userStreak.findUnique.mockResolvedValue({
        currentCount: 7,
        bestCount: 12,
        streakType: 'daily',
      });

      prisma.userInsight.create.mockResolvedValue({
        id: 'insight-1',
        userId: mockUserId,
        insightType: 'pattern_analysis',
        content: {},
        generatedAt: new Date(),
      });

      const insights = await AnalyticsService.generateInsights(mockUserId);

      expect(insights.length).toBeGreaterThan(0);
      
      // Should generate multiple types of insights
      const insightTypes = insights.map(insight => insight.insightType);
      expect(insightTypes).toContain('pattern_analysis');
      expect(insightTypes).toContain('optimization');

      // Verify insights were stored
      expect(prisma.userInsight.create).toHaveBeenCalled();
    });

    it('should generate progress trends over time', async () => {
      const timeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      };

      const mockDailyProgress = [
        { completedAt: new Date('2024-01-01'), _count: { id: 1 } },
        { completedAt: new Date('2024-01-05'), _count: { id: 2 } },
        { completedAt: new Date('2024-01-10'), _count: { id: 1 } },
        { completedAt: new Date('2024-01-15'), _count: { id: 3 } },
        { completedAt: new Date('2024-01-20'), _count: { id: 2 } },
        { completedAt: new Date('2024-01-25'), _count: { id: 4 } },
        { completedAt: new Date('2024-01-30'), _count: { id: 3 } },
      ];

      prisma.userProgress.groupBy.mockResolvedValue(mockDailyProgress);

      const trends = await AnalyticsService.getProgressTrends(mockUserId, timeRange);

      expect(trends.period).toBe('month');
      expect(trends.dataPoints).toHaveLength(31); // 31 days in January
      expect(trends.trend).toBeOneOf(['increasing', 'decreasing', 'stable']);
      expect(typeof trends.changePercentage).toBe('number');

      // Verify data points include both active and inactive days
      const activeDay = trends.dataPoints.find(point => 
        point.date.toDateString() === new Date('2024-01-01').toDateString()
      );
      expect(activeDay?.value).toBe(1);

      const inactiveDay = trends.dataPoints.find(point => 
        point.date.toDateString() === new Date('2024-01-02').toDateString()
      );
      expect(inactiveDay?.value).toBe(0);
    });
  });

  describe('Data Export and Privacy Workflow', () => {
    it('should handle complete data export process', async () => {
      const mockUserData = {
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockProgressData = [
        {
          id: 'progress-1',
          userId: mockUserId,
          exerciseId: 'breathing-basics',
          bodyArea: 'nervensystem',
          completedAt: new Date('2024-01-15'),
          durationMinutes: 15,
          difficultyLevel: 'Anfänger',
          sessionNotes: 'Great session',
          mood: 'gut',
          energyLevel: 'hoch',
        },
      ];

      const mockStreakData = [
        {
          id: 'streak-1',
          userId: mockUserId,
          streakType: 'daily',
          currentCount: 5,
          bestCount: 10,
          lastActivityDate: new Date('2024-01-15'),
          startedAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-15'),
        },
      ];

      // Setup mocks for export
      prisma.user.findUnique.mockResolvedValue(mockUserData);
      prisma.userProgress.findMany.mockResolvedValue(mockProgressData);
      prisma.userStreak.findMany.mockResolvedValue(mockStreakData);
      prisma.userAchievement.findMany.mockResolvedValue([]);
      prisma.userInsight.findMany.mockResolvedValue([]);
      prisma.userCommunityAchievement.findMany.mockResolvedValue([]);
      prisma.challengeParticipant.findMany.mockResolvedValue([]);

      const exportRequest = {
        userId: mockUserId,
        format: 'json' as const,
        includeAchievements: true,
        includeBiometrics: true,
        includeInsights: true,
      };

      const exportResult = await ExportService.generateUserDataExport(exportRequest);
      const parsedResult = JSON.parse(exportResult);

      expect(parsedResult.user).toEqual(mockUserData);
      expect(parsedResult.progressData).toEqual(mockProgressData);
      expect(parsedResult.streakData).toEqual(mockStreakData);
      expect(parsedResult.exportMetadata).toBeDefined();
      expect(parsedResult.exportMetadata.totalRecords).toBe(1);
    });

    it('should handle account deletion workflow', async () => {
      const mockTransaction = jest.fn().mockImplementation((callback) => {
        return callback(prisma);
      });
      
      prisma.$transaction.mockImplementation(mockTransaction);

      await ExportService.deleteAllUserData(mockUserId);

      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle database failures gracefully', async () => {
      const exerciseCompletion: ExerciseCompletion = {
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem' as BodyAreaType,
        durationMinutes: 15,
        difficultyLevel: 'Anfänger' as DifficultyLevel,
      };

      // Simulate database failure
      prisma.userProgress.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        ProgressTracker.recordCompletion(mockUserId, exerciseCompletion)
      ).rejects.toThrow('Database connection failed');

      // Verify no background jobs were scheduled on failure
      expect(JobScheduler.scheduleUserAnalytics).not.toHaveBeenCalled();
    });

    it('should handle cache failures without breaking functionality', async () => {
      // Simulate cache failure
      cacheService.get.mockRejectedValue(new Error('Cache service unavailable'));
      cacheService.set.mockRejectedValue(new Error('Cache service unavailable'));

      // Setup database mocks for fallback
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

      // Should still work despite cache failures
      const result = await ProgressTracker.getUserProgress(mockUserId);

      expect(result.totalSessions).toBe(5);
      expect(result.totalMinutes).toBe(150);
    });

    it('should handle concurrent exercise completions', async () => {
      const exerciseCompletion: ExerciseCompletion = {
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem' as BodyAreaType,
        durationMinutes: 15,
        difficultyLevel: 'Anfänger' as DifficultyLevel,
      };

      // Setup mocks for concurrent requests
      const mockProgressEntries = Array.from({ length: 5 }, (_, i) => ({
        id: `progress-${i}`,
        userId: mockUserId,
        exerciseId: exerciseCompletion.exerciseId,
        bodyArea: exerciseCompletion.bodyArea,
        completedAt: new Date(),
        durationMinutes: exerciseCompletion.durationMinutes,
        difficultyLevel: exerciseCompletion.difficultyLevel,
        createdAt: new Date(),
      }));

      mockProgressEntries.forEach((entry, i) => {
        prisma.userProgress.create.mockResolvedValueOnce(entry);
        prisma.userStreak.findUnique.mockResolvedValueOnce(null);
        prisma.userStreak.create.mockResolvedValueOnce({
          id: `streak-${i}`,
          userId: mockUserId,
          streakType: 'daily',
          currentCount: 1,
          bestCount: 1,
          lastActivityDate: new Date(),
          startedAt: new Date(),
        });
      });

      // Execute concurrent requests
      const promises = Array.from({ length: 5 }, () =>
        ProgressTracker.recordCompletion(mockUserId, exerciseCompletion)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result.id).toBe(`progress-${i}`);
      });

      // Verify all database operations completed
      expect(prisma.userProgress.create).toHaveBeenCalledTimes(5);
    });
  });
});