import { prisma } from './db';
import { DataExportRequest, DateRange, PrivacySettings } from './types';

export class ExportService {
  /**
   * Generate comprehensive data export for a user
   */
  async generateUserDataExport(request: DataExportRequest): Promise<string> {
    const { userId, format, dateRange, includeAchievements, includeBiometrics, includeInsights } = request;

    // Fetch all user data
    const userData = await this.fetchUserData(userId, {
      includeAchievements,
      includeBiometrics,
      includeInsights
    }, dateRange);

    if (format === 'csv') {
      return this.generateCSVExport(userData);
    } else {
      return this.generateJSONExport(userData);
    }
  }

  /**
   * Fetch all user data for export
   */
  private async fetchUserData(
    userId: string, 
    options: {
      includeAchievements: boolean;
      includeBiometrics: boolean;
      includeInsights: boolean;
    },
    dateRange?: DateRange
  ) {
    const whereClause = {
      userId,
      ...(dateRange?.from && dateRange?.to ? {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      } : {})
    };

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Fetch progress data
    const progressData = await prisma.userProgress.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' }
    });

    // Fetch streak data
    const streakData = await prisma.userStreak.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    let achievements = null;
    if (options.includeAchievements) {
      achievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true
        },
        orderBy: { earnedAt: 'desc' }
      });
    }

    let insights = null;
    if (options.includeInsights) {
      insights = await prisma.userInsight.findMany({
        where: { userId },
        orderBy: { generatedAt: 'desc' }
      });
    }

    // Fetch community achievements
    const communityAchievements = await prisma.userCommunityAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { earnedAt: 'desc' }
    });

    // Fetch challenge participation
    const challengeParticipation = await prisma.challengeParticipant.findMany({
      where: { userId },
      include: {
        challenge: true
      },
      orderBy: { joinedAt: 'desc' }
    });

    return {
      user,
      progressData,
      streakData,
      achievements,
      insights,
      communityAchievements,
      challengeParticipation,
      exportMetadata: {
        generatedAt: new Date(),
        dateRange,
        totalRecords: progressData.length,
        includeAchievements: options.includeAchievements,
        includeBiometrics: options.includeBiometrics,
        includeInsights: options.includeInsights
      }
    };
  }

  /**
   * Generate CSV export format
   */
  private generateCSVExport(userData: any): string {
    const csvSections: string[] = [];

    // User Profile Section
    csvSections.push('=== USER PROFILE ===');
    csvSections.push('Field,Value');
    csvSections.push(`User ID,${userData.user.id}`);
    csvSections.push(`Email,${userData.user.email}`);
    csvSections.push(`Name,${userData.user.name || 'N/A'}`);
    csvSections.push(`Account Created,${userData.user.createdAt.toISOString()}`);
    csvSections.push('');

    // Progress Data Section
    csvSections.push('=== EXERCISE PROGRESS ===');
    csvSections.push('Date,Exercise ID,Body Area,Duration (min),Difficulty,Mood,Energy Level,Notes');
    
    userData.progressData.forEach((progress: any) => {
      const row = [
        progress.completedAt.toISOString(),
        progress.exerciseId,
        progress.bodyArea,
        progress.durationMinutes || 'N/A',
        progress.difficultyLevel,
        progress.mood || 'N/A',
        progress.energyLevel || 'N/A',
        `"${progress.sessionNotes || ''}"`
      ].join(',');
      csvSections.push(row);
    });
    csvSections.push('');

    // Streak Data Section
    csvSections.push('=== STREAK DATA ===');
    csvSections.push('Streak Type,Current Count,Best Count,Last Activity,Started At');
    
    userData.streakData.forEach((streak: any) => {
      const row = [
        streak.streakType,
        streak.currentCount,
        streak.bestCount,
        streak.lastActivityDate?.toISOString() || 'N/A',
        streak.startedAt.toISOString()
      ].join(',');
      csvSections.push(row);
    });
    csvSections.push('');

    // Achievements Section
    if (userData.achievements) {
      csvSections.push('=== ACHIEVEMENTS ===');
      csvSections.push('Achievement Name,Description,Category,Points,Rarity,Earned Date');
      
      userData.achievements.forEach((userAchievement: any) => {
        const achievement = userAchievement.achievement;
        const row = [
          `"${achievement.name}"`,
          `"${achievement.description}"`,
          achievement.category,
          achievement.points,
          achievement.rarity,
          userAchievement.earnedAt.toISOString()
        ].join(',');
        csvSections.push(row);
      });
      csvSections.push('');
    }

    // Community Achievements Section
    if (userData.communityAchievements.length > 0) {
      csvSections.push('=== COMMUNITY ACHIEVEMENTS ===');
      csvSections.push('Achievement Name,Description,Points,Rarity,Earned Date');
      
      userData.communityAchievements.forEach((userAchievement: any) => {
        const achievement = userAchievement.achievement;
        const row = [
          `"${achievement.name}"`,
          `"${achievement.description}"`,
          achievement.points,
          achievement.rarity,
          userAchievement.earnedAt.toISOString()
        ].join(',');
        csvSections.push(row);
      });
      csvSections.push('');
    }

    // Insights Section
    if (userData.insights) {
      csvSections.push('=== INSIGHTS ===');
      csvSections.push('Type,Generated Date,Viewed Date,Content');
      
      userData.insights.forEach((insight: any) => {
        const row = [
          insight.insightType,
          insight.generatedAt.toISOString(),
          insight.viewedAt?.toISOString() || 'Not Viewed',
          `"${JSON.stringify(insight.content)}"`
        ].join(',');
        csvSections.push(row);
      });
      csvSections.push('');
    }

    // Export Metadata
    csvSections.push('=== EXPORT METADATA ===');
    csvSections.push('Field,Value');
    csvSections.push(`Generated At,${userData.exportMetadata.generatedAt.toISOString()}`);
    csvSections.push(`Total Progress Records,${userData.exportMetadata.totalRecords}`);
    csvSections.push(`Date Range,${userData.exportMetadata.dateRange ? `${userData.exportMetadata.dateRange.from?.toISOString()} to ${userData.exportMetadata.dateRange.to?.toISOString()}` : 'All Time'}`);

    return csvSections.join('\n');
  }

  /**
   * Generate JSON export format
   */
  private generateJSONExport(userData: any): string {
    return JSON.stringify(userData, null, 2);
  }

  /**
   * Get user's privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    // For now, we'll store privacy settings in user insights with a special type
    const privacyInsight = await prisma.userInsight.findFirst({
      where: {
        userId,
        insightType: 'privacy_settings'
      },
      orderBy: { generatedAt: 'desc' }
    });

    if (!privacyInsight) {
      // Return default privacy settings
      return {
        userId,
        shareProgressWithCommunity: true,
        allowBiometricCollection: true,
        allowInsightGeneration: true,
        dataRetentionDays: 365,
        anonymizeInCommunityStats: true
      };
    }

    return privacyInsight.content as unknown as PrivacySettings;
  }

  /**
   * Update user's privacy settings
   */
  async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const currentSettings = await this.getPrivacySettings(userId) || {
      userId,
      shareProgressWithCommunity: true,
      allowBiometricCollection: true,
      allowInsightGeneration: true,
      dataRetentionDays: 365,
      anonymizeInCommunityStats: true
    };

    const updatedSettings = { ...currentSettings, ...settings, userId };

    // Store updated settings as a user insight
    await prisma.userInsight.create({
      data: {
        userId,
        insightType: 'privacy_settings',
        content: updatedSettings,
        generatedAt: new Date()
      }
    });

    return updatedSettings;
  }

  /**
   * Delete all user data (for account deletion)
   */
  async deleteAllUserData(userId: string): Promise<void> {
    // Delete in order to respect foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete user insights
      await tx.userInsight.deleteMany({
        where: { userId }
      });

      // Delete user achievements
      await tx.userAchievement.deleteMany({
        where: { userId }
      });

      // Delete user community achievements
      await tx.userCommunityAchievement.deleteMany({
        where: { userId }
      });

      // Delete challenge participation
      await tx.challengeParticipant.deleteMany({
        where: { userId }
      });

      // Delete user streaks
      await tx.userStreak.deleteMany({
        where: { userId }
      });

      // Delete user progress
      await tx.userProgress.deleteMany({
        where: { userId }
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });
  }

  /**
   * Generate data portability package
   */
  async generatePortabilityPackage(userId: string): Promise<{
    standardFormat: any;
    platformSpecific: any;
  }> {
    const userData = await this.fetchUserData(userId, {
      includeAchievements: true,
      includeBiometrics: true,
      includeInsights: true
    }, undefined);

    // Standard format following common data portability standards
    const standardFormat = {
      profile: {
        id: userData.user?.id || '',
        email: userData.user?.email || '',
        name: userData.user?.name || '',
        joinDate: userData.user?.createdAt || new Date()
      },
      activities: userData.progressData.map((progress: any) => ({
        id: progress.id,
        type: 'exercise_completion',
        timestamp: progress.completedAt,
        duration: progress.durationMinutes,
        category: progress.bodyArea,
        subcategory: progress.exerciseId,
        difficulty: progress.difficultyLevel,
        notes: progress.sessionNotes,
        mood: progress.mood,
        energy: progress.energyLevel
      })),
      achievements: userData.achievements?.map((ua: any) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        category: ua.achievement.category,
        earnedDate: ua.earnedAt,
        points: ua.achievement.points
      })) || [],
      statistics: {
        totalSessions: userData.progressData.length,
        streaks: userData.streakData.map((streak: any) => ({
          type: streak.streakType,
          current: streak.currentCount,
          best: streak.bestCount,
          lastActivity: streak.lastActivityDate
        }))
      }
    };

    // Platform-specific format (full data structure)
    const platformSpecific = userData;

    return {
      standardFormat,
      platformSpecific
    };
  }

  /**
   * Anonymize user data for community statistics
   */
  async anonymizeUserDataForCommunity(userId: string): Promise<any> {
    const progressData = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        exerciseId: true,
        bodyArea: true,
        completedAt: true,
        durationMinutes: true,
        difficultyLevel: true
        // Exclude personal identifiers and notes
      }
    });

    return {
      anonymizedId: this.generateAnonymizedId(userId),
      totalSessions: progressData.length,
      bodyAreaDistribution: this.calculateBodyAreaDistribution(progressData),
      averageSessionDuration: this.calculateAverageSessionDuration(progressData),
      consistencyScore: this.calculateConsistencyScore(progressData),
      // No personal information included
    };
  }

  private generateAnonymizedId(userId: string): string {
    // Generate a consistent but anonymous ID for the user
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(userId + 'anonymous_salt').digest('hex').substring(0, 8);
  }

  private calculateBodyAreaDistribution(progressData: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    progressData.forEach(progress => {
      distribution[progress.bodyArea] = (distribution[progress.bodyArea] || 0) + 1;
    });
    return distribution;
  }

  private calculateAverageSessionDuration(progressData: any[]): number {
    const validDurations = progressData
      .filter(p => p.durationMinutes)
      .map(p => p.durationMinutes);
    
    if (validDurations.length === 0) return 0;
    
    return validDurations.reduce((sum, duration) => sum + duration, 0) / validDurations.length;
  }

  private calculateConsistencyScore(progressData: any[]): number {
    if (progressData.length === 0) return 0;

    // Calculate consistency based on regularity of sessions
    const dates = progressData.map(p => new Date(p.completedAt).toDateString());
    const uniqueDates = new Set(dates);
    
    const daysSinceFirst = Math.ceil(
      (new Date().getTime() - new Date(progressData[progressData.length - 1].completedAt).getTime()) 
      / (1000 * 60 * 60 * 24)
    );
    
    return Math.min(100, (uniqueDates.size / Math.max(daysSinceFirst, 1)) * 100);
  }
}

export const exportService = new ExportService();