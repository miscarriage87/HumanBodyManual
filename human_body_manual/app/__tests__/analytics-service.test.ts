import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AnalyticsService } from '../lib/analytics-service';
import { DateRange, BodyAreaType } from '../lib/types';

// Mock Prisma
jest.mock('../lib/prisma', () => ({
  prisma: {
    progressEntry: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    streak: {
      findUnique: jest.fn(),
    },
    userInsight: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

const { prisma } = require('../lib/prisma');

describe('AnalyticsService', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateInsights', () => {
    it('should generate pattern analysis insights', async () => {
      const mockRecentProgress = Array.from({ length: 10 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        exerciseId: 'breathing-1',
        bodyArea: 'nervensystem',
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
      }));

      // Set consistent practice time (8 AM)
      mockRecentProgress.forEach((p, i) => {
        p.completedAt.setHours(8, 0, 0, 0);
        p.completedAt.setDate(p.completedAt.getDate() - i);
      });

      prisma.progressEntry.findMany
        .mockResolvedValueOnce(mockRecentProgress) // Recent progress
        .mockResolvedValueOnce(mockRecentProgress); // All progress

      prisma.userInsight.create.mockResolvedValue({
        id: 'insight-1',
        userId: mockUserId,
        insightType: 'pattern_analysis',
        content: {},
        generatedAt: new Date(),
      });

      const result = await AnalyticsService.generateInsights(mockUserId);

      expect(result.length).toBeGreaterThan(0);
      
      const patternInsight = result.find(insight => insight.insightType === 'pattern_analysis');
      expect(patternInsight).toBeDefined();
      expect(patternInsight!.content.title).toContain('Übungsmuster');
      expect(patternInsight!.content.message).toContain('Morgen');
      
      expect(prisma.userInsight.create).toHaveBeenCalled();
    });

    it('should generate plateau detection insights', async () => {
      // Create progress data with same difficulty level for 15 sessions
      const mockRecentProgress = Array.from({ length: 15 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        exerciseId: 'breathing-1',
        bodyArea: 'nervensystem',
        durationMinutes: 15,
        difficultyLevel: 'Anfänger', // Same level for all sessions
      }));

      prisma.progressEntry.findMany
        .mockResolvedValueOnce(mockRecentProgress) // Recent progress
        .mockResolvedValueOnce(mockRecentProgress); // All progress

      prisma.userInsight.create.mockResolvedValue({
        id: 'insight-plateau',
        userId: mockUserId,
        insightType: 'plateau_detection',
        content: {},
        generatedAt: new Date(),
      });

      const result = await AnalyticsService.generateInsights(mockUserId);

      const plateauInsight = result.find(insight => insight.insightType === 'plateau_detection');
      expect(plateauInsight).toBeDefined();
      expect(plateauInsight!.content.title).toContain('Herausforderungen');
      expect(plateauInsight!.content.message).toContain('Anfänger');
      expect(plateauInsight!.content.priority).toBe('high');
    });

    it('should generate motivation insights for inactive users', async () => {
      // No recent progress
      prisma.progressEntry.findMany
        .mockResolvedValueOnce([]) // Recent progress (empty)
        .mockResolvedValueOnce([]); // All progress (empty)

      prisma.streak.findUnique.mockResolvedValue(null);

      prisma.userInsight.create.mockResolvedValue({
        id: 'insight-motivation',
        userId: mockUserId,
        insightType: 'motivation',
        content: {},
        generatedAt: new Date(),
      });

      const result = await AnalyticsService.generateInsights(mockUserId);

      const motivationInsight = result.find(insight => insight.insightType === 'motivation');
      expect(motivationInsight).toBeDefined();
      expect(motivationInsight!.content.title).toContain('Streak');
      expect(motivationInsight!.content.message).toContain('neue Chance');
    });

    it('should generate optimization insights for experienced users', async () => {
      // Create 25 sessions with varying body areas and durations
      const mockAllProgress = Array.from({ length: 25 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        exerciseId: 'breathing-1',
        bodyArea: i % 2 === 0 ? 'nervensystem' : 'bewegung',
        durationMinutes: i % 2 === 0 ? 20 : 10, // nervensystem sessions are longer
        difficultyLevel: 'Anfänger',
      }));

      prisma.progressEntry.findMany
        .mockResolvedValueOnce(mockAllProgress.slice(0, 10)) // Recent progress
        .mockResolvedValueOnce(mockAllProgress); // All progress

      prisma.userInsight.create.mockResolvedValue({
        id: 'insight-optimization',
        userId: mockUserId,
        insightType: 'optimization',
        content: {},
        generatedAt: new Date(),
      });

      const result = await AnalyticsService.generateInsights(mockUserId);

      const optimizationInsight = result.find(insight => insight.insightType === 'optimization');
      expect(optimizationInsight).toBeDefined();
      expect(optimizationInsight!.content.title).toContain('Stärke');
      expect(optimizationInsight!.content.message).toContain('Nervensystem');
    });

    it('should handle users with insufficient data', async () => {
      // Very little progress data
      const mockMinimalProgress = [
        {
          completedAt: new Date(),
          exerciseId: 'breathing-1',
          bodyArea: 'nervensystem',
          durationMinutes: 15,
          difficultyLevel: 'Anfänger',
        },
      ];

      prisma.progressEntry.findMany
        .mockResolvedValueOnce(mockMinimalProgress) // Recent progress
        .mockResolvedValueOnce(mockMinimalProgress); // All progress

      prisma.streak.findUnique.mockResolvedValue(null);

      const result = await AnalyticsService.generateInsights(mockUserId);

      // Should still generate some insights, but fewer
      expect(result.length).toBeGreaterThan(0);
      
      // Should not generate pattern analysis (requires 7+ sessions)
      const patternInsight = result.find(insight => insight.insightType === 'pattern_analysis');
      expect(patternInsight).toBeUndefined();
    });
  });

  describe('getProgressTrends', () => {
    it('should calculate daily progress trends', async () => {
      const timeRange: DateRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-07'),
      };

      const mockDailyProgress = [
        {
          completedAt: new Date('2024-01-01'),
          _count: { id: 2 },
        },
        {
          completedAt: new Date('2024-01-03'),
          _count: { id: 1 },
        },
        {
          completedAt: new Date('2024-01-05'),
          _count: { id: 3 },
        },
      ];

      prisma.progressEntry.groupBy.mockResolvedValue(mockDailyProgress);

      const result = await AnalyticsService.getProgressTrends(mockUserId, timeRange);

      expect(result.period).toBe('week');
      expect(result.dataPoints).toHaveLength(7); // 7 days
      expect(result.dataPoints[0].value).toBe(2); // Jan 1st
      expect(result.dataPoints[1].value).toBe(0); // Jan 2nd (no activity)
      expect(result.dataPoints[2].value).toBe(1); // Jan 3rd
      expect(result.dataPoints[4].value).toBe(3); // Jan 5th

      expect(['increasing', 'decreasing', 'stable']).toContain(result.trend);
      expect(typeof result.changePercentage).toBe('number');
    });

    it('should determine correct trend direction', async () => {
      const timeRange: DateRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-10'),
      };

      // Mock increasing trend (more activity in second half)
      const mockIncreasingProgress = [
        { completedAt: new Date('2024-01-01'), _count: { id: 1 } },
        { completedAt: new Date('2024-01-02'), _count: { id: 1 } },
        { completedAt: new Date('2024-01-06'), _count: { id: 3 } },
        { completedAt: new Date('2024-01-07'), _count: { id: 3 } },
        { completedAt: new Date('2024-01-08'), _count: { id: 4 } },
      ];

      prisma.progressEntry.groupBy.mockResolvedValue(mockIncreasingProgress);

      const result = await AnalyticsService.getProgressTrends(mockUserId, timeRange);

      expect(result.trend).toBe('increasing');
      expect(result.changePercentage).toBeGreaterThan(0);
    });

    it('should handle different time periods', async () => {
      const testCases = [
        { days: 7, expectedPeriod: 'week' },
        { days: 30, expectedPeriod: 'month' },
        { days: 90, expectedPeriod: 'quarter' },
        { days: 365, expectedPeriod: 'year' },
      ];

      for (const testCase of testCases) {
        const timeRange: DateRange = {
          from: new Date(Date.now() - testCase.days * 24 * 60 * 60 * 1000),
          to: new Date(),
        };

        prisma.progressEntry.groupBy.mockResolvedValue([]);

        const result = await AnalyticsService.getProgressTrends(mockUserId, timeRange);

        expect(result.period).toBe(testCase.expectedPeriod);
      }
    });

    it('should include metadata for data points', async () => {
      const timeRange: DateRange = {
        from: new Date('2024-01-01'), // Monday
        to: new Date('2024-01-07'), // Sunday
      };

      prisma.progressEntry.groupBy.mockResolvedValue([]);

      const result = await AnalyticsService.getProgressTrends(mockUserId, timeRange);

      const mondayPoint = result.dataPoints[0];
      expect(mondayPoint.metadata.dayOfWeek).toBe(1); // Monday
      expect(mondayPoint.metadata.isWeekend).toBe(false);

      const sundayPoint = result.dataPoints[6];
      expect(sundayPoint.metadata.dayOfWeek).toBe(0); // Sunday
      expect(sundayPoint.metadata.isWeekend).toBe(true);
    });
  });

  describe('getRecommendations', () => {
    it('should recommend neglected body areas', async () => {
      const mockRecentProgress = [
        {
          exerciseId: 'breathing-1',
          bodyArea: 'nervensystem',
          completedAt: new Date(),
          durationMinutes: 15,
          difficultyLevel: 'Anfänger',
        },
        {
          exerciseId: 'breathing-2',
          bodyArea: 'nervensystem',
          completedAt: new Date(),
          durationMinutes: 20,
          difficultyLevel: 'Anfänger',
        },
      ];

      prisma.progressEntry.findMany.mockResolvedValue(mockRecentProgress);

      const result = await AnalyticsService.getRecommendations(mockUserId);

      expect(result.length).toBeGreaterThan(0);
      
      // Should recommend neglected areas (not nervensystem)
      const neglectedRecs = result.filter(rec => rec.type === 'exercise' && rec.bodyArea !== 'nervensystem');
      expect(neglectedRecs.length).toBeGreaterThan(0);
      
      const firstRec = neglectedRecs[0];
      expect(firstRec.title).toContain('Erkunde');
      expect(firstRec.priority).toBe(8);
    });

    it('should recommend progression for frequently practiced areas', async () => {
      // Create 6 sessions in nervensystem (triggers progression recommendation)
      const mockRecentProgress = Array.from({ length: 6 }, (_, i) => ({
        exerciseId: 'breathing-1',
        bodyArea: 'nervensystem',
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
      }));

      prisma.progressEntry.findMany.mockResolvedValue(mockRecentProgress);

      const result = await AnalyticsService.getRecommendations(mockUserId);

      const progressionRec = result.find(rec => rec.type === 'progression');
      expect(progressionRec).toBeDefined();
      expect(progressionRec!.title).toContain('Steigere');
      expect(progressionRec!.bodyArea).toBe('nervensystem');
      expect(progressionRec!.priority).toBe(7);
    });

    it('should generate schedule recommendations for inactive users', async () => {
      // Last activity was 5 days ago, but provide enough historical data
      const oldActivity = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const mockRecentProgress = Array.from({ length: 5 }, (_, i) => ({
        exerciseId: 'breathing-1',
        bodyArea: 'nervensystem',
        completedAt: new Date(oldActivity.getTime() - i * 24 * 60 * 60 * 1000),
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
      }));

      prisma.progressEntry.findMany.mockResolvedValue(mockRecentProgress);

      const result = await AnalyticsService.getRecommendations(mockUserId);

      const scheduleRec = result.find(rec => rec.type === 'schedule');
      expect(scheduleRec).toBeDefined();
      expect(scheduleRec!.title).toContain('Comeback');
      expect(scheduleRec!.priority).toBe(9);
    });

    it('should generate recovery recommendations for high activity', async () => {
      // 7 sessions in last 3 days (high intensity)
      const mockRecentProgress = Array.from({ length: 7 }, (_, i) => ({
        exerciseId: 'breathing-1',
        bodyArea: 'nervensystem',
        completedAt: new Date(Date.now() - (i % 3) * 24 * 60 * 60 * 1000), // Distributed over 3 days
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
      }));

      prisma.progressEntry.findMany.mockResolvedValue(mockRecentProgress);

      const result = await AnalyticsService.getRecommendations(mockUserId);

      const recoveryRec = result.find(rec => rec.type === 'recovery');
      expect(recoveryRec).toBeDefined();
      expect(recoveryRec!.title).toContain('Pause');
      expect(recoveryRec!.priority).toBe(6);
    });

    it('should sort recommendations by priority', async () => {
      const mockRecentProgress = [
        {
          exerciseId: 'breathing-1',
          bodyArea: 'nervensystem',
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          durationMinutes: 15,
          difficultyLevel: 'Anfänger',
        },
      ];

      prisma.progressEntry.findMany.mockResolvedValue(mockRecentProgress);

      const result = await AnalyticsService.getRecommendations(mockUserId);

      // Verify recommendations are sorted by priority (highest first)
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].priority).toBeGreaterThanOrEqual(result[i].priority);
      }
    });
  });

  describe('getUnviewedInsights', () => {
    it('should return only unviewed insights', async () => {
      const mockUnviewedInsights = [
        {
          id: 'insight-1',
          userId: mockUserId,
          insightType: 'pattern_analysis',
          content: {
            title: 'Pattern Insight',
            message: 'You practice consistently',
            actionItems: [],
            data: {},
            priority: 'medium',
          },
          generatedAt: new Date(),
          viewedAt: null,
        },
        {
          id: 'insight-2',
          userId: mockUserId,
          insightType: 'motivation',
          content: {
            title: 'Motivation Insight',
            message: 'Keep going!',
            actionItems: [],
            data: {},
            priority: 'high',
          },
          generatedAt: new Date(),
          viewedAt: null,
        },
      ];

      prisma.userInsight.findMany.mockResolvedValue(mockUnviewedInsights);

      const result = await AnalyticsService.getUnviewedInsights(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('insight-1');
      expect(result[1].id).toBe('insight-2');

      expect(prisma.userInsight.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          viewedAt: null,
        },
        orderBy: { generatedAt: 'desc' },
      });
    });

    it('should return empty array when no unviewed insights', async () => {
      prisma.userInsight.findMany.mockResolvedValue([]);

      const result = await AnalyticsService.getUnviewedInsights(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('markInsightsAsViewed', () => {
    it('should mark specified insights as viewed', async () => {
      const insightIds = ['insight-1', 'insight-2'];

      await AnalyticsService.markInsightsAsViewed(mockUserId, insightIds);

      expect(prisma.userInsight.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          id: { in: insightIds },
        },
        data: {
          viewedAt: expect.any(Date),
        },
      });
    });

    it('should handle empty insight IDs array', async () => {
      await AnalyticsService.markInsightsAsViewed(mockUserId, []);

      expect(prisma.userInsight.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          id: { in: [] },
        },
        data: {
          viewedAt: expect.any(Date),
        },
      });
    });
  });

  describe('Helper functions', () => {
    it('should correctly map body area names', async () => {
      // Provide progress in one area but not others to trigger neglected area recommendations
      const mockRecentProgress = Array.from({ length: 5 }, (_, i) => ({
        exerciseId: 'breathing-1',
        bodyArea: 'hormone', // Practice only hormone area
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
      }));

      prisma.progressEntry.findMany.mockResolvedValue(mockRecentProgress);

      const result = await AnalyticsService.getRecommendations(mockUserId);

      // Find a recommendation that mentions body area names
      const bodyAreaRec = result.find(rec => rec.description.includes('Nervensystem & Vagusnerv'));
      expect(bodyAreaRec).toBeDefined();
    });

    it('should determine correct time periods', async () => {
      const testCases = [
        { from: new Date('2024-01-01'), to: new Date('2024-01-07'), expected: 'week' },
        { from: new Date('2024-01-01'), to: new Date('2024-01-31'), expected: 'month' },
        { from: new Date('2024-01-01'), to: new Date('2024-03-31'), expected: 'quarter' },
        { from: new Date('2024-01-01'), to: new Date('2024-12-31'), expected: 'year' },
      ];

      for (const testCase of testCases) {
        prisma.progressEntry.groupBy.mockResolvedValue([]);

        const result = await AnalyticsService.getProgressTrends(mockUserId, testCase);

        expect(result.period).toBe(testCase.expected);
      }
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      prisma.progressEntry.findMany.mockRejectedValue(new Error('Database error'));

      await expect(
        AnalyticsService.generateInsights(mockUserId)
      ).rejects.toThrow('Database error');
    });

    it('should handle empty progress data', async () => {
      prisma.progressEntry.findMany.mockResolvedValue([]);
      prisma.streak.findUnique.mockResolvedValue(null);

      const result = await AnalyticsService.generateInsights(mockUserId);

      // Should still return some insights (like motivation for new users)
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle malformed progress data', async () => {
      const malformedProgress = [
        {
          // Missing required fields
          completedAt: new Date(),
          bodyArea: null,
          durationMinutes: null,
        },
      ];

      prisma.progressEntry.findMany.mockResolvedValue(malformedProgress);

      // Should not throw error, but handle gracefully
      const result = await AnalyticsService.generateInsights(mockUserId);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});