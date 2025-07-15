import { NextRequest, NextResponse } from 'next/server';
import { BiometricService } from '@/lib/biometric-service';
import { validateBiometricSnapshot } from '@/lib/validation-schemas';
import { z } from 'zod';

// Schema for biometric data submission
const BiometricSubmissionSchema = z.object({
  userId: z.string(),
  biometricData: z.object({
    heartRate: z.number().min(30).max(220).optional(),
    hrv: z.number().min(0).max(200).optional(),
    stressLevel: z.number().min(0).max(10).optional(),
    sleepQuality: z.number().min(0).max(10).optional(),
    recoveryScore: z.number().min(0).max(100).optional(),
    timestamp: z.string().datetime(),
    source: z.enum(['manual', 'wearable', 'app']),
    deviceId: z.string().optional(),
    confidence: z.number().min(0).max(1).optional()
  }),
  exerciseId: z.string().optional()
});

// GET - Retrieve biometric data for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const biometricData = await BiometricService.getBiometricData(userId, start, end);

    return NextResponse.json({
      success: true,
      data: biometricData,
      count: biometricData.length
    });

  } catch (error) {
    console.error('Error retrieving biometric data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve biometric data' },
      { status: 500 }
    );
  }
}

// POST - Store new biometric data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BiometricSubmissionSchema.parse(body);

    // Convert timestamp string to Date object
    const biometricData = {
      ...validatedData.biometricData,
      timestamp: new Date(validatedData.biometricData.timestamp)
    };

    await BiometricService.storeBiometricData(
      validatedData.userId,
      biometricData,
      validatedData.exerciseId
    );

    return NextResponse.json({
      success: true,
      message: 'Biometric data stored successfully'
    });

  } catch (error) {
    console.error('Error storing biometric data:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('disabled biometric data collection')) {
      return NextResponse.json(
        { error: 'Biometric data collection is disabled for this user' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to store biometric data' },
      { status: 500 }
    );
  }
}

// DELETE - Delete biometric data for a user (privacy compliance)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await BiometricService.deleteBiometricData(userId);

    return NextResponse.json({
      success: true,
      message: 'All biometric data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting biometric data:', error);
    return NextResponse.json(
      { error: 'Failed to delete biometric data' },
      { status: 500 }
    );
  }
}