import { z } from 'zod';

// Body Area Types
export const BodyAreaSchema = z.enum([
  'nervensystem',
  'hormone', 
  'zirkadian',
  'mikrobiom',
  'bewegung',
  'fasten',
  'kaelte',
  'licht'
]);

// Difficulty Levels
export const DifficultyLevelSchema = z.enum(['Anfänger', 'Fortgeschritten', 'Experte']);

// Mood and Energy Ratings
export const MoodRatingSchema = z.enum(['sehr_schlecht', 'schlecht', 'neutral', 'gut', 'sehr_gut']);
export const EnergyRatingSchema = z.enum(['sehr_niedrig', 'niedrig', 'normal', 'hoch', 'sehr_hoch']);

// Biometric Data Schema
export const BiometricSnapshotSchema = z.object({
  heartRate: z.number().min(30).max(220).optional(),
  hrv: z.number().min(0).max(200).optional(),
  stressLevel: z.number().min(0).max(100).optional(),
  sleepQuality: z.number().min(0).max(100).optional(),
  recoveryScore: z.number().min(0).max(100).optional(),
  timestamp: z.date(),
  source: z.enum(['manual', 'wearable', 'app']),
  deviceId: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// Exercise Completion Schema
export const ExerciseCompletionSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise ID is required'),
  bodyArea: BodyAreaSchema,
  durationMinutes: z.number().min(1).max(300).optional(),
  difficultyLevel: DifficultyLevelSchema,
  sessionNotes: z.string().max(1000).optional(),
  biometricData: BiometricSnapshotSchema.optional(),
  mood: MoodRatingSchema.optional(),
  energyLevel: EnergyRatingSchema.optional(),
});

// Progress Entry Schema
export const ProgressEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  exerciseId: z.string(),
  bodyArea: BodyAreaSchema,
  completedAt: z.date(),
  durationMinutes: z.number().optional(),
  difficultyLevel: DifficultyLevelSchema,
  sessionNotes: z.string().optional(),
  biometricData: BiometricSnapshotSchema.optional(),
  mood: MoodRatingSchema.optional(),
  energyLevel: EnergyRatingSchema.optional(),
  createdAt: z.date(),
});

// Date Range Schema
export const DateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
}).refine(
  (data) => !data.from || !data.to || data.from <= data.to,
  {
    message: "From date must be before or equal to to date",
    path: ["to"],
  }
);

// Achievement Criteria Schema
export const AchievementCriteriaSchema = z.object({
  type: z.enum(['streak', 'total_sessions', 'body_area_mastery', 'consistency', 'milestone']),
  target: z.number().min(1),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']).optional(),
  bodyArea: BodyAreaSchema.optional(),
  exerciseId: z.string().optional(),
  conditions: z.record(z.any()).optional(),
});

// Achievement Schema
export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: z.enum(['consistency', 'mastery', 'milestone', 'community', 'special']),
  criteria: AchievementCriteriaSchema,
  badgeIcon: z.string(),
  points: z.number().min(0).max(1000),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  unlocksContent: z.array(z.string()).optional(),
  createdAt: z.date(),
});

// User Progress Schema
export const UserProgressSchema = z.object({
  userId: z.string(),
  totalSessions: z.number().min(0),
  totalMinutes: z.number().min(0),
  currentStreak: z.number().min(0),
  longestStreak: z.number().min(0),
  bodyAreaStats: z.array(z.object({
    bodyArea: BodyAreaSchema,
    totalSessions: z.number().min(0),
    totalMinutes: z.number().min(0),
    averageSessionDuration: z.number().min(0),
    completionRate: z.number().min(0).max(1),
    lastPracticed: z.date(),
    favoriteExercises: z.array(z.string()),
    consistencyScore: z.number().min(0).max(1),
    masteryLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  })),
  recentAchievements: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    achievementId: z.string(),
    achievement: AchievementSchema,
    earnedAt: z.date(),
    progressSnapshot: z.record(z.any()).optional(),
  })),
  weeklyGoal: z.number().min(1).max(50),
  weeklyProgress: z.number().min(0),
  lastActivity: z.date(),
});

// Streak Data Schema
export const StreakDataSchema = z.object({
  userId: z.string(),
  streakType: z.enum(['daily', 'weekly', 'body_area', 'exercise_specific']),
  currentCount: z.number().min(0),
  bestCount: z.number().min(0),
  lastActivityDate: z.date().optional(),
  startedAt: z.date(),
  isActive: z.boolean(),
});

// User Insight Schema
export const UserInsightSchema = z.object({
  id: z.string(),
  userId: z.string(),
  insightType: z.enum(['recommendation', 'pattern_analysis', 'plateau_detection', 'motivation', 'optimization']),
  content: z.object({
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    actionItems: z.array(z.string()).optional(),
    data: z.record(z.any()).optional(),
    priority: z.enum(['low', 'medium', 'high']),
  }),
  generatedAt: z.date(),
  viewedAt: z.date().optional(),
});

// Data Export Request Schema
export const DataExportRequestSchema = z.object({
  userId: z.string(),
  format: z.enum(['csv', 'json']),
  dateRange: DateRangeSchema.optional(),
  includeAchievements: z.boolean().default(true),
  includeBiometrics: z.boolean().default(true),
  includeInsights: z.boolean().default(true),
});

// Privacy Settings Schema
export const PrivacySettingsSchema = z.object({
  userId: z.string(),
  shareProgressWithCommunity: z.boolean().default(false),
  allowBiometricCollection: z.boolean().default(true),
  allowInsightGeneration: z.boolean().default(true),
  dataRetentionDays: z.number().min(30).max(3650).default(365), // 1 month to 10 years
  anonymizeInCommunityStats: z.boolean().default(true),
});

// API Request Schemas

// Record Exercise Completion Request
export const RecordCompletionRequestSchema = z.object({
  exerciseCompletion: ExerciseCompletionSchema,
});

// Get Progress Request
export const GetProgressRequestSchema = z.object({
  timeRange: DateRangeSchema.optional(),
  bodyArea: BodyAreaSchema.optional(),
});

// Get Achievement Progress Request
export const GetAchievementProgressRequestSchema = z.object({
  achievementId: z.string().optional(), // If not provided, returns all achievements
});

// Update Weekly Goal Request
export const UpdateWeeklyGoalRequestSchema = z.object({
  weeklyGoal: z.number().min(1).max(50),
});

// Community Challenge Schema
export const CommunityChallengeSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  startDate: z.date(),
  endDate: z.date(),
  targetMetric: z.string(),
  targetValue: z.number().min(1),
  participants: z.number().min(0),
  rewards: z.array(z.object({
    type: z.enum(['badge', 'points', 'unlock']),
    value: z.union([z.string(), z.number()]),
    description: z.string(),
  })),
  isActive: z.boolean(),
}).refine(
  (data) => data.startDate < data.endDate,
  {
    message: "Start date must be before end date",
    path: ["endDate"],
  }
);

// Validation helper functions
export const validateExerciseCompletion = (data: unknown) => {
  return ExerciseCompletionSchema.parse(data);
};

export const validateProgressEntry = (data: unknown) => {
  return ProgressEntrySchema.parse(data);
};

export const validateDateRange = (data: unknown) => {
  return DateRangeSchema.parse(data);
};

export const validateAchievement = (data: unknown) => {
  return AchievementSchema.parse(data);
};

export const validateUserProgress = (data: unknown) => {
  return UserProgressSchema.parse(data);
};

export const validateBiometricSnapshot = (data: unknown) => {
  return BiometricSnapshotSchema.parse(data);
};

// Type exports for use in other files
export type ValidatedExerciseCompletion = z.infer<typeof ExerciseCompletionSchema>;
export type ValidatedProgressEntry = z.infer<typeof ProgressEntrySchema>;
export type ValidatedDateRange = z.infer<typeof DateRangeSchema>;
export type ValidatedAchievement = z.infer<typeof AchievementSchema>;
export type ValidatedUserProgress = z.infer<typeof UserProgressSchema>;
export type ValidatedBiometricSnapshot = z.infer<typeof BiometricSnapshotSchema>;