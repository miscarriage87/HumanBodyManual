import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AchievementEngine } from '../lib/achievement-engine';
import { ProgressEntry, BodyAreaType, DifficultyLevel } from '../lib/types';

// Use global mocks from jest.setup.js
const prisma = global.mockPrisma;

describe('AchievementEngine', () => {
  const mockUserId = 'test-user-123';
  const mockProgressEntry: ProgressEntry = {
    id: 'progress-123',
    userId: mockUserId,
    exerciseId: 'breathing-basics',
    bodyArea: 'nervensystem' as BodyAreaType,
    completedAt: new Date(),
    durationMinutes: 15,
    difficultyLevel: 'Anfänger' as DifficultyLevel,
    sessionNotes: 'Great session!',
    mood: 'gut',
    energyLevel: 'hoch',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAchievements', () => {
    it('should award achievements when criteria are met', async () => {
      const mockAchievement = {
        id: 'ach-1',
        name: 'First Steps',
        description: 'Complete your first exercise',
        category: 'milestone',
        criteria: {
          type: 'total_sessions',
          target: 1,
        },
        badgeIcon: 'star',
        points: 10,
        rarity: 'common',
        createdAt: new Date(),
      };

      // User has no earned achievements yet
      prisma.userAchievement.findMany.mockResolvedValue([]);
      
      // Available achievements
      prisma.achievement.findMany.mockResolvedValue([mockAchievement]);
      
      // User has 1 total session (meets criteria)
      prisma.progressEntry.count.mockResolvedValue(1);
      
      // Mock the achievement creation
      prisma.userAchievement.create.mockResolvedValue({
        id: 'ua-1',
        userId: mockUserId,
        achievementId: mockAchievement.id,
        earnedAt: new Date(),
        progressSnapshot: {},
      });

      const result = await AchievementEngine.checkAchievements(mockUserId, mockProgressEntry);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockAchievement.id);
      expect(result[0].name).toBe('First Steps');
      
      expect(prisma.userAchievement.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          achievementId: mockAchievement.id,
          progressSnapshot: expect.any(Object),
        },
      });
    });

    it('should not award already earned achievements', async () => {
      const mockAchievement = {
        id: 'ach-1',
        name: 'First Steps',
        description: 'Complete your first exercise',
        category: 'milestone',
        criteria: {
          type: 'total_sessions',
          target: 1,
        },
        badgeIcon: 'star',
        points: 10,
        rarity: 'common',
        createdAt: new Date(),
      };

      // User already earned this achievement
      prisma.userAchievement.findMany.mockResolvedValue([
        { achievementId: mockAchievement.id },
      ]);
      
      // Should not find any available achievements
      prisma.achievement.findMany.mockResolvedValue([]);

      const result = await AchievementEngine.checkAchievements(mockUserId, mockProgressEntry);

      expect(result).toHaveLength(0);
      expect(prisma.userAchievement.create).not.toHaveBeenCalled();
    });

    it('should check streak-based achievements', async () => {
      const streakAchievement = {
        id: 'ach-streak-7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        category: 'consistency',
        criteria: {
          type: 'streak',
          target: 7,
        },
        badgeIcon: 'fire',
        points: 50,
        rarity: 'rare',
        createdAt: new Date(),
      };

      prisma.userAchievement.findMany.mockResolvedValue([]);
      prisma.achievement.findMany.mockResolvedValue([streakAchievement]);
      
      // Mock current streak of 7
      prisma.streak.findUnique.mockResolvedValue({
        currentCount: 7,
        streakType: 'daily',
      });

      prisma.userAchievement.create.mockResolvedValue({
        id: 'ua-streak',
        userId: mockUserId,
        achievementId: streakAchievement.id,
        earnedAt: new Date(),
        progressSnapshot: {},
      });

      const result = await AchievementEngine.checkAchievements(mockUserId, mockProgressEntry);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Week Warrior');
    });

    it('should check body area mastery achievements', async () => {
      const masteryAchievement = {
        id: 'ach-mastery-nervensystem',
        name: 'Nervous System Master',
        description: 'Complete 25 nervous system exercises',
        category: 'mastery',
        criteria: {
          type: 'body_area_mastery',
          bodyArea: 'nervensystem',
          target: 25,
        },
        badgeIcon: 'brain',
        points: 100,
        rarity: 'epic',
        createdAt: new Date(),
      };

      prisma.userAchievement.findMany.mockResolvedValue([]);
      prisma.achievement.findMany.mockResolvedValue([masteryAchievement]);
      
      // Mock 25 sessions in nervensystem
      prisma.userProgress.count.mockImplementation(({ where }) => {
        if (where.bodyArea === 'nervensystem') {
          return Promise.resolve(25);
        }
        return Promise.resolve(0);
      });

      prisma.userAchievement.create.mockResolvedValue({
        id: 'ua-mastery',
        userId: mockUserId,
        achievementId: masteryAchievement.id,
        earnedAt: new Date(),
        progressSnapshot: {},
      });

      const result = await AchievementEngine.checkAchievements(mockUserId, mockProgressEntry);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Nervous System Master');
    });

    it('should check consistency achievements', async () => {
      const perfectWeekAchievement = {
        id: 'ach-perfect-week',
        name: 'Perfect Week',
        description: 'Complete exercises every day for a week',
        category: 'consistency',
        criteria: {
          type: 'consistency',
          conditions: {
            perfectWeek: true,
          },
          target: 1,
        },
        badgeIcon: 'calendar',
        points: 75,
        rarity: 'rare',
        createdAt: new Date(),
      };

      prisma.userAchievement.findMany.mockResolvedValue([]);
      prisma.achievement.findMany.mockResolvedValue([perfectWeekAchievement]);
      
      // Mock 7+ sessions this week (perfect week)
      prisma.userProgress.count.mockResolvedValue(8);

      prisma.userAchievement.create.mockResolvedValue({
        id: 'ua-perfect',
        userId: mockUserId,
        achievementId: perfectWeekAchievement.id,
        earnedAt: new Date(),
        progressSnapshot: {},
      });

      const result = await AchievementEngine.checkAchievements(mockUserId, mockProgressEntry);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Perfect Week');
    });
  });

  describe('getUserAchievements', () => {
    it('should return formatted user achievements', async () => {
      const mockUserAchievements = [
        {
          id: 'ua-1',
          userId: mockUserId,
          achievementId: 'ach-1',
          earnedAt: new Date(),
          progressSnapshot: { totalSessions: 1 },
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
        },
      ];

      prisma.userAchievement.findMany.mockResolvedValue(mockUserAchievements);

      const result = await AchievementEngine.getUserAchievements(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('ua-1');
      expect(result[0].achievement.name).toBe('First Steps');
      expect(result[0].achievement.points).toBe(10);
    });

    it('should order achievements by earned date descending', async () => {
      const olderDate = new Date('2024-01-01');
      const newerDate = new Date('2024-01-15');

      const mockUserAchievements = [
        {
          id: 'ua-1',
          userId: mockUserId,
          achievementId: 'ach-1',
          earnedAt: olderDate,
          progressSnapshot: {},
          achievement: {
            id: 'ach-1',
            name: 'First Achievement',
            description: 'First one',
            category: 'milestone',
            criteria: {},
            badgeIcon: 'star',
            points: 10,
            rarity: 'common',
            createdAt: new Date(),
          },
        },
        {
          id: 'ua-2',
          userId: mockUserId,
          achievementId: 'ach-2',
          earnedAt: newerDate,
          progressSnapshot: {},
          achievement: {
            id: 'ach-2',
            name: 'Second Achievement',
            description: 'Second one',
            category: 'milestone',
            criteria: {},
            badgeIcon: 'medal',
            points: 20,
            rarity: 'common',
            createdAt: new Date(),
          },
        },
      ];

      prisma.userAchievement.findMany.mockResolvedValue(mockUserAchievements);

      const result = await AchievementEngine.getUserAchievements(mockUserId);

      expect(prisma.userAchievement.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: { achievement: true },
        orderBy: { earnedAt: 'desc' },
      });
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress for incomplete achievements', async () => {
      const mockAchievement = {
        id: 'ach-sessions-10',
        name: '10 Sessions',
        description: 'Complete 10 exercise sessions',
        category: 'milestone',
        criteria: {
          type: 'total_sessions',
          target: 10,
        },
        badgeIcon: 'trophy',
        points: 25,
        rarity: 'common',
        createdAt: new Date(),
      };

      prisma.achievement.findUnique.mockResolvedValue(mockAchievement);
      prisma.userAchievement.findUnique.mockResolvedValue(null); // Not completed
      prisma.userProgress.count.mockResolvedValue(6); // 6 out of 10 sessions

      const result = await AchievementEngine.calculateProgress(mockUserId, 'ach-sessions-10');

      expect(result.achievementId).toBe('ach-sessions-10');
      expect(result.currentProgress).toBe(6);
      expect(result.targetProgress).toBe(10);
      expect(result.progressPercentage).toBe(60);
      expect(result.isCompleted).toBe(false);
    });

    it('should handle completed achievements', async () => {
      const mockAchievement = {
        id: 'ach-sessions-5',
        name: '5 Sessions',
        description: 'Complete 5 exercise sessions',
        category: 'milestone',
        criteria: {
          type: 'total_sessions',
          target: 5,
        },
        badgeIcon: 'star',
        points: 15,
        rarity: 'common',
        createdAt: new Date(),
      };

      prisma.achievement.findUnique.mockResolvedValue(mockAchievement);
      prisma.userAchievement.findUnique.mockResolvedValue({
        id: 'ua-completed',
        userId: mockUserId,
        achievementId: 'ach-sessions-5',
        earnedAt: new Date(),
      });
      prisma.userProgress.count.mockResolvedValue(8); // More than target

      const result = await AchievementEngine.calculateProgress(mockUserId, 'ach-sessions-5');

      expect(result.currentProgress).toBe(8);
      expect(result.targetProgress).toBe(5);
      expect(result.progressPercentage).toBe(100); // Capped at 100%
      expect(result.isCompleted).toBe(true);
    });

    it('should throw error for non-existent achievement', async () => {
      prisma.achievement.findUnique.mockResolvedValue(null);

      await expect(
        AchievementEngine.calculateProgress(mockUserId, 'non-existent')
      ).rejects.toThrow('Achievement not found');
    });
  });

  describe('getAllAchievementsWithProgress', () => {
    it('should return all achievements with progress data', async () => {
      const mockAchievements = [
        {
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
        {
          id: 'ach-2',
          name: 'Consistency',
          description: 'Complete 10 exercises',
          category: 'milestone',
          criteria: { type: 'total_sessions', target: 10 },
          badgeIcon: 'trophy',
          points: 50,
          rarity: 'rare',
          createdAt: new Date(),
        },
      ];

      prisma.achievement.findMany.mockResolvedValue(mockAchievements);
      
      // Mock progress calculations
      prisma.achievement.findUnique
        .mockResolvedValueOnce(mockAchievements[0])
        .mockResolvedValueOnce(mockAchievements[1]);
      
      prisma.userAchievement.findUnique
        .mockResolvedValueOnce({ id: 'ua-1' }) // First is completed
        .mockResolvedValueOnce(null); // Second is not completed
      
      prisma.userProgress.count
        .mockResolvedValueOnce(5) // Current progress for first
        .mockResolvedValueOnce(7); // Current progress for second

      const result = await AchievementEngine.getAllAchievementsWithProgress(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].isCompleted).toBe(true);
      expect(result[1].isCompleted).toBe(false);
      expect(result[1].progressPercentage).toBe(70); // 7/10 * 100
    });

    it('should order achievements by category and points', async () => {
      prisma.achievement.findMany.mockResolvedValue([]);

      await AchievementEngine.getAllAchievementsWithProgress(mockUserId);

      expect(prisma.achievement.findMany).toHaveBeenCalledWith({
        orderBy: [{ category: 'asc' }, { points: 'asc' }],
      });
    });
  });

  describe('getAchievementStats', () => {
    it('should return comprehensive achievement statistics', async () => {
      prisma.achievement.count.mockResolvedValue(25);
      prisma.userAchievement.count.mockResolvedValue(150);
      
      // Most earned achievement (first groupBy call)
      prisma.userAchievement.groupBy
        .mockResolvedValueOnce([
          {
            achievementId: 'ach-popular',
            _count: { achievementId: 45 },
          },
        ])
        // Rare achievements (second groupBy call)
        .mockResolvedValueOnce([
          {
            achievementId: 'ach-rare',
            _count: { achievementId: 3 },
          },
        ]);
      
      prisma.achievement.findUnique
        .mockResolvedValueOnce({
          id: 'ach-popular',
          name: 'Popular Achievement',
          rarity: 'common',
        })
        .mockResolvedValueOnce({
          id: 'ach-rare',
          name: 'Rare Achievement',
          rarity: 'epic',
        });

      const result = await AchievementEngine.getAchievementStats();

      expect(result.totalAchievements).toBe(25);
      expect(result.totalAwarded).toBe(150);
      expect(result.mostEarnedAchievement).toEqual({
        name: 'Popular Achievement',
        count: 45,
      });
    });

    it('should handle case with no achievements', async () => {
      prisma.achievement.count.mockResolvedValue(0);
      prisma.userAchievement.count.mockResolvedValue(0);
      prisma.userAchievement.groupBy.mockResolvedValue([]);

      const result = await AchievementEngine.getAchievementStats();

      expect(result.totalAchievements).toBe(0);
      expect(result.totalAwarded).toBe(0);
      expect(result.mostEarnedAchievement).toBeNull();
      expect(result.rareAchievements).toEqual([]);
    });
  });

  describe('Achievement criteria evaluation', () => {
    it('should correctly evaluate different criteria types', async () => {
      const testCases = [
        {
          criteria: { type: 'total_sessions', target: 5 },
          mockSetup: () => prisma.userProgress.count.mockResolvedValue(5),
          shouldPass: true,
        },
        {
          criteria: { type: 'total_sessions', target: 10 },
          mockSetup: () => prisma.userProgress.count.mockResolvedValue(8),
          shouldPass: false,
        },
        {
          criteria: { type: 'streak', target: 7 },
          mockSetup: () => prisma.userStreak.findUnique.mockResolvedValue({ currentCount: 7 }),
          shouldPass: true,
        },
        {
          criteria: { type: 'body_area_mastery', bodyArea: 'nervensystem', target: 15 },
          mockSetup: () => prisma.userProgress.count.mockImplementation(({ where }) => 
            where.bodyArea === 'nervensystem' ? Promise.resolve(15) : Promise.resolve(0)
          ),
          shouldPass: true,
        },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        
        const mockAchievement = {
          id: 'test-ach',
          name: 'Test Achievement',
          description: 'Test',
          category: 'test',
          criteria: testCase.criteria,
          badgeIcon: 'test',
          points: 10,
          rarity: 'common',
          createdAt: new Date(),
        };

        prisma.userAchievement.findMany.mockResolvedValue([]);
        prisma.achievement.findMany.mockResolvedValue([mockAchievement]);
        testCase.mockSetup();

        if (testCase.shouldPass) {
          prisma.userAchievement.create.mockResolvedValue({
            id: 'ua-test',
            userId: mockUserId,
            achievementId: 'test-ach',
            earnedAt: new Date(),
            progressSnapshot: {},
          });
        }

        const result = await AchievementEngine.checkAchievements(mockUserId, mockProgressEntry);

        if (testCase.shouldPass) {
          expect(result).toHaveLength(1);
          expect(prisma.userAchievement.create).toHaveBeenCalled();
        } else {
          expect(result).toHaveLength(0);
          expect(prisma.userAchievement.create).not.toHaveBeenCalled();
        }
      }
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      prisma.userAchievement.findMany.mockRejectedValue(new Error('Database error'));

      // The method should return empty array on error, not throw
      const result = await AchievementEngine.checkAchievements(mockUserId, mockProgressEntry);
      expect(result).toEqual([]);
    });

    it('should handle missing achievement data', async () => {
      prisma.achievement.findUnique.mockResolvedValue(null);

      await expect(
        AchievementEngine.calculateProgress(mockUserId, 'missing-achievement')
      ).rejects.toThrow('Achievement not found');
    });
  });
});