import { prisma } from './prisma';
import { 
  UserInsight, 
  Recommendation, 
  BodyAreaType,
  DifficultyLevel,
  InsightType,
  InsightContent,
  ProgressEntry
} from './types';
import { exercises, Exercise } from '../data/exercises';

export interface OptimalPracticeTime {
  hour: number;
  dayOfWeek: number;
  confidence: number;
  reasoning: string;
}

export interface PlateauDetection {
  isInPlateau: boolean;
  plateauDuration: number; // days
  stagnantAreas: BodyAreaType[];
  progressionSuggestions: string[];
}

export interface MotivationalMessage {
  type: 'encouragement' | 'streak_recovery' | 'goal_setting' | 'celebration';
  title: string;
  message: string;
  actionItems: string[];
  urgency: 'low' | 'medium' | 'high';
}

export interface ComplementaryTechnique {
  exerciseId: string;
  exercise: Exercise;
  bodyArea: BodyAreaType;
  synergy: string;
  expectedBenefit: string;
  priority: number;
}

export class RecommendationEngine {
  /**
   * Analyze user patterns and suggest optimal practice times
   */
  static async analyzeOptimalPracticeTimes(userId: string): Promise<OptimalPracticeTime[]> {
    // Get user's practice history for the last 60 days
    const recentProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Last 60 days
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    if (recentProgress.length < 10) {
      // Not enough data, return general recommendations
      return [
        {
          hour: 7,
          dayOfWeek: -1, // Any day
          confidence: 0.3,
          reasoning: 'Morgendliche Praxis ist wissenschaftlich optimal für Hormonbalance und Energie.',
        },
        {
          hour: 18,
          dayOfWeek: -1,
          confidence: 0.3,
          reasoning: 'Abendliche Entspannungsübungen fördern besseren Schlaf und Regeneration.',
        },
      ];
    }

    // Analyze practice times by hour
    const hourlyStats = this.analyzeHourlyPatterns(recentProgress);
    const weeklyStats = this.analyzeWeeklyPatterns(recentProgress);

    const recommendations: OptimalPracticeTime[] = [];

    // Find peak practice hours
    const topHours = Object.entries(hourlyStats)
      .sort(([,a], [,b]) => b.sessions - a.sessions)
      .slice(0, 3);

    for (const [hour, stats] of topHours) {
      if (stats.sessions >= 3) { // Minimum threshold
        recommendations.push({
          hour: parseInt(hour),
          dayOfWeek: -1,
          confidence: Math.min(stats.sessions / 10, 1), // Max confidence at 10+ sessions
          reasoning: `Du hast bereits ${stats.sessions} mal um ${hour}:00 Uhr geübt mit durchschnittlich ${Math.round(stats.avgDuration)} Minuten. Diese Zeit scheint gut für dich zu funktionieren.`,
        });
      }
    }

    // Find optimal days of week
    const topDays = Object.entries(weeklyStats)
      .sort(([,a], [,b]) => b.sessions - a.sessions)
      .slice(0, 2);

    for (const [dayStr, stats] of topDays) {
      const day = parseInt(dayStr);
      if (stats.sessions >= 3) {
        const dayName = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][day];
        recommendations.push({
          hour: stats.mostCommonHour,
          dayOfWeek: day,
          confidence: Math.min(stats.sessions / 8, 1),
          reasoning: `${dayName} ist dein produktivster Tag mit ${stats.sessions} Sessions. Besonders um ${stats.mostCommonHour}:00 Uhr bist du aktiv.`,
        });
      }
    }

    // Add science-based recommendations if user has gaps
    if (!recommendations.some(r => r.hour >= 6 && r.hour <= 9)) {
      recommendations.push({
        hour: 7,
        dayOfWeek: -1,
        confidence: 0.7,
        reasoning: 'Morgendliche Praxis (6-9 Uhr) optimiert Cortisol-Rhythmus und setzt positive Energie für den Tag frei.',
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detect if user is in a plateau and needs progression strategies
   */
  static async detectPlateau(userId: string): Promise<PlateauDetection> {
    const recentProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    if (recentProgress.length < 10) {
      return {
        isInPlateau: false,
        plateauDuration: 0,
        stagnantAreas: [],
        progressionSuggestions: [],
      };
    }

    // Check for difficulty level stagnation
    const difficultyProgression = this.analyzeDifficultyProgression(recentProgress);
    const bodyAreaStagnation = this.analyzeBodyAreaStagnation(recentProgress);
    const exerciseVariety = this.analyzeExerciseVariety(recentProgress);

    const isInPlateau = 
      difficultyProgression.daysSinceProgression > 21 ||
      bodyAreaStagnation.stagnantAreas.length > 0 ||
      exerciseVariety.varietyScore < 0.3;

    const plateauDuration = Math.max(
      difficultyProgression.daysSinceProgression,
      bodyAreaStagnation.maxStagnationDays
    );

    const progressionSuggestions: string[] = [];

    if (difficultyProgression.daysSinceProgression > 14) {
      const nextLevel = this.getNextDifficultyLevel(difficultyProgression.currentLevel);
      progressionSuggestions.push(
        `Probiere ${nextLevel}-Übungen in deinen stärksten Bereichen (${difficultyProgression.strongestAreas.join(', ')})`
      );
    }

    if (bodyAreaStagnation.stagnantAreas.length > 0) {
      progressionSuggestions.push(
        `Erkunde neue Körperbereiche: ${bodyAreaStagnation.stagnantAreas.map(area => this.getBodyAreaName(area)).join(', ')}`
      );
    }

    if (exerciseVariety.varietyScore < 0.4) {
      progressionSuggestions.push(
        'Erweitere dein Übungsrepertoire - du wiederholst oft die gleichen Übungen'
      );
    }

    // Add duration-based progression
    const avgDuration = recentProgress.reduce((sum, p) => sum + (p.durationMinutes || 0), 0) / recentProgress.length;
    if (avgDuration > 0 && avgDuration < 15) {
      progressionSuggestions.push('Verlängere deine Sessions schrittweise auf 15-20 Minuten für tiefere Wirkung');
    }

    return {
      isInPlateau,
      plateauDuration,
      stagnantAreas: bodyAreaStagnation.stagnantAreas,
      progressionSuggestions,
    };
  }

  /**
   * Generate motivational messages for users with declining engagement
   */
  static async generateMotivationalMessage(userId: string): Promise<MotivationalMessage | null> {
    const recentProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Last 2 weeks
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const olderProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 2-4 weeks ago
          lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const currentStreak = await prisma.userStreak.findUnique({
      where: {
        userId_streakType: {
          userId,
          streakType: 'daily',
        },
      },
    });

    // Analyze engagement patterns
    const recentSessions = recentProgress.length;
    const olderSessions = olderProgress.length;
    const engagementTrend = recentSessions - olderSessions;
    const daysSinceLastSession = this.getDaysSinceLastSession(recentProgress);

    // Determine message type and urgency
    if (daysSinceLastSession >= 7) {
      return {
        type: 'streak_recovery',
        title: 'Zeit für ein Comeback! 🌟',
        message: `Es sind ${daysSinceLastSession} Tage seit deiner letzten Übung vergangen. Jeder Neuanfang ist eine Chance, stärker zurückzukommen. Deine bisherigen ${recentSessions + olderSessions} Sessions zeigen, dass du es drauf hast!`,
        actionItems: [
          'Starte heute mit einer einfachen 5-Minuten Atemübung',
          'Wähle deine Lieblings-Körperbereich für den Wiedereinstieg',
          'Setze dir das Ziel von 3 Sessions in den nächsten 7 Tagen',
        ],
        urgency: 'high',
      };
    }

    if (daysSinceLastSession >= 3) {
      return {
        type: 'encouragement',
        title: 'Dein Körper vermisst dich! 💪',
        message: `${daysSinceLastSession} Tage Pause können manchmal gut sein, aber dein Körper ist bereit für die nächste Session. Kleine, konsistente Schritte führen zu großen Veränderungen.`,
        actionItems: [
          'Plane heute eine kurze 10-Minuten Session',
          'Wähle eine Übung, die dir Freude macht',
          'Erinnere dich an das gute Gefühl nach der letzten Session',
        ],
        urgency: 'medium',
      };
    }

    if (engagementTrend < -2) {
      return {
        type: 'goal_setting',
        title: 'Lass uns deine Routine neu beleben! 🎯',
        message: `Deine Aktivität ist in den letzten 2 Wochen etwas zurückgegangen (${recentSessions} vs ${olderSessions} Sessions). Das ist völlig normal - lass uns gemeinsam wieder Schwung aufbauen!`,
        actionItems: [
          'Setze dir ein realistisches Wochenziel (z.B. 3 Sessions)',
          'Plane feste Zeiten für deine Praxis',
          'Belohne dich für erreichte Meilensteine',
        ],
        urgency: 'medium',
      };
    }

    if (currentStreak && currentStreak.currentCount >= 7) {
      return {
        type: 'celebration',
        title: `Fantastische ${currentStreak.currentCount}-Tage Streak! 🔥`,
        message: `Du bist auf einem unglaublichen Weg! ${currentStreak.currentCount} Tage in Folge zeigen deine Hingabe. Dein Körper und Geist danken es dir bereits.`,
        actionItems: [
          'Feiere diesen Erfolg bewusst',
          'Teile deine Erfahrungen mit anderen',
          'Setze dir das nächste Streak-Ziel',
        ],
        urgency: 'low',
      };
    }

    // Default encouragement for active users
    if (recentSessions >= 5) {
      return {
        type: 'encouragement',
        title: 'Du machst das großartig! ⭐',
        message: `${recentSessions} Sessions in 2 Wochen - du bist auf dem richtigen Weg! Konsistenz ist der Schlüssel zu nachhaltiger Transformation.`,
        actionItems: [
          'Halte deine aktuelle Routine bei',
          'Experimentiere mit neuen Übungen',
          'Achte auf die positiven Veränderungen in deinem Körper',
        ],
        urgency: 'low',
      };
    }

    return null;
  }

  /**
   * Suggest complementary techniques based on current practice areas
   */
  static async suggestComplementaryTechniques(userId: string): Promise<ComplementaryTechnique[]> {
    const recentProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // Last 3 weeks
        },
      },
    });

    if (recentProgress.length < 3) {
      // Return general starter recommendations
      return this.getStarterRecommendations();
    }

    // Analyze current practice patterns
    const bodyAreaFrequency = this.analyzeBodyAreaFrequency(recentProgress);
    const exerciseFrequency = this.analyzeExerciseFrequency(recentProgress);
    const difficultyDistribution = this.analyzeDifficultyDistribution(recentProgress);

    const suggestions: ComplementaryTechnique[] = [];

    // Find underrepresented body areas
    const allBodyAreas: BodyAreaType[] = [
      'nervensystem', 'hormone', 'zirkadian', 'mikrobiom', 
      'bewegung', 'fasten', 'kaelte', 'licht'
    ];

    const practiceAreas = Object.keys(bodyAreaFrequency) as BodyAreaType[];
    const neglectedAreas = allBodyAreas.filter(area => !practiceAreas.includes(area));

    // Suggest complementary areas based on current practice
    for (const currentArea of practiceAreas) {
      const complementaryAreas = this.getComplementaryBodyAreas(currentArea);
      
      for (const compArea of complementaryAreas) {
        if (bodyAreaFrequency[compArea] === undefined || bodyAreaFrequency[compArea] < bodyAreaFrequency[currentArea] * 0.5) {
          const exercise = this.findBestExerciseForArea(compArea, difficultyDistribution.mostCommon);
          if (exercise) {
            suggestions.push({
              exerciseId: exercise.id,
              exercise,
              bodyArea: compArea,
              synergy: this.getAreaSynergy(currentArea, compArea),
              expectedBenefit: this.getComplementaryBenefit(currentArea, compArea),
              priority: this.calculateComplementaryPriority(currentArea, compArea, bodyAreaFrequency),
            });
          }
        }
      }
    }

    // Add neglected areas with high priority
    for (const neglectedArea of neglectedAreas.slice(0, 2)) {
      const exercise = this.findBestExerciseForArea(neglectedArea, 'Anfänger');
      if (exercise) {
        suggestions.push({
          exerciseId: exercise.id,
          exercise,
          bodyArea: neglectedArea,
          synergy: 'Ganzheitliche Balance durch Exploration neuer Körperbereiche',
          expectedBenefit: `Erweitere dein Wellness-Spektrum durch ${this.getBodyAreaName(neglectedArea)}`,
          priority: 8,
        });
      }
    }

    // Suggest progression within current areas
    const mostPracticedArea = Object.entries(bodyAreaFrequency)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostPracticedArea && mostPracticedArea[1] >= 5) {
      const [area, frequency] = mostPracticedArea;
      const nextLevelExercise = this.findProgressionExercise(
        area as BodyAreaType, 
        difficultyDistribution.mostCommon,
        exerciseFrequency
      );

      if (nextLevelExercise) {
        suggestions.push({
          exerciseId: nextLevelExercise.id,
          exercise: nextLevelExercise,
          bodyArea: area as BodyAreaType,
          synergy: 'Vertiefung deiner Expertise im stärksten Bereich',
          expectedBenefit: `Erreiche Mastery in ${this.getBodyAreaName(area as BodyAreaType)} durch fortgeschrittene Techniken`,
          priority: 7,
        });
      }
    }

    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5); // Top 5 recommendations
  }

  /**
   * Generate comprehensive insights and recommendations for a user
   */
  static async generateComprehensiveInsights(userId: string): Promise<UserInsight[]> {
    const insights: UserInsight[] = [];

    // Analyze optimal practice times
    const optimalTimes = await this.analyzeOptimalPracticeTimes(userId);
    if (optimalTimes.length > 0 && optimalTimes[0].confidence > 0.5) {
      const topTime = optimalTimes[0];
      insights.push({
        id: `optimal_time_${userId}_${Date.now()}`,
        userId,
        insightType: 'recommendation' as InsightType,
        content: {
          title: 'Deine optimale Übungszeit entdeckt',
          message: topTime.reasoning,
          actionItems: [
            `Plane deine wichtigsten Sessions um ${topTime.hour}:00 Uhr`,
            'Nutze diese Zeit für anspruchsvollere Übungen',
            'Setze dir Erinnerungen für deine Powerzeit',
          ],
          data: {
            optimalHour: topTime.hour,
            confidence: topTime.confidence,
            dayOfWeek: topTime.dayOfWeek,
          },
          priority: 'medium' as const,
        },
        generatedAt: new Date(),
      });
    }

    // Check for plateau
    const plateauDetection = await this.detectPlateau(userId);
    if (plateauDetection.isInPlateau) {
      insights.push({
        id: `plateau_${userId}_${Date.now()}`,
        userId,
        insightType: 'plateau_detection' as InsightType,
        content: {
          title: 'Zeit für neue Herausforderungen',
          message: `Du befindest dich seit ${plateauDetection.plateauDuration} Tagen in einer Plateau-Phase. Dein Körper ist bereit für den nächsten Schritt!`,
          actionItems: plateauDetection.progressionSuggestions,
          data: {
            plateauDuration: plateauDetection.plateauDuration,
            stagnantAreas: plateauDetection.stagnantAreas,
          },
          priority: 'high' as const,
        },
        generatedAt: new Date(),
      });
    }

    // Generate motivational message
    const motivationalMessage = await this.generateMotivationalMessage(userId);
    if (motivationalMessage) {
      insights.push({
        id: `motivation_${userId}_${Date.now()}`,
        userId,
        insightType: 'motivation' as InsightType,
        content: {
          title: motivationalMessage.title,
          message: motivationalMessage.message,
          actionItems: motivationalMessage.actionItems,
          data: {
            messageType: motivationalMessage.type,
            urgency: motivationalMessage.urgency,
          },
          priority: motivationalMessage.urgency === 'high' ? 'high' : 'medium' as const,
        },
        generatedAt: new Date(),
      });
    }

    // Add complementary technique suggestions
    const complementaryTechniques = await this.suggestComplementaryTechniques(userId);
    if (complementaryTechniques.length > 0) {
      const topTechnique = complementaryTechniques[0];
      insights.push({
        id: `complementary_${userId}_${Date.now()}`,
        userId,
        insightType: 'recommendation' as InsightType,
        content: {
          title: 'Perfekte Ergänzung für deine Praxis',
          message: `${topTechnique.exercise.title} aus dem Bereich ${this.getBodyAreaName(topTechnique.bodyArea)} würde deine aktuelle Praxis optimal ergänzen. ${topTechnique.synergy}`,
          actionItems: [
            `Probiere "${topTechnique.exercise.title}" in deiner nächsten Session`,
            'Kombiniere es mit deinen bewährten Übungen',
            'Achte auf die synergistischen Effekte',
          ],
          data: {
            exerciseId: topTechnique.exerciseId,
            bodyArea: topTechnique.bodyArea,
            expectedBenefit: topTechnique.expectedBenefit,
            priority: topTechnique.priority,
          },
          priority: 'medium' as const,
        },
        generatedAt: new Date(),
      });
    }

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

  // Private helper methods

  private static analyzeHourlyPatterns(progress: any[]): Record<number, { sessions: number; avgDuration: number }> {
    const hourlyStats: Record<number, { sessions: number; totalDuration: number }> = {};

    for (const session of progress) {
      const hour = session.completedAt.getHours();
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { sessions: 0, totalDuration: 0 };
      }
      hourlyStats[hour].sessions++;
      hourlyStats[hour].totalDuration += session.durationMinutes || 0;
    }

    const result: Record<number, { sessions: number; avgDuration: number }> = {};
    for (const [hour, stats] of Object.entries(hourlyStats)) {
      result[parseInt(hour)] = {
        sessions: stats.sessions,
        avgDuration: stats.totalDuration / stats.sessions,
      };
    }

    return result;
  }

  private static analyzeWeeklyPatterns(progress: any[]): Record<number, { sessions: number; mostCommonHour: number }> {
    const weeklyStats: Record<number, { sessions: number; hours: number[] }> = {};

    for (const session of progress) {
      const day = session.completedAt.getDay();
      const hour = session.completedAt.getHours();
      
      if (!weeklyStats[day]) {
        weeklyStats[day] = { sessions: 0, hours: [] };
      }
      weeklyStats[day].sessions++;
      weeklyStats[day].hours.push(hour);
    }

    const result: Record<number, { sessions: number; mostCommonHour: number }> = {};
    for (const [day, stats] of Object.entries(weeklyStats)) {
      const hourCounts = stats.hours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const mostCommonHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '12';

      result[parseInt(day)] = {
        sessions: stats.sessions,
        mostCommonHour: parseInt(mostCommonHour),
      };
    }

    return result;
  }

  private static analyzeDifficultyProgression(progress: any[]): {
    currentLevel: DifficultyLevel;
    daysSinceProgression: number;
    strongestAreas: string[];
  } {
    const recentLevels = progress.slice(0, 10).map(p => p.difficultyLevel);
    const currentLevel = recentLevels[0] as DifficultyLevel;

    // Find last progression
    let daysSinceProgression = 0;
    for (let i = 1; i < progress.length; i++) {
      if (progress[i].difficultyLevel !== currentLevel) {
        daysSinceProgression = Math.floor(
          (Date.now() - progress[i].completedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        break;
      }
      if (i === progress.length - 1) {
        daysSinceProgression = Math.floor(
          (Date.now() - progress[progress.length - 1].completedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    // Find strongest areas (most practiced)
    const areaCounts = progress.reduce((acc, p) => {
      acc[p.bodyArea] = (acc[p.bodyArea] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const strongestAreas = Object.entries(areaCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 2)
      .map(([area]) => this.getBodyAreaName(area as BodyAreaType));

    return {
      currentLevel,
      daysSinceProgression,
      strongestAreas,
    };
  }

  private static analyzeBodyAreaStagnation(progress: any[]): {
    stagnantAreas: BodyAreaType[];
    maxStagnationDays: number;
  } {
    const allAreas: BodyAreaType[] = [
      'nervensystem', 'hormone', 'zirkadian', 'mikrobiom', 
      'bewegung', 'fasten', 'kaelte', 'licht'
    ];

    const practiceAreas = new Set(progress.map(p => p.bodyArea));
    const stagnantAreas = allAreas.filter(area => !practiceAreas.has(area));

    const maxStagnationDays = progress.length > 0 
      ? Math.floor((Date.now() - progress[progress.length - 1].completedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      stagnantAreas,
      maxStagnationDays,
    };
  }

  private static analyzeExerciseVariety(progress: any[]): { varietyScore: number } {
    const uniqueExercises = new Set(progress.map(p => p.exerciseId));
    const varietyScore = uniqueExercises.size / Math.max(progress.length, 1);

    return { varietyScore };
  }

  private static getNextDifficultyLevel(current: DifficultyLevel): DifficultyLevel {
    switch (current) {
      case 'Anfänger': return 'Fortgeschritten';
      case 'Fortgeschritten': return 'Experte';
      case 'Experte': return 'Experte';
      default: return 'Fortgeschritten';
    }
  }

  private static getDaysSinceLastSession(progress: any[]): number {
    if (progress.length === 0) return 999;
    const lastSession = progress[0].completedAt;
    return Math.floor((Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static analyzeBodyAreaFrequency(progress: any[]): Record<string, number> {
    return progress.reduce((acc, p) => {
      acc[p.bodyArea] = (acc[p.bodyArea] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private static analyzeExerciseFrequency(progress: any[]): Record<string, number> {
    return progress.reduce((acc, p) => {
      acc[p.exerciseId] = (acc[p.exerciseId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private static analyzeDifficultyDistribution(progress: any[]): { mostCommon: DifficultyLevel } {
    const diffCounts = progress.reduce((acc, p) => {
      acc[p.difficultyLevel] = (acc[p.difficultyLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(diffCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] as DifficultyLevel || 'Anfänger';

    return { mostCommon };
  }

  private static getComplementaryBodyAreas(area: BodyAreaType): BodyAreaType[] {
    const complementaryMap: Record<BodyAreaType, BodyAreaType[]> = {
      nervensystem: ['zirkadian', 'mikrobiom', 'licht'],
      hormone: ['fasten', 'bewegung', 'kaelte'],
      zirkadian: ['licht', 'nervensystem', 'fasten'],
      mikrobiom: ['nervensystem', 'fasten', 'bewegung'],
      bewegung: ['hormone', 'mikrobiom', 'kaelte'],
      fasten: ['hormone', 'mikrobiom', 'zirkadian'],
      kaelte: ['hormone', 'bewegung', 'nervensystem'],
      licht: ['zirkadian', 'nervensystem', 'hormone'],
    };

    return complementaryMap[area] || [];
  }

  private static findBestExerciseForArea(area: BodyAreaType, difficulty: DifficultyLevel): Exercise | null {
    const areaExercises = exercises.filter(e => e.category === area);
    
    // Prefer matching difficulty, fallback to beginner
    let suitable = areaExercises.filter(e => e.difficulty === difficulty);
    if (suitable.length === 0) {
      suitable = areaExercises.filter(e => e.difficulty === 'Anfänger');
    }

    return suitable[0] || null;
  }

  private static getAreaSynergy(area1: BodyAreaType, area2: BodyAreaType): string {
    const synergyMap: Record<string, string> = {
      'nervensystem-zirkadian': 'Nervensystem und Circadianer Rhythmus arbeiten synergistisch für optimale Regeneration',
      'hormone-bewegung': 'Krafttraining und Hormonoptimierung verstärken sich gegenseitig',
      'mikrobiom-fasten': 'Darmgesundheit und Fasten fördern gemeinsam die Autophagie',
      'kaelte-hormone': 'Kältetherapie aktiviert braunes Fett und optimiert Hormonproduktion',
      'licht-zirkadian': 'Lichttherapie ist der Haupttreiber für gesunde circadiane Rhythmen',
    };

    const key1 = `${area1}-${area2}`;
    const key2 = `${area2}-${area1}`;
    
    return synergyMap[key1] || synergyMap[key2] || 'Diese Bereiche ergänzen sich optimal für ganzheitliche Gesundheit';
  }

  private static getComplementaryBenefit(area1: BodyAreaType, area2: BodyAreaType): string {
    return `Die Kombination von ${this.getBodyAreaName(area1)} und ${this.getBodyAreaName(area2)} maximiert deine Wellness-Ergebnisse durch synergistische Effekte.`;
  }

  private static calculateComplementaryPriority(
    currentArea: BodyAreaType, 
    complementaryArea: BodyAreaType, 
    frequency: Record<string, number>
  ): number {
    const currentFreq = frequency[currentArea] || 0;
    const compFreq = frequency[complementaryArea] || 0;
    
    // Higher priority for areas that are practiced less relative to current area
    const ratio = compFreq / Math.max(currentFreq, 1);
    return Math.max(1, 10 - Math.floor(ratio * 5));
  }

  private static findProgressionExercise(
    area: BodyAreaType, 
    currentDifficulty: DifficultyLevel,
    exerciseFreq: Record<string, number>
  ): Exercise | null {
    const nextLevel = this.getNextDifficultyLevel(currentDifficulty);
    const areaExercises = exercises.filter(e => 
      e.category === area && 
      e.difficulty === nextLevel &&
      (exerciseFreq[e.id] || 0) === 0 // Not practiced yet
    );

    return areaExercises[0] || null;
  }

  private static getStarterRecommendations(): ComplementaryTechnique[] {
    const starterExercises = [
      exercises.find(e => e.id === 'vagus-atem-1'),
      exercises.find(e => e.id === 'zirkadian-licht-1'),
      exercises.find(e => e.id === 'faszien-rolle-1'),
    ].filter(Boolean) as Exercise[];

    return starterExercises.map((exercise, index) => ({
      exerciseId: exercise.id,
      exercise,
      bodyArea: exercise.category as BodyAreaType,
      synergy: 'Perfekter Einstieg in die ganzheitliche Körperoptimierung',
      expectedBenefit: 'Grundlagen für nachhaltiges Wellness und Gesundheit',
      priority: 9 - index,
    }));
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
}