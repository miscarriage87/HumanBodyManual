import { NextRequest, NextResponse } from 'next/server';
import { CommunityService } from '@/lib/community-service';
import { getCurrentUser, getDemoUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    // Get current user (optional for leaderboard viewing)
    const user = await getCurrentUser(request) || getDemoUser();
    
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'total_sessions';
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'all_time' || 'weekly';

    let leaderboard;
    
    try {
      // Generate leaderboard with user context if available
      leaderboard = await CommunityService.generateLeaderboard(
        metric,
        period,
        user?.id
      );
    } catch (dbError) {
      // If database is not available, use mock data
      console.log('Database not available, using mock leaderboard data');
      leaderboard = generateMockLeaderboard(metric, period, user?.id);
    }

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockLeaderboard(
  metric: string,
  period: 'daily' | 'weekly' | 'monthly' | 'all_time',
  userId?: string
) {
  const totalParticipants = Math.floor(Math.random() * 100) + 50;
  const entries = [];
  
  // Generate mock leaderboard entries
  for (let i = 1; i <= Math.min(20, totalParticipants); i++) {
    const isCurrentUser = userId && i === Math.floor(Math.random() * 10) + 5; // Random position for current user
    const value = Math.floor(Math.random() * 100) + (20 - i) * 5; // Higher values for better ranks
    
    entries.push({
      rank: i,
      percentile: Math.round(((totalParticipants - i) / totalParticipants) * 100),
      value,
      isCurrentUser: !!isCurrentUser,
      anonymizedId: isCurrentUser ? undefined : `user_${i}`
    });
  }

  return {
    metric,
    period,
    entries,
    totalParticipants,
    lastUpdated: new Date()
  };
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