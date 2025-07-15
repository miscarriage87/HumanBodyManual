import { NextRequest, NextResponse } from 'next/server';
import { BiometricService } from '@/lib/biometric-service';
import { z } from 'zod';

const TrendsRequestSchema = z.object({
  userId: z.string(),
  metric: z.enum(['heartRate', 'hrv', 'stressLevel', 'sleepQuality', 'recoveryScore']),
  period: z.enum(['week', 'month', 'quarter']).default('month')
});

// GET - Get biometric trends over time
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const metric = searchParams.get('metric') as 'heartRate' | 'hrv' | 'stressLevel' | 'sleepQuality' | 'recoveryScore';
    const period = searchParams.get('period') as 'week' | 'month' | 'quarter' || 'month';

    if (!userId || !metric) {
      return NextResponse.json(
        { error: 'User ID and metric are required' },
        { status: 400 }
      );
    }

    const validatedData = TrendsRequestSchema.parse({ userId, metric, period });

    const trends = await BiometricService.getBiometricTrends(
      validatedData.userId,
      validatedData.metric,
      validatedData.period
    );

    return NextResponse.json({
      success: true,
      data: trends,
      analysisDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving biometric trends:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to retrieve biometric trends' },
      { status: 500 }
    );
  }
}