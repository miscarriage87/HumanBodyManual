import { NextRequest, NextResponse } from 'next/server';
import { BiometricService } from '@/lib/biometric-service';
import { z } from 'zod';

const CorrelationRequestSchema = z.object({
  userId: z.string(),
  timeframe: z.enum(['week', 'month', 'quarter']).default('month')
});

// GET - Analyze correlation between exercises and biometric data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeframe = searchParams.get('timeframe') as 'week' | 'month' | 'quarter' || 'month';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const validatedData = CorrelationRequestSchema.parse({ userId, timeframe });

    const correlations = await BiometricService.analyzeExerciseBiometricCorrelation(
      validatedData.userId,
      validatedData.timeframe
    );

    return NextResponse.json({
      success: true,
      data: correlations,
      timeframe: validatedData.timeframe,
      analysisDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing biometric correlations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze biometric correlations' },
      { status: 500 }
    );
  }
}