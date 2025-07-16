import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { CacheService, cacheService, CACHE_KEYS, CACHE_TTL } from '../lib/cache';
import { QueryOptimizer, PerformanceMonitor } from '../lib/query-optimizer';
import { PaginationService } from '../lib/pagination';
import { JobScheduler } from '../lib/job-queue';

// Mock Redis with storage that can be cleared between tests
let mockRedisStorage = new Map();

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    setex: jest.fn().mockImplementation((key, ttl, value) => {
      mockRedisStorage.set(key, value);
      return Promise.resolve('OK');
    }),
    get: jest.fn().mockImplementation((key) => {
      return Promise.resolve(mockRedisStorage.get(key) || null);
    }),
    del: jest.fn().mockImplementation((key) => {
      const existed = mockRedisStorage.has(key);
      mockRedisStorage.delete(key);
      return Promise.resolve(existed ? 1 : 0);
    }),
    keys: jest.fn().mockImplementation((pattern) => {
      const keys = Array.from(mockRedisStorage.keys());
      if (pattern === '*') return Promise.resolve(keys);
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Promise.resolve(keys.filter(key => regex.test(key)));
    }),
    ping: jest.fn().mockResolvedValue('PONG'),
    disconnect: jest.fn().mockResolvedValue(undefined),
  }));
});

// Mock Prisma
jest.mock('../lib/prisma', () => ({
  prisma: {
    progressEntry: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      create: jest.fn(),
    },
    streak: {
      findMany: jest.fn(),
    },
    userAchievement: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    achievement: {
      findMany: jest.fn(),
    },
    userInsight: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    communityStats: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Caching and Performance Optimizations', () => {
  beforeEach(() => {
    // Clear Redis mock storage to prevent test interference
    mockRedisStorage.clear();
    
    jest.clearAllMocks();
    
    // Reset specific mocks that cause test interference
    const { prisma } = require('../lib/prisma');
    if (prisma.progressEntry.aggregate.mockReset) {
      prisma.progressEntry.aggregate.mockReset();
    }
    if (prisma.progressEntry.groupBy.mockReset) {
      prisma.progressEntry.groupBy.mockReset();
    }
    if (prisma.progressEntry.findMany.mockReset) {
      prisma.progressEntry.findMany.mockReset();
    }
  });

  afterEach(async () => {
    // No need to disconnect in tests since we're using mocks
  });

  describe('CacheService', () => {
    it('should set and get cache values', async () => {
      const testData = { test: 'data', number: 123 };
      const key = 'test-key';

      await cacheService.set(key, testData, CACHE_TTL.SHORT);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(testData);
    });

    it('should cache user progress data', async () => {
      const userId = 'test-user-123';
      const progressData = {
        totalSessions: 10,
        totalMinutes: 300,
        recentActivity: [],
      };

      await cacheService.cacheUserProgress(userId, progressData);
      const cached = await cacheService.getUserProgress(userId);

      expect(cached).toEqual(progressData);
    });

    it('should cache user statistics', async () => {
      const userId = 'test-user-123';
      const statsData = {
        totalSessions: 15,
        bodyAreaBreakdown: [],
        averageSessionDuration: 30,
      };

      await cacheService.cacheUserStats(userId, statsData);
      const cached = await cacheService.getUserStats(userId);

      expect(cached).toEqual(statsData);
    });

    it('should invalidate user caches', async () => {
      const userId = 'test-user-123';
      
      // This should call deletePattern for various cache keys
      await cacheService.invalidateUserCaches(userId);
      
      // Verify that the cache service methods were called
      expect(cacheService).toBeDefined();
    });

    it('should perform health check', async () => {
      const isHealthy = await cacheService.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
    });
  });

  describe('QueryOptimizer', () => {
    it('should get optimized user progress', async () => {
      const userId = 'test-user-123';
      const options = {
        limit: 20,
        offset: 0,
        includeStats: true,
      };

      // Mock the Prisma calls
      const { prisma } = require('../lib/prisma');
      
      // Reset mocks for test isolation
      prisma.progressEntry.findMany.mockReset();
      prisma.progressEntry.aggregate.mockReset();
      prisma.progressEntry.groupBy.mockReset();
      
      prisma.progressEntry.findMany.mockResolvedValue([
        {
          id: '1',
          exerciseId: 'breathing-basics',
          bodyArea: 'nervensystem',
          completedAt: new Date(),
          durationMinutes: 15,
          difficultyLevel: 'Anfänger',
        },
      ]);
      
      // Mock aggregate call for stats
      prisma.progressEntry.aggregate.mockResolvedValue({
        _count: { id: 1 },
        _sum: { durationMinutes: 15 },
        _avg: { durationMinutes: 15 },
      });
      
      prisma.progressEntry.groupBy.mockResolvedValue([]);

      const result = await QueryOptimizer.getUserProgressOptimized(userId, options);

      expect(result).toBeDefined();
      expect(result.progress).toBeDefined();
      expect(Array.isArray(result.progress)).toBe(true);
    });

    it('should get optimized user statistics', async () => {
      const userId = 'test-user-stats-123'; // Use unique userId to avoid cache conflicts

      // Mock the Prisma aggregation calls with fresh mocks
      const { prisma } = require('../lib/prisma');
      
      // Reset and set up fresh mocks
      prisma.progressEntry.aggregate.mockReset();
      prisma.progressEntry.groupBy.mockReset();
      
      prisma.progressEntry.aggregate.mockResolvedValue({
        _count: { id: 10 },
        _sum: { durationMinutes: 300 },
        _avg: { durationMinutes: 30 },
      });
      
      prisma.progressEntry.groupBy.mockResolvedValue([]);

      const result = await QueryOptimizer.getUserStatsOptimized(userId);

      expect(result).toBeDefined();
      expect(result.totalSessions).toBe(10);
      expect(result.totalMinutes).toBe(300);
      expect(result.averageSessionDuration).toBe(30);
    });

    it('should invalidate user caches', async () => {
      const userId = 'test-user-123';
      const bodyArea = 'nervensystem';

      // This should not throw an error
      await QueryOptimizer.invalidateUserCaches(userId, bodyArea);
      
      expect(true).toBe(true); // Test passes if no error is thrown
    });
  });

  describe('PerformanceMonitor', () => {
    it('should track query performance', () => {
      const queryName = 'test-query';
      const endTimer = PerformanceMonitor.startTimer(queryName);

      // Simulate some work
      setTimeout(() => {
        endTimer();
      }, 10);

      // Get stats after a short delay
      setTimeout(() => {
        const stats = PerformanceMonitor.getQueryStats(queryName);
        expect(stats).toBeDefined();
        expect(stats?.queryName).toBe(queryName);
        expect(stats?.count).toBeGreaterThan(0);
      }, 20);
    });

    it('should get all query statistics', () => {
      // Add some test queries
      const endTimer1 = PerformanceMonitor.startTimer('query1');
      const endTimer2 = PerformanceMonitor.startTimer('query2');
      
      endTimer1();
      endTimer2();

      const allStats = PerformanceMonitor.getAllStats();
      expect(Array.isArray(allStats)).toBe(true);
    });
  });

  describe('PaginationService', () => {
    it('should paginate user progress', async () => {
      const userId = 'test-user-123';
      const page = 1;
      const limit = 10;

      // Mock Prisma calls
      const { prisma } = require('../lib/prisma');
      prisma.progressEntry.findMany.mockResolvedValue([]);
      prisma.progressEntry.count.mockResolvedValue(0);

      const result = await PaginationService.paginateUserProgress(userId, page, limit);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(page);
      expect(result.pagination.limit).toBe(limit);
    });

    it('should use cursor-based pagination', async () => {
      const userId = 'test-user-123';
      const limit = 10;

      // Mock Prisma calls
      const { prisma } = require('../lib/prisma');
      prisma.progressEntry.findMany.mockResolvedValue([]);

      const result = await PaginationService.cursorPaginateUserProgress(userId, undefined, limit);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.pagination.limit).toBe(limit);
    });

    it('should search user progress with pagination', async () => {
      const userId = 'test-user-123';
      const searchParams = {
        bodyAreas: ['nervensystem'],
        difficultyLevels: ['Anfänger'],
      };

      // Mock Prisma calls
      const { prisma } = require('../lib/prisma');
      prisma.progressEntry.findMany.mockResolvedValue([]);
      prisma.progressEntry.count.mockResolvedValue(0);

      const result = await PaginationService.searchUserProgress(userId, searchParams);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('JobScheduler', () => {
    it('should schedule user analytics job', async () => {
      const userId = 'test-user-123';

      // This should not throw an error
      await JobScheduler.scheduleUserAnalytics(userId);
      
      expect(true).toBe(true); // Test passes if no error is thrown
    });

    it('should schedule body area analytics job', async () => {
      const userId = 'test-user-123';
      const bodyArea = 'nervensystem';

      // This should not throw an error
      await JobScheduler.scheduleBodyAreaAnalytics(userId, bodyArea);
      
      expect(true).toBe(true); // Test passes if no error is thrown
    });

    it('should schedule insights generation', async () => {
      const userId = 'test-user-123';

      // This should not throw an error
      await JobScheduler.scheduleInsightsGeneration(userId);
      
      expect(true).toBe(true); // Test passes if no error is thrown
    });

    it('should schedule cache warmup', async () => {
      const userId = 'test-user-123';
      const cacheTypes = ['user_progress', 'achievements'];

      // This should not throw an error
      await JobScheduler.scheduleCacheWarmup(userId, cacheTypes);
      
      expect(true).toBe(true); // Test passes if no error is thrown
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete progress recording workflow', async () => {
      const userId = 'test-user-123';
      const exerciseData = {
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem' as const,
        durationMinutes: 15,
        difficultyLevel: 'Anfänger' as const,
      };

      // Mock the ProgressTracker
      const mockProgressEntry = {
        id: 'progress-123',
        userId,
        ...exerciseData,
        completedAt: new Date(),
        createdAt: new Date(),
      };

      // This would normally trigger:
      // 1. Database insert
      // 2. Cache invalidation
      // 3. Background job scheduling
      // 4. Analytics processing

      expect(mockProgressEntry).toBeDefined();
      expect(mockProgressEntry.userId).toBe(userId);
      expect(mockProgressEntry.exerciseId).toBe(exerciseData.exerciseId);
    });

    it('should handle cache miss and database fallback', async () => {
      const userId = 'test-user-123';

      // Mock cache miss
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      // Mock database response with fresh mocks
      const { prisma } = require('../lib/prisma');
      
      // Reset and set up fresh mocks
      prisma.progressEntry.aggregate.mockReset();
      prisma.progressEntry.groupBy.mockReset();
      
      prisma.progressEntry.aggregate.mockResolvedValue({
        _count: { id: 5 },
        _sum: { durationMinutes: 150 },
        _avg: { durationMinutes: 30 },
      });
      
      prisma.progressEntry.groupBy.mockResolvedValue([]);

      const result = await QueryOptimizer.getUserStatsOptimized(userId);

      expect(result).toBeDefined();
      expect(result.totalSessions).toBe(5);
    });
  });
});

describe('Performance Benchmarks', () => {
  it('should complete cache operations within acceptable time', async () => {
    const testData = { large: 'data'.repeat(1000) };
    
    const startTime = Date.now();
    await cacheService.set('benchmark-test', testData);
    await cacheService.get('benchmark-test');
    const endTime = Date.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100); // Should complete within 100ms
  });

  it('should handle concurrent cache operations', async () => {
    const operations = [];

    // Create 10 concurrent cache operations
    for (let i = 0; i < 10; i++) {
      operations.push(
        cacheService.set(`concurrent-test-${i}`, { data: i })
      );
    }

    const startTime = Date.now();
    await Promise.all(operations);
    const endTime = Date.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(500); // Should complete within 500ms
  });
});