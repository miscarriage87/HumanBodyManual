import { PrismaClient } from '@prisma/client';
import { 
  CommunityStats, 
  CommunityChallenge, 
  ChallengeParticipant, 
  ChallengeProgress,
  CommunityAchievement,
  UserCommunityAchievement,
  Leaderboard,
  LeaderboardEntry,
  PopularExercise,
  BodyAreaPopularity,
  BodyAreaType
} from './types';

const prisma = new PrismaClient();

export class CommunityService {
  /**
   * Generate mock community statistics for testing
   */
  static generateMockCommunityStats(
    statType: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): CommunityStats {
    const now = new Date();
    
    return {
      id: 'mock-stats-' + statType,
      statType,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      totalActiveUsers: Math.floor(Math.random() * 500) + 100,
      totalSessions: Math.floor(Math.random() * 2000) + 500,
      averageSessionDuration: Math.floor(Math.random() * 30) + 15,
      popularExercises: [
        {
          exerciseId: 'atemtechnik-4-7-8',
          completionCount: Math.floor(Math.random() * 200) + 50,
          rank: 1,
          trendDirection: 'up' as const
        },
        {
          exerciseId: 'kalt-duschen',
          completionCount: Math.floor(Math.random() * 150) + 40,
          rank: 2,
          trendDirection: 'stable' as const
        },
        {
          exerciseId: 'meditation-10min',
          completionCount: Math.floor(Math.random() * 180) + 35,
          rank: 3,
          trendDirection: 'up' as const
        }
      ],
      bodyAreaStats: [
        {
          bodyArea: 'nervensystem',
          practitionerCount: Math.floor(Math.random() * 150) + 50,
          averageSessionsPerWeek: 3.2,
          popularityRank: 1,
          totalSessions: Math.floor(Math.random() * 400) + 100,
          averageDuration: 18.5
        },
        {
          bodyArea: 'bewegung',
          practitionerCount: Math.floor(Math.random() * 120) + 40,
          averageSessionsPerWeek: 2.8,
          popularityRank: 2,
          totalSessions: Math.floor(Math.random() * 350) + 80,
          averageDuration: 25.3
        },
        {
          bodyArea: 'kaelte',
          practitionerCount: Math.floor(Math.random() * 100) + 30,
          averageSessionsPerWeek: 2.1,
          popularityRank: 3,
          totalSessions: Math.floor(Math.random() * 200) + 60,
          averageDuration: 12.7
        }
      ],
      generatedAt: now
    };
  }

  /**
   * Generate anonymized community statistics
   */
  static async generateCommunityStats(
    statType: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<CommunityStats> {
    const now = new Date();
    let startDate: Date;
    
    // Calculate date range based on stat type
    switch (statType) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
    }

    // Get anonymized aggregated data
    const [
      totalActiveUsers,
      totalSessions,
      averageSessionDuration,
      popularExercises,
      bodyAreaStats
    ] = await Promise.all([
      this.getTotalActiveUsers(startDate),
      this.getTotalSessions(startDate),
      this.getAverageSessionDuration(startDate),
      this.getPopularExercises(startDate),
      this.getBodyAreaPopularity(startDate)
    ]);

    // Check if stats already exist for this period
    const existingStats = await prisma.communityStats.findUnique({
      where: {
        statType_date: {
          statType,
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      }
    });

    const statsData = {
      statType,
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      totalActiveUsers,
      totalSessions,
      averageSessionDuration,
      popularExercises: popularExercises as any,
      bodyAreaStats: bodyAreaStats as any
    };

    let communityStats;
    if (existingStats) {
      // Update existing stats
      communityStats = await prisma.communityStats.update({
        where: { id: existingStats.id },
        data: statsData
      });
    } else {
      // Create new stats
      communityStats = await prisma.communityStats.create({
        data: statsData
      });
    }

    return {
      id: communityStats.id,
      statType: communityStats.statType as 'daily' | 'weekly' | 'monthly',
      date: communityStats.date,
      totalActiveUsers: communityStats.totalActiveUsers,
      totalSessions: communityStats.totalSessions,
      averageSessionDuration: communityStats.averageSessionDuration,
      popularExercises: (communityStats.popularExercises as unknown) as PopularExercise[],
      bodyAreaStats: (communityStats.bodyAreaStats as unknown) as BodyAreaPopularity[],
      generatedAt: communityStats.generatedAt
    };
  }

  /**
   * Get community statistics (cached version)
   */
  static async getCommunityStats(
    statType: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<CommunityStats | null> {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const stats = await prisma.communityStats.findUnique({
      where: {
        statType_date: {
          statType,
          date: targetDate
        }
      }
    });

    if (!stats) {
      return null;
    }

    return {
      id: stats.id,
      statType: stats.statType as 'daily' | 'weekly' | 'monthly',
      date: stats.date,
      totalActiveUsers: stats.totalActiveUsers,
      totalSessions: stats.totalSessions,
      averageSessionDuration: stats.averageSessionDuration,
      popularExercises: (stats.popularExercises as unknown) as PopularExercise[],
      bodyAreaStats: (stats.bodyAreaStats as unknown) as BodyAreaPopularity[],
      generatedAt: stats.generatedAt
    };
  }

  /**
   * Create a new community challenge
   */
  static async createChallenge(challengeData: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    targetMetric: string;
    targetValue: number;
    rewards: any[];
  }): Promise<CommunityChallenge> {
    const challenge = await prisma.communityChallenge.create({
      data: {
        ...challengeData,
        rewards: challengeData.rewards
      },
      include: {
        participants: true
      }
    });

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      targetMetric: challenge.targetMetric,
      targetValue: challenge.targetValue,
      rewards: challenge.rewards as any[],
      isActive: challenge.isActive,
      participantCount: challenge.participants.length,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt
    };
  }

  /**
   * Get active community challenges
   */
  static async getActiveChallenges(): Promise<CommunityChallenge[]> {
    const challenges = await prisma.communityChallenge.findMany({
      where: {
        isActive: true,
        endDate: {
          gte: new Date()
        }
      },
      include: {
        participants: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return challenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      targetMetric: challenge.targetMetric,
      targetValue: challenge.targetValue,
      rewards: challenge.rewards as any[],
      isActive: challenge.isActive,
      participantCount: challenge.participants.length,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt
    }));
  }

  /**
   * Join a community challenge
   */
  static async joinChallenge(userId: string, challengeId: string): Promise<ChallengeParticipant> {
    // Check if user is already participating
    const existingParticipant = await prisma.challengeParticipant.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId
        }
      }
    });

    if (existingParticipant) {
      throw new Error('User is already participating in this challenge');
    }

    const participant = await prisma.challengeParticipant.create({
      data: {
        userId,
        challengeId,
        progress: {
          currentValue: 0,
          targetValue: 0,
          progressPercentage: 0,
          lastUpdated: new Date()
        }
      }
    });

    return {
      id: participant.id,
      userId: participant.userId,
      challengeId: participant.challengeId,
      joinedAt: participant.joinedAt,
      progress: (participant.progress as unknown) as ChallengeProgress,
      completed: participant.completed,
      completedAt: participant.completedAt || undefined
    };
  }

  /**
   * Update challenge progress for a user
   */
  static async updateChallengeProgress(
    userId: string, 
    challengeId: string, 
    newValue: number
  ): Promise<ChallengeParticipant> {
    const challenge = await prisma.communityChallenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const participant = await prisma.challengeParticipant.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId
        }
      }
    });

    if (!participant) {
      throw new Error('User is not participating in this challenge');
    }

    const progressPercentage = Math.min((newValue / challenge.targetValue) * 100, 100);
    const completed = newValue >= challenge.targetValue;

    const updatedParticipant = await prisma.challengeParticipant.update({
      where: { id: participant.id },
      data: {
        progress: {
          currentValue: newValue,
          targetValue: challenge.targetValue,
          progressPercentage,
          lastUpdated: new Date()
        },
        completed,
        completedAt: completed ? new Date() : null
      }
    });

    // Check for community achievements if challenge is completed
    if (completed && !participant.completed) {
      await this.checkCommunityAchievements(userId, 'challenge_completion', {
        challengeId,
        challengeTitle: challenge.title
      });
    }

    return {
      id: updatedParticipant.id,
      userId: updatedParticipant.userId,
      challengeId: updatedParticipant.challengeId,
      joinedAt: updatedParticipant.joinedAt,
      progress: (updatedParticipant.progress as unknown) as ChallengeProgress,
      completed: updatedParticipant.completed,
      completedAt: updatedParticipant.completedAt || undefined
    };
  }

  /**
   * Generate leaderboard with anonymized rankings
   */
  static async generateLeaderboard(
    metric: string,
    period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly',
    userId?: string
  ): Promise<Leaderboard> {
    let startDate: Date | undefined;
    const now = new Date();

    // Calculate date range based on period
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all_time':
        startDate = undefined;
        break;
    }

    // Get user statistics based on metric
    const userStats = await this.getUserStatsByMetric(metric, startDate);
    
    // Sort and rank users
    const sortedStats = userStats.sort((a, b) => b.value - a.value);
    const totalParticipants = sortedStats.length;

    // Create leaderboard entries with anonymization
    const entries: LeaderboardEntry[] = sortedStats.map((stat, index) => {
      const rank = index + 1;
      const percentile = Math.round(((totalParticipants - rank) / totalParticipants) * 100);
      
      return {
        rank,
        percentile,
        value: stat.value,
        isCurrentUser: userId ? stat.userId === userId : false,
        anonymizedId: userId && stat.userId === userId ? undefined : `user_${rank}`
      };
    });

    return {
      metric,
      period,
      entries,
      totalParticipants,
      lastUpdated: new Date()
    };
  }

  /**
   * Check and award community achievements
   */
  static async checkCommunityAchievements(
    userId: string,
    triggerType: string,
    context: Record<string, any>
  ): Promise<UserCommunityAchievement[]> {
    const achievements = await prisma.communityAchievement.findMany({
      where: {
        isActive: true,
        criteria: {
          path: ['type'],
          equals: triggerType
        }
      }
    });

    const newAchievements: UserCommunityAchievement[] = [];

    for (const achievement of achievements) {
      const criteria = achievement.criteria as any;
      const meetsRequirements = await this.checkAchievementRequirements(
        userId,
        criteria,
        context
      );

      if (meetsRequirements) {
        // Check if user already has this achievement
        const existingAchievement = await prisma.userCommunityAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id
            }
          }
        });

        if (!existingAchievement) {
          const userAchievement = await prisma.userCommunityAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              context
            },
            include: {
              achievement: true
            }
          });

          newAchievements.push({
            id: userAchievement.id,
            userId: userAchievement.userId,
            achievementId: userAchievement.achievementId,
            achievement: {
              id: userAchievement.achievement.id,
              name: userAchievement.achievement.name,
              description: userAchievement.achievement.description,
              criteria: userAchievement.achievement.criteria as any,
              badgeIcon: userAchievement.achievement.badgeIcon || undefined,
              points: userAchievement.achievement.points,
              rarity: userAchievement.achievement.rarity as any,
              isActive: userAchievement.achievement.isActive,
              createdAt: userAchievement.achievement.createdAt
            },
            earnedAt: userAchievement.earnedAt,
            context: userAchievement.context as any
          });
        }
      }
    }

    return newAchievements;
  }

  // Private helper methods

  private static async getTotalActiveUsers(startDate: Date): Promise<number> {
    const result = await prisma.userProgress.groupBy({
      by: ['userId'],
      where: {
        completedAt: {
          gte: startDate
        }
      }
    });

    return result.length;
  }

  private static async getTotalSessions(startDate: Date): Promise<number> {
    const result = await prisma.userProgress.count({
      where: {
        completedAt: {
          gte: startDate
        }
      }
    });

    return result;
  }

  private static async getAverageSessionDuration(startDate: Date): Promise<number> {
    const result = await prisma.userProgress.aggregate({
      where: {
        completedAt: {
          gte: startDate
        },
        durationMinutes: {
          not: null
        }
      },
      _avg: {
        durationMinutes: true
      }
    });

    return result._avg.durationMinutes || 0;
  }

  private static async getPopularExercises(startDate: Date): Promise<PopularExercise[]> {
    const result = await prisma.userProgress.groupBy({
      by: ['exerciseId'],
      where: {
        completedAt: {
          gte: startDate
        }
      },
      _count: {
        exerciseId: true
      },
      orderBy: {
        _count: {
          exerciseId: 'desc'
        }
      },
      take: 10
    });

    return result.map((item, index) => ({
      exerciseId: item.exerciseId,
      completionCount: item._count.exerciseId,
      rank: index + 1,
      trendDirection: 'stable' as const // Would need historical data for actual trend
    }));
  }

  private static async getBodyAreaPopularity(startDate: Date): Promise<BodyAreaPopularity[]> {
    const result = await prisma.userProgress.groupBy({
      by: ['bodyArea'],
      where: {
        completedAt: {
          gte: startDate
        }
      },
      _count: {
        bodyArea: true
      },
      _avg: {
        durationMinutes: true
      }
    });

    // Get unique practitioners per body area
    const practitionerCounts = await Promise.all(
      result.map(async (item) => {
        const practitioners = await prisma.userProgress.groupBy({
          by: ['userId'],
          where: {
            bodyArea: item.bodyArea,
            completedAt: {
              gte: startDate
            }
          }
        });
        return {
          bodyArea: item.bodyArea,
          practitionerCount: practitioners.length
        };
      })
    );

    return result.map((item, index) => {
      const practitionerData = practitionerCounts.find(p => p.bodyArea === item.bodyArea);
      
      return {
        bodyArea: item.bodyArea as BodyAreaType,
        practitionerCount: practitionerData?.practitionerCount || 0,
        averageSessionsPerWeek: Math.round(item._count.bodyArea / 7), // Approximate
        popularityRank: index + 1,
        totalSessions: item._count.bodyArea,
        averageDuration: item._avg.durationMinutes || 0
      };
    });
  }

  private static async getUserStatsByMetric(
    metric: string,
    startDate?: Date
  ): Promise<Array<{ userId: string; value: number }>> {
    const whereClause = startDate ? { completedAt: { gte: startDate } } : {};

    switch (metric) {
      case 'total_sessions':
        const sessionStats = await prisma.userProgress.groupBy({
          by: ['userId'],
          where: whereClause,
          _count: {
            id: true
          }
        });
        return sessionStats.map(stat => ({
          userId: stat.userId,
          value: stat._count.id
        }));

      case 'total_minutes':
        const minuteStats = await prisma.userProgress.groupBy({
          by: ['userId'],
          where: {
            ...whereClause,
            durationMinutes: { not: null }
          },
          _sum: {
            durationMinutes: true
          }
        });
        return minuteStats.map(stat => ({
          userId: stat.userId,
          value: stat._sum.durationMinutes || 0
        }));

      case 'current_streak':
        const streakStats = await prisma.userStreak.findMany({
          where: {
            streakType: 'daily'
          },
          select: {
            userId: true,
            currentCount: true
          }
        });
        return streakStats.map(stat => ({
          userId: stat.userId,
          value: stat.currentCount
        }));

      default:
        return [];
    }
  }

  private static async checkAchievementRequirements(
    userId: string,
    criteria: any,
    context: Record<string, any>
  ): Promise<boolean> {
    switch (criteria.type) {
      case 'challenge_completion':
        // Check if user has completed required number of challenges
        const completedChallenges = await prisma.challengeParticipant.count({
          where: {
            userId,
            completed: true
          }
        });
        return completedChallenges >= (criteria.requirements.challengeCount || 1);

      case 'community_participation':
        // Check if user has participated in community features
        const participationCount = await prisma.challengeParticipant.count({
          where: { userId }
        });
        return participationCount >= (criteria.requirements.participationCount || 1);

      case 'leaderboard_rank':
        // This would require more complex logic to check current leaderboard position
        return false; // Placeholder

      default:
        return false;
    }
  }
}