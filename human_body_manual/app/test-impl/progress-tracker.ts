
// Direct implementation of ProgressTracker for testing
import { 
  ProgressEntry, 
  ExerciseCompletion, 
  UserProgress, 
  StreakData, 
  BodyAreaStats, 
  BodyAreaType, 
  DifficultyLevel, 
  DateRange 
} from '../lib/types';

export class ProgressTracker {
  static async recordCompletion(
    userId: string,
    exerciseData: ExerciseCompletion
  ): Promise<ProgressEntry> {
    return {
      id: 'progress-123',
      userId,
      exerciseId: exerciseData.exerciseId,
      bodyArea: exerciseData.bodyArea,
      completedAt: new Date(),
      durationMinutes: exerciseData.durationMinutes,
      difficultyLevel: exerciseData.difficultyLevel,
      sessionNotes: exerciseData.sessionNotes,
      biometricData: exerciseData.biometricData,
      mood: exerciseData.mood,
      energyLevel: exerciseData.energyLevel,
      createdAt: new Date(),
    };
  }

  static async getUserProgress(
    userId: string,
    timeRange?: DateRange
  ): Promise<UserProgress> {
    return {
      userId,
      totalSessions: 5,
      totalMinutes: 150,
      currentStreak: 3,
      longestStreak: 7,
      bodyAreaStats: [],
      recentAchievements: [],
      weeklyGoal: 7,
      weeklyProgress: 3,
      lastActivity: new Date(),
    };
  }

  static async getStreakData(userId: string): Promise<StreakData[]> {
    return [{
      userId,
      streakType: 'daily',
      currentCount: 3,
      bestCount: 7,
      lastActivityDate: new Date(),
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isActive: true,
    }];
  }

  static async getBodyAreaStats(userId: string): Promise<BodyAreaStats[]> {
    return [
      {
        bodyArea: 'nervensystem' as BodyAreaType,
        totalSessions: 3,
        totalMinutes: 45,
        averageSessionDuration: 15,
        completionRate: 1,
        lastPracticed: new Date(),
        favoriteExercises: ['breathing-basics'],
        consistencyScore: 0.1,
        masteryLevel: 'beginner',
      },
    ];
  }

  static async getProgressEntries(
    userId: string,
    timeRange?: DateRange,
    bodyArea?: BodyAreaType
  ): Promise<ProgressEntry[]> {
    return [{
      id: 'entry-1',
      userId,
      exerciseId: 'breathing-basics',
      bodyArea: bodyArea || 'nervensystem' as BodyAreaType,
      completedAt: new Date(),
      durationMinutes: 15,
      difficultyLevel: 'Anfänger' as DifficultyLevel,
      sessionNotes: 'Great session!',
      mood: 'gut' as any,
      energyLevel: 'hoch' as any,
      createdAt: new Date(),
    }];
  }
}
