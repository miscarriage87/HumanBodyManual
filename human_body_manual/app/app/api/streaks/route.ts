import { NextRequest, NextResponse } from 'next/server';
import { ProgressTracker } from '@/lib/progress-tracker';
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

    // Get streak data
    const streakData = await ProgressTracker.getStreakData(user.id);

    return NextResponse.json({
      success: true,
      data: streakData,
    });

  } catch (error) {
    console.error('Error fetching streaks:', error);
    
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