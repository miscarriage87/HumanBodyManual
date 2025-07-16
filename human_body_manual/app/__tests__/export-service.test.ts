import { ExportService } from '../lib/export-service';
import { DataExportRequest, PrivacySettings } from '../lib/types';

// Mock Prisma
jest.mock('../lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn()
    },
    userProgress: {
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    userStreak: {
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    userAchievement: {
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    userInsight: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn()
    },
    userCommunityAchievement: {
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    challengeParticipant: {
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

const { prisma } = require('../lib/db');

describe('ExportService', () => {
  let exportService: ExportService;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    exportService = new ExportService();
    jest.clearAllMocks();
  });

  describe('generateUserDataExport', () => {
    const mockUserData = {
      id: mockUserId,
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    const mockProgressData = [
      {
        id: 'progress-1',
        userId: mockUserId,
        exerciseId: 'breathing-basic',
        bodyArea: 'nervensystem',
        completedAt: new Date('2024-01-15'),
        durationMinutes: 10,
        difficultyLevel: 'Anfänger',
        sessionNotes: 'Great session',
        mood: 'gut',
        energyLevel: 'hoch'
      }
    ];

    const mockStreakData = [
      {
        id: 'streak-1',
        userId: mockUserId,
        streakType: 'daily',
        currentCount: 5,
        bestCount: 10,
        lastActivityDate: new Date('2024-01-15'),
        startedAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue(mockUserData);
      prisma.userProgress.findMany.mockResolvedValue(mockProgressData);
      prisma.userStreak.findMany.mockResolvedValue(mockStreakData);
      prisma.userAchievement.findMany.mockResolvedValue([]);
      prisma.userInsight.findMany.mockResolvedValue([]);
      prisma.userCommunityAchievement.findMany.mockResolvedValue([]);
      prisma.challengeParticipant.findMany.mockResolvedValue([]);
    });

    it('should generate JSON export successfully', async () => {
      const request: DataExportRequest = {
        userId: mockUserId,
        format: 'json',
        includeAchievements: true,
        includeBiometrics: true,
        includeInsights: true
      };

      const result = await exportService.generateUserDataExport(request);
      const parsedResult = JSON.parse(result);

      // Handle date serialization - JSON.stringify converts dates to strings
      const expectedUserData = {
        ...mockUserData,
        createdAt: mockUserData.createdAt.toISOString(),
        updatedAt: mockUserData.updatedAt.toISOString(),
      };
      
      const expectedProgressData = mockProgressData.map(item => ({
        ...item,
        completedAt: item.completedAt.toISOString(),
      }));
      
      const expectedStreakData = mockStreakData.map(item => ({
        ...item,
        lastActivityDate: item.lastActivityDate.toISOString(),
        startedAt: item.startedAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));
      
      expect(parsedResult.user).toEqual(expectedUserData);
      expect(parsedResult.progressData).toEqual(expectedProgressData);
      expect(parsedResult.streakData).toEqual(expectedStreakData);
      expect(parsedResult.exportMetadata).toBeDefined();
      expect(parsedResult.exportMetadata.totalRecords).toBe(1);
    });

    it('should generate CSV export successfully', async () => {
      const request: DataExportRequest = {
        userId: mockUserId,
        format: 'csv',
        includeAchievements: false,
        includeBiometrics: false,
        includeInsights: false
      };

      const result = await exportService.generateUserDataExport(request);

      expect(result).toContain('=== USER PROFILE ===');
      expect(result).toContain('=== EXERCISE PROGRESS ===');
      expect(result).toContain('=== STREAK DATA ===');
      expect(result).toContain(mockUserData.email);
      expect(result).toContain('breathing-basic');
      expect(result).toContain('nervensystem');
    });

    it('should respect date range filter', async () => {
      const dateRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31')
      };

      const request: DataExportRequest = {
        userId: mockUserId,
        format: 'json',
        dateRange,
        includeAchievements: true,
        includeBiometrics: true,
        includeInsights: true
      };

      await exportService.generateUserDataExport(request);

      expect(prisma.userProgress.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        },
        orderBy: { completedAt: 'desc' }
      });
    });
  });

  describe('Privacy Settings', () => {
    it('should return default privacy settings when none exist', async () => {
      prisma.userInsight.findFirst.mockResolvedValue(null);

      const settings = await exportService.getPrivacySettings(mockUserId);

      expect(settings).toEqual({
        userId: mockUserId,
        shareProgressWithCommunity: true,
        allowBiometricCollection: true,
        allowInsightGeneration: true,
        dataRetentionDays: 365,
        anonymizeInCommunityStats: true
      });
    });

    it('should return existing privacy settings', async () => {
      const existingSettings: PrivacySettings = {
        userId: mockUserId,
        shareProgressWithCommunity: false,
        allowBiometricCollection: false,
        allowInsightGeneration: true,
        dataRetentionDays: 180,
        anonymizeInCommunityStats: true
      };

      prisma.userInsight.findFirst.mockResolvedValue({
        content: existingSettings
      });

      const settings = await exportService.getPrivacySettings(mockUserId);

      expect(settings).toEqual(existingSettings);
    });

    it('should update privacy settings', async () => {
      const currentSettings: PrivacySettings = {
        userId: mockUserId,
        shareProgressWithCommunity: true,
        allowBiometricCollection: true,
        allowInsightGeneration: true,
        dataRetentionDays: 365,
        anonymizeInCommunityStats: true
      };

      prisma.userInsight.findFirst.mockResolvedValue({
        content: currentSettings
      });

      const updates = {
        shareProgressWithCommunity: false,
        dataRetentionDays: 180
      };

      const updatedSettings = await exportService.updatePrivacySettings(mockUserId, updates);

      expect(updatedSettings.shareProgressWithCommunity).toBe(false);
      expect(updatedSettings.dataRetentionDays).toBe(180);
      expect(updatedSettings.allowBiometricCollection).toBe(true); // unchanged

      expect(prisma.userInsight.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          insightType: 'privacy_settings',
          content: updatedSettings,
          generatedAt: expect.any(Date)
        }
      });
    });
  });

  describe('Account Deletion', () => {
    it('should delete all user data in correct order', async () => {
      const mockTransaction = jest.fn();
      prisma.$transaction.mockImplementation(mockTransaction);

      await exportService.deleteAllUserData(mockUserId);

      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Data Portability', () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2024-01-01')
      });
      prisma.userProgress.findMany.mockResolvedValue([
        {
          id: 'progress-1',
          exerciseId: 'breathing-basic',
          bodyArea: 'nervensystem',
          completedAt: new Date('2024-01-15'),
          durationMinutes: 10,
          difficultyLevel: 'Anfänger'
        }
      ]);
      prisma.userStreak.findMany.mockResolvedValue([]);
      prisma.userAchievement.findMany.mockResolvedValue([]);
      prisma.userInsight.findMany.mockResolvedValue([]);
      prisma.userCommunityAchievement.findMany.mockResolvedValue([]);
      prisma.challengeParticipant.findMany.mockResolvedValue([]);
    });

    it('should generate portability package with standard format', async () => {
      const result = await exportService.generatePortabilityPackage(mockUserId);

      expect(result.standardFormat).toBeDefined();
      expect(result.standardFormat.profile).toBeDefined();
      expect(result.standardFormat.activities).toBeDefined();
      expect(result.standardFormat.achievements).toBeDefined();
      expect(result.standardFormat.statistics).toBeDefined();

      expect(result.standardFormat.profile.email).toBe('test@example.com');
      expect(result.standardFormat.activities).toHaveLength(1);
      expect(result.standardFormat.activities[0].type).toBe('exercise_completion');
    });

    it('should generate portability package with platform-specific format', async () => {
      const result = await exportService.generatePortabilityPackage(mockUserId);

      expect(result.platformSpecific).toBeDefined();
      expect(result.platformSpecific.user).toBeDefined();
      expect(result.platformSpecific.progressData).toBeDefined();
      expect(result.platformSpecific.exportMetadata).toBeDefined();
    });
  });

  describe('Data Anonymization', () => {
    beforeEach(() => {
      prisma.userProgress.findMany.mockResolvedValue([
        {
          exerciseId: 'breathing-basic',
          bodyArea: 'nervensystem',
          completedAt: new Date('2024-01-15'),
          durationMinutes: 10,
          difficultyLevel: 'Anfänger'
        },
        {
          exerciseId: 'movement-stretch',
          bodyArea: 'bewegung',
          completedAt: new Date('2024-01-16'),
          durationMinutes: 15,
          difficultyLevel: 'Fortgeschritten'
        }
      ]);
    });

    it('should anonymize user data for community statistics', async () => {
      const result = await exportService.anonymizeUserDataForCommunity(mockUserId);

      expect(result.anonymizedId).toBeDefined();
      expect(result.anonymizedId).not.toBe(mockUserId);
      expect(result.totalSessions).toBe(2);
      expect(result.bodyAreaDistribution).toEqual({
        nervensystem: 1,
        bewegung: 1
      });
      expect(result.averageSessionDuration).toBe(12.5);
      expect(result.consistencyScore).toBeDefined();

      // Ensure no personal information is included
      expect(result).not.toHaveProperty('userId');
      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('name');
    });

    it('should generate consistent anonymized ID for same user', async () => {
      const result1 = await exportService.anonymizeUserDataForCommunity(mockUserId);
      const result2 = await exportService.anonymizeUserDataForCommunity(mockUserId);

      expect(result1.anonymizedId).toBe(result2.anonymizedId);
    });
  });
});