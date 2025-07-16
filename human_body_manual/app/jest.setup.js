// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

import '@testing-library/jest-dom'

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Prisma Client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  userProgress: {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: 'mock-progress-id',
      userId: 'mock-user-id',
      exerciseId: 'mock-exercise-id',
      bodyArea: 'nervensystem',
      completedAt: new Date(),
      durationMinutes: 30,
      difficultyLevel: 'Anfänger',
      sessionNotes: null,
      biometricData: null,
      mood: null,
      energyLevel: null,
      createdAt: new Date(),
    }),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    groupBy: jest.fn().mockResolvedValue([]),
    aggregate: jest.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { durationMinutes: 0 } }),
  },
  userStreak: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: 'mock-streak-id',
      userId: 'mock-user-id',
      streakType: 'daily',
      currentCount: 1,
      bestCount: 1,
      lastActivityDate: new Date(),
      startedAt: new Date(),
    }),
    update: jest.fn().mockResolvedValue({
      id: 'mock-streak-id',
      userId: 'mock-user-id',
      streakType: 'daily',
      currentCount: 2,
      bestCount: 2,
      lastActivityDate: new Date(),
      startedAt: new Date(),
    }),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  progressEntry: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
    groupBy: jest.fn().mockResolvedValue([]),
    aggregate: jest.fn(),
  },
  achievement: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  userAchievement: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  streak: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  performanceMetric: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  userEngagementMetric: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  systemHealthMetric: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  errorLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  userInsight: {
    create: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  userCommunityAchievement: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    delete: jest.fn(),
  },
  challengeParticipant: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $disconnect: jest.fn(),
}

jest.mock('./lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock Bull Queue and related dependencies
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
  }))
})

// Mock msgpackr (ES module dependency of Bull)
jest.mock('msgpackr', () => ({
  pack: jest.fn(),
  unpack: jest.fn(),
  Packr: jest.fn(),
  Encoder: jest.fn(),
}))

// Mock job-queue module
jest.mock('./lib/job-queue', () => ({
  analyticsQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
  },
  insightsQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
  },
  cacheWarmupQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
  },
  JobScheduler: {
    scheduleUserAnalytics: jest.fn().mockResolvedValue(undefined),
    scheduleBodyAreaAnalytics: jest.fn().mockResolvedValue(undefined),
    scheduleCommunityAnalytics: jest.fn().mockResolvedValue(undefined),
    scheduleInsightsGeneration: jest.fn().mockResolvedValue(undefined),
    scheduleCacheWarmup: jest.fn().mockResolvedValue(undefined),
  },
}))

// Mock Redis with in-memory storage
jest.mock('ioredis', () => {
  const mockStorage = new Map();
  
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockImplementation((key) => {
      return Promise.resolve(mockStorage.get(key) || null);
    }),
    set: jest.fn().mockImplementation((key, value) => {
      mockStorage.set(key, value);
      return Promise.resolve('OK');
    }),
    setex: jest.fn().mockImplementation((key, ttl, value) => {
      mockStorage.set(key, value);
      return Promise.resolve('OK');
    }),
    del: jest.fn().mockImplementation((key) => {
      const existed = mockStorage.has(key);
      mockStorage.delete(key);
      return Promise.resolve(existed ? 1 : 0);
    }),
    keys: jest.fn().mockImplementation((pattern) => {
      const keys = Array.from(mockStorage.keys());
      if (pattern === '*') return Promise.resolve(keys);
      // Simple pattern matching for tests
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Promise.resolve(keys.filter(key => regex.test(key)));
    }),
    exists: jest.fn().mockImplementation((key) => {
      return Promise.resolve(mockStorage.has(key) ? 1 : 0);
    }),
    expire: jest.fn().mockResolvedValue(1),
    ping: jest.fn().mockResolvedValue('PONG'),
    disconnect: jest.fn().mockResolvedValue(undefined),
  }))
})

// Mock Next.js Request and Response
global.Request = class MockRequest {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.url
    this.method = init.method || 'GET'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.body = init.body
  }
  
  async json() {
    return JSON.parse(this.body || '{}')
  }
  
  async text() {
    return this.body || ''
  }
}

global.Response = class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map(Object.entries(init.headers || {}))
  }
  
  static json(data, init = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers }
    })
  }
  
  async json() {
    return JSON.parse(this.body)
  }
  
  async text() {
    return this.body
  }
}



// Mock JobScheduler (already mocked above in job-queue mock)
// The JobScheduler is part of the job-queue module

// Mock cache service with proper storage simulation
let mockCacheStorage = new Map();

const mockCacheService = {
  get: jest.fn().mockImplementation(async (key) => {
    return mockCacheStorage.get(key) || null;
  }),
  set: jest.fn().mockImplementation(async (key, value, ttl) => {
    mockCacheStorage.set(key, value);
    return true;
  }),
  setex: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockImplementation(async (key) => {
    const existed = mockCacheStorage.has(key);
    mockCacheStorage.delete(key);
    return existed ? 1 : 0;
  }),
  delete: jest.fn().mockImplementation(async (key) => {
    const existed = mockCacheStorage.has(key);
    mockCacheStorage.delete(key);
    return existed ? 1 : 0;
  }),
  deletePattern: jest.fn().mockImplementation(async (pattern) => {
    let count = 0;
    for (const key of mockCacheStorage.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        mockCacheStorage.delete(key);
        count++;
      }
    }
    return count;
  }),
  cacheUserStats: jest.fn().mockImplementation(async (userId, data, ttl) => {
    mockCacheStorage.set(`user_stats:${userId}`, data);
    return true;
  }),
  cacheBodyAreaStats: jest.fn().mockResolvedValue(true),
  cacheCommunityStats: jest.fn().mockResolvedValue(true),
  cacheAchievements: jest.fn().mockResolvedValue(true),
  cacheStreaks: jest.fn().mockResolvedValue(true),
  cacheUserProgress: jest.fn().mockImplementation(async (userId, data, ttl) => {
    mockCacheStorage.set(`user_progress:${userId}`, data);
    return true;
  }),
  getUserProgress: jest.fn().mockImplementation(async (userId) => {
    return mockCacheStorage.get(`user_progress:${userId}`) || null;
  }),
  getUserStats: jest.fn().mockImplementation(async (userId) => {
    return mockCacheStorage.get(`user_stats:${userId}`) || null;
  }),
  invalidateUserCaches: jest.fn().mockImplementation(async (userId) => {
    for (const key of mockCacheStorage.keys()) {
      if (key.includes(userId)) {
        mockCacheStorage.delete(key);
      }
    }
    return undefined;
  }),
  healthCheck: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(undefined),
};

jest.mock('./lib/cache', () => ({
  cacheService: mockCacheService,
}));

// Mock auth helpers
const mockAuthHelpers = {
  getCurrentUser: jest.fn().mockResolvedValue(null),
  getDemoUser: jest.fn().mockReturnValue({
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
  }),
  requireAuth: jest.fn().mockResolvedValue({
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
  }),
};

jest.mock('./lib/auth-helper', () => mockAuthHelpers);

// Mock query optimizer
const mockQueryOptimizer = {
  getUserStatsOptimized: jest.fn().mockResolvedValue({
    totalSessions: 0,
    totalMinutes: 0,
    averageSessionDuration: 0,
    bodyAreaStats: [],
    recentActivity: [],
  }),
  getStreaksOptimized: jest.fn().mockResolvedValue({
    streaks: []
  }),
  getUserAchievementsOptimized: jest.fn().mockResolvedValue({
    earned: []
  }),
  invalidateUserCaches: jest.fn().mockResolvedValue(undefined),
};

jest.mock('./lib/query-optimizer', () => ({
  QueryOptimizer: mockQueryOptimizer,
}));

// Mock ProgressTracker for API tests only
const mockProgressTracker = {
  recordCompletion: jest.fn(),
  getUserProgress: jest.fn(),
  getStreakData: jest.fn(),
  getBodyAreaStats: jest.fn(),
  getProgressEntries: jest.fn(),
  markExerciseCompleted: jest.fn(),
  getProgressData: jest.fn(),
};

// Mock AchievementEngine for API tests only  
const mockAchievementEngine = {
  checkAchievements: jest.fn(),
  getUserAchievements: jest.fn(),
  calculateProgress: jest.fn(),
  getAllAchievementsWithProgress: jest.fn(),
};

// Mock the modules for API tests
jest.mock('./lib/progress-tracker', () => ({
  ProgressTracker: mockProgressTracker,
}));

jest.mock('./lib/achievement-engine', () => ({
  AchievementEngine: mockAchievementEngine,
}));

// Mock validation schemas
const mockValidationSchemas = {
  validateExerciseCompletion: jest.fn().mockReturnValue({}),
  validateDateRange: jest.fn().mockReturnValue({}),
  validateUserInput: jest.fn().mockReturnValue({}),
};

jest.mock('./lib/validation-schemas', () => mockValidationSchemas);

// Make mocks available globally for tests
global.mockPrisma = mockPrisma;
global.mockCacheService = mockCacheService;
global.mockAuthHelpers = mockAuthHelpers;
global.mockQueryOptimizer = mockQueryOptimizer;
global.mockValidationSchemas = mockValidationSchemas;
global.mockProgressTracker = mockProgressTracker;
global.mockAchievementEngine = mockAchievementEngine;
global.mockCacheStorage = mockCacheStorage;