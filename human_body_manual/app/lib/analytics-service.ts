import { 
  UserInsight, 
  Recommendation, 
  TrendData, 
  TrendDataPoint,
  BodyAreaType,
  DateRange,
  InsightType,
  InsightContent
} from './types';
import { prisma } from './prisma';

export class AnalyticsService {
  /**
   * Generate personalized insights for a user
   */
  static async generateInsights(userId: string): Promise<UserInsight[]> {
    const insights: UserInsight[] = [];

    // Get user's progress data for analysis
    const recentProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const allProgress = await prisma.userProgress.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });

    // Generate different types of insights
    const patternInsight = await this.generatePatternAnalysis(userId, recentProgress);
    if (patternInsight) insights.push(patternInsight);

    const plateauInsight = await this.generatePlateauDetection(userId, recentProgress);
    if (plateauInsight) insights.push(plateauInsight);

    const motivationInsight = await this.generateMotivationInsight(userId, recentProgress);
    if (motivationInsight) insights.push(motivationInsight);

    const optimizationInsight = await this.generateOptimizationInsight(userId, allProgress);
    if (optimizationInsight) insights.push(optimizationInsight);

    // Store insights in database
    for (const insight of insights) {
      await prisma.userInsight.create({
        data: {
          userId,
          insightType: insight.insightType,
          content: insight.content as any,
        },
      });
    }

    return insights;
  }

  /**
   * Get progress trends for a user
   */
  static async getProgressTrends(
    userId: string, 
    timeRange: DateRange
  ): Promise<TrendData> {
    const startDate = timeRange.from || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = timeRange.to || new Date();

    // Get daily session counts
    const dailyProgress = await prisma.userProgress.groupBy({
      by: ['completedAt'],
      where: {
        userId,
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { id: true },
      orderBy: { completedAt: 'asc' },
    });

    // Create data points for each day
    const dataPoints: TrendDataPoint[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayProgress = dailyProgress.find((p: any) => 
        p.completedAt.toISOString().split('T')[0] === dateStr
      );

      dataPoints.push({
        date: new Date(currentDate),
        value: dayProgress?._count.id || 0,
        label: dateStr,
        metadata: {
          dayOfWeek: currentDate.getDay(),
          isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        },
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate trend direction
    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let changePercentage = 0;

    if (firstHalfAvg > 0) {
      changePercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      if (changePercentage > 10) trend = 'increasing';
      else if (changePercentage < -10) trend = 'decreasing';
    }

    return {
      period: this.determinePeriod(startDate, endDate),
      dataPoints,
      trend,
      changePercentage: Math.round(changePercentage),
    };
  }

  /**
   * Get personalized recommendations
   */
  static async getRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Get user's recent activity
    const recentProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Last 2 weeks
        },
      },
    });

    // Analyze body area distribution
    const bodyAreaCounts = recentProgress.reduce((acc: Record<string, number>, p: any) => {
      acc[p.bodyArea] = (acc[p.bodyArea] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bodyAreas: BodyAreaType[] = [
      'nervensystem', 'hormone', 'zirkadian', 'mikrobiom', 
      'bewegung', 'fasten', 'kaelte', 'licht'
    ];

    // Recommend neglected body areas
    const neglectedAreas = bodyAreas.filter(area => (bodyAreaCounts[area] || 0) === 0);
    
    for (const area of neglectedAreas.slice(0, 2)) { // Top 2 neglected areas
      recommendations.push({
        id: `neglected_${area}`,
        type: 'exercise',
        title: `Erkunde ${this.getBodyAreaName(area)}`,
        description: `Du hast in den letzten 2 Wochen keine ${this.getBodyAreaName(area)}-Übungen gemacht. Zeit, diesen wichtigen Bereich zu erkunden!`,
        bodyArea: area,
        priority: 8,
        reasoning: 'Basierend auf deiner aktuellen Aktivität fehlt dir die Balance in diesem Körperbereich.',
        estimatedBenefit: 'Ganzheitliche Körperoptimierung durch ausgewogene Praxis aller Bereiche.',
      });
    }

    // Recommend progression for frequently practiced areas
    const mostPracticedArea = Object.entries(bodyAreaCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    if (mostPracticedArea && (mostPracticedArea[1] as number) >= 5) {
      recommendations.push({
        id: `progression_${mostPracticedArea[0]}`,
        type: 'progression',
        title: `Steigere dich in ${this.getBodyAreaName(mostPracticedArea[0] as BodyAreaType)}`,
        description: `Du zeigst großes Engagement in ${this.getBodyAreaName(mostPracticedArea[0] as BodyAreaType)}. Zeit für fortgeschrittene Techniken!`,
        bodyArea: mostPracticedArea[0] as BodyAreaType,
        priority: 7,
        reasoning: `Du hast ${mostPracticedArea[1]} Übungen in diesem Bereich absolviert - bereit für die nächste Stufe.`,
        estimatedBenefit: 'Tiefere Wirkung und neue Herausforderungen für kontinuierliches Wachstum.',
      });
    }

    // Schedule recommendations based on patterns
    const scheduleRec = await this.generateScheduleRecommendation(userId, recentProgress);
    if (scheduleRec) recommendations.push(scheduleRec);

    // Recovery recommendations based on intensity
    const recoveryRec = await this.generateRecoveryRecommendation(userId, recentProgress);
    if (recoveryRec) recommendations.push(recoveryRec);

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  // Private helper methods

  private static async generatePatternAnalysis(
    userId: string, 
    recentProgress: any[]
  ): Promise<UserInsight | null> {
    if (recentProgress.length < 7) return null;

    // Analyze practice times
    const practiceHours = recentProgress.map(p => p.completedAt.getHours());
    const avgHour = practiceHours.reduce((sum, h) => sum + h, 0) / practiceHours.length;

    let timeOfDay = 'Mittag';
    if (avgHour < 10) timeOfDay = 'Morgen';
    else if (avgHour > 18) timeOfDay = 'Abend';

    // Analyze weekly patterns
    const weekdayCounts = recentProgress.reduce((acc, p) => {
      const day = p.completedAt.getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostActiveDay = Object.entries(weekdayCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

    return {
      id: `pattern_${userId}_${Date.now()}`,
      userId,
      insightType: 'pattern_analysis' as InsightType,
      content: {
        title: 'Deine Übungsmuster',
        message: `Du übst am liebsten am ${timeOfDay} und bist besonders aktiv am ${dayNames[parseInt(mostActiveDay[0])]}. Diese Konsistenz ist ein Zeichen für eine gesunde Routine!`,
        actionItems: [
          `Nutze deine produktivste Zeit am ${timeOfDay} für anspruchsvollere Übungen`,
          `Plane deine Woche um deinen aktivsten Tag (${dayNames[parseInt(mostActiveDay[0])]}) herum`,
        ],
        data: {
          averagePracticeHour: Math.round(avgHour),
          mostActiveDay: parseInt(mostActiveDay[0]),
          totalSessions: recentProgress.length,
        },
        priority: 'medium' as const,
      },
      generatedAt: new Date(),
    };
  }

  private static async generatePlateauDetection(
    userId: string, 
    recentProgress: any[]
  ): Promise<UserInsight | null> {
    if (recentProgress.length < 14) return null;

    // Check if user is stuck in same difficulty levels
    const difficultyLevels = recentProgress.map(p => p.difficultyLevel);
    const uniqueDifficulties = new Set(difficultyLevels);

    if (uniqueDifficulties.size === 1 && recentProgress.length >= 10) {
      const currentLevel = Array.from(uniqueDifficulties)[0];
      
      return {
        id: `plateau_${userId}_${Date.now()}`,
        userId,
        insightType: 'plateau_detection' as InsightType,
        content: {
          title: 'Zeit für neue Herausforderungen',
          message: `Du übst seit ${recentProgress.length} Sessions auf ${currentLevel}-Niveau. Dein Körper ist bereit für den nächsten Schritt!`,
          actionItems: [
            'Probiere Übungen der nächsthöheren Schwierigkeitsstufe',
            'Verlängere die Dauer deiner aktuellen Übungen',
            'Kombiniere mehrere Übungen in einer Session',
          ],
          data: {
            currentLevel,
            sessionsAtLevel: recentProgress.length,
            suggestedProgression: currentLevel === 'Anfänger' ? 'Fortgeschritten' : 'Experte',
          },
          priority: 'high' as const,
        },
        generatedAt: new Date(),
      };
    }

    return null;
  }

  private static async generateMotivationInsight(
    userId: string, 
    recentProgress: any[]
  ): Promise<UserInsight | null> {
    const currentStreak = await prisma.userStreak.findUnique({
      where: {
        userId_streakType: {
          userId,
          streakType: 'daily',
        },
      },
    });

    if (!currentStreak || currentStreak.currentCount < 3) {
      return {
        id: `motivation_${userId}_${Date.now()}`,
        userId,
        insightType: 'motivation' as InsightType,
        content: {
          title: 'Baue deine Streak auf',
          message: recentProgress.length === 0 
            ? 'Ein neuer Tag, eine neue Chance! Starte heute deine Wellness-Reise.'
            : `Du bist auf einem guten Weg! ${recentProgress.length} Sessions in den letzten 30 Tagen zeigen dein Engagement.`,
          actionItems: [
            'Setze dir das Ziel, 3 Tage in Folge zu üben',
            'Wähle eine einfache 5-Minuten Übung für schwierige Tage',
            'Feiere jeden kleinen Erfolg auf deinem Weg',
          ],
          data: {
            currentStreak: currentStreak?.currentCount || 0,
            recentSessions: recentProgress.length,
            encouragement: true,
          },
          priority: 'medium' as const,
        },
        generatedAt: new Date(),
      };
    }

    return null;
  }

  private static async generateOptimizationInsight(
    userId: string, 
    allProgress: any[]
  ): Promise<UserInsight | null> {
    if (allProgress.length < 20) return null;

    // Find most effective body areas (by session duration)
    const bodyAreaEffectiveness = allProgress.reduce((acc, p) => {
      if (!acc[p.bodyArea]) {
        acc[p.bodyArea] = { totalDuration: 0, sessions: 0 };
      }
      acc[p.bodyArea].totalDuration += p.durationMinutes || 0;
      acc[p.bodyArea].sessions += 1;
      return acc;
    }, {} as Record<string, { totalDuration: number; sessions: number }>);

    const avgDurations = Object.entries(bodyAreaEffectiveness)
      .map(([area, data]: [string, any]) => ({
        area,
        avgDuration: data.totalDuration / data.sessions,
        sessions: data.sessions,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration);

    const topArea = avgDurations[0];

    if (topArea && topArea.sessions >= 5) {
      return {
        id: `optimization_${userId}_${Date.now()}`,
        userId,
        insightType: 'optimization' as InsightType,
        content: {
          title: 'Deine Stärke entdeckt',
          message: `${this.getBodyAreaName(topArea.area as BodyAreaType)} scheint besonders gut zu dir zu passen - du übst hier durchschnittlich ${Math.round(topArea.avgDuration)} Minuten pro Session.`,
          actionItems: [
            `Nutze ${this.getBodyAreaName(topArea.area as BodyAreaType)} als Anker für schwierige Tage`,
            'Erkunde verwandte Techniken in diesem Bereich',
            'Teile deine Erfahrungen mit anderen Praktizierenden',
          ],
          data: {
            topBodyArea: topArea.area,
            avgDuration: Math.round(topArea.avgDuration),
            totalSessions: topArea.sessions,
          },
          priority: 'low' as const,
        },
        generatedAt: new Date(),
      };
    }

    return null;
  }

  private static async generateScheduleRecommendation(
    userId: string, 
    recentProgress: any[]
  ): Promise<Recommendation | null> {
    if (recentProgress.length < 5) return null;

    // Analyze gaps in practice
    const dates = recentProgress.map(p => p.completedAt.toDateString());
    const uniqueDates = new Set(dates);
    const daysSinceLastPractice = Math.floor(
      (Date.now() - Math.max(...recentProgress.map(p => p.completedAt.getTime()))) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPractice >= 3) {
      return {
        id: `schedule_comeback_${userId}`,
        type: 'schedule',
        title: 'Zeit für ein Comeback',
        description: `Es sind ${daysSinceLastPractice} Tage seit deiner letzten Übung vergangen. Ein sanfter Wiedereinstieg wird dir gut tun.`,
        priority: 9,
        reasoning: 'Längere Pausen können den Momentum unterbrechen.',
        estimatedBenefit: 'Wiederaufbau der Routine und Erhaltung der bisherigen Fortschritte.',
      };
    }

    return null;
  }

  private static async generateRecoveryRecommendation(
    userId: string, 
    recentProgress: any[]
  ): Promise<Recommendation | null> {
    // Check for high intensity in recent days
    const last3Days = recentProgress.filter(p => 
      p.completedAt >= new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    );

    if (last3Days.length >= 6) { // More than 2 sessions per day on average
      return {
        id: `recovery_${userId}`,
        type: 'recovery',
        title: 'Gönn dir eine Pause',
        description: 'Du warst sehr aktiv in den letzten Tagen. Eine Erholungspause oder sanfte Übungen können jetzt optimal sein.',
        priority: 6,
        reasoning: 'Hohe Aktivität in kurzer Zeit kann zu Überanstrengung führen.',
        estimatedBenefit: 'Bessere Regeneration und nachhaltige Praxis ohne Burnout.',
      };
    }

    return null;
  }

  private static getBodyAreaName(bodyArea: BodyAreaType): string {
    const names: Record<BodyAreaType, string> = {
      nervensystem: 'Nervensystem & Vagusnerv',
      hormone: 'Hormonelle Balance',
      zirkadian: 'Zirkadianer Rhythmus',
      mikrobiom: 'Mikrobiom & Darm-Hirn-Achse',
      bewegung: 'Bewegung & Faszientraining',
      fasten: 'Fasten & Autophagie',
      kaelte: 'Kältetherapie & Thermogenese',
      licht: 'Lichttherapie & Photobiomodulation',
    };
    return names[bodyArea];
  }

  private static determinePeriod(startDate: Date, endDate: Date): 'week' | 'month' | 'quarter' | 'year' {
    const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'week';
    if (diffDays <= 31) return 'month';
    if (diffDays <= 90) return 'quarter';
    return 'year';
  }

  /**
   * Get user insights that haven't been viewed yet
   */
  static async getUnviewedInsights(userId: string): Promise<UserInsight[]> {
    const insights = await prisma.userInsight.findMany({
      where: {
        userId,
        viewedAt: null,
      },
      orderBy: { generatedAt: 'desc' },
    });

    return insights.map((insight: any) => ({
      id: insight.id,
      userId: insight.userId,
      insightType: insight.insightType as InsightType,
      content: insight.content as InsightContent,
      generatedAt: insight.generatedAt,
      viewedAt: insight.viewedAt || undefined,
    }));
  }

  /**
   * Mark insights as viewed
   */
  static async markInsightsAsViewed(userId: string, insightIds: string[]): Promise<void> {
    await prisma.userInsight.updateMany({
      where: {
        userId,
        id: { in: insightIds },
      },
      data: {
        viewedAt: new Date(),
      },
    });
  }
}