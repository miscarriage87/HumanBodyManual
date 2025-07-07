
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'consistency' | 'exploration' | 'mastery' | 'transformation';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: {
    type: 'streak' | 'exercises_completed' | 'areas_explored' | 'specific_exercise';
    target: number;
    timeframe?: string;
    specificExercise?: string;
  };
  badge: string;
}

export const achievements: Achievement[] = [
  // Konsistenz Achievements
  {
    id: 'first-step',
    title: 'Erste Schritte',
    description: 'Du hast deine erste Übung abgeschlossen - der Beginn einer transformierenden Reise!',
    icon: 'Baby',
    category: 'consistency',
    rarity: 'bronze',
    criteria: {
      type: 'exercises_completed',
      target: 1
    },
    badge: '🌱'
  },
  {
    id: 'week-warrior',
    title: 'Wochen-Krieger',
    description: '7 Tage in Folge praktiziert - du entwickelst eine kraftvolle Gewohnheit!',
    icon: 'Calendar',
    category: 'consistency',
    rarity: 'silver',
    criteria: {
      type: 'streak',
      target: 7
    },
    badge: '🔥'
  },
  {
    id: 'month-master',
    title: 'Monats-Meister',
    description: '30 Tage kontinuierliche Praxis - deine Transformation ist unaufhaltsam!',
    icon: 'Trophy',
    category: 'consistency',
    rarity: 'gold',
    criteria: {
      type: 'streak',
      target: 30
    },
    badge: '🏆'
  },
  {
    id: 'century-sage',
    title: 'Jahrhundert-Weiser',
    description: '100 Tage Streaks - Du bist ein wahrer Meister der Beständigkeit!',
    icon: 'Crown',
    category: 'consistency',
    rarity: 'platinum',
    criteria: {
      type: 'streak',
      target: 100
    },
    badge: '👑'
  },

  // Exploration Achievements
  {
    id: 'body-explorer',
    title: 'Körper-Forscher',
    description: 'Du hast alle 8 Hauptbereiche des Körpers erkundet - ein wahrer Entdecker!',
    icon: 'Compass',
    category: 'exploration',
    rarity: 'gold',
    criteria: {
      type: 'areas_explored',
      target: 8
    },
    badge: '🧭'
  },
  {
    id: 'technique-collector',
    title: 'Technik-Sammler',
    description: '20 verschiedene Übungen gemeistert - dein Repertoire wächst stetig!',
    icon: 'BookOpen',
    category: 'exploration',
    rarity: 'silver',
    criteria: {
      type: 'exercises_completed',
      target: 20
    },
    badge: '📚'
  },

  // Mastery Achievements
  {
    id: 'breath-master',
    title: 'Atem-Meister',
    description: 'Du hast 5 verschiedene Atemtechniken gemeistert - du kontrollierst deinen Lebensatem!',
    icon: 'Wind',
    category: 'mastery',
    rarity: 'gold',
    criteria: {
      type: 'exercises_completed',
      target: 5,
      specificExercise: 'nervensystem' // Nervensystem-Übungen
    },
    badge: '💨'
  },
  {
    id: 'cold-warrior',
    title: 'Kälte-Krieger',
    description: 'Du hast dich der Kälte gestellt und deine Komfortzone gesprengt!',
    icon: 'Snowflake',
    category: 'mastery',
    rarity: 'silver',
    criteria: {
      type: 'specific_exercise',
      target: 5,
      specificExercise: 'progressives-kaelte-protokoll'
    },
    badge: '❄️'
  },
  {
    id: 'rhythm-keeper',
    title: 'Rhythmus-Hüter',
    description: 'Du hast deinen zirkadianen Rhythmus gemeistert - Zeit ist dein Verbündeter!',
    icon: 'Clock',
    category: 'mastery',
    rarity: 'gold',
    criteria: {
      type: 'exercises_completed',
      target: 7,
      specificExercise: 'zirkadian'
    },
    badge: '⏰'
  },

  // Transformation Achievements
  {
    id: 'energy-awakening',
    title: 'Energie-Erwachen',
    description: 'Du spürst eine neue Energie in dir - deine Transformation hat begonnen!',
    icon: 'Zap',
    category: 'transformation',
    rarity: 'silver',
    criteria: {
      type: 'exercises_completed',
      target: 10
    },
    badge: '⚡'
  },
  {
    id: 'mind-body-unity',
    title: 'Geist-Körper-Einheit',
    description: 'Du hast Übungen aus allen Bereichen praktiziert - wahre ganzheitliche Integration!',
    icon: 'Heart',
    category: 'transformation',
    rarity: 'platinum',
    criteria: {
      type: 'areas_explored',
      target: 8
    },
    badge: '💎'
  },
  {
    id: 'resilience-builder',
    title: 'Resilienz-Architekt',
    description: 'Du baust systematisch deine Widerstandskraft auf - unerschütterlich wie ein Fels!',
    icon: 'Shield',
    category: 'transformation',
    rarity: 'gold',
    criteria: {
      type: 'exercises_completed',
      target: 50
    },
    badge: '🛡️'
  }
];

export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return achievements.filter(achievement => achievement.category === category);
};

export const getAchievementsByRarity = (rarity: Achievement['rarity']): Achievement[] => {
  return achievements.filter(achievement => achievement.rarity === rarity);
};

export const checkAchievements = (userStats: {
  streak: number;
  completedExercises: string[];
  exploredAreas: string[];
}): Achievement[] => {
  const earned: Achievement[] = [];

  achievements.forEach(achievement => {
    let isEarned = false;

    switch (achievement.criteria.type) {
      case 'streak':
        isEarned = userStats.streak >= achievement.criteria.target;
        break;
      case 'exercises_completed':
        if (achievement.criteria.specificExercise) {
          // Count exercises from specific category
          const categoryExercises = userStats.completedExercises.filter(ex => 
            ex.includes(achievement.criteria.specificExercise!)
          );
          isEarned = categoryExercises.length >= achievement.criteria.target;
        } else {
          isEarned = userStats.completedExercises.length >= achievement.criteria.target;
        }
        break;
      case 'areas_explored':
        isEarned = userStats.exploredAreas.length >= achievement.criteria.target;
        break;
      case 'specific_exercise':
        const exerciseCount = userStats.completedExercises.filter(ex => 
          ex === achievement.criteria.specificExercise
        ).length;
        isEarned = exerciseCount >= achievement.criteria.target;
        break;
    }

    if (isEarned) {
      earned.push(achievement);
    }
  });

  return earned;
};
