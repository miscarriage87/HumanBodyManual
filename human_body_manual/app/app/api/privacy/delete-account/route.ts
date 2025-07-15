import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/lib/export-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, confirmationText } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Require explicit confirmation
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation text. Please type "DELETE MY ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }

    // Generate final data export before deletion
    const finalExport = await exportService.generateUserDataExport({
      userId,
      format: 'json',
      includeAchievements: true,
      includeBiometrics: true,
      includeInsights: true
    });

    // Delete all user data
    await exportService.deleteAllUserData(userId);

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
      finalExport: finalExport // Include final export in response
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    );
  }
}