import Bull from 'bull';
import { prisma } from './prisma';
import { cacheService } from './cache';

// Job queue configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create job queues
export const analyticsQueue = new Bull('analytics processing', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const insightsQueue = new Bull('insights generation', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const cacheWarmupQueue = new Bull('cache warmup', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 3,
    attempts: 2,
  },
});

// Job types
export interface AnalyticsJobData {
  userId: string;
  type: 'user_stats' | 'body_area_stats' | 'community_stats';
  bodyArea?: string;
}

export interface InsightsJobData {
  userId: string;
  type: 'recommendations' | 'plateau_detection' | 'motivation';
}

export interface CacheWarmupJobData {
  userId: string;
  cacheTypes: string[];
}

// Analytics processing jobs
analyticsQueue.process('user_stats', async (job) => {
  const { userId } = job.data as AnalyticsJobData;
  
  try {
    // Calculate comprehensive user statistics
    const userStats = await calculateUserStats(userId);
    
    // Cache the results
    await cacheService.cacheUserStats(userId, userStats);
    
    console.log(`User stats calculated and cached for user: ${userId}`);
    return userStats;
  } catch (error) {
    console.error(`Error processing user stats for ${userId}:`, error);
    throw error;
  }
});

analyticsQueue.process('body_area_stats', async (job) => {
  const { userId, bodyArea } = job.data as AnalyticsJobData;
  
  if (!bodyArea) {
    throw new Error('Body area is required for body area stats job');
  }
  
  try {
    const bodyAreaStats = await calculateBodyAreaStats(userId, bodyArea);
    await cacheService.cacheBodyAreaStats(userId, bodyArea, bodyAreaStats);
    
    console.log(`Body area stats calculated for user: ${userId}, area: ${bodyArea}`);
    return bodyAreaStats;
  } catch (error) {
    console.error(`Error processing body area stats for ${userId}:`, error);
    throw error;
  }
});

analyticsQueue.process('community_stats', async (job) => {
  try {
    const communityStats = await calculateCommunityStats();
    await cacheService.cacheCommunityStats('daily', communityStats);
    
    console.log('Community stats calculated and cached');
    return communityStats;
  } catch (error) {
    console.error('Error processing community stats:', error);
    throw error;
  }
});

// Insights generation jobs
insightsQueue.process('recommendations', async (job) => {
  const { userId } = job.data as InsightsJobData;
  
  try {
    const recommendations = await generateRecommendations(userId);
    
    // Store insights in database
    await prisma.userInsight.create({
      data: {
        userId,
        insightType: 'recommendations',
        content: recommendations,
      },
    });
    
    console.log(`Recommendations generated for user: ${userId}`);
    return recommendations;
  } catch (error) {
    console.error(`Error generating recommendations for ${userId}:`, error);
    throw error;
  }
});

insightsQueue.process('plateau_detection', async (job) => {
  const { userId } = job.data as InsightsJobData;
  
  try {
    const plateauAnalysis = await detectPlateaus(userId);
    
    if (plateauAnalysis.hasPlateaus) {
      await prisma.userInsight.create({
        data: {
          userId,
          insightType: 'plateau_detection',
          content: plateauAnalysis,
        },
      });
    }
    
    console.log(`Plateau detection completed for user: ${userId}`);
    return plateauAnalysis;
  } catch (error) {
    console.error(`Error detecting plateaus for ${userId}:`, error);
    throw error;
  }
});

insightsQueue.process('motivation', async (job) => {
  const { userId } = job.data as InsightsJobData;
  
  try {
    const motivationInsights = await generateMotivationInsights(userId);
    
    await prisma.userInsight.create({
      data: {
        userId,
        insightType: 'motivation',
        content: motivationInsights,
      },
    });
    
    console.log(`Motivation insights generated for user: ${userId}`);
    return motivationInsights;
  } catch (error) {
    console.error(`Error generating motivation insights for ${userId}:`, error);
    throw error;
  }
});

// Cache warmup jobs
cacheWarmupQueue.process('warmup', async (job) => {
  const { userId, cacheTypes } = job.data as CacheWarmupJobData;
  
  try {
    for (const cacheType of cacheTypes) {
      switch (cacheType) {
        case 'user_progress':
          await warmupUserProgressCache(userId);
          break;
        case 'achievements':
          await warmupAchievementsCache(userId);
          break;
        case 'streaks':
          await warmupStreaksCache(userId);
          break;
      }
    }
    
    console.log(`Cache warmed up for user: ${userId}`);
  } catch (error) {
    console.error(`Error warming up cache for ${userId}:`, error);
    throw error;
  }
});

// Helper functions for analytics calculations
async function calculateUserStats(userId: string) {
  const [totalSessions, totalMinutes, streakData, recentProgress] = await Promise.all([
    prisma.userProgress.count({ where: { userId } }),
    prisma.userProgress.aggregate({
      where: { userId },
      _sum: { durationMinutes: true },
    }),
    prisma.userStreak.findMany({ where: { userId } }),
    prisma.userProgress.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 30,
    }),
  ]);

  const bodyAreaStats = await prisma.userProgress.groupBy({
    by: ['bodyArea'],
    where: { userId },
    _count: { bodyArea: true },
    _sum: { durationMinutes: true },
  });

  return {
    totalSessions,
    totalMinutes: totalMinutes._sum.durationMinutes || 0,
    streaks: streakData,
    bodyAreaStats,
    recentActivity: recentProgress,
    lastUpdated: new Date(),
  };
}

async function calculateBodyAreaStats(userId: string, bodyArea: string) {
  const [sessions, exercises, avgDuration] = await Promise.all([
    prisma.userProgress.count({
      where: { userId, bodyArea },
    }),
    prisma.userProgress.groupBy({
      by: ['exerciseId'],
      where: { userId, bodyArea },
      _count: { exerciseId: true },
    }),
    prisma.userProgress.aggregate({
      where: { userId, bodyArea },
      _avg: { durationMinutes: true },
    }),
  ]);

  const recentSessions = await prisma.userProgress.findMany({
    where: { userId, bodyArea },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });

  return {
    totalSessions: sessions,
    exerciseBreakdown: exercises,
    averageDuration: avgDuration._avg.durationMinutes || 0,
    recentSessions,
    lastUpdated: new Date(),
  };
}

async function calculateCommunityStats() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, weeklyStats, popularExercises, bodyAreaStats] = await Promise.all([
    prisma.user.count(),
    prisma.userProgress.aggregate({
      where: { completedAt: { gte: weekAgo } },
      _count: { id: true },
      _avg: { durationMinutes: true },
    }),
    prisma.userProgress.groupBy({
      by: ['exerciseId'],
      where: { completedAt: { gte: weekAgo } },
      _count: { exerciseId: true },
      orderBy: { _count: { exerciseId: 'desc' } },
      take: 10,
    }),
    prisma.userProgress.groupBy({
      by: ['bodyArea'],
      where: { completedAt: { gte: weekAgo } },
      _count: { bodyArea: true },
    }),
  ]);

  return {
    totalActiveUsers: totalUsers,
    weeklySessionCount: weeklyStats._count.id,
    averageSessionDuration: weeklyStats._avg.durationMinutes || 0,
    popularExercises,
    bodyAreaPopularity: bodyAreaStats,
    generatedAt: new Date(),
  };
}

async function generateRecommendations(userId: string) {
  // Get user's recent activity patterns
  const recentProgress = await prisma.userProgress.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    take: 50,
  });

  // Analyze patterns and generate recommendations
  const bodyAreaFrequency = recentProgress.reduce((acc, session) => {
    acc[session.bodyArea] = (acc[session.bodyArea] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leastPracticedAreas = Object.entries(bodyAreaFrequency)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([area]) => area);

  return {
    recommendedAreas: leastPracticedAreas,
    optimalPracticeTime: await calculateOptimalPracticeTime(userId),
    progressionSuggestions: await getProgressionSuggestions(userId),
    generatedAt: new Date(),
  };
}

async function detectPlateaus(userId: string) {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const recentProgress = await prisma.userProgress.findMany({
    where: {
      userId,
      completedAt: { gte: last30Days },
    },
    orderBy: { completedAt: 'asc' },
  });

  // Simple plateau detection: check if session frequency has decreased
  const firstHalf = recentProgress.slice(0, Math.floor(recentProgress.length / 2));
  const secondHalf = recentProgress.slice(Math.floor(recentProgress.length / 2));

  const hasPlateaus = secondHalf.length < firstHalf.length * 0.8;

  return {
    hasPlateaus,
    recentSessionCount: recentProgress.length,
    trend: hasPlateaus ? 'declining' : 'stable',
    suggestions: hasPlateaus ? [
      'Try varying your exercise routine',
      'Set smaller, achievable goals',
      'Consider joining a community challenge',
    ] : [],
    analyzedAt: new Date(),
  };
}

async function generateMotivationInsights(userId: string) {
  const streaks = await prisma.userStreak.findMany({ where: { userId } });
  const achievements = await prisma.userAchievement.count({ where: { userId } });

  return {
    currentStreaks: streaks,
    totalAchievements: achievements,
    motivationalMessage: getMotivationalMessage(streaks, achievements),
    nextMilestone: await getNextMilestone(userId),
    generatedAt: new Date(),
  };
}

// Cache warmup functions
async function warmupUserProgressCache(userId: string) {
  const userStats = await calculateUserStats(userId);
  await cacheService.cacheUserStats(userId, userStats);
}

async function warmupAchievementsCache(userId: string) {
  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });
  await cacheService.cacheAchievements(userId, achievements);
}

async function warmupStreaksCache(userId: string) {
  const streaks = await prisma.userStreak.findMany({ where: { userId } });
  await cacheService.cacheStreaks(userId, streaks);
}

// Utility functions
async function calculateOptimalPracticeTime(userId: string): Promise<string> {
  const sessions = await prisma.userProgress.findMany({
    where: { userId },
    select: { completedAt: true },
  });

  const hourCounts = sessions.reduce((acc, session) => {
    const hour = session.completedAt.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const optimalHour = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  return optimalHour ? `${optimalHour}:00` : '09:00';
}

async function getProgressionSuggestions(userId: string): Promise<string[]> {
  // This would analyze user's current level and suggest next steps
  return [
    'Try increasing session duration by 5 minutes',
    'Explore advanced variations of your favorite exercises',
    'Focus on consistency over intensity',
  ];
}

function getMotivationalMessage(streaks: any[], achievements: number): string {
  if (achievements > 10) {
    return "You're a wellness champion! Keep up the amazing work!";
  } else if (streaks.some(s => s.currentCount > 7)) {
    return "Your consistency is inspiring! You're building great habits!";
  } else {
    return "Every step counts on your wellness journey. You've got this!";
  }
}

async function getNextMilestone(userId: string): Promise<string> {
  const totalSessions = await prisma.userProgress.count({ where: { userId } });
  
  const milestones = [10, 25, 50, 100, 250, 500];
  const nextMilestone = milestones.find(m => m > totalSessions);
  
  return nextMilestone 
    ? `Complete ${nextMilestone - totalSessions} more sessions to reach ${nextMilestone} total sessions!`
    : "You've achieved all major milestones! Keep up the excellent work!";
}

// Job scheduling helpers
export class JobScheduler {
  static async scheduleUserAnalytics(userId: string) {
    await analyticsQueue.add('user_stats', { userId, type: 'user_stats' });
  }

  static async scheduleBodyAreaAnalytics(userId: string, bodyArea: string) {
    await analyticsQueue.add('body_area_stats', { userId, bodyArea, type: 'body_area_stats' });
  }

  static async scheduleCommunityAnalytics() {
    await analyticsQueue.add('community_stats', { type: 'community_stats' });
  }

  static async scheduleInsightsGeneration(userId: string) {
    await insightsQueue.add('recommendations', { userId, type: 'recommendations' });
    await insightsQueue.add('plateau_detection', { userId, type: 'plateau_detection' });
    await insightsQueue.add('motivation', { userId, type: 'motivation' });
  }

  static async scheduleCacheWarmup(userId: string, cacheTypes: string[] = ['user_progress', 'achievements', 'streaks']) {
    await cacheWarmupQueue.add('warmup', { userId, cacheTypes });
  }
}

// Export queues for monitoring
export { analyticsQueue, insightsQueue, cacheWarmupQueue };