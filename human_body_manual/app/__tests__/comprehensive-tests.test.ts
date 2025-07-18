
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { 
  createMockProgressEntry, 
  createMockUserProgress,
  createMockAchievement,
  setupMockPrisma,
  setupMockCacheService
} from './test-helper';

// Mock the actual services
jest.mock('../lib/prisma', () => ({
  prisma: setupMockPrisma(),
}));

jest.mock('../lib/cache', () => ({
  cacheService: setupMockCacheService(),
}));

// Import after mocks are set up
import { ProgressTracker } from '../lib/progress-tracker';
import { AchievementEngine } from '../lib/achievement-engine';

describe('Comprehensive Tests', () => {
  const mockUserId = 'test-user-123';
  const mockExerciseData = {
    exerciseId: 'breathing-basics',
    bodyArea: 'nervensystem',
    durationMinutes: 15,
    difficultyLevel: 'Anfänger',
    sessionNotes: 'Great session!',
    mood: 'gut',
    energyLevel: 'hoch',
  };

  it('should record exercise completion successfully', async () => {
    const result = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    
    expect(result).toBeDefined();
    expect(result.id).toBe('progress-123');
    expect(result.userId).toBe(mockUserId);
    expect(result.exerciseId).toBe(mockExerciseData.exerciseId);
    expect(result.bodyArea).toBe(mockExerciseData.bodyArea);
  });

  it('should check achievements after completion', async () => {
    const progressEntry = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    const achievements = await AchievementEngine.checkAchievements(mockUserId, progressEntry);
    
    expect(achievements).toHaveLength(1);
    expect(achievements[0].name).toBe('First Steps');
  });

  it('should get user progress data', async () => {
    const result = await ProgressTracker.getUserProgress(mockUserId);
    
    expect(result).toBeDefined();
    expect(result.userId).toBe(mockUserId);
    expect(result.totalSessions).toBe(5);
    expect(result.totalMinutes).toBe(150);
  });

  it('should get streak data', async () => {
    const streaks = await ProgressTracker.getStreakData(mockUserId);
    
    expect(streaks).toHaveLength(1);
    expect(streaks[0].userId).toBe(mockUserId);
    expect(streaks[0].currentCount).toBe(3);
  });

  it('should get user achievements', async () => {
    const achievements = await AchievementEngine.getUserAchievements(mockUserId);
    
    expect(achievements).toHaveLength(1);
    expect(achievements[0].achievement.name).toBe('First Steps');
  });

  it('should calculate achievement progress', async () => {
    const progress = await AchievementEngine.calculateProgress(mockUserId, 'ach-2');
    
    expect(progress).toBeDefined();
    expect(progress.currentProgress).toBe(6);
    expect(progress.targetProgress).toBe(10);
    expect(progress.progressPercentage).toBe(60);
  });
});
