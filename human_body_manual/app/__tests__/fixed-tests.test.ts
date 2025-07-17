
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { 
  createMockProgressEntry, 
  createMockUserProgress,
  createMockStreakData,
  createMockAchievement,
  setupMockPrisma,
  setupMockCacheService,
  setupMockJobScheduler,
  setupMockQueryOptimizer
} from './test-helper';

// Mock the dependencies
jest.mock('../lib/prisma', () => {
  const mockPrisma = setupMockPrisma();
  return { prisma: mockPrisma };
});

const { mockCacheService } = setupMockCacheService();
jest.mock('../lib/cache', () => ({
  cacheService: mockCacheService,
}));

const mockJobScheduler = setupMockJobScheduler();
jest.mock('../lib/job-queue', () => ({
  JobScheduler: mockJobScheduler,
}));

const mockQueryOptimizer = setupMockQueryOptimizer();
jest.mock('../lib/query-optimizer', () => ({
  QueryOptimizer: mockQueryOptimizer,
}));

// Import after mocks are set up
import { ProgressTracker } from '../lib/progress-tracker';
import { AchievementEngine } from '../lib/achievement-engine';
import { prisma } from '../lib/prisma';

// Make sure the mocks are properly set up
beforeAll(() => {
  // Make the mocks available globally
  (global as any).mockPrisma = prisma;
  (global as any).mockCacheService = mockCacheService;
});

describe('Fixed Tests', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should record exercise completion successfully', async () => {
    const mockProgressEntry = createMockProgressEntry();
    (prisma.userProgress.create as jest.Mock).mockResolvedValue(mockProgressEntry);
    
    const result = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    
    expect(prisma.userProgress.create).toHaveBeenCalledWith({
      data: {
        userId: mockUserId,
        exerciseId: mockExerciseData.exerciseId,
        bodyArea: mockExerciseData.bodyArea,
        completedAt: expect.any(Date),
        durationMinutes: mockExerciseData.durationMinutes,
        difficultyLevel: mockExerciseData.difficultyLevel,
        sessionNotes: mockExerciseData.sessionNotes,
        biometricData: undefined,
        mood: mockExerciseData.mood,
        energyLevel: mockExerciseData.energyLevel,
      },
    });
    
    expect(result).toBeDefined();
    expect(result.id).toBe(mockProgressEntry.id);
    expect(result.userId).toBe(mockUserId);
    expect(result.exerciseId).toBe(mockExerciseData.exerciseId);
  });

  it('should check achievements after completion', async () => {
    const mockProgressEntry = createMockProgressEntry();
    const mockAchievement = createMockAchievement();
    
    (prisma.userProgress.create as jest.Mock).mockResolvedValue(mockProgressEntry);
    (prisma.achievement.findMany as jest.Mock).mockResolvedValue([mockAchievement]);
    (prisma.userAchievement.findMany as jest.Mock).mockResolvedValue([]);
    
    const progressEntry = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    const achievements = await AchievementEngine.checkAchievements(mockUserId, progressEntry);
    
    expect(achievements).toHaveLength(1);
    expect(achievements[0].name).toBe('First Steps');
  });

  it('should get user progress data', async () => {
    const mockUserProgress = createMockUserProgress();
    mockCacheService.get.mockResolvedValue(mockUserProgress);
    
    const result = await ProgressTracker.getUserProgress(mockUserId);
    
    expect(mockCacheService.get).toHaveBeenCalled();
    expect(result).toEqual(mockUserProgress);
  });
});
