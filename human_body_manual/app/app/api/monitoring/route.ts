import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MonitoringService } from '../../../lib/monitoring-service';

const prisma = new PrismaClient();
const monitoringService = new MonitoringService(prisma);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const metric = searchParams.get('metric');

    // Calculate time range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const dateRange = { start: startDate, end: now };

    // Return specific metric or overview
    if (metric === 'progress-tracking') {
      const progressMetrics = await monitoringService.getProgressTrackingMetrics(dateRange);
      return NextResponse.json(progressMetrics);
    }

    if (metric === 'feature-usage') {
      const featureUsage = await monitoringService.getProgressFeatureUsage(dateRange);
      return NextResponse.json(featureUsage);
    }

    if (metric === 'system-health') {
      const systemHealth = await monitoringService.getSystemHealthStatus();
      return NextResponse.json(systemHealth);
    }

    if (metric === 'errors') {
      const errors = await monitoringService.getUnresolvedErrors();
      return NextResponse.json(errors);
    }

    // Return overview dashboard data
    const [
      progressMetrics,
      featureUsage,
      systemHealth,
      performanceMetrics,
      engagementAnalytics,
      errors
    ] = await Promise.all([
      monitoringService.getProgressTrackingMetrics(dateRange),
      monitoringService.getProgressFeatureUsage(dateRange),
      monitoringService.getSystemHealthStatus(),
      monitoringService.getPerformanceMetrics(dateRange),
      monitoringService.getUserEngagementAnalytics(dateRange),
      monitoringService.getUnresolvedErrors(10)
    ]);

    return NextResponse.json({
      progressMetrics,
      featureUsage,
      systemHealth,
      performanceMetrics,
      engagementAnalytics,
      errors,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Monitoring API error:', error);
    
    // Log the error
    await monitoringService.logError({
      errorType: 'api_error',
      message: 'Failed to fetch monitoring data',
      feature: 'monitoring-api',
      metadata: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    });

    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'performance':
        const performanceMetric = await monitoringService.recordPerformanceMetric(data);
        return NextResponse.json(performanceMetric);

      case 'engagement':
        const engagement = await monitoringService.recordUserEngagement(data);
        return NextResponse.json(engagement);

      case 'health':
        const health = await monitoringService.recordSystemHealth(data);
        return NextResponse.json(health);

      case 'error':
        const errorLog = await monitoringService.logError(data);
        return NextResponse.json(errorLog);

      default:
        return NextResponse.json(
          { error: 'Invalid monitoring type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring POST API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to record monitoring data' },
      { status: 500 }
    );
  }
}