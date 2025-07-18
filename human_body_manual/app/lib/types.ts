export type DateRange = {
  from?: Date | undefined
  to?: Date | undefined
}

// Progress Tracking Types

export type BodyAreaType = 
  | 'nervensystem'
  | 'hormone' 
  | 'zirkadian'
  | 'mikrobiom'
  | 'bewegung'
  | 'fasten'
  | 'kaelte'
  | 'licht';

export type DifficultyLevel = 'Anfänger' | 'Fortgeschritten' | 'Experte';

export type MoodRating = 'sehr_schlecht' | 'schlecht' | 'neutral' | 'gut' | 'sehr_gut';

export type EnergyRating = 'sehr_niedrig' | 'niedrig' | 'normal' | 'hoch' | 'sehr_hoch';

export type AchievementCategory = 
  | 'consistency'
  | 'mastery'
  | 'milestone'
  | 'community'
  | 'special';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type StreakType = 'daily' | 'weekly' | 'body_area' | 'exercise_specific';

export type InsightType = 
  | 'recommendation'
  | 'pattern_analysis'
  | 'plateau_detection'
  | 'motivation'
  | 'optimization';

// Core Progress Tracking Models

export interface ProgressEntry {
  id: string;
  userId: string;
  exerciseId: string;
  bodyArea: BodyAreaType;
  completedAt: Date;
  durationMinutes?: number;
  difficultyLevel: DifficultyLevel;
  sessionNotes?: string;
  biometricData?: BiometricSnapshot;
  mood?: MoodRating;
  energyLevel?: EnergyRating;
  createdAt: Date;
}

export interface ExerciseCompletion {
  exerciseId: string;
  bodyArea: BodyAreaType;
  durationMinutes?: number;
  difficultyLevel: DifficultyLevel;
  sessionNotes?: string;
  biometricData?: BiometricSnapshot;
  mood?: MoodRating;
  energyLevel?: EnergyRating;
}

export interface UserProgress {
  userId: string;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  bodyAreaStats: BodyAreaStats[];
  recentAchievements: Achievement[];
  weeklyGoal: number;
  weeklyProgress: number;
  lastActivity: Date;
}

export interface BodyAreaStats {
  bodyArea: BodyAreaType;
  totalSessions: number;
  totalMinutes: number;
  averageSessionDuration: number;
  completionRate: number;
  lastPracticed: Date;
  favoriteExercises: string[];
  consistencyScore: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  criteria: AchievementCriteria;
  badgeIcon: string;
  points: number;
  rarity: AchievementRarity;
  unlocksContent?: string[];
  createdAt: Date;
}

export interface AchievementCriteria {
  type: 'streak' | 'total_sessions' | 'body_area_mastery' | 'consistency' | 'milestone';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  bodyArea?: BodyAreaType;
  exerciseId?: string;
  conditions?: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  earnedAt: Date;
  progressSnapshot?: Record<string, any>;
}

export interface AchievementProgress {
  achievementId: string;
  achievement: Achievement;
  currentProgress: number;
  targetProgress: number;
  progressPercentage: number;
  isCompleted: boolean;
  estimatedCompletion?: Date;
}

export interface StreakData {
  userId: string;
  streakType: StreakType;
  currentCount: number;
  bestCount: number;
  lastActivityDate?: Date;
  startedAt: Date;
  isActive: boolean;
}

export interface UserInsight {
  id: string;
  userId: string;
  insightType: InsightType;
  content: InsightContent;
  generatedAt: Date;
  viewedAt?: Date;
}

export interface InsightContent {
  title: string;
  message: string;
  actionItems?: string[];
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

export interface Recommendation {
  id: string;
  type: 'exercise' | 'schedule' | 'progression' | 'recovery';
  title: string;
  description: string;
  exerciseId?: string;
  bodyArea?: BodyAreaType;
  priority: number;
  reasoning: string;
  estimatedBenefit: string;
}

export interface TrendData {
  period: 'week' | 'month' | 'quarter' | 'year';
  dataPoints: TrendDataPoint[];
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
}

export interface TrendDataPoint {
  date: Date;
  value: number;
  label: string;
  metadata?: Record<string, any>;
}

// Biometric Integration Models

export interface BiometricSnapshot {
  heartRate?: number;
  hrv?: number;
  stressLevel?: number;
  sleepQuality?: number;
  recoveryScore?: number;
  timestamp: Date;
  source: 'manual' | 'wearable' | 'app';
  deviceId?: string;
  confidence?: number;
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

// Community and Social Features

export interface CommunityStats {
  id: string;
  statType: 'daily' | 'weekly' | 'monthly';
  date: Date;
  totalActiveUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  popularExercises: PopularExercise[];
  bodyAreaStats: BodyAreaPopularity[];
  generatedAt: Date;
}

export interface PopularExercise {
  exerciseId: string;
  completionCount: number;
  averageRating?: number;
  trendDirection: 'up' | 'down' | 'stable';
  rank: number;
}

export interface BodyAreaPopularity {
  bodyArea: BodyAreaType;
  practitionerCount: number;
  averageSessionsPerWeek: number;
  popularityRank: number;
  totalSessions: number;
  averageDuration: number;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetMetric: string;
  targetValue: number;
  rewards: ChallengeReward[];
  isActive: boolean;
  participantCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeReward {
  type: 'badge' | 'points' | 'unlock' | 'community_achievement';
  value: string | number;
  description: string;
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: Date;
  progress?: ChallengeProgress;
  completed: boolean;
  completedAt?: Date;
}

export interface ChallengeProgress {
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
  lastUpdated: Date;
  milestones?: ChallengeMilestone[];
}

export interface ChallengeMilestone {
  value: number;
  description: string;
  achieved: boolean;
  achievedAt?: Date;
}

export interface CommunityAchievement {
  id: string;
  name: string;
  description: string;
  criteria: CommunityAchievementCriteria;
  badgeIcon?: string;
  points: number;
  rarity: AchievementRarity;
  isActive: boolean;
  createdAt: Date;
}

export interface CommunityAchievementCriteria {
  type: 'challenge_completion' | 'community_participation' | 'leaderboard_rank' | 'social_engagement';
  requirements: Record<string, any>;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

export interface UserCommunityAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: CommunityAchievement;
  earnedAt: Date;
  context?: Record<string, any>;
}

export interface LeaderboardEntry {
  rank: number;
  percentile: number;
  value: number;
  isCurrentUser?: boolean;
  anonymizedId?: string; // For display purposes only
}

export interface Leaderboard {
  metric: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: Date;
}

// Export and Privacy Types

export interface DataExportRequest {
  userId: string;
  format: 'csv' | 'json';
  dateRange?: DateRange;
  includeAchievements: boolean;
  includeBiometrics: boolean;
  includeInsights: boolean;
}

export interface PrivacySettings {
  userId: string;
  shareProgressWithCommunity: boolean;
  allowBiometricCollection: boolean;
  allowInsightGeneration: boolean;
  dataRetentionDays: number;
  anonymizeInCommunityStats: boolean;
}