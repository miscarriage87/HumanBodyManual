import { NextRequest, NextResponse } from 'next/server';
import { ProgressTracker } from '@/lib/progress-tracker';
import { AchievementEngine } from '@/lib/achievement-engine';
import { validateExerciseCompletion } from '@/lib/validation-schemas';
import { getCurrentUser, getDemoUser } from '@/lib/auth-helper';

export async function POST(request: NextRequest) {
  try {
    // Get current user (using demo user for now)
    const user = await getCurrentUser(request) || getDemoUser();
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the exercise completion data
    const exerciseCompletion = validateExerciseCompletion(body.exerciseCompletion);
    
    // Record the completion
    const progressEntry = await ProgressTracker.recordCompletion(
      user.id,
      exerciseCompletion
    );

    // Check for new achievements
    const newAchievements = await AchievementEngine.checkAchievements(
      user.id,
      progressEntry
    );

    // Serialize dates properly
    const serializedProgressEntry = {
      ...progressEntry,
      completedAt: progressEntry.completedAt.toISOString(),
      createdAt: progressEntry.createdAt.toISOString(),
    };

    const serializedAchievements = newAchievements.map(achievement => ({
      ...achievement,
      createdAt: achievement.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        progressEntry: serializedProgressEntry,
        newAchievements: serializedAchievements,
      },
    });

  } catch (error) {
    console.error('Error recording progress:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}