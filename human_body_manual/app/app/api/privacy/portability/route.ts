import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/lib/export-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const format = searchParams.get('format') || 'standard';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const portabilityPackage = await exportService.generatePortabilityPackage(userId);

    const responseData = format === 'platform' 
      ? portabilityPackage.platformSpecific 
      : portabilityPackage.standardFormat;

    const filename = `human-body-manual-portability-${format}-${userId}-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(responseData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Data portability error:', error);
    return NextResponse.json(
      { error: 'Failed to generate portability package' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, includeStandardFormat = true, includePlatformFormat = false } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const portabilityPackage = await exportService.generatePortabilityPackage(userId);

    const response: any = {
      success: true,
      generatedAt: new Date().toISOString(),
      userId: userId
    };

    if (includeStandardFormat) {
      response.standardFormat = portabilityPackage.standardFormat;
    }

    if (includePlatformFormat) {
      response.platformSpecific = portabilityPackage.platformSpecific;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Data portability error:', error);
    return NextResponse.json(
      { error: 'Failed to generate portability package' },
      { status: 500 }
    );
  }
}