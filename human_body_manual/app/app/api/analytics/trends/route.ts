import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';
import { getCurrentUser, getDemoUser } from '@/lib/auth-helper';
import { DateRange } from '@/lib/types';

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
    const period = searchParams.get('period') || 'week';
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Build date range
    let dateRange: DateRange = {};
    
    if (fromDate) {
      dateRange.from = new Date(fromDate);
    }
    
    if (toDate) {
      dateRange.to = new Date(toDate);
    }

    // If no specific dates provided, use defaults based on period
    if (!fromDate && !toDate) {
      const now = new Date();
      
      switch (period) {
        case 'week':
          dateRange.from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateRange.to = now;
          break;
        case 'month':
          dateRange.from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateRange.to = now;
          break;
        case 'quarter':
          dateRange.from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          dateRange.to = now;
          break;
        case 'year':
          dateRange.from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          dateRange.to = now;
          break;
        default:
          dateRange.from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateRange.to = now;
      }
    }

    // Get progress trends
    const trends = await AnalyticsService.getProgressTrends(user.id, dateRange);

    return NextResponse.json({
      success: true,
      data: trends,
    });

  } catch (error) {
    console.error('Error fetching progress trends:', error);
    
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}