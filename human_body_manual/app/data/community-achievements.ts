import { CommunityAchievement, CommunityChallenge } from '@/lib/types';

export const defaultCommunityAchievements: Omit<CommunityAchievement, 'id' | 'createdAt'>[] = [
  {
    name: 'Community Starter',
    description: 'Tritt deiner ersten Community Challenge bei',
    criteria: {
      type: 'community_participation',
      requirements: { participationCount: 1 }
    },
    badgeIcon: '🌟',
    points: 50,
    rarity: 'common',
    isActive: true
  },
  {
    name: 'Challenge Champion',
    description: 'Schließe 5 Community Challenges erfolgreich ab',
    criteria: {
      type: 'challenge_completion',
      requirements: { challengeCount: 5 }
    },
    badgeIcon: '🏆',
    points: 200,
    rarity: 'rare',
    isActive: true
  },
  {
    name: 'Community Leader',
    description: 'Erreiche die Top 10% in der monatlichen Rangliste',
    criteria: {
      type: 'leaderboard_rank',
      requirements: { percentile: 90 },
      timeframe: 'monthly'
    },
    badgeIcon: '👑',
    points: 500,
    rarity: 'epic',
    isActive: true
  },
  {
    name: 'Social Butterfly',
    description: 'Nimm an 10 verschiedenen Community Challenges teil',
    criteria: {
      type: 'community_participation',
      requirements: { participationCount: 10 }
    },
    badgeIcon: '🦋',
    points: 300,
    rarity: 'rare',
    isActive: true
  },
  {
    name: 'Inspiration',
    description: 'Halte eine 30-Tage Streak während einer Community Challenge',
    criteria: {
      type: 'challenge_completion',
      requirements: { streakDays: 30 }
    },
    badgeIcon: '✨',
    points: 400,
    rarity: 'epic',
    isActive: true
  },
  {
    name: 'Consistency Master',
    description: 'Schließe 3 Challenges in Folge erfolgreich ab',
    criteria: {
      type: 'challenge_completion',
      requirements: { consecutiveChallenges: 3 }
    },
    badgeIcon: '🎯',
    points: 350,
    rarity: 'rare',
    isActive: true
  },
  {
    name: 'Community Legend',
    description: 'Erreiche Platz 1 in einer monatlichen Rangliste',
    criteria: {
      type: 'leaderboard_rank',
      requirements: { rank: 1 },
      timeframe: 'monthly'
    },
    badgeIcon: '🌟',
    points: 1000,
    rarity: 'legendary',
    isActive: true
  },
  {
    name: 'Team Player',
    description: 'Hilf der Community dabei, ein Gesamtziel zu erreichen',
    criteria: {
      type: 'community_participation',
      requirements: { teamGoalContribution: true }
    },
    badgeIcon: '🤝',
    points: 250,
    rarity: 'rare',
    isActive: true
  }
];

export const sampleCommunityChallenge: Omit<CommunityChallenge, 'id' | 'createdAt' | 'updatedAt' | 'participantCount'>[] = [
  {
    title: '7-Tage Achtsamkeits-Challenge',
    description: 'Praktiziere 7 Tage in Folge mindestens eine Achtsamkeitsübung aus dem Nervensystem-Bereich',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    targetMetric: 'consecutive_days',
    targetValue: 7,
    rewards: [
      {
        type: 'badge',
        value: 'mindfulness_week',
        description: 'Achtsamkeits-Woche Badge'
      },
      {
        type: 'points',
        value: 100,
        description: '100 Community Punkte'
      }
    ],
    isActive: true
  },
  {
    title: 'Bewegungs-Marathon',
    description: 'Sammle gemeinsam mit der Community 10.000 Minuten Bewegungsübungen',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    targetMetric: 'total_minutes',
    targetValue: 10000,
    rewards: [
      {
        type: 'community_achievement',
        value: 'movement_marathon',
        description: 'Bewegungs-Marathon Achievement'
      },
      {
        type: 'unlock',
        value: 'advanced_movement_techniques',
        description: 'Erweiterte Bewegungstechniken'
      }
    ],
    isActive: true
  },
  {
    title: 'Kälte-Resistenz Challenge',
    description: 'Absolviere 14 Kälteübungen in 21 Tagen',
    startDate: new Date(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    targetMetric: 'cold_sessions',
    targetValue: 14,
    rewards: [
      {
        type: 'badge',
        value: 'cold_warrior',
        description: 'Kälte-Krieger Badge'
      },
      {
        type: 'points',
        value: 200,
        description: '200 Community Punkte'
      }
    ],
    isActive: true
  }
];