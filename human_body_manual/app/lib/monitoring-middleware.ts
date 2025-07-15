import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MonitoringService } from './monitoring-service';
import { ErrorTrackingService } from './error-tracking';

const prisma = new PrismaClient();
const monitoringService = new MonitoringService(prisma);
const errorTrackingService = new ErrorTrackingService(prisma);

export interface MonitoringContext {
  userId?: string;
  sessionId?: string;
  feature: string;
  action: string;
  startTime: number;
}

export class MonitoringMiddleware {
  // Track API performance and errors
  static async trackApiCall(
    request: NextRequest,
    handler: () => Promise<NextResponse>,
    context: MonitoringContext
  ): Promise<NextResponse> {
    const startTime = Date.now();
    let response: NextResponse;
    let error: Error | null = null;

    try {
      response = await handler();
      
      // Record successful API call
      const responseTime = Date.now() - startTime;
      
      await monitoringService.recordPerformanceMetric({
        metricName: 'api_response_time',
        value: responseTime,
        metadata: {
          endpoint: request.nextUrl.pathname,
          method: request.method,
          feature: context.feature,
          statusCode: response.status,
        },
      });

      // Record user engagement
      if (context.userId) {
        await monitoringService.recordUserEngagement({
          userId: context.userId,
          action: context.action,
          feature: context.feature,
          sessionId: context.sessionId,
          metadata: {
            endpoint: request.nextUrl.pathname,
            method: request.method,
            responseTime,
            statusCode: response.status,
          },
        });
      }

      // Record system health
      await monitoringService.recordSystemHealth({
        component: `api-${context.feature}`,
        status: response.status < 400 ? 'healthy' : response.status < 500 ? 'warning' : 'error',
        responseTime,
        errorRate: 0,
      });

      return response;

    } catch (err) {
      error = err instanceof Error ? err : new Error('Unknown error');
      const responseTime = Date.now() - startTime;

      // Record error
      await errorTrackingService.recordError({
        errorType: 'api_error',
        message: error.message,
        stack: error.stack,
        userId: context.userId,
        sessionId: context.sessionId,
        component: context.feature,
        severity: 'high',
        metadata: {
          endpoint: request.nextUrl.pathname,
          method: request.method,
          responseTime,
        },
      });

      // Record system health as error
      await monitoringService.recordSystemHealth({
        component: `api-${context.feature}`,
        status: 'error',
        responseTime,
        errorRate: 1,
        details: {
          error: error.message,
          stack: error.stack,
        },
      });

      throw error;
    }
  }

  // Track progress tracking operations
  static async trackProgressOperation(
    operation: string,
    userId: string,
    handler: () => Promise<any>,
    metadata?: Record<string, any>
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      const result = await handler();
      const duration = Date.now() - startTime;

      // Record performance metric
      await monitoringService.recordPerformanceMetric({
        metricName: `progress_${operation}_duration`,
        value: duration,
        metadata: {
          operation,
          userId,
          success: true,
          ...metadata,
        },
      });

      // Record user engagement
      await monitoringService.recordUserEngagement({
        userId,
        action: operation,
        feature: 'progress-tracking',
        metadata: {
          duration,
          success: true,
          ...metadata,
        },
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error('Unknown error');

      // Record error
      await errorTrackingService.recordError({
        errorType: 'progress_operation_error',
        message: err.message,
        stack: err.stack,
        userId,
        component: 'progress-tracking',
        severity: 'medium',
        metadata: {
          operation,
          duration,
          ...metadata,
        },
      });

      throw error;
    }
  }

  // Track achievement operations
  static async trackAchievementOperation(
    operation: string,
    userId: string,
    handler: () => Promise<any>,
    metadata?: Record<string, any>
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      const result = await handler();
      const duration = Date.now() - startTime;

      // Record performance metric
      await monitoringService.recordPerformanceMetric({
        metricName: `achievement_${operation}_duration`,
        value: duration,
        metadata: {
          operation,
          userId,
          success: true,
          ...metadata,
        },
      });

      // Record user engagement
      await monitoringService.recordUserEngagement({
        userId,
        action: operation,
        feature: 'achievements',
        metadata: {
          duration,
          success: true,
          ...metadata,
        },
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error('Unknown error');

      // Record error
      await errorTrackingService.recordError({
        errorType: 'achievement_operation_error',
        message: err.message,
        stack: err.stack,
        userId,
        component: 'achievements',
        severity: 'medium',
        metadata: {
          operation,
          duration,
          ...metadata,
        },
      });

      throw error;
    }
  }

  // Track database operations
  static async trackDatabaseOperation(
    operation: string,
    table: string,
    handler: () => Promise<any>,
    metadata?: Record<string, any>
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      const result = await handler();
      const duration = Date.now() - startTime;

      // Record performance metric for slow queries
      if (duration > 1000) { // Log queries taking more than 1 second
        await monitoringService.recordPerformanceMetric({
          metricName: 'slow_database_query',
          value: duration,
          metadata: {
            operation,
            table,
            ...metadata,
          },
        });
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error('Unknown error');

      // Record database error
      await errorTrackingService.recordError({
        errorType: 'database_error',
        message: err.message,
        stack: err.stack,
        component: 'database',
        severity: 'high',
        metadata: {
          operation,
          table,
          duration,
          ...metadata,
        },
      });

      throw error;
    }
  }

  // Track feature usage
  static async trackFeatureUsage(
    userId: string,
    feature: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await monitoringService.recordUserEngagement({
        userId,
        action,
        feature,
        metadata,
      });
    } catch (error) {
      // Don't throw errors for tracking failures
      console.error('Failed to track feature usage:', error);
    }
  }

  // Track page views
  static async trackPageView(
    userId: string | undefined,
    page: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      if (userId) {
        await monitoringService.recordUserEngagement({
          userId,
          action: 'page_view',
          feature: 'navigation',
          metadata: {
            page,
            ...metadata,
          },
        });
      }
    } catch (error) {
      // Don't throw errors for tracking failures
      console.error('Failed to track page view:', error);
    }
  }

  // Health check for monitoring system
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    checks: Record<string, any>;
  }> {
    const checks: Record<string, any> = {};
    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';

    try {
      // Check database connectivity
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStart;
      
      checks.database = {
        status: dbResponseTime < 100 ? 'healthy' : dbResponseTime < 500 ? 'warning' : 'error',
        responseTime: dbResponseTime,
      };

      if (checks.database.status !== 'healthy') {
        overallStatus = checks.database.status;
      }

      // Check recent error rate
      const recentErrors = await prisma.errorLog.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
          resolved: false,
        },
      });

      checks.errorRate = {
        status: recentErrors < 5 ? 'healthy' : recentErrors < 20 ? 'warning' : 'error',
        count: recentErrors,
      };

      if (checks.errorRate.status === 'error') {
        overallStatus = 'error';
      } else if (checks.errorRate.status === 'warning' && overallStatus === 'healthy') {
        overallStatus = 'warning';
      }

      // Record health check result
      await monitoringService.recordSystemHealth({
        component: 'monitoring-system',
        status: overallStatus,
        responseTime: Date.now() - dbStart,
        details: checks,
      });

      return { status: overallStatus, checks };

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      
      checks.healthCheck = {
        status: 'error',
        error: err.message,
      };

      return { status: 'error', checks };
    }
  }
}

// Utility function to create monitoring context
export function createMonitoringContext(
  feature: string,
  action: string,
  userId?: string,
  sessionId?: string
): MonitoringContext {
  return {
    userId,
    sessionId,
    feature,
    action,
    startTime: Date.now(),
  };
}

// Decorator for automatic monitoring
export function withMonitoring(
  feature: string,
  action: string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;

        // Record successful operation
        await monitoringService.recordPerformanceMetric({
          metricName: `${feature}_${action}_duration`,
          value: duration,
          metadata: {
            feature,
            action,
            method: propertyName,
            success: true,
          },
        });

        return result;

      } catch (error) {
        const duration = Date.now() - startTime;
        const err = error instanceof Error ? error : new Error('Unknown error');

        // Record error
        await errorTrackingService.recordError({
          errorType: 'method_error',
          message: err.message,
          stack: err.stack,
          component: feature,
          severity: 'medium',
          metadata: {
            action,
            method: propertyName,
            duration,
          },
        });

        throw error;
      }
    };
  };
}