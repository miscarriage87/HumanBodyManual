import { NextRequest, NextResponse } from 'next/server';
import { ExportService } from '@/lib/export-service';
import { getCurrentUser, getDemoUser } from '@/lib/auth-helper';
import { DataExportRequest } from '@/lib/types';

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
    
    const exportRequest: DataExportRequest = {
      userId: user.id,
      format: body.format || 'csv',
      dateRange: body.dateRange ? {
        from: body.dateRange.from ? new Date(body.dateRange.from) : undefined,
        to: body.dateRange.to ? new Date(body.dateRange.to) : undefined,
      } : undefined,
      includeAchievements: body.includeAchievements ?? true,
      includeBiometrics: body.includeBiometrics ?? false,
      includeInsights: body.includeInsights ?? true,
    };

    // Validate request
    const validation = ExportService.validateExportRequest(exportRequest);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid export request', details: validation.errors },
        { status: 400 }
      );
    }

    // Generate export
    const blob = await ExportService.exportUserData(exportRequest);
    const filename = ExportService.generateExportFilename(exportRequest.format, user.id);

    // Convert blob to buffer for response
    const buffer = await blob.arrayBuffer();

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', exportRequest.format === 'csv' ? 'text/csv' : 'application/json');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Length', buffer.byteLength.toString());

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request) || getDemoUser();
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Build date range for preview
    let dateRange = undefined;
    if (fromDate || toDate) {
      dateRange = {
        from: fromDate ? new Date(fromDate) : undefined,
        to: toDate ? new Date(toDate) : undefined,
      };
    }

    // Get export preview
    const preview = await ExportService.getExportPreview(user.id, dateRange);

    return NextResponse.json({
      success: true,
      data: preview,
    });

  } catch (error) {
    console.error('Error getting export preview:', error);
    
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