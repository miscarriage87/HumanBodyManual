'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  UserProgress, 
  ProgressEntry, 
  Achievement, 
  ExerciseCompletion,
  BodyAreaType,
  DateRange 
} from '@/lib/types';

interface UseProgressTrackingReturn {
  userProgress: UserProgress | null;
  loading: boolean;
  error: string | null;
  recordCompletion: (exerciseData: ExerciseCompletion) => Promise<{
    progressEntry: ProgressEntry;
    newAchievements: Achievement[];
  }>;
  getProgressEntries: (timeRange?: DateRange, bodyArea?: BodyAreaType) => Promise<ProgressEntry[]>;
  refreshProgress: () => Promise<void>;
}

export function useProgressTracking(userId?: string): UseProgressTrackingReturn {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use mock user ID if none provided
  const effectiveUserId = userId || 'user-123';

  const loadUserProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/progress?userId=${effectiveUserId}`);
      if (!response.ok) {
        throw new Error('Failed to load progress');
      }
      const progress = await response.json();
      setUserProgress(progress);
    } catch (err) {
      console.error('Error loading user progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const recordCompletion = useCallback(async (exerciseData: ExerciseCompletion) => {
    try {
      // Record the completion
      const progressEntry = await ProgressTracker.recordCompletion(effectiveUserId, exerciseData);
      
      // Check for new achievements
      const newAchievements = await AchievementEngine.checkAchievements(effectiveUserId, progressEntry);
      
      // Refresh user progress
      await loadUserProgress();
      
      return { progressEntry, newAchievements };
    } catch (err) {
      console.error('Error recording completion:', err);
      throw err;
    }
  }, [effectiveUserId, loadUserProgress]);

  const getProgressEntries = useCallback(async (timeRange?: DateRange, bodyArea?: BodyAreaType) => {
    try {
      return await ProgressTracker.getProgressEntries(effectiveUserId, timeRange, bodyArea);
    } catch (err) {
      console.error('Error getting progress entries:', err);
      throw err;
    }
  }, [effectiveUserId]);

  const refreshProgress = useCallback(async () => {
    await loadUserProgress();
  }, [loadUserProgress]);

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  return {
    userProgress,
    loading,
    error,
    recordCompletion,
    getProgressEntries,
    refreshProgress,
  };
}

// Hook for exercise-specific progress
export function useExerciseProgress(exerciseId: string, bodyArea: BodyAreaType, userId?: string) {
  const [exerciseProgress, setExerciseProgress] = useState<{
    completionCount: number;
    lastCompleted?: Date;
    averageDuration: number;
    isCompleted: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const effectiveUserId = userId || 'user-123';

  const loadExerciseProgress = useCallback(async () => {
    try {
      setLoading(true);
      const progressEntries = await ProgressTracker.getProgressEntries(
        effectiveUserId,
        undefined,
        bodyArea
      );

      const exerciseEntries = progressEntries.filter(entry => entry.exerciseId === exerciseId);
      
      if (exerciseEntries.length > 0) {
        const totalDuration = exerciseEntries.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0);
        const averageDuration = totalDuration / exerciseEntries.length;
        const lastCompleted = exerciseEntries[0]?.completedAt;

        setExerciseProgress({
          completionCount: exerciseEntries.length,
          lastCompleted,
          averageDuration,
          isCompleted: exerciseEntries.length > 0,
        });
      } else {
        setExerciseProgress({
          completionCount: 0,
          averageDuration: 0,
          isCompleted: false,
        });
      }
    } catch (error) {
      console.error('Error loading exercise progress:', error);
      setExerciseProgress({
        completionCount: 0,
        averageDuration: 0,
        isCompleted: false,
      });
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, exerciseId, bodyArea]);

  useEffect(() => {
    loadExerciseProgress();
  }, [loadExerciseProgress]);

  return { exerciseProgress, loading, refreshProgress: loadExerciseProgress };
}