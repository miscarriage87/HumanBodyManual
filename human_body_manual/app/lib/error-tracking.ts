import { PrismaClient } from '@prisma/client';

export interface ErrorEvent {
  id: string;
  errorType: string;
  message: string;
  stack?: string;
  userId?: string;
  sessionId?: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
  resolved: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  timeWindow: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

export class ErrorTrackingService {
  private prisma: PrismaClient;
  private alertRules: AlertRule[] = [];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.initializeDefaultAlertRules();
  }

  // Record error events
  async recordError(error: Omit<ErrorEvent, 'id' | 'timestamp' | 'resolved'>) {
    try {
      const errorEvent = await this.prisma.errorLog.create({
        data: {
          errorType: error.errorType,
          message: error.message,
          stackTrace: error.stack,
          userId: error.userId,
          feature: error.component,
          metadata: {
            ...error.metadata,
            severity: error.severity,
            sessionId: error.sessionId,
          },
          timestamp: new Date(),
          resolved: false,
        },
      });

      // Check alert rules
      await this.checkAlertRules(errorEvent);

      return errorEvent;
    } catch (err) {
      console.error('Failed to record error:', err);
      // Fallback logging to prevent infinite loops
      console.error('Original error:', error);
    }
  }

  // Get error statistics
  async getErrorStatistics(timeRange: { start: Date; end: Date }) {
    try {
      const errorStats = await this.prisma.errorLog.groupBy({
        by: ['feature', 'errorType'],
        where: {
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        _count: {
          _all: true,
        },
      });

      const errorTrends = await this.prisma.errorLog.findMany({
        where: {
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        select: {
          timestamp: true,
          errorType: true,
          feature: true,
          metadata: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      return {
        statistics: errorStats,
        trends: errorTrends,
      };
    } catch (error) {
      console.error('Failed to get error statistics:', error);
      throw error;
    }
  }

  // Get recent errors for dashboard
  async getRecentErrors(limit: number = 50) {
    try {
      const recentErrors = await this.prisma.errorLog.findMany({
        take: limit,
        orderBy: {
          timestamp: 'desc',
        },
      });

      return recentErrors;
    } catch (error) {
      console.error('Failed to get recent errors:', error);
      throw error;
    }
  }

  // Mark error as resolved
  async resolveError(errorId: string, resolvedBy?: string) {
    try {
      const resolvedError = await this.prisma.errorLog.update({
        where: { id: errorId },
        data: {
          resolved: true,
          metadata: {
            resolvedAt: new Date(),
            resolvedBy,
          },
        },
      });

      return resolvedError;
    } catch (error) {
      console.error('Failed to resolve error:', error);
      throw error;
    }
  }

  // Check alert rules and trigger notifications
  private async checkAlertRules(errorEvent: any) {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      const shouldAlert = await this.evaluateAlertRule(rule, errorEvent);
      if (shouldAlert) {
        await this.triggerAlert(rule, errorEvent);
      }
    }
  }

  // Evaluate if an alert rule should trigger
  private async evaluateAlertRule(rule: AlertRule, errorEvent: any): Promise<boolean> {
    try {
      const timeWindow = new Date(Date.now() - rule.timeWindow * 60 * 1000);
      const severity = errorEvent.metadata?.severity;
      
      switch (rule.condition) {
        case 'error_rate':
          const errorCount = await this.prisma.errorLog.count({
            where: {
              feature: errorEvent.feature,
              timestamp: { gte: timeWindow },
            },
          });
          return errorCount >= rule.threshold;

        case 'critical_error':
          return severity === 'critical';

        case 'component_failure':
          const componentErrors = await this.prisma.errorLog.count({
            where: {
              feature: errorEvent.feature,
              timestamp: { gte: timeWindow },
            },
          });
          // For now, we'll use a simple count. In production, you'd want to filter by severity
          // stored in metadata, but Prisma JSON queries are complex
          return componentErrors >= rule.threshold;

        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to evaluate alert rule:', error);
      return false;
    }
  }

  // Trigger alert notification
  private async triggerAlert(rule: AlertRule, errorEvent: any) {
    try {
      // Log alert (in production, this would send to notification channels)
      console.warn(`ALERT: ${rule.name}`, {
        rule: rule.name,
        severity: rule.severity,
        errorEvent: {
          feature: errorEvent.feature,
          message: errorEvent.message,
          timestamp: errorEvent.timestamp,
        },
      });

      // For now, we'll log alerts to the error log with a special type
      // In production, this would integrate with notification services
      await this.prisma.errorLog.create({
        data: {
          errorType: 'alert_triggered',
          message: `Alert triggered: ${rule.name}`,
          feature: 'monitoring-system',
          metadata: {
            alertRule: rule.name,
            severity: rule.severity,
            originalErrorId: errorEvent.id,
            threshold: rule.threshold,
            timeWindow: rule.timeWindow,
          },
          resolved: false,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  }

  // Initialize default alert rules
  private initializeDefaultAlertRules() {
    this.alertRules = [
      {
        id: '1',
        name: 'High Error Rate',
        condition: 'error_rate',
        threshold: 10,
        timeWindow: 5,
        severity: 'high',
        enabled: true,
        notificationChannels: ['email', 'slack'],
      },
      {
        id: '2',
        name: 'Critical Error',
        condition: 'critical_error',
        threshold: 1,
        timeWindow: 1,
        severity: 'critical',
        enabled: true,
        notificationChannels: ['email', 'slack', 'sms'],
      },
      {
        id: '3',
        name: 'Component Failure',
        condition: 'component_failure',
        threshold: 5,
        timeWindow: 10,
        severity: 'high',
        enabled: true,
        notificationChannels: ['email'],
      },
    ];
  }
}