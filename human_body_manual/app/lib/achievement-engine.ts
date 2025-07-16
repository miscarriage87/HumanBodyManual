import { 
  Achievement, 
  UserAchievement, 
  AchievementProgress, 
  ProgressEntry,
  BodyAreaType 
} from './types';
import { prisma } from './prisma';

export class AchievementEngine {
  /**
   * Check and award achievements after a progress entry
   */
  static async checkAchievements(
    userId: string, 
    progressData: ProgressEntry
  ): Promise<Achievement[]> {
    try {
      const newAchievements: Achievement[] = [];

      // Get all achievements that the user hasn't earned yet
      const earnedAchievementIds = await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      });

      const earnedIds = new Set(earnedAchievementIds.map((ua: { achievementId: string }) => ua.achievementId));

      const availableAchievements = await prisma.achievement.findMany({
        where: {
          id: { notIn: Array.from(earnedIds) },
        },
      });

      // Check each available achievement
      for (const achievement of availableAchievements) {
        const criteria = achievement.criteria as any;
        const isEarned = await this.checkAchievementCriteria(userId, criteria, progressData);

        if (isEarned) {
          // Award the achievement
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              progressSnapshot: {
                totalSessions: await this.getTotalSessions(userId),
                currentStreak: await this.getCurrentStreak(userId),
                bodyAreaProgress: await this.getBodyAreaProgress(userId),
              },
            },
          });

          newAchievements.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            category: achievement.category as any,
            criteria: achievement.criteria as any,
            badgeIcon: achievement.badgeIcon || '',
            points: achievement.points,
            rarity: achievement.rarity as any,
            createdAt: achievement.createdAt,
          });
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return []; // Return empty array on error instead of throwing
    }
  }

  /**
   * Get all achievements earned by a user
   */
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { earnedAt: 'desc' },
      });

      return userAchievements.map((ua: any) => ({
        id: ua.id,
        userId: ua.userId,
        achievementId: ua.achievementId,
        achievement: {
          id: ua.achievement.id,
          name: ua.achievement.name,
          description: ua.achievement.description,
          category: ua.achievement.category as any,
          criteria: ua.achievement.criteria as any,
          badgeIcon: ua.achievement.badgeIcon || '',
          points: ua.achievement.points,
          rarity: ua.achievement.rarity as any,
          createdAt: ua.achievement.createdAt,
        },
        earnedAt: ua.earnedAt,
        progressSnapshot: ua.progressSnapshot as any,
      }));
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Calculate progress towards a specific achievement
   */
  static async calculateProgress(
    userId: string, 
    achievementId: string
  ): Promise<AchievementProgress> {
    try {
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId },
      });

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      const criteria = achievement.criteria as any;
      const currentProgress = await this.getCurrentProgressForCriteria(userId, criteria);
      const targetProgress = criteria.target;
      const progressPercentage = Math.min((currentProgress / targetProgress) * 100, 100);

      // Check if already completed
      const isCompleted = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId,
          },
        },
      });

      return {
        achievementId,
        achievement: {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category as any,
          criteria: achievement.criteria as any,
          badgeIcon: achievement.badgeIcon || '',
          points: achievement.points,
          rarity: achievement.rarity as any,
          createdAt: achievement.createdAt,
        },
        currentProgress,
        targetProgress,
        progressPercentage,
        isCompleted: !!isCompleted,
      };
    } catch (error) {
      console.error('Error calculating achievement progress:', error);
      throw error;
    }
  }

  /**
   * Get all available achievements with progress
   */
  static async getAllAchievementsWithProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      const achievements = await prisma.achievement.findMany({
        orderBy: [{ category: 'asc' }, { points: 'asc' }],
      });

      const progressList: AchievementProgress[] = [];

      for (const achievement of achievements) {
        try {
          const progress = await this.calculateProgress(userId, achievement.id);
          progressList.push(progress);
        } catch (error) {
          console.warn(`Error calculating progress for achievement ${achievement.id}:`, error);
          // Continue with other achievements
        }
      }

      return progressList;
    } catch (error) {
      console.error('Error getting achievements with progress:', error);
      return [];
    }
  }

  /**
   * Check if specific achievement criteria is met
   */
  private static async checkAchievementCriteria(
    userId: string, 
    criteria: any, 
    progressData: ProgressEntry
  ): Promise<boolean> {
    switch (criteria.type) {
      case 'total_sessions':
        const totalSessions = await this.getTotalSessions(userId);
        return totalSessions >= criteria.target;

      case 'streak':
        const currentStreak = await this.getCurrentStreak(userId);
        return currentStreak >= criteria.target;

      case 'body_area_mastery':
        const bodyAreaSessions = await this.getBodyAreaSessions(userId, criteria.bodyArea);
        return bodyAreaSessions >= criteria.target;

      case 'consistency':
        if (criteria.conditions?.perfectWeek) {
          return await this.checkPerfectWeek(userId);
        }
        if (criteria.conditions?.allBodyAreas) {
          return await this.checkAllBodyAreasThisWeek(userId);
        }
        return false;

      case 'milestone':
        if (criteria.conditions?.joinedCommunity) {
          // This would be set when user joins community
          return false; // Placeholder
        }
        if (criteria.conditions?.sharedProgress) {
          // This would be set when user shares progress
          return false; // Placeholder
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Get current progress for specific criteria
   */
  private static async getCurrentProgressForCriteria(userId: string, criteria: any): Promise<number> {
    switch (criteria.type) {
      case 'total_sessions':
        return await this.getTotalSessions(userId);

      case 'streak':
        return await this.getCurrentStreak(userId);

      case 'body_area_mastery':
        return await this.getBodyAreaSessions(userId, criteria.bodyArea);

      case 'consistency':
        if (criteria.conditions?.perfectWeek) {
          return (await this.checkPerfectWeek(userId)) ? 1 : 0;
        }
        if (criteria.conditions?.allBodyAreas) {
          return (await this.checkAllBodyAreasThisWeek(userId)) ? 1 : 0;
        }
        return 0;

      default:
        return 0;
    }
  }

  // Helper methods

  private static async getTotalSessions(userId: string): Promise<number> {
    return await prisma.userProgress.count({
      where: { userId },
    });
  }

  private static async getCurrentStreak(userId: string): Promise<number> {
    const streak = await prisma.userStreak.findUnique({
      where: {
        userId_streakType: {
          userId,
          streakType: 'daily',
        },
      },
    });

    return streak?.currentCount || 0;
  }

  private static async getBodyAreaSessions(userId: string, bodyArea: BodyAreaType): Promise<number> {
    return await prisma.userProgress.count({
      where: { userId, bodyArea },
    });
  }

  private static async getBodyAreaProgress(userId: string): Promise<Record<string, number>> {
    const bodyAreas: BodyAreaType[] = [
      'nervensystem', 'hormone', 'zirkadian', 'mikrobiom', 
      'bewegung', 'fasten', 'kaelte', 'licht'
    ];

    const progress: Record<string, number> = {};

    for (const bodyArea of bodyAreas) {
      progress[bodyArea] = await this.getBodyAreaSessions(userId, bodyArea);
    }

    return progress;
  }

  private static async checkPerfectWeek(userId: string): Promise<boolean> {
    // Get start of current week (Sunday)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Count sessions this week
    const sessionsThisWeek = await prisma.userProgress.count({
      where: {
        userId,
        completedAt: { gte: weekStart },
      },
    });

    // For now, consider 7+ sessions a perfect week
    return sessionsThisWeek >= 7;
  }

  private static async checkAllBodyAreasThisWeek(userId: string): Promise<boolean> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const bodyAreasThisWeek = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: { gte: weekStart },
      },
      select: { bodyArea: true },
      distinct: ['bodyArea'],
    });

    const uniqueBodyAreas = new Set(bodyAreasThisWeek.map((p: any) => p.bodyArea));
    return uniqueBodyAreas.size >= 8; // All 8 body areas
  }

  /**
   * Get achievement statistics for admin/analytics
   */
  static async getAchievementStats(): Promise<{
    totalAchievements: number;
    totalAwarded: number;
    mostEarnedAchievement: { name: string; count: number } | null;
    rareAchievements: { name: string; count: number }[];
  }> {
    try {
      const totalAchievements = await prisma.achievement.count();
      const totalAwarded = await prisma.userAchievement.count();

      // Most earned achievement
      const achievementCounts = await prisma.userAchievement.groupBy({
        by: ['achievementId'],
        _count: { achievementId: true },
        orderBy: { _count: { achievementId: 'desc' } },
        take: 1,
      });

      let mostEarnedAchievement = null;
      if (achievementCounts.length > 0) {
        const achievement = await prisma.achievement.findUnique({
          where: { id: achievementCounts[0].achievementId },
        });
        if (achievement) {
          mostEarnedAchievement = {
            name: achievement.name,
            count: achievementCounts[0]._count.achievementId,
          };
        }
      }

      // Rare achievements (epic and legendary with low earn rates)
      const rareAchievementCounts = await prisma.userAchievement.groupBy({
        by: ['achievementId'],
        _count: { achievementId: true },
        having: { achievementId: { _count: { lt: 10 } } }, // Less than 10 people earned it
      });

      const rareAchievements = [];
      for (const rare of rareAchievementCounts) {
        const achievement = await prisma.achievement.findUnique({
          where: { id: rare.achievementId },
        });
        if (achievement && (achievement.rarity === 'epic' || achievement.rarity === 'legendary')) {
          rareAchievements.push({
            name: achievement.name,
            count: rare._count.achievementId,
          });
        }
      }

      return {
        totalAchievements,
        totalAwarded,
        mostEarnedAchievement,
        rareAchievements,
      };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
      return {
        totalAchievements: 0,
        totalAwarded: 0,
        mostEarnedAchievement: null,
        rareAchievements: [],
      };
    }
  }
}