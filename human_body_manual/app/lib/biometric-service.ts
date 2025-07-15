import { PrismaClient, Prisma } from '@prisma/client';
import { BiometricSnapshot, ProgressEntry, PrivacySettings } from './types';
import { validateBiometricSnapshot } from './validation-schemas';

const prisma = new PrismaClient();

export interface BiometricIntegrationConfig {
  deviceId: string;
  deviceType: 'fitbit' | 'apple_watch' | 'garmin' | 'oura' | 'whoop' | 'manual';
  apiKey?: string;
  refreshToken?: string;
  lastSync?: Date;
  isActive: boolean;
}

export interface BiometricCorrelation {
  exerciseId: string;
  bodyArea: string;
  avgHeartRate?: number;
  avgHrv?: number;
  avgStressLevel?: number;
  avgRecoveryScore?: number;
  sessionCount: number;
  correlationStrength: number;
  insights: string[];
}

export interface BiometricTrend {
  metric: 'heartRate' | 'hrv' | 'stressLevel' | 'sleepQuality' | 'recoveryScore';
  period: 'week' | 'month' | 'quarter';
  values: { date: Date; value: number }[];
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
}

export class BiometricService {
  /**
   * Store biometric data from external sources
   */
  static async storeBiometricData(
    userId: string,
    biometricData: BiometricSnapshot,
    exerciseId?: string
  ): Promise<void> {
    // Validate the biometric data
    const validatedData = validateBiometricSnapshot(biometricData);

    // Check user privacy settings
    const privacySettings = await this.getUserPrivacySettings(userId);
    if (!privacySettings.allowBiometricCollection) {
      throw new Error('User has disabled biometric data collection');
    }

    // If associated with an exercise, update the progress entry
    if (exerciseId) {
      await prisma.userProgress.updateMany({
        where: {
          userId,
          exerciseId,
          completedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
          }
        },
        data: {
          biometricData: JSON.stringify(validatedData)
        }
      });
    } else {
      // Store as standalone biometric entry (could be used for correlation analysis)
      await prisma.userInsight.create({
        data: {
          userId,
          insightType: 'biometric_data',
          content: {
            type: 'standalone_biometric',
            data: validatedData,
            timestamp: validatedData.timestamp
          }
        }
      });
    }
  }

  /**
   * Retrieve biometric data for a user within a date range
   */
  static async getBiometricData(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BiometricSnapshot[]> {
    const progressEntries = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: startDate,
          lte: endDate
        },
        biometricData: {
          not: Prisma.JsonNull
        }
      },
      select: {
        biometricData: true,
        completedAt: true
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    return progressEntries
      .map(entry => {
        if (entry.biometricData) {
          try {
            return JSON.parse(entry.biometricData as string) as BiometricSnapshot;
          } catch {
            return null;
          }
        }
        return null;
      })
      .filter((data): data is BiometricSnapshot => data !== null);
  }

  /**
   * Analyze correlation between exercise completion and biometric metrics
   */
  static async analyzeExerciseBiometricCorrelation(
    userId: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<BiometricCorrelation[]> {
    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const progressEntries = await prisma.userProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: startDate
        },
        biometricData: {
          not: Prisma.JsonNull
        }
      },
      select: {
        exerciseId: true,
        bodyArea: true,
        biometricData: true,
        completedAt: true
      }
    });

    // Group by exercise and calculate averages
    const exerciseGroups = new Map<string, {
      exerciseId: string;
      bodyArea: string;
      biometricData: BiometricSnapshot[];
    }>();

    progressEntries.forEach(entry => {
      const key = `${entry.exerciseId}-${entry.bodyArea}`;
      if (!exerciseGroups.has(key)) {
        exerciseGroups.set(key, {
          exerciseId: entry.exerciseId,
          bodyArea: entry.bodyArea,
          biometricData: []
        });
      }

      try {
        const biometric = JSON.parse(entry.biometricData as string) as BiometricSnapshot;
        exerciseGroups.get(key)!.biometricData.push(biometric);
      } catch {
        // Skip invalid biometric data
      }
    });

    // Calculate correlations and insights
    const correlations: BiometricCorrelation[] = [];

    exerciseGroups.forEach(({ exerciseId, bodyArea, biometricData }) => {
      if (biometricData.length < 3) return; // Need at least 3 data points

      const avgHeartRate = this.calculateAverage(biometricData, 'heartRate');
      const avgHrv = this.calculateAverage(biometricData, 'hrv');
      const avgStressLevel = this.calculateAverage(biometricData, 'stressLevel');
      const avgRecoveryScore = this.calculateAverage(biometricData, 'recoveryScore');

      const insights = this.generateBiometricInsights({
        avgHeartRate,
        avgHrv,
        avgStressLevel,
        avgRecoveryScore,
        sessionCount: biometricData.length,
        bodyArea
      });

      correlations.push({
        exerciseId,
        bodyArea,
        avgHeartRate,
        avgHrv,
        avgStressLevel,
        avgRecoveryScore,
        sessionCount: biometricData.length,
        correlationStrength: this.calculateCorrelationStrength(biometricData),
        insights
      });
    });

    return correlations.sort((a, b) => b.correlationStrength - a.correlationStrength);
  }

  /**
   * Get biometric trends over time
   */
  static async getBiometricTrends(
    userId: string,
    metric: 'heartRate' | 'hrv' | 'stressLevel' | 'sleepQuality' | 'recoveryScore',
    period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<BiometricTrend> {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const biometricData = await this.getBiometricData(userId, startDate, new Date());

    // Group by day and calculate daily averages
    const dailyValues = new Map<string, number[]>();

    biometricData.forEach(data => {
      const dateKey = data.timestamp.toISOString().split('T')[0];
      const value = data[metric];

      if (value !== undefined) {
        if (!dailyValues.has(dateKey)) {
          dailyValues.set(dateKey, []);
        }
        dailyValues.get(dateKey)!.push(value);
      }
    });

    // Calculate daily averages
    const values = Array.from(dailyValues.entries())
      .map(([dateStr, values]) => ({
        date: new Date(dateStr),
        value: values.reduce((sum, val) => sum + val, 0) / values.length
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate trend
    const trend = this.calculateTrend(values.map(v => v.value));
    const changePercentage = this.calculateChangePercentage(values.map(v => v.value));

    return {
      metric,
      period,
      values,
      trend,
      changePercentage
    };
  }

  /**
   * Update user privacy settings for biometric data
   */
  static async updateBiometricPrivacySettings(
    userId: string,
    settings: Partial<PrivacySettings>
  ): Promise<void> {
    // Store privacy settings in user insights for now
    // In a real implementation, you might want a dedicated privacy_settings table
    // Check if privacy settings already exist
    const existingSettings = await prisma.userInsight.findFirst({
      where: {
        userId,
        insightType: 'privacy_settings'
      }
    });

    if (existingSettings) {
      await prisma.userInsight.update({
        where: {
          id: existingSettings.id
        },
        data: {
          content: settings,
          generatedAt: new Date()
        }
      });
    } else {
      await prisma.userInsight.create({
        data: {
          userId,
          insightType: 'privacy_settings',
          content: settings
        }
      });
    }
  }

  /**
   * Get user privacy settings
   */
  static async getUserPrivacySettings(userId: string): Promise<PrivacySettings> {
    const privacyInsight = await prisma.userInsight.findFirst({
      where: {
        userId,
        insightType: 'privacy_settings'
      }
    });

    if (privacyInsight && privacyInsight.content) {
      return privacyInsight.content as unknown as PrivacySettings;
    }

    // Default privacy settings
    return {
      userId,
      shareProgressWithCommunity: false,
      allowBiometricCollection: true,
      allowInsightGeneration: true,
      dataRetentionDays: 365,
      anonymizeInCommunityStats: true
    };
  }

  /**
   * Delete all biometric data for a user (for privacy compliance)
   */
  static async deleteBiometricData(userId: string): Promise<void> {
    // Remove biometric data from progress entries
    await prisma.userProgress.updateMany({
      where: {
        userId,
        biometricData: {
          not: Prisma.JsonNull
        }
      },
      data: {
        biometricData: Prisma.JsonNull
      }
    });

    // Remove standalone biometric insights
    await prisma.userInsight.deleteMany({
      where: {
        userId,
        insightType: 'biometric_data'
      }
    });
  }

  // Helper methods

  private static calculateAverage(
    data: BiometricSnapshot[],
    metric: keyof BiometricSnapshot
  ): number | undefined {
    const values = data
      .map(d => d[metric])
      .filter((val): val is number => typeof val === 'number');

    if (values.length === 0) return undefined;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private static calculateCorrelationStrength(data: BiometricSnapshot[]): number {
    // Simple correlation strength based on data consistency and completeness
    const completeness = data.filter(d =>
      d.heartRate !== undefined || d.hrv !== undefined || d.stressLevel !== undefined
    ).length / data.length;

    const consistency = this.calculateDataConsistency(data);

    return (completeness + consistency) / 2;
  }

  private static calculateDataConsistency(data: BiometricSnapshot[]): number {
    if (data.length < 2) return 0;

    // Calculate coefficient of variation for heart rate as a proxy for consistency
    const heartRates = data
      .map(d => d.heartRate)
      .filter((hr): hr is number => hr !== undefined);

    if (heartRates.length < 2) return 0;

    const mean = heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length;
    const variance = heartRates.reduce((sum, hr) => sum + Math.pow(hr - mean, 2), 0) / heartRates.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Lower coefficient of variation = higher consistency
    return Math.max(0, 1 - cv);
  }

  private static calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const changePercent = Math.abs((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent < 5) return 'stable';
    return secondAvg > firstAvg ? 'improving' : 'declining';
  }

  private static calculateChangePercentage(values: number[]): number {
    if (values.length < 2) return 0;

    const firstValue = values[0];
    const lastValue = values[values.length - 1];

    return ((lastValue - firstValue) / firstValue) * 100;
  }

  private static generateBiometricInsights(data: {
    avgHeartRate?: number;
    avgHrv?: number;
    avgStressLevel?: number;
    avgRecoveryScore?: number;
    sessionCount: number;
    bodyArea: string;
  }): string[] {
    const insights: string[] = [];

    if (data.avgHeartRate) {
      if (data.avgHeartRate > 150) {
        insights.push(`High intensity detected for ${data.bodyArea} exercises - consider recovery time`);
      } else if (data.avgHeartRate < 80) {
        insights.push(`Low heart rate during ${data.bodyArea} exercises - good for relaxation`);
      }
    }

    if (data.avgHrv) {
      if (data.avgHrv > 50) {
        insights.push(`Excellent HRV during ${data.bodyArea} practice - indicates good recovery`);
      } else if (data.avgHrv < 20) {
        insights.push(`Low HRV detected - consider lighter ${data.bodyArea} exercises`);
      }
    }

    if (data.avgStressLevel) {
      if (data.avgStressLevel < 3) {
        insights.push(`${data.bodyArea} exercises effectively reduce stress levels`);
      } else if (data.avgStressLevel > 7) {
        insights.push(`High stress during ${data.bodyArea} exercises - try gentler variations`);
      }
    }

    if (data.avgRecoveryScore) {
      if (data.avgRecoveryScore > 80) {
        insights.push(`Excellent recovery scores with ${data.bodyArea} practice`);
      } else if (data.avgRecoveryScore < 60) {
        insights.push(`Consider adjusting ${data.bodyArea} exercise intensity for better recovery`);
      }
    }

    if (data.sessionCount > 10) {
      insights.push(`Strong consistency in ${data.bodyArea} practice - ${data.sessionCount} sessions tracked`);
    }

    return insights;
  }
}