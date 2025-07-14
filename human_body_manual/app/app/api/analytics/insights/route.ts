import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';
import { getCurrentUser, getDemoUser } from '@/lib/auth-helper';

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
    const unviewedOnly = searchParams.get('unviewedOnly') === 'true';

    if (unviewedOnly) {
      // Get only unviewed insights
      const insights = await AnalyticsService.getUnviewedInsights(user.id);
      
      return NextResponse.json({
        success: true,
        data: insights,
      });
    } else {
      // Generate new insights
      const insights = await AnalyticsService.generateInsights(user.id);
      
      return NextResponse.json({
        success: true,
        data: insights,
      });
    }

  } catch (error) {
    console.error('Error fetching insights:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { insightIds } = body;

    if (!Array.isArray(insightIds)) {
      return NextResponse.json(
        { error: 'insightIds must be an array' },
        { status: 400 }
      );
    }

    // Mark insights as viewed
    await AnalyticsService.markInsightsAsViewed(user.id, insightIds);

    return NextResponse.json({
      success: true,
      message: 'Insights marked as viewed',
    });

  } catch (error) {
    console.error('Error marking insights as viewed:', error);
    
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