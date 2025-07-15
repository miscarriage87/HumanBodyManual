import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/lib/export-service';
import { PrivacySettings } from '@/lib/types';

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

    const privacySettings = await exportService.getPrivacySettings(userId);

    return NextResponse.json({
      success: true,
      data: privacySettings
    });

  } catch (error) {
    console.error('Privacy settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...settingsUpdate } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedSettings = await exportService.updatePrivacySettings(userId, settingsUpdate);

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Privacy settings updated successfully'
    });

  } catch (error) {
    console.error('Privacy settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}