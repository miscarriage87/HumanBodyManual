import { NextRequest, NextResponse } from 'next/server';
import { ProgressTracker } from '@/lib/progress-tracker';
import { validateDateRange } from '@/lib/validation-schemas';
import { getCurrentUser, getDemoUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request) || getDemoUser();
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    let timeRange;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    
    if (fromParam || toParam) {
      timeRange = validateDateRange({
        from: fromParam ? new Date(fromParam) : undefined,
        to: toParam ? new Date(toParam) : undefined,
      });
    }

    // Get user progress
    const userProgress = await ProgressTracker.getUserProgress(
      user.id,
      timeRange
    );

    // Serialize dates properly
    const serializedProgress = {
      ...userProgress,
      lastActivity: userProgress.lastActivity.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedProgress,
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid date range provided', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}