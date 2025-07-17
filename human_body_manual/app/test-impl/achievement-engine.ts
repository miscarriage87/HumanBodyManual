
import { 
  Achievement, 
  UserAchievement, 
  AchievementProgress, 
  ProgressEntry,
  BodyAreaType 
} from '../lib/types';

// Mock implementation for testing
export class AchievementEngine {
  static async checkAchievements(
    userId: string, 
    progressData: ProgressEntry
  ): Promise<Achievement[]> {
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
  }

  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
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
  }

  static async calculateProgress(
    userId: string, 
    achievementId: string
  ): Promise<AchievementProgress> {
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
  }

  static async getAllAchievementsWithProgress(userId: string): Promise<AchievementProgress[]> {
    return [
      {
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
        currentProgress: 1,
        targetProgress: 1,
        progressPercentage: 100,
        isCompleted: true,
      },
      {
        achievementId: 'ach-2',
        achievement: {
          id: 'ach-2',
          name: 'Regular Practice',
          description: 'Complete 10 exercises',
          category: 'milestone',
          criteria: { type: 'total_sessions', target: 10 },
          badgeIcon: 'medal',
          points: 20,
          rarity: 'uncommon',
          createdAt: new Date(),
        },
        currentProgress: 7,
        targetProgress: 10,
        progressPercentage: 70,
        isCompleted: false,
      },
    ];
  }

  static async getAchievementStats(): Promise<{
    totalAchievements: number;
    totalAwarded: number;
    mostEarnedAchievement: { name: string; count: number } | null;
    rareAchievements: { name: string; count: number }[];
  }> {
    return {
      totalAchievements: 25,
      totalAwarded: 150,
      mostEarnedAchievement: {
        name: 'First Steps',
        count: 50,
      },
      rareAchievements: [
        {
          name: 'Master of All',
          count: 3,
        },
      ],
    };
  }
}
