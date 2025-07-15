import { NextRequest, NextResponse } from 'next/server';
import { BiometricService } from '@/lib/biometric-service';
import { PrivacySettingsSchema } from '@/lib/validation-schemas';
import { z } from 'zod';

// GET - Retrieve user's biometric privacy settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const privacySettings = await BiometricService.getUserPrivacySettings(userId);

    return NextResponse.json({
      success: true,
      data: privacySettings
    });

  } catch (error) {
    console.error('Error retrieving privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve privacy settings' },
      { status: 500 }
    );
  }
}

// PUT - Update user's biometric privacy settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedSettings = PrivacySettingsSchema.parse(body);

    await BiometricService.updateBiometricPrivacySettings(
      validatedSettings.userId,
      validatedSettings
    );

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating privacy settings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid privacy settings format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}