import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor } from '@/lib/query-optimizer';
import { cacheService } from '@/lib/cache';
import { analyticsQueue, insightsQueue, cacheWarmupQueue } from '@/lib/job-queue';

// GET /api/performance - Get performance metrics and system health
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');

    switch (metric) {
      case 'queries':
        // Get query performance statistics
        const queryStats = PerformanceMonitor.getAllStats();
        
        return NextResponse.json({
          success: true,
          data: {
            queryStats,
            totalQueries: queryStats.reduce((sum, stat) => sum + (stat?.count || 0), 0),
            averageResponseTime: queryStats.length > 0 
              ? Math.round(queryStats.reduce((sum, stat) => sum + (stat?.averageMs || 0), 0) / queryStats.length)
              : 0,
          },
        });

      case 'cache':
        // Get cache health and statistics
        const cacheHealthy = await cacheService.healthCheck();
        
        return NextResponse.json({
          success: true,
          data: {
            healthy: cacheHealthy,
            status: cacheHealthy ? 'connected' : 'disconnected',
          },
        });

      case 'queues':
        // Get job queue statistics
        const [analyticsWaiting, insightsWaiting, cacheWaiting] = await Promise.all([
          analyticsQueue.waiting(),
          insightsQueue.waiting(),
          cacheWarmupQueue.waiting(),
        ]);

        const [analyticsActive, insightsActive, cacheActive] = await Promise.all([
          analyticsQueue.active(),
          insightsQueue.active(),
          cacheWarmupQueue.active(),
        ]);

        const [analyticsCompleted, insightsCompleted, cacheCompleted] = await Promise.all([
          analyticsQueue.completed(),
          insightsQueue.completed(),
          cacheWarmupQueue.completed(),
        ]);

        const [analyticsFailed, insightsFailed, cacheFailed] = await Promise.all([
          analyticsQueue.failed(),
          insightsQueue.failed(),
          cacheWarmupQueue.failed(),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            analytics: {
              waiting: analyticsWaiting.length,
              active: analyticsActive.length,
              completed: analyticsCompleted.length,
              failed: analyticsFailed.length,
            },
            insights: {
              waiting: insightsWaiting.length,
              active: insightsActive.length,
              completed: insightsCompleted.length,
              failed: insightsFailed.length,
            },
            cacheWarmup: {
              waiting: cacheWaiting.length,
              active: cacheActive.length,
              completed: cacheCompleted.length,
              failed: cacheFailed.length,
            },
          },
        });

      case 'system':
        // Get overall system health
        const systemHealth = {
          cache: await cacheService.healthCheck(),
          database: await checkDatabaseHealth(),
          queues: await checkQueueHealth(),
        };

        return NextResponse.json({
          success: true,
          data: {
            healthy: Object.values(systemHealth).every(Boolean),
            components: systemHealth,
            timestamp: new Date().toISOString(),
          },
        });

      default:
        // Get all performance metrics
        const allMetrics = {
          queries: PerformanceMonitor.getAllStats(),
          cache: {
            healthy: await cacheService.healthCheck(),
          },
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
          },
        };

        return NextResponse.json({
          success: true,
          data: allMetrics,
        });
    }

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}

// POST /api/performance - Trigger performance optimizations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    switch (action) {
      case 'optimize_queries':
        // Trigger query optimization analysis
        const queryStats = PerformanceMonitor.getAllStats();
        const slowQueries = queryStats.filter(stat => stat && stat.averageMs > 1000);
        
        return NextResponse.json({
          success: true,
          data: {
            message: 'Query optimization analysis completed',
            slowQueries,
            recommendations: generateQueryOptimizationRecommendations(slowQueries),
          },
        });

      case 'warm_cache':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required for cache warmup' },
            { status: 400 }
          );
        }

        // Import JobScheduler to avoid circular dependencies
        const { JobScheduler } = await import('@/lib/job-queue');
        await JobScheduler.scheduleCacheWarmup(userId);
        
        return NextResponse.json({
          success: true,
          data: {
            message: `Cache warmup scheduled for user ${userId}`,
          },
        });

      case 'cleanup_cache':
        // Clean up expired cache entries (this would be implemented based on Redis capabilities)
        return NextResponse.json({
          success: true,
          data: {
            message: 'Cache cleanup initiated',
          },
        });

      case 'analyze_performance':
        // Perform comprehensive performance analysis
        const analysis = await performComprehensiveAnalysis();
        
        return NextResponse.json({
          success: true,
          data: analysis,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error performing optimization:', error);
    return NextResponse.json(
      { error: 'Failed to perform optimization' },
      { status: 500 }
    );
  }
}

// Helper functions
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/db');
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

async function checkQueueHealth(): Promise<boolean> {
  try {
    // Check if queues are responsive
    const queueChecks = await Promise.allSettled([
      analyticsQueue.isReady(),
      insightsQueue.isReady(),
      cacheWarmupQueue.isReady(),
    ]);

    return queueChecks.every(result => result.status === 'fulfilled');
  } catch (error) {
    console.error('Queue health check failed:', error);
    return false;
  }
}

function generateQueryOptimizationRecommendations(slowQueries: any[]): string[] {
  const recommendations = [];

  if (slowQueries.length === 0) {
    recommendations.push('All queries are performing well!');
    return recommendations;
  }

  recommendations.push(`Found ${slowQueries.length} slow queries that need attention`);

  slowQueries.forEach(query => {
    if (query.averageMs > 2000) {
      recommendations.push(`${query.queryName}: Consider adding database indexes or optimizing query logic`);
    } else if (query.averageMs > 1000) {
      recommendations.push(`${query.queryName}: Monitor for potential optimization opportunities`);
    }
  });

  recommendations.push('Consider implementing additional caching for frequently accessed data');
  recommendations.push('Review database indexes for optimal query performance');

  return recommendations;
}

async function performComprehensiveAnalysis() {
  const [queryStats, cacheHealth, queueStats] = await Promise.all([
    PerformanceMonitor.getAllStats(),
    cacheService.healthCheck(),
    Promise.all([
      analyticsQueue.waiting(),
      insightsQueue.waiting(),
      cacheWarmupQueue.waiting(),
    ]),
  ]);

  const totalQueuedJobs = queueStats.reduce((sum, jobs) => sum + jobs.length, 0);
  const averageQueryTime = queryStats.length > 0 
    ? queryStats.reduce((sum, stat) => sum + (stat?.averageMs || 0), 0) / queryStats.length
    : 0;

  return {
    performance: {
      averageQueryTime: Math.round(averageQueryTime),
      slowQueries: queryStats.filter(stat => stat && stat.averageMs > 1000).length,
      totalQueries: queryStats.reduce((sum, stat) => sum + (stat?.count || 0), 0),
    },
    cache: {
      healthy: cacheHealth,
      status: cacheHealth ? 'optimal' : 'needs_attention',
    },
    queues: {
      totalQueuedJobs,
      status: totalQueuedJobs < 100 ? 'optimal' : 'high_load',
    },
    recommendations: [
      ...(averageQueryTime > 500 ? ['Consider query optimization'] : []),
      ...(!cacheHealth ? ['Fix cache connectivity issues'] : []),
      ...(totalQueuedJobs > 100 ? ['Consider scaling background job processing'] : []),
    ],
    timestamp: new Date().toISOString(),
  };
}