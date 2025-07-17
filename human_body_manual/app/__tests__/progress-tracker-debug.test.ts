
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the dependencies
const mockPrisma = {
  userProgress: {
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: 'progress-123',
        ...data.data,
        completedAt: new Date(),
        createdAt: new Date(),
      });
    }),
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    count: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue({ _sum: { durationMinutes: 0 } }),
  },
  userStreak: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: 'streak-1',
        ...data.data,
      });
    }),
    update: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: data.where.id,
        ...data.data,
      });
    }),
  },
};

jest.mock('../lib/prisma', () => ({
  prisma: mockPrisma,
}));

const mockCacheService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  deletePattern: jest.fn().mockResolvedValue(1),
};

jest.mock('../lib/cache', () => ({
  cacheService: mockCacheService,
}));

const mockJobScheduler = {
  scheduleUserAnalytics: jest.fn().mockResolvedValue(undefined),
  scheduleBodyAreaAnalytics: jest.fn().mockResolvedValue(undefined),
  scheduleInsightsGeneration: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../lib/job-queue', () => ({
  JobScheduler: mockJobScheduler,
}));

const mockQueryOptimizer = {
  invalidateUserCaches: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../lib/query-optimizer', () => ({
  QueryOptimizer: mockQueryOptimizer,
}));

// Import after mocks are set up
import { ProgressTracker } from '../lib/progress-tracker';

// Make mockPrisma available to the ProgressTracker
(global as any).mockPrisma = mockPrisma;

describe('ProgressTracker Debug Test', () => {
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
    const result = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    
    expect(mockPrisma.userProgress.create).toHaveBeenCalledWith({
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
    expect(result.id).toBe('progress-123');
    expect(result.userId).toBe(mockUserId);
    expect(result.exerciseId).toBe(mockExerciseData.exerciseId);
  });
});
