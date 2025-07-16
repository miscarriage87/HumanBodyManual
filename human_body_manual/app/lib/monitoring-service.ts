import { PrismaClient } from '@prisma/client';

export interface PerformanceMetric {
  id: string;
  metricName: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserEngagementMetric {
  userId: string;
  action: string;
  feature: string;
  timestamp: Date;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealthMetric {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime?: number;
  errorRate?: number;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface ErrorLogEntry {
  id: string;
  errorType: string;
  message: string;
  stackTrace?: string;
  userId?: string;
  feature?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  timestamp: Date;
}

export interface ProgressTrackingMetrics {
  totalProgressEntries: number;
  averageSessionDuration: number;
  achievementUnlockRate: number;
  streakRetentionRate: number;
  featureAdoptionRate: number;
  errorRate: number;
}

export class MonitoringService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Performance monitoring
  async recordPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) {
    try {
      const performanceMetric = await this.prisma.performanceMetric.create({
        data: {
          metricName: metric.metricName,
          value: metric.value,
          metadata: metric.metadata || {},
          timestamp: new Date(),
        },
      });
      return performanceMetric;
    } catch (error) {
      console.error('Failed to record performance metric:', error);
      throw error;
    }
  }

  // User engagement tracking
  async recordUserEngagement(engagement: Omit<UserEngagementMetric, 'timestamp'>) {
    try {
      const userEngagement = await this.prisma.userEngagementMetric.create({
        data: {
          userId: engagement.userId,
          action: engagement.action,
          feature: engagement.feature,
          sessionId: engagement.sessionId,
          metadata: engagement.metadata || {},
          timestamp: new Date(),
        },
      });
      return userEngagement;
    } catch (error) {
      console.error('Failed to record user engagement:', error);
      throw error;
    }
  }

  // System health monitoring
  async recordSystemHealth(health: Omit<SystemHealthMetric, 'timestamp'>) {
    try {
      const systemHealth = await this.prisma.systemHealthMetric.create({
        data: {
          component: health.component,
          status: health.status,
          responseTime: health.responseTime,
          errorRate: health.errorRate,
          details: health.details || {},
          timestamp: new Date(),
        },
      });
      return systemHealth;
    } catch (error) {
      console.error('Failed to record system health:', error);
      throw error;
    }
  }

  // Get performance metrics for dashboard
  async getPerformanceMetrics(timeRange: { start: Date; end: Date }) {
    try {
      const metrics = await this.prisma.performanceMetric.findMany({
        where: {
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      return metrics;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  // Get user engagement analytics
  async getUserEngagementAnalytics(timeRange: { start: Date; end: Date }) {
    try {
      const engagementData = await this.prisma.userEngagementMetric.groupBy({
        by: ['feature', 'action'],
        where: {
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      const uniqueUsers = await this.prisma.userEngagementMetric.findMany({
        where: {
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      });

      return {
        featureUsage: engagementData,
        activeUsers: uniqueUsers.length,
      };
    } catch (error) {
      console.error('Failed to get user engagement analytics:', error);
      throw error;
    }
  }

  // Get system health status
  async getSystemHealthStatus() {
    try {
      const recentHealth = await this.prisma.systemHealthMetric.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 100,
      });

      const componentStatus = recentHealth.reduce((acc: Record<string, any>, metric) => {
        if (!acc[metric.component] || acc[metric.component].timestamp < metric.timestamp) {
          acc[metric.component] = metric;
        }
        return acc;
      }, {} as Record<string, any>);

      return Object.values(componentStatus);
    } catch (error) {
      console.error('Failed to get system health status:', error);
      throw error;
    }
  }

  // Error tracking
  async logError(error: Omit<ErrorLogEntry, 'id' | 'timestamp' | 'resolved'>) {
    try {
      const errorLog = await this.prisma.errorLog.create({
        data: {
          errorType: error.errorType,
          message: error.message,
          stackTrace: error.stackTrace,
          userId: error.userId,
          feature: error.feature,
          metadata: error.metadata || {},
          resolved: false,
          timestamp: new Date(),
        },
      });
      return errorLog;
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
      // Fallback to console logging if database fails
      console.error('Original error:', error);
      throw dbError;
    }
  }

  // Mark error as resolved
  async resolveError(errorId: string) {
    try {
      const resolvedError = await this.prisma.errorLog.update({
        where: { id: errorId },
        data: { resolved: true },
      });
      return resolvedError;
    } catch (error) {
      console.error('Failed to resolve error:', error);
      throw error;
    }
  }

  // Get unresolved errors
  async getUnresolvedErrors(limit: number = 50) {
    try {
      const errors = await this.prisma.errorLog.findMany({
        where: { resolved: false },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
      return errors;
    } catch (error) {
      console.error('Failed to get unresolved errors:', error);
      throw error;
    }
  }

  // Progress tracking specific metrics
  async getProgressTrackingMetrics(timeRange: { start: Date; end: Date }): Promise<ProgressTrackingMetrics> {
    try {
      // Total progress entries
      const totalProgressEntries = await this.prisma.progressEntry.count({
        where: {
          completedAt: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      });

      // Average session duration
      const sessionDurations = await this.prisma.progressEntry.aggregate({
        where: {
          completedAt: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
          durationMinutes: { not: null },
        },
        _avg: {
          durationMinutes: true,
        },
      });

      // Achievement unlock rate
      const totalAchievements = await this.prisma.userAchievement.count({
        where: {
          earnedAt: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      });

      const uniqueUsersWithProgress = await this.prisma.progressEntry.findMany({
        where: {
          completedAt: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        select: { userId: true },
        distinct: ['userId'],
      });

      const achievementUnlockRate = uniqueUsersWithProgress.length > 0 
        ? totalAchievements / uniqueUsersWithProgress.length 
        : 0;

      // Streak retention rate (users who maintained streaks)
      const activeStreaks = await this.prisma.streak.count({
        where: {
          currentCount: { gt: 0 },
          lastActivityDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      const totalUsers = await this.prisma.user.count();
      const streakRetentionRate = totalUsers > 0 ? activeStreaks / totalUsers : 0;

      // Feature adoption rate (users who used progress tracking features)
      const progressFeatureUsers = await this.prisma.userEngagementMetric.findMany({
        where: {
          feature: { in: ['progress-dashboard', 'achievements', 'streaks', 'analytics'] },
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        select: { userId: true },
        distinct: ['userId'],
      });

      const featureAdoptionRate = totalUsers > 0 ? progressFeatureUsers.length / totalUsers : 0;

      // Error rate for progress tracking features
      const progressErrors = await this.prisma.errorLog.count({
        where: {
          feature: { in: ['progress-tracking', 'achievements', 'streaks', 'analytics'] },
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      });

      const totalProgressOperations = totalProgressEntries + totalAchievements;
      const errorRate = totalProgressOperations > 0 ? progressErrors / totalProgressOperations : 0;

      return {
        totalProgressEntries,
        averageSessionDuration: sessionDurations._avg.durationMinutes || 0,
        achievementUnlockRate,
        streakRetentionRate,
        featureAdoptionRate,
        errorRate,
      };
    } catch (error) {
      console.error('Failed to get progress tracking metrics:', error);
      throw error;
    }
  }

  // Get feature usage analytics for progress tracking
  async getProgressFeatureUsage(timeRange: { start: Date; end: Date }) {
    try {
      const featureUsage = await this.prisma.userEngagementMetric.groupBy({
        by: ['feature', 'action'],
        where: {
          feature: { in: ['progress-dashboard', 'achievements', 'streaks', 'analytics', 'biometric-integration', 'community'] },
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      return featureUsage;
    } catch (error) {
      console.error('Failed to get progress feature usage:', error);
      throw error;
    }
  }

  // Monitor system performance for progress tracking operations
  async monitorProgressTrackingPerformance() {
    const startTime = Date.now();
    
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - startTime;

      await this.recordPerformanceMetric({
        metricName: 'database_response_time',
        value: dbResponseTime,
        metadata: { component: 'progress-tracking' },
      });

      await this.recordSystemHealth({
        component: 'progress-tracking-database',
        status: 'healthy',
        responseTime: dbResponseTime,
        errorRate: 0,
      });

      return { status: 'healthy', responseTime: dbResponseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await this.logError({
        errorType: 'database_connection',
        message: 'Database connection failed during health check',
        feature: 'progress-tracking',
        metadata: { responseTime, error: error instanceof Error ? error.message : 'Unknown error' },
      });

      await this.recordSystemHealth({
        component: 'progress-tracking-database',
        status: 'error',
        responseTime,
        errorRate: 1,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      throw error;
    }
  }
}