
'use client';

export interface UserProgress {
  streak: number;
  lastActivity: string;
  completedExercises: string[];
  exploredAreas: string[];
  achievements: string[];
  totalSessions: number;
  favoriteExercises: string[];
}

const STORAGE_KEY = 'human_body_manual_progress';

export const getProgressData = (): UserProgress => {
  if (typeof window === 'undefined') {
    return getDefaultProgress();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        ...getDefaultProgress(),
        ...data
      };
    }
  } catch (error) {
    console.error('Error loading progress data:', error);
  }

  return getDefaultProgress();
};

export const saveProgressData = (progress: UserProgress): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress data:', error);
  }
};

export const getDefaultProgress = (): UserProgress => ({
  streak: 0,
  lastActivity: '',
  completedExercises: [],
  exploredAreas: [],
  achievements: [],
  totalSessions: 0,
  favoriteExercises: []
});

export const markExerciseCompleted = (exerciseSlug: string, category: string): UserProgress => {
  const progress = getProgressData();
  const today = new Date().toDateString();

  // Add exercise to completed if not already there
  if (!progress.completedExercises.includes(exerciseSlug)) {
    progress.completedExercises.push(exerciseSlug);
  }

  // Add area to explored if not already there
  if (!progress.exploredAreas.includes(category)) {
    progress.exploredAreas.push(category);
  }

  // Update streak
  if (progress.lastActivity === today) {
    // Already did something today, don't change streak
  } else if (progress.lastActivity === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
    // Yesterday was last activity, increment streak
    progress.streak += 1;
  } else {
    // Reset streak to 1 for new start
    progress.streak = 1;
  }

  progress.lastActivity = today;
  progress.totalSessions += 1;

  saveProgressData(progress);
  return progress;
};

export const addToFavorites = (exerciseSlug: string): UserProgress => {
  const progress = getProgressData();
  
  if (!progress.favoriteExercises.includes(exerciseSlug)) {
    progress.favoriteExercises.push(exerciseSlug);
    saveProgressData(progress);
  }
  
  return progress;
};

export const removeFromFavorites = (exerciseSlug: string): UserProgress => {
  const progress = getProgressData();
  
  progress.favoriteExercises = progress.favoriteExercises.filter(slug => slug !== exerciseSlug);
  saveProgressData(progress);
  
  return progress;
};

export const earnAchievement = (achievementId: string): UserProgress => {
  const progress = getProgressData();
  
  if (!progress.achievements.includes(achievementId)) {
    progress.achievements.push(achievementId);
    saveProgressData(progress);
  }
  
  return progress;
};

export const getStreakColor = (streak: number): string => {
  if (streak >= 100) return 'text-purple-600';
  if (streak >= 30) return 'text-gold-600';
  if (streak >= 7) return 'text-orange-600';
  if (streak >= 3) return 'text-green-600';
  return 'text-gray-600';
};

export const getStreakEmoji = (streak: number): string => {
  if (streak >= 100) return '👑';
  if (streak >= 30) return '🏆';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '⭐';
  return '🌱';
};
