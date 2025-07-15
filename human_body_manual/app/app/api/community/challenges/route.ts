import { NextRequest, NextResponse } from 'next/server';
import { CommunityService } from '@/lib/community-service';
import { getCurrentUser, getDemoUser } from '@/lib/auth-helper';
import { sampleCommunityChallenge } from '@/data/community-achievements';

export async function GET(request: NextRequest) {
  try {
    let challenges;
    
    try {
      // Try to get active challenges from database
      challenges = await CommunityService.getActiveChallenges();
    } catch (dbError) {
      // If database is not available, use mock data
      console.log('Database not available, using mock challenge data');
      challenges = sampleCommunityChallenge.map((challenge, index) => ({
        ...challenge,
        id: `mock-challenge-${index + 1}`,
        participantCount: Math.floor(Math.random() * 50) + 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    return NextResponse.json({
      success: true,
      data: challenges,
    });

  } catch (error) {
    console.error('Error fetching challenges:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request) || getDemoUser();
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, challengeId, ...data } = body;

    if (action === 'join') {
      // Join a challenge
      if (!challengeId) {
        return NextResponse.json(
          { error: 'Challenge ID is required' },
          { status: 400 }
        );
      }

      const participant = await CommunityService.joinChallenge(user.id, challengeId);

      return NextResponse.json({
        success: true,
        data: participant,
      });

    } else if (action === 'update_progress') {
      // Update challenge progress
      const { newValue } = data;
      
      if (!challengeId || typeof newValue !== 'number') {
        return NextResponse.json(
          { error: 'Challenge ID and newValue are required' },
          { status: 400 }
        );
      }

      const participant = await CommunityService.updateChallengeProgress(
        user.id,
        challengeId,
        newValue
      );

      return NextResponse.json({
        success: true,
        data: participant,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error handling challenge request:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}