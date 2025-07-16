import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { cacheService } from './cache';

// Query optimization utilities for progress tracking
export class QueryOptimizer {
  /**
   * Optimized user progress query with caching
   */
  static async getUserProgressOptimized(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      bodyArea?: string;
      dateRange?: { start: Date; end: Date };
      includeStats?: boolean;
    } = {}
  ) {
    const { limit = 50, offset = 0, bodyArea, dateRange, includeStats = false } = options;
    
    // Generate cache key based on parameters
    const cacheKey = `user_progress_optimized:${userId}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Build optimized query
    const whereClause: Prisma.UserProgressWhereInput = {
      userId,
      ...(bodyArea && { bodyArea }),
      ...(dateRange && {
        completedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }),
    };

    // Use cursor-based pagination for better performance on large datasets
    const progressData = await prisma.progressEntry.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        exerciseId: true,
        bodyArea: true,
        completedAt: true,
        durationMinutes: true,
        difficultyLevel: true,
        mood: true,
        energyLevel: true,
      },
    });

    let result: any = { progress: progressData };

    // Add aggregated stats if requested
    if (includeStats) {
      const stats = await this.getUserStatsOptimized(userId, dateRange);
      result.stats = stats;
    }

    // Cache the result
    await cacheService.set(cacheKey, result, 300); // 5 minutes cache

    return result;
  }

  /**
   * Optimized user statistics calculation
   */
  static async getUserStatsOptimized(
    userId: string,
    dateRange?: { start: Date; end: Date }
  ) {
    const cacheKey = `user_stats_optimized:${userId}:${dateRange ? JSON.stringify(dateRange) : 'all'}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const whereClause: Prisma.UserProgressWhereInput = {
      userId,
      ...(dateRange && {
        completedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      }),
    };

    // Use aggregation queries for better performance
    const [totalStats, bodyAreaStats, exerciseStats] = await Promise.all([
      // Total sessions and duration
      prisma.progressEntry.aggregate({
        where: whereClause,
        _count: { id: true },
        _sum: { durationMinutes: true },
        _avg: { durationMinutes: true },
      }),

      // Body area breakdown
      prisma.progressEntry.groupBy({
        by: ['bodyArea'],
        where: whereClause,
        _count: { bodyArea: true },
        _sum: { durationMinutes: true },
        orderBy: { _count: { bodyArea: 'desc' } },
      }),

      // Exercise frequency
      prisma.progressEntry.groupBy({
        by: ['exerciseId'],
        where: whereClause,
        _count: { exerciseId: true },
        orderBy: { _count: { exerciseId: 'desc' } },
        take: 10,
      }),
    ]);

    const result = {
      totalSessions: totalStats._count.id,
      totalMinutes: totalStats._sum.durationMinutes || 0,
      averageSessionDuration: totalStats._avg.durationMinutes || 0,
      bodyAreaBreakdown: bodyAreaStats,
      topExercises: exerciseStats,
      calculatedAt: new Date(),
    };

    // Cache for 30 minutes
    await cacheService.set(cacheKey, result, 1800);

    return result;
  }

  /**
   * Optimized streak calculation
   */
  static async getStreaksOptimized(userId: string) {
    const cacheKey = `streaks_optimized:${userId}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get current streaks from database
    const streaks = await prisma.streak.findMany({
      where: { userId },
      orderBy: { currentCount: 'desc' },
    });

    // Calculate daily streak from recent progress
    const dailyStreak = await this.calculateDailyStreak(userId);

    const result = {
      streaks,
      dailyStreak,
      calculatedAt: new Date(),
    };

    // Cache for 15 minutes
    await cacheService.set(cacheKey, result, 900);

    return result;
  }

  /**
   * Calculate daily streak efficiently
   */
  private static async calculateDailyStreak(userId: string): Promise<number> {
    // Get distinct dates of user progress in descending order
    const distinctDates = await prisma.$queryRaw<Array<{ date: Date }>>`
      SELECT DISTINCT DATE(completed_at) as date
      FROM user_progress
      WHERE user_id = ${userId}
      ORDER BY date DESC
      LIMIT 100
    `;

    if (distinctDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < distinctDates.length; i++) {
      const currentDate = new Date(distinctDates[i].date);
      currentDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (currentDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Optimized achievements query
   */
  static async getUserAchievementsOptimized(userId: string) {
    const cacheKey = `achievements_optimized:${userId}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [userAchievements, allAchievements] = await Promise.all([
      prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              badgeIcon: true,
              points: true,
              rarity: true,
            },
          },
        },
        orderBy: { earnedAt: 'desc' },
      }),

      prisma.achievement.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          criteria: true,
          badgeIcon: true,
          points: true,
          rarity: true,
        },
      }),
    ]);

    const earnedIds = new Set(userAchievements.map(ua => ua.achievementId));
    const availableAchievements = allAchievements.filter(a => !earnedIds.has(a.id));

    const result = {
      earned: userAchievements,
      available: availableAchievements,
      totalPoints: userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0),
      calculatedAt: new Date(),
    };

    // Cache for 1 hour
    await cacheService.set(cacheKey, result, 3600);

    return result;
  }

  /**
   * Optimized community statistics
   */
  static async getCommunityStatsOptimized(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    const cacheKey = `community_stats_optimized:${timeframe}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const [activeUsers, sessionStats, popularExercises, bodyAreaStats] = await Promise.all([
      // Count unique active users
      prisma.progressEntry.findMany({
        where: { completedAt: { gte: startDate } },
        select: { userId: true },
        distinct: ['userId'],
      }),

      // Session statistics
      prisma.progressEntry.aggregate({
        where: { completedAt: { gte: startDate } },
        _count: { id: true },
        _sum: { durationMinutes: true },
        _avg: { durationMinutes: true },
      }),

      // Popular exercises
      prisma.progressEntry.groupBy({
        by: ['exerciseId'],
        where: { completedAt: { gte: startDate } },
        _count: { exerciseId: true },
        orderBy: { _count: { exerciseId: 'desc' } },
        take: 10,
      }),

      // Body area popularity
      prisma.progressEntry.groupBy({
        by: ['bodyArea'],
        where: { completedAt: { gte: startDate } },
        _count: { bodyArea: true },
        _sum: { durationMinutes: true },
        orderBy: { _count: { bodyArea: 'desc' } },
      }),
    ]);

    const result = {
      timeframe,
      activeUsers: activeUsers.length,
      totalSessions: sessionStats._count.id,
      totalMinutes: sessionStats._sum.durationMinutes || 0,
      averageSessionDuration: sessionStats._avg.durationMinutes || 0,
      popularExercises,
      bodyAreaStats,
      calculatedAt: new Date(),
    };

    // Cache for different durations based on timeframe
    const cacheTTL = timeframe === 'daily' ? 3600 : timeframe === 'weekly' ? 7200 : 14400;
    await cacheService.set(cacheKey, result, cacheTTL);

    return result;
  }

  /**
   * Paginated progress history with cursor-based pagination
   */
  static async getProgressHistoryPaginated(
    userId: string,
    cursor?: string,
    limit: number = 20,
    bodyArea?: string
  ) {
    const cacheKey = `progress_history:${userId}:${cursor || 'start'}:${limit}:${bodyArea || 'all'}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const whereClause: Prisma.UserProgressWhereInput = {
      userId,
      ...(bodyArea && { bodyArea }),
      ...(cursor && { id: { lt: cursor } }),
    };

    const progress = await prisma.progressEntry.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' },
      take: limit + 1, // Take one extra to determine if there are more results
      select: {
        id: true,
        exerciseId: true,
        bodyArea: true,
        completedAt: true,
        durationMinutes: true,
        difficultyLevel: true,
        mood: true,
        energyLevel: true,
      },
    });

    const hasMore = progress.length > limit;
    const items = hasMore ? progress.slice(0, -1) : progress;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const result = {
      items,
      nextCursor,
      hasMore,
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Batch invalidate related caches when user progress is updated
   */
  static async invalidateUserCaches(userId: string, bodyArea?: string) {
    const patterns = [
      `user_progress_optimized:${userId}:*`,
      `user_stats_optimized:${userId}:*`,
      `streaks_optimized:${userId}`,
      `achievements_optimized:${userId}`,
      `progress_history:${userId}:*`,
    ];

    if (bodyArea) {
      patterns.push(`body_area_stats:${userId}:${bodyArea}`);
    }

    for (const pattern of patterns) {
      await cacheService.deletePattern(pattern);
    }

    // Also invalidate community stats as user activity affects them
    await cacheService.deletePattern('community_stats_optimized:*');
  }
}

// Database performance monitoring
export class PerformanceMonitor {
  private static queryTimes: Map<string, number[]> = new Map();

  static startTimer(queryName: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      
      if (!this.queryTimes.has(queryName)) {
        this.queryTimes.set(queryName, []);
      }
      
      const times = this.queryTimes.get(queryName)!;
      times.push(duration);
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      }
    };
  }

  static getQueryStats(queryName: string) {
    const times = this.queryTimes.get(queryName) || [];
    if (times.length === 0) return null;

    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    return {
      queryName,
      count: times.length,
      averageMs: Math.round(avg),
      minMs: min,
      maxMs: max,
    };
  }

  static getAllStats() {
    return Array.from(this.queryTimes.keys()).map(queryName => 
      this.getQueryStats(queryName)
    ).filter(Boolean);
  }
}

// Export optimized query functions
export const optimizedQueries = {
  getUserProgress: QueryOptimizer.getUserProgressOptimized,
  getUserStats: QueryOptimizer.getUserStatsOptimized,
  getStreaks: QueryOptimizer.getStreaksOptimized,
  getUserAchievements: QueryOptimizer.getUserAchievementsOptimized,
  getCommunityStats: QueryOptimizer.getCommunityStatsOptimized,
  getProgressHistory: QueryOptimizer.getProgressHistoryPaginated,
};