import { NextRequest, NextResponse } from 'next/server';
import { QueryOptimizer, PerformanceMonitor } from '@/lib/query-optimizer';
import { PaginationService } from '@/lib/pagination';
import { cacheService } from '@/lib/cache';
import { JobScheduler } from '@/lib/job-queue';

// GET /api/progress/optimized - Get optimized user progress data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const bodyArea = searchParams.get('bodyArea') || undefined;
    const includeStats = searchParams.get('includeStats') === 'true';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build date range if provided
    const dateRange = (dateFrom && dateTo) ? {
      start: new Date(dateFrom),
      end: new Date(dateTo)
    } : undefined;

    // Start performance monitoring
    const endTimer = PerformanceMonitor.startTimer('getUserProgressOptimized');

    // Get optimized progress data
    const progressData = await QueryOptimizer.getUserProgressOptimized(userId, {
      limit,
      offset: (page - 1) * limit,
      bodyArea,
      dateRange,
      includeStats,
    });

    endTimer();

    return NextResponse.json({
      success: true,
      data: progressData,
      pagination: {
        page,
        limit,
        hasMore: progressData.progress.length === limit,
      },
    });

  } catch (error) {
    console.error('Error fetching optimized progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}

// POST /api/progress/optimized - Record progress with optimization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, exerciseId, bodyArea, durationMinutes, difficultyLevel, sessionNotes, mood, energyLevel } = body;

    if (!userId || !exerciseId || !bodyArea) {
      return NextResponse.json(
        { error: 'User ID, exercise ID, and body area are required' },
        { status: 400 }
      );
    }

    // Start performance monitoring
    const endTimer = PerformanceMonitor.startTimer('recordProgressOptimized');

    // Import ProgressTracker dynamically to avoid circular dependencies
    const { ProgressTracker } = await import('@/lib/progress-tracker');

    // Record the completion
    const progressEntry = await ProgressTracker.recordCompletion(userId, {
      exerciseId,
      bodyArea,
      durationMinutes,
      difficultyLevel: difficultyLevel || 'Anfänger',
      sessionNotes,
      mood,
      energyLevel,
    });

    endTimer();

    return NextResponse.json({
      success: true,
      data: progressEntry,
    });

  } catch (error) {
    console.error('Error recording optimized progress:', error);
    return NextResponse.json(
      { error: 'Failed to record progress' },
      { status: 500 }
    );
  }
}

// PUT /api/progress/optimized/cache - Cache management endpoints
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    switch (action) {
      case 'warmup':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required for cache warmup' },
            { status: 400 }
          );
        }
        
        await JobScheduler.scheduleCacheWarmup(userId);
        
        return NextResponse.json({
          success: true,
          message: 'Cache warmup scheduled',
        });

      case 'invalidate':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required for cache invalidation' },
            { status: 400 }
          );
        }
        
        await QueryOptimizer.invalidateUserCaches(userId);
        
        return NextResponse.json({
          success: true,
          message: 'User caches invalidated',
        });

      case 'health':
        const isHealthy = await cacheService.healthCheck();
        
        return NextResponse.json({
          success: true,
          cacheHealthy: isHealthy,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: warmup, invalidate, or health' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error managing cache:', error);
    return NextResponse.json(
      { error: 'Failed to manage cache' },
      { status: 500 }
    );
  }
}

// DELETE /api/progress/optimized/cache - Clear specific caches
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const cacheType = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (cacheType) {
      case 'progress':
        await cacheService.deletePattern(`user_progress*:${userId}:*`);
        break;
      case 'stats':
        await cacheService.deletePattern(`user_stats*:${userId}:*`);
        break;
      case 'achievements':
        await cacheService.deletePattern(`achievements*:${userId}:*`);
        break;
      case 'all':
        await cacheService.invalidateUserCaches(userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid cache type. Use: progress, stats, achievements, or all' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${cacheType} cache cleared for user ${userId}`,
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}