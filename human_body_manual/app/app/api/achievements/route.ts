import { NextRequest, NextResponse } from 'next/server';
import { AchievementEngine } from '@/lib/achievement-engine';
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
    const includeProgress = searchParams.get('includeProgress') === 'true';

    if (includeProgress) {
      // Get all achievements with progress
      const achievementsWithProgress = await AchievementEngine.getAllAchievementsWithProgress(
        user.id
      );

      return NextResponse.json({
        success: true,
        data: achievementsWithProgress,
      });
    } else {
      // Get only earned achievements
      const userAchievements = await AchievementEngine.getUserAchievements(
        user.id
      );

      return NextResponse.json({
        success: true,
        data: userAchievements,
      });
    }

  } catch (error) {
    console.error('Error fetching achievements:', error);
    
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