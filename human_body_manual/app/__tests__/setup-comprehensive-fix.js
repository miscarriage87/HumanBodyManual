// Comprehensive test fix - setup proper mocks and fix all failing tests

// Mock Prisma Client
const mockPrisma = {
  userProgress: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  userStreak: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  achievement: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  userAchievement: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  userInsight: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock Cache Service
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
};

// Mock Query Optimizer
const mockQueryOptimizer = {
  getUserStatsOptimized: jest.fn(),
  invalidateUserCaches: jest.fn(),
};

// Mock Job Scheduler
const mockJobScheduler = {
  scheduleUserAnalytics: jest.fn(),
  scheduleBodyAreaAnalytics: jest.fn(),
  scheduleInsightsGeneration: jest.fn(),
};

// Setup default mock implementations
function setupDefaultMocks() {
  // Progress creation mock
  mockPrisma.userProgress.create.mockImplementation((data) => {
    return Promise.resolve({
      id: 'progress-123',
      userId: data.data.userId,
      exerciseId: data.data.exerciseId,
      bodyArea: data.data.bodyArea,
      completedAt: data.data.completedAt || new Date(),
      durationMinutes: data.data.durationMinutes,
      difficultyLevel: data.data.difficultyLevel,
      sessionNotes: data.data.sessionNotes,
      biometricData: data.data.biometricData,
      mood: data.data.mood,
      energyLevel: data.data.energyLevel,
      createdAt: new Date(),
    });
  });

  // Progress count mock
  mockPrisma.userProgress.count.mockResolvedValue(15);

  // Progress aggregate mock
  mockPrisma.userProgress.aggregate.mockResolvedValue({
    _sum: { durationMinutes: 300 }
  });

  // Progress findMany mock
  mockPrisma.userProgress.findMany.mockResolvedValue([
    {
      id: 'progress-1',
      userId: 'test-user-123',
      exerciseId: 'breathing-basics',
      bodyArea: 'nervensystem',
      completedAt: new Date('2024-01-01'),
      durationMinutes: 15,
      difficultyLevel: 'Anfänger',
      sessionNotes: 'Great session!',
      mood: 'gut',
      energyLevel: 'hoch',
      createdAt: new Date('2024-01-01'),
    }
  ]);

  // Progress findFirst mock
  mockPrisma.userProgress.findFirst.mockResolvedValue({
    completedAt: new Date()
  });

  // Streak mocks
  mockPrisma.userStreak.findUnique.mockResolvedValue({
    id: 'streak-1',
    userId: 'test-user-123',
    streakType: 'daily',
    currentCount: 5,
    bestCount: 10,
    lastActivityDate: new Date(),
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  mockPrisma.userStreak.findMany.mockResolvedValue([
    {
      id: 'streak-1',
      userId: 'test-user-123',
      streakType: 'daily',
      currentCount: 3,
      bestCount: 5,
      lastActivityDate: new Date(),
      startedAt: new Date(),
    }
  ]);

  mockPrisma.userStreak.create.mockImplementation((data) => {
    return Promise.resolve({
      id: 'streak-new',
      ...data.data,
    });
  });

  mockPrisma.userStreak.update.mockImplementation(({ where, data }) => {
    return Promise.resolve({
      id: where.id,
      ...data,
    });
  });

  // Achievement mocks
  mockPrisma.achievement.findMany.mockResolvedValue([
    {
      id: 'ach-first-steps',
      name: 'First Steps',
      description: 'Complete your first exercise',
      category: 'milestone',
      criteria: { type: 'total_sessions', target: 1 },
      badgeIcon: '🎯',
      points: 10,
      rarity: 'common',
      createdAt: new Date(),
    },
    {
      id: 'ach-sessions-10',
      name: '10 Sessions',
      description: 'Complete 10 exercise sessions',
      category: 'progress',
      criteria: { type: 'total_sessions', target: 10 },
      badgeIcon: '🔥',
      points: 50,
      rarity: 'common',
      createdAt: new Date(),
    }
  ]);

  mockPrisma.achievement.findUnique.mockImplementation(({ where }) => {
    const achievements = {
      'ach-first-steps': {
        id: 'ach-first-steps',
        name: 'First Steps',
        description: 'Complete your first exercise',
        category: 'milestone',
        criteria: { type: 'total_sessions', target: 1 },
        badgeIcon: '🎯',
        points: 10,
        rarity: 'common',
        createdAt: new Date(),
      },
      'ach-sessions-10': {
        id: 'ach-sessions-10',
        name: '10 Sessions',
        description: 'Complete 10 exercise sessions',
        category: 'progress',
        criteria: { type: 'total_sessions', target: 10 },
        badgeIcon: '🔥',
        points: 50,
        rarity: 'common',
        createdAt: new Date(),
      }
    };
    return Promise.resolve(achievements[where.id] || null);
  });

  mockPrisma.achievement.count.mockResolvedValue(25);

  // User Achievement mocks
  mockPrisma.userAchievement.create.mockImplementation((data) => {
    return Promise.resolve({
      id: 'user-ach-new',
      ...data.data,
      earnedAt: new Date(),
    });
  });

  mockPrisma.userAchievement.findMany.mockResolvedValue([
    {
      id: 'user-ach-1',
      userId: 'test-user-123',
      achievementId: 'ach-first-steps',
      earnedAt: new Date(),
      progressSnapshot: {},
      achievement: {
        id: 'ach-first-steps',
        name: 'First Steps',
        description: 'Complete your first exercise',
        category: 'milestone',
        criteria: { type: 'total_sessions', target: 1 },
        badgeIcon: '🎯',
        points: 10,
        rarity: 'common',
        createdAt: new Date(),
      }
    }
  ]);

  mockPrisma.userAchievement.findUnique.mockResolvedValue(null);

  mockPrisma.userAchievement.count.mockResolvedValue(150);

  mockPrisma.userAchievement.groupBy.mockResolvedValue([
    {
      achievementId: 'ach-first-steps',
      _count: { achievementId: 50 }
    }
  ]);

  // Cache mocks
  mockCacheService.get.mockResolvedValue(null);
  mockCacheService.set.mockResolvedValue(true);

  // Query optimizer mocks
  mockQueryOptimizer.getUserStatsOptimized.mockResolvedValue({
    totalSessions: 15,
    totalMinutes: 300,
    bodyAreaBreakdown: {}
  });

  mockQueryOptimizer.invalidateUserCaches.mockResolvedValue(true);

  // Job scheduler mocks
  mockJobScheduler.scheduleUserAnalytics.mockResolvedValue(true);
  mockJobScheduler.scheduleBodyAreaAnalytics.mockResolvedValue(true);
  mockJobScheduler.scheduleInsightsGeneration.mockResolvedValue(true);

  // User mock
  mockPrisma.user.findUnique.mockResolvedValue({
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
  });

  // Transaction mock
  mockPrisma.$transaction.mockImplementation(async (callback) => {
    return await callback(mockPrisma);
  });
}

// Reset all mocks
function resetAllMocks() {
  Object.values(mockPrisma).forEach(table => {
    if (typeof table === 'object') {
      Object.values(table).forEach(method => {
        if (jest.isMockFunction(method)) {
          method.mockReset();
        }
      });
    }
  });
  
  Object.values(mockCacheService).forEach(method => {
    if (jest.isMockFunction(method)) {
      method.mockReset();
    }
  });

  Object.values(mockQueryOptimizer).forEach(method => {
    if (jest.isMockFunction(method)) {
      method.mockReset();
    }
  });

  Object.values(mockJobScheduler).forEach(method => {
    if (jest.isMockFunction(method)) {
      method.mockReset();
    }
  });
}

module.exports = {
  mockPrisma,
  mockCacheService,
  mockQueryOptimizer,
  mockJobScheduler,
  setupDefaultMocks,
  resetAllMocks,
};