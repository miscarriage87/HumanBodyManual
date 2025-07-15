import { NextRequest, NextResponse } from 'next/server';
import { CommunityService } from '@/lib/community-service';
import { getCurrentUser, getDemoUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statType = searchParams.get('statType') as 'daily' | 'weekly' | 'monthly' || 'weekly';

    let communityStats;
    
    try {
      // Try to get cached community stats first
      communityStats = await CommunityService.getCommunityStats(statType);

      // If no cached stats exist, generate new ones
      if (!communityStats) {
        communityStats = await CommunityService.generateCommunityStats(statType);
      }
    } catch (dbError) {
      // If database is not available, use mock data
      console.log('Database not available, using mock data');
      communityStats = CommunityService.generateMockCommunityStats(statType);
    }

    return NextResponse.json({
      success: true,
      data: communityStats,
    });

  } catch (error) {
    console.error('Error fetching community stats:', error);
    
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