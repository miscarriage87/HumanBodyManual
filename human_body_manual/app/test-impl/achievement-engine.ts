
// Direct implementation of AchievementEngine for testing
import { 
  Achievement, 
  UserAchievement, 
  AchievementProgress, 
  ProgressEntry 
} from '../lib/types';

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
}
