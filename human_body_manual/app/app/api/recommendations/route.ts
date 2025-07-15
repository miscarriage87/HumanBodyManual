import { NextRequest, NextResponse } from 'next/server';
import { RecommendationEngine } from '../../../lib/recommendation-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'optimal-times':
        const optimalTimes = await RecommendationEngine.analyzeOptimalPracticeTimes(userId);
        return NextResponse.json({ optimalTimes });

      case 'plateau-detection':
        const plateauDetection = await RecommendationEngine.detectPlateau(userId);
        return NextResponse.json({ plateauDetection });

      case 'motivational-message':
        const motivationalMessage = await RecommendationEngine.generateMotivationalMessage(userId);
        return NextResponse.json({ motivationalMessage });

      case 'complementary-techniques':
        const complementaryTechniques = await RecommendationEngine.suggestComplementaryTechniques(userId);
        return NextResponse.json({ complementaryTechniques });

      case 'comprehensive':
      default:
        const insights = await RecommendationEngine.generateComprehensiveInsights(userId);
        return NextResponse.json({ insights });
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'generate-insights':
        const insights = await RecommendationEngine.generateComprehensiveInsights(userId);
        return NextResponse.json({ 
          success: true, 
          insights,
          message: 'Insights generated successfully' 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing recommendation request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}