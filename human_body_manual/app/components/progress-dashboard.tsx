
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ProgressTracker } from '@/lib/progress-tracker';
import { bodyAreas } from '@/data/body-areas';
import { exercises } from '@/data/exercises';
import { initialAchievements } from '@/data/achievements';
import AchievementBadge from './achievement-badge';
import CalendarHeatmapComponent from './progress/calendar-heatmap';
import StreakCounter from './progress/streak-counter';
import BodyAreaProgressCards from './progress/body-area-progress-cards';
import RecentActivityFeed from './progress/recent-activity-feed';
import MobileProgressDashboard from './progress/mobile-progress-dashboard';
import { BodyAreaStats, ProgressEntry } from '@/lib/types';

// Mock functions for demo purposes
const getProgressData = () => ({
  streak: 5,
  completedExercises: ['breathing-basics', 'cold-shower', 'morning-light'],
  exploredAreas: ['nervensystem', 'kaelte', 'licht']
});

const checkAchievements = (data: any) => {
  // Mock achievement checking - return some sample achievements
  return initialAchievements.slice(0, 3).map((achievement, index) => ({
    ...achievement,
    id: `achievement-${index}`,
    createdAt: new Date()
  }));
};

export default function ProgressDashboard() {
  const [progress, setProgress] = useState(getProgressData());
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getProgressData());
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const earnedAchievements = checkAchievements({
    streak: progress.streak,
    completedExercises: progress.completedExercises,
    exploredAreas: progress.exploredAreas
  });

  const completionByArea = bodyAreas.map(area => {
    const areaExercises = exercises.filter(ex => ex.category === area.id);
    const completedInArea = progress.completedExercises.filter(ex => 
      areaExercises.some(ae => ae.slug === ex)
    ).length;
    
    return {
      ...area,
      completed: completedInArea,
      total: areaExercises.length,
      percentage: areaExercises.length > 0 ? (completedInArea / areaExercises.length) * 100 : 0
    };
  });

  const totalExercises = exercises.length;
  const completedExercises = progress.completedExercises.length;
  const overallProgress = (completedExercises / totalExercises) * 100;

  // Generate mock data for the new components
  const generateHeatmapData = () => {
    const data = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 90);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      data.push({
        date: d.toISOString().split('T')[0],
        count: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0
      });
    }
    return data;
  };

  const generateBodyAreaStats = (): BodyAreaStats[] => {
    return bodyAreas.map(area => ({
      bodyArea: area.id as any,
      totalSessions: Math.floor(Math.random() * 50) + 10,
      totalMinutes: Math.floor(Math.random() * 1000) + 200,
      averageSessionDuration: Math.floor(Math.random() * 30) + 15,
      completionRate: Math.floor(Math.random() * 100),
      lastPracticed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      favoriteExercises: exercises
        .filter(ex => ex.category === area.id)
        .slice(0, 3)
        .map(ex => ex.title),
      consistencyScore: Math.floor(Math.random() * 100),
      masteryLevel: ['beginner', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)] as any
    }));
  };

  const generateRecentActivities = (): ProgressEntry[] => {
    return progress.completedExercises.slice(-10).map((exerciseSlug, index) => {
      const exercise = exercises.find(ex => ex.slug === exerciseSlug);
      const bodyArea = bodyAreas.find(area => area.id === exercise?.category);
      
      return {
        id: `activity-${index}`,
        userId: 'user-1',
        exerciseId: exercise?.title || exerciseSlug,
        bodyArea: (bodyArea?.id || 'bewegung') as any,
        completedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
        durationMinutes: Math.floor(Math.random() * 45) + 15,
        difficultyLevel: exercise?.difficulty || 'Anfänger' as any,
        sessionNotes: Math.random() > 0.7 ? 'Großartige Session heute!' : undefined,
        mood: ['sehr_gut', 'gut', 'neutral'][Math.floor(Math.random() * 3)] as any,
        energyLevel: ['hoch', 'normal', 'sehr_hoch'][Math.floor(Math.random() * 3)] as any,
        createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
      };
    });
  };

  const heatmapData = generateHeatmapData();
  const bodyAreaStats = generateBodyAreaStats();
  const recentActivities = generateRecentActivities();

  // Render mobile-optimized dashboard on mobile devices
  if (isMobile) {
    return <MobileProgressDashboard />;
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Streak Counter with Flame Animation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StreakCounter
          currentStreak={progress.streak}
          longestStreak={Math.max(progress.streak, 15)} // Mock longest streak
          lastActivityDate={new Date()}
          className="lg:col-span-1"
        />
        
        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="organic-card p-6 text-center"
          >
            <div className="text-3xl font-playfair font-bold text-forest-600 mb-2">
              {completedExercises}
            </div>
            <div className="text-charcoal-600 text-sm font-medium mb-1">
              Übungen gemeistert ✨
            </div>
            <div className="text-xs text-charcoal-500">
              von {totalExercises} verfügbaren
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="organic-card p-6 text-center"
          >
            <div className="text-3xl font-playfair font-bold text-gold-600 mb-2">
              {earnedAchievements.length}
            </div>
            <div className="text-charcoal-600 text-sm font-medium mb-1">
              Errungenschaften 🏆
            </div>
            <div className="text-xs text-charcoal-500">
              von {initialAchievements.length} möglichen
            </div>
          </motion.div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <CalendarHeatmapComponent
        values={heatmapData}
        startDate={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)}
        endDate={new Date()}
      />

      {/* Gesamtfortschritt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="organic-card p-6"
      >
        <h3 className="font-playfair font-semibold text-xl text-charcoal-900 mb-4">
          🌟 Deine Transformation
        </h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-charcoal-600 mb-2">
            <span>Gesamtfortschritt</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="progress-bar h-3">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
        <div className="text-sm text-charcoal-600 text-center">
          {overallProgress < 25 && "🌱 Du beginnst deine Reise - jeder Schritt zählt!"}
          {overallProgress >= 25 && overallProgress < 50 && "🌿 Du entwickelst wunderbare Gewohnheiten!"}
          {overallProgress >= 50 && overallProgress < 75 && "🌳 Deine Transformation nimmt Gestalt an!"}
          {overallProgress >= 75 && "🏔️ Du bist ein wahrer Meister geworden!"}
        </div>
      </motion.div>

      {/* Enhanced Body Area Progress Cards with Circular Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="mb-6">
          <h3 className="font-playfair font-semibold text-xl text-charcoal-900 mb-2">
            📊 Fortschritt nach Körperbereichen
          </h3>
          <p className="text-sm text-charcoal-600">
            Detaillierte Einblicke in deine Praxis in jedem Bereich
          </p>
        </div>
        <BodyAreaProgressCards bodyAreaStats={bodyAreaStats} />
      </motion.div>

      {/* Errungenschaften */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="organic-card p-6"
      >
        <h3 className="font-playfair font-semibold text-xl text-charcoal-900 mb-6">
          🏆 Deine Errungenschaften
        </h3>
        
        {earnedAchievements.length > 0 ? (
          <div className="space-y-6">
            {['common', 'rare', 'epic', 'legendary'].map(rarity => {
              const rarityAchievements = earnedAchievements.filter(a => a.rarity === rarity);
              
              if (rarityAchievements.length === 0) return null;
              
              return (
                <div key={rarity}>
                  <h4 className="font-semibold text-charcoal-800 mb-3 capitalize">
                    {rarity === 'common' && '🥉 Häufig'}
                    {rarity === 'rare' && '🥈 Selten'}
                    {rarity === 'epic' && '🥇 Episch'}
                    {rarity === 'legendary' && '💎 Legendär'}
                    <span className="ml-2 text-sm font-normal text-charcoal-600">
                      ({rarityAchievements.length})
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {rarityAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <AchievementBadge
                          achievement={achievement}
                          isEarned={true}
                          size="md"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌱</div>
            <h4 className="font-playfair font-semibold text-charcoal-800 mb-2">
              Deine Reise beginnt
            </h4>
            <p className="text-charcoal-600 text-sm">
              Vervollständige deine erste Übung, um deine erste Errungenschaft zu verdienen!
            </p>
          </div>
        )}
      </motion.div>

      {/* Enhanced Recent Activity Feed */}
      <RecentActivityFeed 
        activities={recentActivities}
        maxItems={8}
      />
    </div>
  );
}
