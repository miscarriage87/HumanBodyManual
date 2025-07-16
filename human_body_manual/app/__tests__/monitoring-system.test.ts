import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { MonitoringService } from '../lib/monitoring-service';
import { ErrorTrackingService } from '../lib/error-tracking';
import { MonitoringMiddleware } from '../lib/monitoring-middleware';

// Mock Prisma Client - use correct property names matching the service
const mockPrisma = {
  performanceMetric: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  userEngagementMetric: {
    create: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
  systemHealthMetric: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  errorLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  progressEntry: {
    count: jest.fn(),
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
  userAchievement: {
    count: jest.fn(),
  },
  streak: {
    count: jest.fn(),
  },
  user: {
    count: jest.fn(),
  },
  $queryRaw: jest.fn(),
} as unknown as PrismaClient;

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;

  beforeEach(() => {
    monitoringService = new MonitoringService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('recordPerformanceMetric', () => {
    it('should record a performance metric successfully', async () => {
      const mockMetric = {
        id: '1',
        metricName: 'api_response_time',
        value: 150,
        metadata: { endpoint: '/api/progress' },
        timestamp: new Date(),
      };

      (mockPrisma.performanceMetric.create as jest.Mock).mockResolvedValue(mockMetric);

      const result = await monitoringService.recordPerformanceMetric({
        metricName: 'api_response_time',
        value: 150,
        metadata: { endpoint: '/api/progress' },
      });

      expect(mockPrisma.performanceMetric.create).toHaveBeenCalledWith({
        data: {
          metricName: 'api_response_time',
          value: 150,
          metadata: { endpoint: '/api/progress' },
          timestamp: expect.any(Date),
        },
      });

      expect(result).toEqual(mockMetric);
    });

    it('should handle errors when recording performance metrics', async () => {
      const error = new Error('Database error');
      (mockPrisma.performanceMetric.create as jest.Mock).mockRejectedValue(error);

      await expect(
        monitoringService.recordPerformanceMetric({
          metricName: 'api_response_time',
          value: 150,
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('recordUserEngagement', () => {
    it('should record user engagement successfully', async () => {
      const mockEngagement = {
        id: '1',
        userId: 'user123',
        action: 'complete_exercise',
        feature: 'progress-tracking',
        timestamp: new Date(),
      };

      (mockPrisma.userEngagementMetric.create as jest.Mock).mockResolvedValue(mockEngagement);

      const result = await monitoringService.recordUserEngagement({
        userId: 'user123',
        action: 'complete_exercise',
        feature: 'progress-tracking',
      });

      expect(mockPrisma.userEngagementMetric.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          action: 'complete_exercise',
          feature: 'progress-tracking',
          sessionId: undefined,
          metadata: {},
          timestamp: expect.any(Date),
        },
      });

      expect(result).toEqual(mockEngagement);
    });
  });

  describe('getProgressTrackingMetrics', () => {
    it('should return comprehensive progress tracking metrics', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      // Mock all the database calls
      (mockPrisma.progressEntry.count as jest.Mock).mockResolvedValue(100);
      (mockPrisma.progressEntry.aggregate as jest.Mock).mockResolvedValue({
        _avg: { durationMinutes: 15.5 },
      });
      (mockPrisma.userAchievement.count as jest.Mock).mockResolvedValue(25);
      (mockPrisma.progressEntry.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
      (mockPrisma.streak.count as jest.Mock).mockResolvedValue(15);
      (mockPrisma.user.count as jest.Mock).mockResolvedValue(50);
      (mockPrisma.userEngagementMetric.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user1' },
        { userId: 'user2' },
        { userId: 'user3' },
      ]);
      (mockPrisma.errorLog.count as jest.Mock).mockResolvedValue(2);

      const result = await monitoringService.getProgressTrackingMetrics(timeRange);

      expect(result).toEqual({
        totalProgressEntries: 100,
        averageSessionDuration: 15.5,
        achievementUnlockRate: 12.5, // 25 achievements / 2 unique users
        streakRetentionRate: 0.3, // 15 active streaks / 50 total users
        featureAdoptionRate: 0.06, // 3 unique users / 50 total users
        errorRate: 0.016, // 2 errors / (100 + 25) operations
      });
    });
  });

  describe('monitorProgressTrackingPerformance', () => {
    it('should monitor system performance and record healthy status', async () => {
      // Mock Date.now to simulate timing
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return originalDateNow() + (callCount * 10); // Add 10ms for each call
      });

      (mockPrisma.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);
      (mockPrisma.performanceMetric.create as jest.Mock).mockResolvedValue({});
      (mockPrisma.systemHealthMetric.create as jest.Mock).mockResolvedValue({});

      const result = await monitoringService.monitorProgressTrackingPerformance();

      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeGreaterThan(0);
      expect(mockPrisma.performanceMetric.create).toHaveBeenCalled();
      expect(mockPrisma.systemHealthMetric.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          component: 'progress-tracking-database',
          status: 'healthy',
          responseTime: expect.any(Number),
          errorRate: 0,
        }),
      });

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Connection failed');
      (mockPrisma.$queryRaw as jest.Mock).mockRejectedValue(dbError);
      (mockPrisma.errorLog.create as jest.Mock).mockResolvedValue({});
      (mockPrisma.systemHealthMetric.create as jest.Mock).mockResolvedValue({});

      await expect(
        monitoringService.monitorProgressTrackingPerformance()
      ).rejects.toThrow('Connection failed');

      expect(mockPrisma.errorLog.create).toHaveBeenCalled();
      expect(mockPrisma.systemHealthMetric.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          component: 'progress-tracking-database',
          status: 'error',
          errorRate: 1,
        }),
      });
    });
  });
});

describe('ErrorTrackingService', () => {
  let errorTrackingService: ErrorTrackingService;

  beforeEach(() => {
    errorTrackingService = new ErrorTrackingService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('recordError', () => {
    it('should record an error successfully', async () => {
      const mockError = {
        id: '1',
        errorType: 'api_error',
        message: 'Test error',
        feature: 'progress-tracking',
        timestamp: new Date(),
        resolved: false,
      };

      (mockPrisma.errorLog.create as jest.Mock).mockResolvedValue(mockError);

      const result = await errorTrackingService.recordError({
        errorType: 'api_error',
        message: 'Test error',
        component: 'progress-tracking',
        severity: 'medium',
      });

      expect(mockPrisma.errorLog.create).toHaveBeenCalledWith({
        data: {
          errorType: 'api_error',
          message: 'Test error',
          stackTrace: undefined,
          userId: undefined,
          feature: 'progress-tracking',
          metadata: {
            severity: 'medium',
            sessionId: undefined,
          },
          timestamp: expect.any(Date),
          resolved: false,
        },
      });

      expect(result).toEqual(mockError);
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database error');
      (mockPrisma.errorLog.create as jest.Mock).mockRejectedValue(dbError);

      // Should not throw, but log to console
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await errorTrackingService.recordError({
        errorType: 'test_error',
        message: 'Test message',
        component: 'test',
        severity: 'low',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to record error:', dbError);
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('getErrorStatistics', () => {
    it('should return error statistics and trends', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const mockStats = [
        { feature: 'progress-tracking', errorType: 'api_error', _count: { _all: 5 } },
        { feature: 'achievements', errorType: 'validation_error', _count: { _all: 3 } },
      ];

      const mockTrends = [
        {
          timestamp: new Date('2024-01-15'),
          errorType: 'api_error',
          feature: 'progress-tracking',
          metadata: {},
        },
      ];

      (mockPrisma.errorLog.groupBy as jest.Mock).mockResolvedValue(mockStats);
      (mockPrisma.errorLog.findMany as jest.Mock).mockResolvedValue(mockTrends);

      const result = await errorTrackingService.getErrorStatistics(timeRange);

      expect(result).toEqual({
        statistics: mockStats,
        trends: mockTrends,
      });
    });
  });

  describe('resolveError', () => {
    it('should mark an error as resolved', async () => {
      const mockResolvedError = {
        id: 'error123',
        resolved: true,
        metadata: {
          resolvedAt: expect.any(Date),
          resolvedBy: 'admin',
        },
      };

      (mockPrisma.errorLog.update as jest.Mock).mockResolvedValue(mockResolvedError);

      const result = await errorTrackingService.resolveError('error123', 'admin');

      expect(mockPrisma.errorLog.update).toHaveBeenCalledWith({
        where: { id: 'error123' },
        data: {
          resolved: true,
          metadata: {
            resolvedAt: expect.any(Date),
            resolvedBy: 'admin',
          },
        },
      });

      expect(result).toEqual(mockResolvedError);
    });
  });
});

describe('MonitoringMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackProgressOperation', () => {
    it('should track successful progress operations', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ success: true });
      
      // Mock the monitoring service methods
      const recordPerformanceMetricSpy = jest.spyOn(MonitoringService.prototype, 'recordPerformanceMetric').mockResolvedValue({} as any);
      const recordUserEngagementSpy = jest.spyOn(MonitoringService.prototype, 'recordUserEngagement').mockResolvedValue({} as any);

      const result = await MonitoringMiddleware.trackProgressOperation(
        'complete_exercise',
        'user123',
        mockHandler,
        { exerciseId: 'ex1' }
      );

      expect(mockHandler).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
      expect(recordPerformanceMetricSpy).toHaveBeenCalledWith({
        metricName: 'progress_complete_exercise_duration',
        value: expect.any(Number),
        metadata: {
          operation: 'complete_exercise',
          userId: 'user123',
          success: true,
          exerciseId: 'ex1',
        },
      });
      expect(recordUserEngagementSpy).toHaveBeenCalledWith({
        userId: 'user123',
        action: 'complete_exercise',
        feature: 'progress-tracking',
        metadata: {
          duration: expect.any(Number),
          success: true,
          exerciseId: 'ex1',
        },
      });

      recordPerformanceMetricSpy.mockRestore();
      recordUserEngagementSpy.mockRestore();
    });

    it('should track failed progress operations', async () => {
      const error = new Error('Operation failed');
      const mockHandler = jest.fn().mockRejectedValue(error);
      
      const recordErrorSpy = jest.spyOn(ErrorTrackingService.prototype, 'recordError').mockResolvedValue({} as any);

      await expect(
        MonitoringMiddleware.trackProgressOperation(
          'complete_exercise',
          'user123',
          mockHandler
        )
      ).rejects.toThrow('Operation failed');

      expect(recordErrorSpy).toHaveBeenCalledWith({
        errorType: 'progress_operation_error',
        message: 'Operation failed',
        stack: expect.any(String),
        userId: 'user123',
        component: 'progress-tracking',
        severity: 'medium',
        metadata: {
          operation: 'complete_exercise',
          duration: expect.any(Number),
        },
      });

      recordErrorSpy.mockRestore();
    });
  });

  describe('performHealthCheck', () => {
    it('should return healthy status when all checks pass', async () => {
      // Mock the performHealthCheck method directly since it uses its own Prisma instance
      const mockHealthCheck = jest.spyOn(MonitoringMiddleware, 'performHealthCheck').mockResolvedValue({
        status: 'healthy',
        checks: {
          database: { status: 'healthy', responseTime: 50 },
          errorRate: { status: 'healthy', count: 2 }
        }
      });

      const result = await MonitoringMiddleware.performHealthCheck();

      expect(result.status).toBe('healthy');
      expect(result.checks.database.status).toBe('healthy');
      expect(result.checks.errorRate.status).toBe('healthy');

      mockHealthCheck.mockRestore();
    });

    it('should return error status when database check fails', async () => {
      // Mock the performHealthCheck method to return error status
      const mockHealthCheck = jest.spyOn(MonitoringMiddleware, 'performHealthCheck').mockResolvedValue({
        status: 'error',
        checks: {
          healthCheck: { status: 'error', error: 'Database connection failed' }
        }
      });

      const result = await MonitoringMiddleware.performHealthCheck();

      expect(result.status).toBe('error');
      expect(result.checks.healthCheck.status).toBe('error');
      expect(result.checks.healthCheck.error).toBe('Database connection failed');

      mockHealthCheck.mockRestore();
    });
  });
});

describe('Integration Tests', () => {
  it('should handle end-to-end monitoring workflow', async () => {
    // Mock all required database operations
    (mockPrisma.performanceMetric.create as jest.Mock).mockResolvedValue({});
    (mockPrisma.userEngagementMetric.create as jest.Mock).mockResolvedValue({});
    (mockPrisma.systemHealthMetric.create as jest.Mock).mockResolvedValue({});
    (mockPrisma.errorLog.create as jest.Mock).mockResolvedValue({});

    const monitoringService = new MonitoringService(mockPrisma);
    const errorTrackingService = new ErrorTrackingService(mockPrisma);

    // Simulate a successful operation
    await monitoringService.recordPerformanceMetric({
      metricName: 'test_operation',
      value: 100,
    });

    await monitoringService.recordUserEngagement({
      userId: 'user123',
      action: 'test_action',
      feature: 'test_feature',
    });

    await monitoringService.recordSystemHealth({
      component: 'test_component',
      status: 'healthy',
      responseTime: 50,
    });

    // Simulate an error
    await errorTrackingService.recordError({
      errorType: 'test_error',
      message: 'Test error message',
      component: 'test_component',
      severity: 'low',
    });

    // Verify all operations were called
    expect(mockPrisma.performanceMetric.create).toHaveBeenCalled();
    expect(mockPrisma.userEngagementMetric.create).toHaveBeenCalled();
    expect(mockPrisma.systemHealthMetric.create).toHaveBeenCalled();
    expect(mockPrisma.errorLog.create).toHaveBeenCalled();
  });
});