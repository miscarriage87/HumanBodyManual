import { Achievement, AchievementCategory, AchievementRarity } from '@/lib/types';

export const initialAchievements: Omit<Achievement, 'id' | 'createdAt'>[] = [
  // Consistency Achievements
  {
    name: 'Erster Schritt',
    description: 'Vervollständige deine erste Übung',
    category: 'milestone' as AchievementCategory,
    criteria: {
      type: 'total_sessions',
      target: 1,
      timeframe: 'all_time'
    },
    badgeIcon: '🌱',
    points: 10,
    rarity: 'common' as AchievementRarity
  },
  {
    name: 'Consistency Warrior',
    description: 'Praktiziere 7 Tage in Folge',
    category: 'consistency' as AchievementCategory,
    criteria: {
      type: 'streak',
      target: 7,
      timeframe: 'daily'
    },
    badgeIcon: '🔥',
    points: 50,
    rarity: 'rare' as AchievementRarity
  },
  {
    name: 'Unaufhaltsam',
    description: 'Erreiche eine 30-Tage Streak',
    category: 'consistency' as AchievementCategory,
    criteria: {
      type: 'streak',
      target: 30,
      timeframe: 'daily'
    },
    badgeIcon: '⚡',
    points: 200,
    rarity: 'epic' as AchievementRarity,
    unlocksContent: ['advanced_techniques']
  },
  {
    name: 'Legende der Beständigkeit',
    description: 'Halte eine 100-Tage Streak aufrecht',
    category: 'consistency' as AchievementCategory,
    criteria: {
      type: 'streak',
      target: 100,
      timeframe: 'daily'
    },
    badgeIcon: '👑',
    points: 500,
    rarity: 'legendary' as AchievementRarity,
    unlocksContent: ['master_techniques', 'exclusive_content']
  },

  // Milestone Achievements
  {
    name: 'Fleißiger Praktiker',
    description: 'Vervollständige 30 Übungen insgesamt',
    category: 'milestone' as AchievementCategory,
    criteria: {
      type: 'total_sessions',
      target: 30,
      timeframe: 'all_time'
    },
    badgeIcon: '📈',
    points: 75,
    rarity: 'common' as AchievementRarity
  },
  {
    name: 'Hundertfacher Meister',
    description: 'Erreiche 100 abgeschlossene Übungen',
    category: 'milestone' as AchievementCategory,
    criteria: {
      type: 'total_sessions',
      target: 100,
      timeframe: 'all_time'
    },
    badgeIcon: '💯',
    points: 150,
    rarity: 'rare' as AchievementRarity
  },
  {
    name: 'Wellness Virtuose',
    description: 'Sammle 500 abgeschlossene Übungen',
    category: 'milestone' as AchievementCategory,
    criteria: {
      type: 'total_sessions',
      target: 500,
      timeframe: 'all_time'
    },
    badgeIcon: '🎯',
    points: 400,
    rarity: 'epic' as AchievementRarity
  },

  // Body Area Mastery Achievements
  {
    name: 'Nervensystem Novize',
    description: 'Vervollständige 10 Nervensystem-Übungen',
    category: 'mastery' as AchievementCategory,
    criteria: {
      type: 'body_area_mastery',
      target: 10,
      bodyArea: 'nervensystem',
      timeframe: 'all_time'
    },
    badgeIcon: '🧠',
    points: 30,
    rarity: 'common' as AchievementRarity
  },
  {
    name: 'Hormon Harmonisierer',
    description: 'Meistere 15 Hormon-Balance Übungen',
    category: 'mastery' as AchievementCategory,
    criteria: {
      type: 'body_area_mastery',
      target: 15,
      bodyArea: 'hormone',
      timeframe: 'all_time'
    },
    badgeIcon: '⚖️',
    points: 40,
    rarity: 'common' as AchievementRarity
  },
  {
    name: 'Zirkadianer Zeitmeister',
    description: 'Optimiere deinen Rhythmus mit 20 Übungen',
    category: 'mastery' as AchievementCategory,
    criteria: {
      type: 'body_area_mastery',
      target: 20,
      bodyArea: 'zirkadian',
      timeframe: 'all_time'
    },
    badgeIcon: '🌅',
    points: 50,
    rarity: 'rare' as AchievementRarity
  },
  {
    name: 'Mikrobiom Meister',
    description: 'Kultiviere dein inneres Ökosystem mit 25 Übungen',
    category: 'mastery' as AchievementCategory,
    criteria: {
      type: 'body_area_mastery',
      target: 25,
      bodyArea: 'mikrobiom',
      timeframe: 'all_time'
    },
    badgeIcon: '🦠',
    points: 60,
    rarity: 'rare' as AchievementRarity
  },
  {
    name: 'Bewegungs Virtuose',
    description: 'Befreie deinen Körper mit 30 Bewegungsübungen',
    category: 'mastery' as AchievementCategory,
    criteria: {
      type: 'body_area_mastery',
      target: 30,
      bodyArea: 'bewegung',
      timeframe: 'all_time'
    },
    badgeIcon: '🤸',
    points: 70,
    rarity: 'rare' as AchievementRarity
  },
  {
    name: 'Fasten Philosoph',
    description: 'Aktiviere Autophagie mit 20 Fasten-Übungen',
    category: 'mastery' as AchievementCategory,
    criteria: {
      type: 'body_area_mastery',
      target: 20,
      bodyArea: 'fasten',
      timeframe: 'all_time'
    },
    badgeIcon: '🕐',
    points: 55,
    rarity: 'rare' as AchievementRarity
  },
  {
    name: 'Kälte Krieger',
    description: 'Stärke deine Resilienz mit 25 Kälte-Übungen',
    category: 'mastery' as AchievementCategory,
    criteria: {
      type: 'body_area_mastery',
      target: 25,
      bodyArea: 'kaelte',
      timeframe: 'all_time'
    },
    badgeIcon: '❄️',
    points: 65,
    rarity: 'rare' as AchievementRarity
  },
  {
    name: 'Licht Luminär',
    description: 'Nutze heilende Frequenzen mit 15 Licht-Übungen',
    category: 'mastery' as AchievementCategory,
    criteria: {
      type: 'body_area_mastery',
      target: 15,
      bodyArea: 'licht',
      timeframe: 'all_time'
    },
    badgeIcon: '💡',
    points: 45,
    rarity: 'rare' as AchievementRarity
  },

  // Special Weekly Achievements
  {
    name: 'Perfekte Woche',
    description: 'Vervollständige alle geplanten Übungen einer Woche',
    category: 'special' as AchievementCategory,
    criteria: {
      type: 'consistency',
      target: 7,
      timeframe: 'weekly',
      conditions: { perfectWeek: true }
    },
    badgeIcon: '🌟',
    points: 100,
    rarity: 'epic' as AchievementRarity
  },
  {
    name: 'Ganzheitlicher Praktiker',
    description: 'Praktiziere in allen 8 Körperbereichen innerhalb einer Woche',
    category: 'special' as AchievementCategory,
    criteria: {
      type: 'consistency',
      target: 8,
      timeframe: 'weekly',
      conditions: { allBodyAreas: true }
    },
    badgeIcon: '🎭',
    points: 120,
    rarity: 'epic' as AchievementRarity
  },

  // Community Achievements
  {
    name: 'Community Mitglied',
    description: 'Tritt der Human Body Manual Community bei',
    category: 'community' as AchievementCategory,
    criteria: {
      type: 'milestone',
      target: 1,
      conditions: { joinedCommunity: true }
    },
    badgeIcon: '🤝',
    points: 25,
    rarity: 'common' as AchievementRarity
  },
  {
    name: 'Inspirierender Praktiker',
    description: 'Teile deinen ersten Fortschritt mit der Community',
    category: 'community' as AchievementCategory,
    criteria: {
      type: 'milestone',
      target: 1,
      conditions: { sharedProgress: true }
    },
    badgeIcon: '📢',
    points: 35,
    rarity: 'common' as AchievementRarity
  }
];

export const getAchievementsByCategory = (category: AchievementCategory) => {
  return initialAchievements.filter(achievement => achievement.category === category);
};

export const getAchievementsByRarity = (rarity: AchievementRarity) => {
  return initialAchievements.filter(achievement => achievement.rarity === rarity);
};

export const getUnlockableAchievements = () => {
  return initialAchievements.filter(achievement => achievement.unlocksContent && achievement.unlocksContent.length > 0);
};