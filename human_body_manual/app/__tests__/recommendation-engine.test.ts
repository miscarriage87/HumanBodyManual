import { RecommendationEngine } from '../lib/recommendation-engine';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    userProgress: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    userStreak: {
      findUnique: jest.fn(),
    },
    userInsight: {
      create: jest.fn(),
    },
  })),
}));

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('RecommendationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeOptimalPracticeTimes', () => {
    it('should return general recommendations for users with insufficient data', async () => {
      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue([]);

      const result = await RecommendationEngine.analyzeOptimalPracticeTimes('test-user');

      expect(result).toHaveLength(2);
      expect(result[0].hour).toBe(7);
      expect(result[1].hour).toBe(18);
      expect(result[0].confidence).toBe(0.3);
    });

    it('should analyze patterns for users with sufficient data', async () => {
      const mockProgress = [
        {
          completedAt: new Date('2024-01-01T08:00:00Z'),
          durationMinutes: 15,
        },
        {
          completedAt: new Date('2024-01-02T08:30:00Z'),
          durationMinutes: 20,
        },
        {
          completedAt: new Date('2024-01-03T08:15:00Z'),
          durationMinutes: 18,
        },
        {
          completedAt: new Date('2024-01-04T19:00:00Z'),
          durationMinutes: 12,
        },
      ];

      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue(mockProgress);

      const result = await RecommendationEngine.analyzeOptimalPracticeTimes('test-user');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].confidence).toBeGreaterThan(0);
      expect(result[0].reasoning).toContain('mal um');
    });
  });

  describe('detectPlateau', () => {
    it('should return no plateau for users with insufficient data', async () => {
      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue([]);

      const result = await RecommendationEngine.detectPlateau('test-user');

      expect(result.isInPlateau).toBe(false);
      expect(result.plateauDuration).toBe(0);
      expect(result.stagnantAreas).toHaveLength(0);
    });

    it('should detect difficulty level stagnation', async () => {
      const mockProgress = Array.from({ length: 15 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        difficultyLevel: 'Anfänger',
        bodyArea: 'nervensystem',
        exerciseId: 'test-exercise',
        durationMinutes: 15,
      }));

      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue(mockProgress);

      const result = await RecommendationEngine.detectPlateau('test-user');

      expect(result.isInPlateau).toBe(true);
      expect(result.progressionSuggestions.length).toBeGreaterThan(0);
      expect(result.progressionSuggestions[0]).toContain('Fortgeschritten');
    });

    it('should detect body area stagnation', async () => {
      const mockProgress = Array.from({ length: 12 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        difficultyLevel: 'Anfänger',
        bodyArea: 'nervensystem', // Only one body area
        exerciseId: 'test-exercise',
        durationMinutes: 15,
      }));

      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue(mockProgress);

      const result = await RecommendationEngine.detectPlateau('test-user');

      expect(result.stagnantAreas.length).toBeGreaterThan(0);
      expect(result.stagnantAreas).not.toContain('nervensystem');
    });
  });

  describe('generateMotivationalMessage', () => {
    it('should generate comeback message for inactive users', async () => {
      const oldProgress = [{
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        difficultyLevel: 'Anfänger',
        bodyArea: 'nervensystem',
        exerciseId: 'test-exercise',
      }];

      (mockPrisma.userProgress.findMany as jest.Mock)
        .mockResolvedValueOnce([]) // Recent progress (empty)
        .mockResolvedValueOnce(oldProgress); // Older progress

      (mockPrisma.userStreak.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await RecommendationEngine.generateMotivationalMessage('test-user');

      expect(result).not.toBeNull();
      expect(result!.type).toBe('streak_recovery');
      expect(result!.urgency).toBe('high');
      expect(result!.title).toContain('Comeback');
    });

    it('should generate celebration message for streak users', async () => {
      const recentProgress = Array.from({ length: 5 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        difficultyLevel: 'Anfänger',
        bodyArea: 'nervensystem',
        exerciseId: 'test-exercise',
      }));

      (mockPrisma.userProgress.findMany as jest.Mock)
        .mockResolvedValueOnce(recentProgress)
        .mockResolvedValueOnce([]);

      (mockPrisma.userStreak.findUnique as jest.Mock).mockResolvedValue({
        currentCount: 10,
        bestCount: 15,
        streakType: 'daily',
      });

      const result = await RecommendationEngine.generateMotivationalMessage('test-user');

      expect(result).not.toBeNull();
      expect(result!.type).toBe('celebration');
      expect(result!.title).toContain('10-Tage Streak');
    });
  });

  describe('suggestComplementaryTechniques', () => {
    it('should return starter recommendations for new users', async () => {
      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue([]);

      const result = await RecommendationEngine.suggestComplementaryTechniques('test-user');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].synergy).toContain('Einstieg');
      expect(result[0].priority).toBeGreaterThan(7);
    });

    it('should suggest complementary areas for experienced users', async () => {
      const mockProgress = Array.from({ length: 10 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        difficultyLevel: 'Anfänger',
        bodyArea: 'nervensystem', // Focused on one area
        exerciseId: 'vagus-atem-1',
        durationMinutes: 15,
      }));

      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue(mockProgress);

      const result = await RecommendationEngine.suggestComplementaryTechniques('test-user');

      expect(result.length).toBeGreaterThan(0);
      // Should suggest complementary areas to nervensystem
      const suggestedAreas = result.map(r => r.bodyArea);
      expect(suggestedAreas).toContain('zirkadian'); // Complementary to nervensystem
    });
  });

  describe('generateComprehensiveInsights', () => {
    it('should generate multiple insights for active users', async () => {
      const mockProgress = Array.from({ length: 20 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        difficultyLevel: i < 10 ? 'Anfänger' : 'Fortgeschritten',
        bodyArea: i % 2 === 0 ? 'nervensystem' : 'bewegung',
        exerciseId: `exercise-${i % 3}`,
        durationMinutes: 15 + (i % 10),
      }));

      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue(mockProgress);
      (mockPrisma.userStreak.findUnique as jest.Mock).mockResolvedValue({
        currentCount: 5,
        bestCount: 10,
        streakType: 'daily',
      });
      (mockPrisma.userInsight.create as jest.Mock).mockResolvedValue({
        id: 'insight-1',
        userId: 'test-user',
        insightType: 'recommendation',
        content: {},
        generatedAt: new Date(),
      });

      const result = await RecommendationEngine.generateComprehensiveInsights('test-user');

      expect(result.length).toBeGreaterThan(0);
      expect(mockPrisma.userInsight.create).toHaveBeenCalled();
      
      // Check that different types of insights are generated
      const insightTypes = result.map(insight => insight.insightType);
      expect(insightTypes).toContain('recommendation');
    });
  });

  describe('Helper methods', () => {
    it('should correctly identify complementary body areas', async () => {
      // This tests the private method indirectly through suggestComplementaryTechniques
      const mockProgress = [{
        completedAt: new Date(),
        difficultyLevel: 'Anfänger',
        bodyArea: 'nervensystem',
        exerciseId: 'test-exercise',
        durationMinutes: 15,
      }];

      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue(mockProgress);

      const result = await RecommendationEngine.suggestComplementaryTechniques('test-user');

      // Should suggest areas complementary to nervensystem
      const suggestedAreas = result.map(r => r.bodyArea);
      const expectedComplementary = ['zirkadian', 'mikrobiom', 'licht'];
      
      const hasComplementary = suggestedAreas.some(area => 
        expectedComplementary.includes(area)
      );
      expect(hasComplementary).toBe(true);
    });

    it('should calculate appropriate priority scores', async () => {
      const mockProgress = Array.from({ length: 8 }, (_, i) => ({
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        difficultyLevel: 'Anfänger',
        bodyArea: 'nervensystem',
        exerciseId: 'test-exercise',
        durationMinutes: 15,
      }));

      (mockPrisma.userProgress.findMany as jest.Mock).mockResolvedValue(mockProgress);

      const result = await RecommendationEngine.suggestComplementaryTechniques('test-user');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].priority).toBeGreaterThan(0);
      expect(result[0].priority).toBeLessThanOrEqual(10);
      
      // Results should be sorted by priority (highest first)
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].priority).toBeGreaterThanOrEqual(result[i].priority);
      }
    });
  });
});