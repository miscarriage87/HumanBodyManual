import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';

// Create mock data helpers
const createMockProgressEntry = (overrides = {}) => ({
  id: 'progress-1',
  userId: 'test-user-123',
  exerciseId: 'breathing-basics',
  bodyArea: 'nervensystem',
  completedAt: new Date(),
  durationMinutes: 15,
  difficultyLevel: 'Anfänger',
  sessionNotes: 'Great session!',
  mood: 'gut',
  energyLevel: 'hoch',
  createdAt: new Date(),
  ...overrides,
});

const createMockUserProgress = (overrides = {}) => ({
  userId: 'test-user-123',
  totalSessions: 5,
  totalMinutes: 150,
  currentStreak: 3,
  longestStreak: 7,
  bodyAreaStats: [],
  recentAchievements: [],
  weeklyGoal: 7,
  weeklyProgress: 3,
  lastActivity: new Date(),
  ...overrides,
});

const createMockAchievement = (overrides = {}) => ({
  id: 'ach-1',
  name: 'First Steps',
  description: 'Complete your first exercise',
  category: 'milestone',
  criteria: { type: 'total_sessions', target: 1 },
  badgeIcon: 'star',
  points: 10,
  rarity: 'common',
  createdAt: new Date(),
  ...overrides,
});

// Setup mocks
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
    findMany: jest.fn().mockResolvedValue([createMockProgressEntry()]),
    findFirst: jest.fn().mockResolvedValue(createMockProgressEntry()),
    count: jest.fn().mockResolvedValue(5),
    aggregate: jest.fn().mockResolvedValue({ _sum: { durationMinutes: 150 } }),
  },
  achievement: {
    findMany: jest.fn().mockResolvedValue([createMockAchievement()]),
  },
  userAchievement: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation(async (callback) => {
    if (typeof callback === 'function') {
      return callback(mockPrisma);
    }
    return Promise.all(callback);
  }),
};

const mockCacheService = {
  get: jest.fn().mockImplementation(async (key) => {
    if (key.includes('user_progress')) {
      return createMockUserProgress();
    }
    return null;
  }),
  set: jest.fn().mockResolvedValue(true),
  deletePattern: jest.fn().mockResolvedValue(1),
};

const mockJobScheduler = {
  scheduleUserAnalytics: jest.fn().mockResolvedValue(undefined),
  scheduleBodyAreaAnalytics: jest.fn().mockResolvedValue(undefined),
  scheduleInsightsGeneration: jest.fn().mockResolvedValue(undefined),
};

const mockQueryOptimizer = {
  invalidateUserCaches: jest.fn().mockResolvedValue(undefined),
};

// Mock the modules
jest.mock('../lib/prisma', () => ({
  prisma: mockPrisma,
}));

jest.mock('../lib/cache', () => ({
  cacheService: mockCacheService,
}));

jest.mock('../lib/job-queue', () => ({
  JobScheduler: mockJobScheduler,
}));

jest.mock('../lib/query-optimizer', () => ({
  QueryOptimizer: mockQueryOptimizer,
}));

// Import after mocks are set up
import { ProgressTracker } from '../lib/progress-tracker';
import { AchievementEngine } from '../lib/achievement-engine';

describe('Comprehensive Fix Tests', () => {
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
    // Setup the mock implementation for this specific test
    const mockEntry = createMockProgressEntry();
    mockPrisma.userProgress.create.mockResolvedValueOnce(mockEntry);
    
    // Call the function
    const result = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    
    // Verify the mock was called correctly
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
    
    // Verify the result
    expect(result).toBeDefined();
    expect(result.id).toBe(mockEntry.id);
    expect(result.userId).toBe(mockUserId);
    expect(result.exerciseId).toBe(mockExerciseData.exerciseId);
  });

  it('should check achievements after completion', async () => {
    // Setup the mock implementation for this specific test
    const mockEntry = createMockProgressEntry();
    const mockAchievement = createMockAchievement();
    
    mockPrisma.userProgress.create.mockResolvedValueOnce(mockEntry);
    mockPrisma.achievement.findMany.mockResolvedValueOnce([mockAchievement]);
    mockPrisma.userAchievement.findMany.mockResolvedValueOnce([]);
    
    // Call the functions
    const progressEntry = await ProgressTracker.recordCompletion(mockUserId, mockExerciseData);
    const achievements = await AchievementEngine.checkAchievements(mockUserId, progressEntry);
    
    // Verify the result
    expect(achievements).toHaveLength(1);
    expect(achievements[0].name).toBe('First Steps');
  });

  it('should get user progress data', async () => {
    // Setup the mock implementation for this specific test
    const mockProgress = createMockUserProgress();
    mockCacheService.get.mockResolvedValueOnce(mockProgress);
    
    // Call the function
    const result = await ProgressTracker.getUserProgress(mockUserId);
    
    // Verify the mock was called correctly
    expect(mockCacheService.get).toHaveBeenCalled();
    
    // Verify the result
    expect(result).toEqual(mockProgress);
  });
});