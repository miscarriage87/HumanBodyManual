import { PrismaClient } from '@prisma/client';
import { 
  ProgressEntry, 
  ExerciseCompletion, 
  UserProgress, 
  StreakData, 
  BodyAreaStats,
  BodyAreaType,
  DifficultyLevel,
  DateRange
} from './types';

const prisma = new PrismaClient();

export class ProgressTracker {
  /**
   * Record a completed exercise session
   */
  static async recordCompletion(
    userId: string, 
    exerciseData: ExerciseCompletion
  ): Promise<ProgressEntry> {
    const progressEntry = await prisma.userProgress.create({
      data: {
        userId,
        exerciseId: exerciseData.exerciseId,
        bodyArea: exerciseData.bodyArea,
        completedAt: new Date(),
        durationMinutes: exerciseData.durationMinutes,
        difficultyLevel: exerciseData.difficultyLevel,
        sessionNotes: exerciseData.sessionNotes,
        biometricData: exerciseData.biometricData ? JSON.stringify(exerciseData.biometricData) : null,
        mood: exerciseData.mood,
        energyLevel: exerciseData.energyLevel,
      },
    });

    // Update streaks after recording completion
    await this.updateStreaks(userId);

    return {
      id: progressEntry.id,
      userId: progressEntry.userId,
      exerciseId: progressEntry.exerciseId,
      bodyArea: progressEntry.bodyArea as BodyAreaType,
      completedAt: progressEntry.completedAt,
      durationMinutes: progressEntry.durationMinutes || undefined,
      difficultyLevel: progressEntry.difficultyLevel as DifficultyLevel,
      sessionNotes: progressEntry.sessionNotes || undefined,
      biometricData: progressEntry.biometricData ? JSON.parse(progressEntry.biometricData as string) : undefined,
      mood: progressEntry.mood as any,
      energyLevel: progressEntry.energyLevel as any,
      createdAt: progressEntry.createdAt,
    };
  }

  /**
   * Get comprehensive user progress data
   */
  static async getUserProgress(
    userId: string, 
    timeRange?: DateRange
  ): Promise<UserProgress> {
    const whereClause: any = { userId };
    
    if (timeRange?.from || timeRange?.to) {
      whereClause.completedAt = {};
      if (timeRange.from) whereClause.completedAt.gte = timeRange.from;
      if (timeRange.to) whereClause.completedAt.lte = timeRange.to;
    }

    // Get total sessions and minutes
    const totalStats = await prisma.userProgress.aggregate({
      where: whereClause,
      _count: { id: true },
      _sum: { durationMinutes: true },
    });

    // Get current and longest streaks
    const streakData = await this.getStreakData(userId);
    const dailyStreak = streakData.find(s => s.streakType === 'daily');

    // Get body area statistics
    const bodyAreaStats = await this.getBodyAreaStats(userId);

    // Get recent achievements (last 30 days)
    const recentAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        earnedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
      take: 10,
    });

    // Get last activity
    const lastActivity = await prisma.userProgress.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });

    // Calculate weekly progress (assuming goal of 7 sessions per week)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyProgress = await prisma.userProgress.count({
      where: {
        userId,
        completedAt: { gte: weekStart },
      },
    });

    return {
      userId,
      totalSessions: totalStats._count.id || 0,
      totalMinutes: totalStats._sum.durationMinutes || 0,
      currentStreak: dailyStreak?.currentCount || 0,
      longestStreak: dailyStreak?.bestCount || 0,
      bodyAreaStats,
      recentAchievements: recentAchievements.map((ua: any) => ({
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
      })),
      weeklyGoal: 7, // Default weekly goal
      weeklyProgress,
      lastActivity: lastActivity?.completedAt || new Date(),
    };
  }

  /**
   * Get streak data for a user
   */
  static async getStreakData(userId: string): Promise<StreakData[]> {
    const streaks = await prisma.userStreak.findMany({
      where: { userId },
    });

    return streaks.map((streak: any) => ({
      userId: streak.userId,
      streakType: streak.streakType as any,
      currentCount: streak.currentCount,
      bestCount: streak.bestCount,
      lastActivityDate: streak.lastActivityDate || undefined,
      startedAt: streak.startedAt,
      isActive: this.isStreakActive(streak.lastActivityDate, streak.streakType as any),
    }));
  }

  /**
   * Get body area specific statistics
   */
  static async getBodyAreaStats(userId: string): Promise<BodyAreaStats[]> {
    const bodyAreas: BodyAreaType[] = [
      'nervensystem', 'hormone', 'zirkadian', 'mikrobiom', 
      'bewegung', 'fasten', 'kaelte', 'licht'
    ];

    const stats: BodyAreaStats[] = [];

    for (const bodyArea of bodyAreas) {
      const areaProgress = await prisma.userProgress.findMany({
        where: { userId, bodyArea },
        orderBy: { completedAt: 'desc' },
      });

      if (areaProgress.length === 0) {
        stats.push({
          bodyArea,
          totalSessions: 0,
          totalMinutes: 0,
          averageSessionDuration: 0,
          completionRate: 0,
          lastPracticed: new Date(0),
          favoriteExercises: [],
          consistencyScore: 0,
          masteryLevel: 'beginner',
        });
        continue;
      }

      const totalSessions = areaProgress.length;
      const totalMinutes = areaProgress.reduce((sum: number, p: any) => sum + (p.durationMinutes || 0), 0);
      const averageSessionDuration = totalMinutes / totalSessions;

      // Calculate favorite exercises (most practiced)
      const exerciseCounts = areaProgress.reduce((acc: Record<string, number>, p: any) => {
        acc[p.exerciseId] = (acc[p.exerciseId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const favoriteExercises = Object.entries(exerciseCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([exerciseId]) => exerciseId);

      // Calculate consistency score (sessions in last 30 days / 30)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentSessions = areaProgress.filter((p: any) => p.completedAt >= thirtyDaysAgo).length;
      const consistencyScore = Math.min(recentSessions / 30, 1);

      // Determine mastery level based on total sessions
      let masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';
      if (totalSessions >= 50) masteryLevel = 'expert';
      else if (totalSessions >= 25) masteryLevel = 'advanced';
      else if (totalSessions >= 10) masteryLevel = 'intermediate';

      stats.push({
        bodyArea,
        totalSessions,
        totalMinutes,
        averageSessionDuration,
        completionRate: 1, // For now, assume 100% completion rate
        lastPracticed: areaProgress[0].completedAt,
        favoriteExercises,
        consistencyScore,
        masteryLevel,
      });
    }

    return stats;
  }

  /**
   * Update user streaks after completing an exercise
   */
  private static async updateStreaks(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update daily streak
    await this.updateDailyStreak(userId, today);
  }

  /**
   * Update daily streak for a user
   */
  private static async updateDailyStreak(userId: string, today: Date): Promise<void> {
    const existingStreak = await prisma.userStreak.findUnique({
      where: {
        userId_streakType: {
          userId,
          streakType: 'daily',
        },
      },
    });

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!existingStreak) {
      // Create new streak
      await prisma.userStreak.create({
        data: {
          userId,
          streakType: 'daily',
          currentCount: 1,
          bestCount: 1,
          lastActivityDate: today,
        },
      });
      return;
    }

    const lastActivity = existingStreak.lastActivityDate;
    
    if (!lastActivity) {
      // Reset streak
      await prisma.userStreak.update({
        where: { id: existingStreak.id },
        data: {
          currentCount: 1,
          bestCount: Math.max(existingStreak.bestCount, 1),
          lastActivityDate: today,
        },
      });
      return;
    }

    const lastActivityDate = new Date(lastActivity);
    lastActivityDate.setHours(0, 0, 0, 0);

    if (lastActivityDate.getTime() === today.getTime()) {
      // Already practiced today, no change needed
      return;
    }

    if (lastActivityDate.getTime() === yesterday.getTime()) {
      // Continuing streak
      const newCount = existingStreak.currentCount + 1;
      await prisma.userStreak.update({
        where: { id: existingStreak.id },
        data: {
          currentCount: newCount,
          bestCount: Math.max(existingStreak.bestCount, newCount),
          lastActivityDate: today,
        },
      });
    } else {
      // Streak broken, reset
      await prisma.userStreak.update({
        where: { id: existingStreak.id },
        data: {
          currentCount: 1,
          lastActivityDate: today,
        },
      });
    }
  }

  /**
   * Check if a streak is currently active
   */
  private static isStreakActive(lastActivityDate: Date | null, streakType: string): boolean {
    if (!lastActivityDate) return false;

    const now = new Date();
    const lastActivity = new Date(lastActivityDate);

    switch (streakType) {
      case 'daily':
        const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 1; // Active if practiced today or yesterday
      default:
        return false;
    }
  }

  /**
   * Get progress entries for a specific date range
   */
  static async getProgressEntries(
    userId: string,
    timeRange?: DateRange,
    bodyArea?: BodyAreaType
  ): Promise<ProgressEntry[]> {
    const whereClause: any = { userId };
    
    if (timeRange?.from || timeRange?.to) {
      whereClause.completedAt = {};
      if (timeRange.from) whereClause.completedAt.gte = timeRange.from;
      if (timeRange.to) whereClause.completedAt.lte = timeRange.to;
    }

    if (bodyArea) {
      whereClause.bodyArea = bodyArea;
    }

    const entries = await prisma.userProgress.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' },
    });

    return entries.map((entry: any) => ({
      id: entry.id,
      userId: entry.userId,
      exerciseId: entry.exerciseId,
      bodyArea: entry.bodyArea as BodyAreaType,
      completedAt: entry.completedAt,
      durationMinutes: entry.durationMinutes || undefined,
      difficultyLevel: entry.difficultyLevel as DifficultyLevel,
      sessionNotes: entry.sessionNotes || undefined,
      biometricData: entry.biometricData ? JSON.parse(entry.biometricData as string) : undefined,
      mood: entry.mood as any,
      energyLevel: entry.energyLevel as any,
      createdAt: entry.createdAt,
    }));
  }

  /**
   * Mark an exercise as completed (legacy function for compatibility)
   */
  static async markExerciseCompleted(
    userId: string,
    exerciseId: string,
    bodyArea: BodyAreaType,
    durationMinutes?: number,
    difficultyLevel: DifficultyLevel = 'Anfänger'
  ): Promise<ProgressEntry> {
    return this.recordCompletion(userId, {
      exerciseId,
      bodyArea,
      durationMinutes,
      difficultyLevel,
    });
  }

  /**
   * Get progress data (legacy function for compatibility)
   */
  static async getProgressData(userId: string): Promise<UserProgress> {
    return this.getUserProgress(userId);
  }

  /**
   * Add exercise to favorites (mock implementation)
   */
  static async addToFavorites(userId: string, exerciseId: string): Promise<void> {
    // This would typically be stored in a separate favorites table
    // For now, we'll just log it
    console.log(`Adding exercise ${exerciseId} to favorites for user ${userId}`);
  }

  /**
   * Remove exercise from favorites (mock implementation)
   */
  static async removeFromFavorites(userId: string, exerciseId: string): Promise<void> {
    // This would typically be stored in a separate favorites table
    // For now, we'll just log it
    console.log(`Removing exercise ${exerciseId} from favorites for user ${userId}`);
  }
}

// Legacy interface for compatibility with existing code
interface LegacyProgressData {
  completedExercises: string[];
  favoriteExercises: string[];
}

// Mock functions that match the expected legacy interface
const mockGetProgressData = (): LegacyProgressData => ({
  completedExercises: ['breathing-basics', 'cold-shower', 'morning-light'],
  favoriteExercises: ['breathing-basics']
});

const mockMarkExerciseCompleted = (exerciseId: string, bodyArea: string): void => {
  console.log(`Marking exercise ${exerciseId} in ${bodyArea} as completed`);
};

const mockAddToFavorites = (exerciseId: string): void => {
  console.log(`Adding ${exerciseId} to favorites`);
};

const mockRemoveFromFavorites = (exerciseId: string): void => {
  console.log(`Removing ${exerciseId} from favorites`);
};

// Export legacy functions for compatibility with the expected interface
export const markExerciseCompleted = mockMarkExerciseCompleted;
export const getProgressData = mockGetProgressData;
export const addToFavorites = mockAddToFavorites;
export const removeFromFavorites = mockRemoveFromFavorites;