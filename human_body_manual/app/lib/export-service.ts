import { ProgressTracker } from './progress-tracker';
import { AnalyticsService } from './analytics-service';
import { 
  DataExportRequest, 
  ProgressEntry, 
  UserProgress, 
  UserAchievement, 
  UserInsight,
  BodyAreaStats,
  DateRange 
} from './types';

export class ExportService {
  /**
   * Export user progress data in the requested format
   */
  static async exportUserData(request: DataExportRequest): Promise<Blob> {
    const data = await this.gatherExportData(request);
    
    if (request.format === 'csv') {
      return this.generateCSV(data);
    } else {
      return this.generateJSON(data);
    }
  }

  /**
   * Gather all data for export based on request parameters
   */
  private static async gatherExportData(request: DataExportRequest) {
    const { userId, dateRange, includeAchievements, includeBiometrics, includeInsights } = request;

    // Get basic progress data
    const userProgress = await ProgressTracker.getUserProgress(userId, dateRange);
    const progressEntries = await ProgressTracker.getProgressEntries(userId, dateRange);
    
    const exportData: any = {
      exportInfo: {
        userId,
        exportDate: new Date().toISOString(),
        dateRange: dateRange ? {
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString()
        } : null,
        totalRecords: progressEntries.length
      },
      userProgress,
      progressEntries: progressEntries.map(entry => ({
        ...entry,
        // Filter out biometric data if not requested
        biometricData: includeBiometrics ? entry.biometricData : undefined
      }))
    };

    // Add achievements if requested
    if (includeAchievements) {
      exportData.achievements = userProgress.recentAchievements;
    }

    // Add insights if requested
    if (includeInsights) {
      try {
        const insights = await AnalyticsService.generateInsights(userId);
        exportData.insights = insights;
      } catch (error) {
        console.warn('Could not fetch insights for export:', error);
        exportData.insights = [];
      }
    }

    return exportData;
  }

  /**
   * Generate CSV format export
   */
  private static generateCSV(data: any): Blob {
    const csvSections: string[] = [];

    // Export Info Section
    csvSections.push('=== EXPORT INFORMATION ===');
    csvSections.push(`Export Date,${data.exportInfo.exportDate}`);
    csvSections.push(`User ID,${data.exportInfo.userId}`);
    csvSections.push(`Total Records,${data.exportInfo.totalRecords}`);
    if (data.exportInfo.dateRange?.from) {
      csvSections.push(`Date Range From,${data.exportInfo.dateRange.from}`);
    }
    if (data.exportInfo.dateRange?.to) {
      csvSections.push(`Date Range To,${data.exportInfo.dateRange.to}`);
    }
    csvSections.push('');

    // User Progress Summary
    csvSections.push('=== PROGRESS SUMMARY ===');
    csvSections.push(`Total Sessions,${data.userProgress.totalSessions}`);
    csvSections.push(`Total Minutes,${data.userProgress.totalMinutes}`);
    csvSections.push(`Current Streak,${data.userProgress.currentStreak}`);
    csvSections.push(`Longest Streak,${data.userProgress.longestStreak}`);
    csvSections.push(`Weekly Goal,${data.userProgress.weeklyGoal}`);
    csvSections.push(`Weekly Progress,${data.userProgress.weeklyProgress}`);
    csvSections.push(`Last Activity,${data.userProgress.lastActivity}`);
    csvSections.push('');

    // Body Area Stats
    csvSections.push('=== BODY AREA STATISTICS ===');
    csvSections.push('Body Area,Total Sessions,Total Minutes,Average Duration,Completion Rate,Last Practiced,Consistency Score,Mastery Level');
    data.userProgress.bodyAreaStats.forEach((stat: BodyAreaStats) => {
      csvSections.push([
        stat.bodyArea,
        stat.totalSessions,
        stat.totalMinutes,
        stat.averageSessionDuration.toFixed(1),
        stat.completionRate,
        stat.lastPracticed.toISOString(),
        (stat.consistencyScore * 100).toFixed(1),
        stat.masteryLevel
      ].join(','));
    });
    csvSections.push('');

    // Progress Entries
    csvSections.push('=== DETAILED PROGRESS ENTRIES ===');
    csvSections.push('Date,Exercise ID,Body Area,Duration (min),Difficulty,Mood,Energy Level,Session Notes');
    data.progressEntries.forEach((entry: ProgressEntry) => {
      csvSections.push([
        entry.completedAt.toISOString(),
        `"${entry.exerciseId}"`,
        entry.bodyArea,
        entry.durationMinutes || '',
        entry.difficultyLevel,
        entry.mood || '',
        entry.energyLevel || '',
        entry.sessionNotes ? `"${entry.sessionNotes.replace(/"/g, '""')}"` : ''
      ].join(','));
    });

    // Achievements
    if (data.achievements) {
      csvSections.push('');
      csvSections.push('=== ACHIEVEMENTS ===');
      csvSections.push('Achievement Name,Description,Category,Rarity,Points,Earned Date');
      data.achievements.forEach((achievement: UserAchievement) => {
        csvSections.push([
          `"${achievement.achievement.name}"`,
          `"${achievement.achievement.description}"`,
          achievement.achievement.category,
          achievement.achievement.rarity,
          achievement.achievement.points,
          achievement.earnedAt.toISOString()
        ].join(','));
      });
    }

    // Insights
    if (data.insights) {
      csvSections.push('');
      csvSections.push('=== INSIGHTS ===');
      csvSections.push('Type,Title,Message,Priority,Generated Date,Viewed Date');
      data.insights.forEach((insight: UserInsight) => {
        csvSections.push([
          insight.insightType,
          `"${insight.content.title}"`,
          `"${insight.content.message.replace(/"/g, '""')}"`,
          insight.content.priority,
          insight.generatedAt.toISOString(),
          insight.viewedAt?.toISOString() || ''
        ].join(','));
      });
    }

    const csvContent = csvSections.join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Generate JSON format export
   */
  private static generateJSON(data: any): Blob {
    const jsonContent = JSON.stringify(data, null, 2);
    return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  }

  /**
   * Generate a filename for the export
   */
  static generateExportFilename(format: 'csv' | 'json', userId: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const userIdShort = userId.substring(0, 8);
    return `human-body-manual-export-${userIdShort}-${timestamp}.${format}`;
  }

  /**
   * Download a blob as a file
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get export statistics for display
   */
  static async getExportPreview(userId: string, dateRange?: DateRange): Promise<{
    totalSessions: number;
    totalMinutes: number;
    bodyAreasCount: number;
    achievementsCount: number;
    dateRangeText: string;
  }> {
    const userProgress = await ProgressTracker.getUserProgress(userId, dateRange);
    const progressEntries = await ProgressTracker.getProgressEntries(userId, dateRange);

    const bodyAreasWithData = new Set(progressEntries.map(entry => entry.bodyArea));

    let dateRangeText = 'Alle Daten';
    if (dateRange?.from && dateRange?.to) {
      dateRangeText = `${dateRange.from.toLocaleDateString('de-DE')} - ${dateRange.to.toLocaleDateString('de-DE')}`;
    } else if (dateRange?.from) {
      dateRangeText = `Ab ${dateRange.from.toLocaleDateString('de-DE')}`;
    } else if (dateRange?.to) {
      dateRangeText = `Bis ${dateRange.to.toLocaleDateString('de-DE')}`;
    }

    return {
      totalSessions: progressEntries.length,
      totalMinutes: progressEntries.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0),
      bodyAreasCount: bodyAreasWithData.size,
      achievementsCount: userProgress.recentAchievements.length,
      dateRangeText
    };
  }

  /**
   * Validate export request
   */
  static validateExportRequest(request: DataExportRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.userId) {
      errors.push('User ID is required');
    }

    if (!['csv', 'json'].includes(request.format)) {
      errors.push('Format must be either csv or json');
    }

    if (request.dateRange?.from && request.dateRange?.to) {
      if (request.dateRange.from > request.dateRange.to) {
        errors.push('Start date must be before end date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}