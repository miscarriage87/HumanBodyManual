'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ProgressTracker } from '@/lib/progress-tracker';
import { bodyAreas } from '@/data/body-areas';
import { exercises } from '@/data/exercises';
import { initialAchievements } from '@/data/achievements';
import AchievementBadge from '../achievement-badge';
import CalendarHeatmapComponent from './calendar-heatmap';
import StreakCounter from './streak-counter';
import BodyAreaProgressCards from './body-area-progress-cards';
import RecentActivityFeed from './recent-activity-feed';
import MobileAchievementCelebration, { MobileAchievementToast } from '../mobile-achievement-celebration';
import { OfflineStatusIndicator } from '../offline-status-indicator';
import { useMobileAchievements, useAchievementSharing } from '@/hooks/use-mobile-achievements';
import { BodyAreaStats, ProgressEntry } from '@/lib/types';

interface MobileProgressDashboardProps {
  className?: string;
}

type ViewMode = 'overview' | 'progress' | 'achievements' | 'activity';

// Mock functions for demo purposes
const getProgressData = () => ({
  streak: 5,
  completedExercises: ['breathing-basics', 'cold-shower', 'morning-light'],
  exploredAreas: ['nervensystem', 'kaelte', 'licht']
});

const checkAchievements = (data: any) => {
  return initialAchievements.slice(0, 3).map((achievement, index) => ({
    ...achievement,
    id: `achievement-${index}`,
    createdAt: new Date()
  }));
};

export default function MobileProgressDashboard({ className = '' }: MobileProgressDashboardProps) {
  const [progress, setProgress] = useState(getProgressData());
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Mobile achievements and offline functionality
  const { 
    notifications, 
    showAchievementModal, 
    showAchievementToast, 
    dismissNotification 
  } = useMobileAchievements();
  const { shareAchievement } = useAchievementSharing();

  useEffect(() => {
    setMounted(true);
    setProgress(getProgressData());
  }, []);

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const views: ViewMode[] = ['overview', 'progress', 'achievements', 'activity'];
    const currentIndex = views.indexOf(activeView);

    if (isLeftSwipe && currentIndex < views.length - 1) {
      setActiveView(views[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveView(views[currentIndex - 1]);
    }
  };

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        <div className="h-20 bg-gray-200 rounded-xl"></div>
        <div className="h-40 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const earnedAchievements = checkAchievements({
    streak: progress.streak,
    completedExercises: progress.completedExercises,
    exploredAreas: progress.exploredAreas
  });

  const totalExercises = exercises.length;
  const completedExercises = progress.completedExercises.length;
  const overallProgress = (completedExercises / totalExercises) * 100;

  // Generate mock data
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

  const renderTabBar = () => (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-2">
      <div className="flex justify-between items-center">
        {[
          { key: 'overview', icon: 'Home', label: 'Übersicht' },
          { key: 'progress', icon: 'TrendingUp', label: 'Fortschritt' },
          { key: 'achievements', icon: 'Award', label: 'Erfolge' },
          { key: 'activity', icon: 'Activity', label: 'Aktivität' }
        ].map(({ key, icon, label }) => {
          const IconComponent = Icons[icon as keyof typeof Icons] as any;
          const isActive = activeView === key;
          
          return (
            <button
              key={key}
              onClick={() => setActiveView(key as ViewMode)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive 
                  ? 'bg-forest-100 text-forest-700' 
                  : 'text-charcoal-600 hover:bg-gray-100'
              }`}
            >
              <IconComponent size={20} />
              <span className="text-xs font-medium truncate">{label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Swipe indicator */}
      <div className="flex justify-center mt-2">
        <div className="flex gap-1">
          {['overview', 'progress', 'achievements', 'activity'].map((view, index) => (
            <div
              key={view}
              className={`w-2 h-1 rounded-full transition-all duration-200 ${
                activeView === view ? 'bg-forest-600 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6 p-4">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="organic-card p-4 text-center"
        >
          <div className="text-2xl font-playfair font-bold text-forest-600 mb-1">
            {progress.streak}
          </div>
          <div className="text-sm text-charcoal-600">Tage Streak 🔥</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="organic-card p-4 text-center"
        >
          <div className="text-2xl font-playfair font-bold text-gold-600 mb-1">
            {completedExercises}
          </div>
          <div className="text-sm text-charcoal-600">Übungen ✨</div>
        </motion.div>
      </div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="organic-card p-4"
      >
        <h3 className="font-playfair font-semibold text-lg text-charcoal-900 mb-3">
          🌟 Gesamtfortschritt
        </h3>
        <div className="mb-3">
          <div className="flex justify-between text-sm text-charcoal-600 mb-2">
            <span>Abgeschlossen</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="progress-bar h-3">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>
        <div className="text-sm text-charcoal-600 text-center">
          {overallProgress < 25 && "🌱 Du beginnst deine Reise!"}
          {overallProgress >= 25 && overallProgress < 50 && "🌿 Tolle Fortschritte!"}
          {overallProgress >= 50 && overallProgress < 75 && "🌳 Du wirst zum Experten!"}
          {overallProgress >= 75 && "🏔️ Meisterhafte Leistung!"}
        </div>
      </motion.div>

      {/* Recent Achievements */}
      {earnedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="organic-card p-4"
        >
          <h3 className="font-playfair font-semibold text-lg text-charcoal-900 mb-3">
            🏆 Neueste Erfolge
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {earnedAchievements.slice(0, 3).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex-shrink-0"
              >
                <AchievementBadge
                  achievement={achievement}
                  isEarned={true}
                  size="sm"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6 p-4">
      {/* Calendar Heatmap - Mobile Optimized */}
      <div className="organic-card p-4">
        <h3 className="font-playfair font-semibold text-lg text-charcoal-900 mb-3">
          📅 Aktivität
        </h3>
        <div className="overflow-x-auto">
          <CalendarHeatmapComponent
            values={heatmapData}
            startDate={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)}
            endDate={new Date()}
          />
        </div>
      </div>

      {/* Body Area Progress - Mobile Grid */}
      <div className="organic-card p-4">
        <h3 className="font-playfair font-semibold text-lg text-charcoal-900 mb-3">
          📊 Bereiche
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {bodyAreaStats.slice(0, 4).map((stats) => (
            <div key={stats.bodyArea} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-forest-600 mb-1">
                {Math.round(stats.completionRate)}%
              </div>
              <div className="text-xs text-charcoal-600 capitalize">
                {stats.bodyArea.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="organic-card p-4"
      >
        <h3 className="font-playfair font-semibold text-lg text-charcoal-900 mb-4">
          🏆 Deine Errungenschaften
        </h3>
        
        {earnedAchievements.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {earnedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <AchievementBadge
                  achievement={achievement}
                  isEarned={true}
                  size="md"
                />
                <div className="mt-2 text-xs text-charcoal-600 font-medium">
                  {achievement.name}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌱</div>
            <h4 className="font-playfair font-semibold text-charcoal-800 mb-2">
              Erste Schritte
            </h4>
            <p className="text-charcoal-600 text-sm">
              Vervollständige Übungen für Erfolge!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderActivity = () => (
    <div className="p-4">
      <RecentActivityFeed 
        activities={recentActivities}
        maxItems={10}
        mobileOptimized={true}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'progress':
        return renderProgress();
      case 'achievements':
        return renderAchievements();
      case 'activity':
        return renderActivity();
      default:
        return renderOverview();
    }
  };

  return (
    <div 
      className={`mobile-progress-dashboard ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderTabBar()}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen pb-20"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Achievement Notifications */}
      {notifications.map((notification) => {
        if (notification.type === 'modal') {
          return (
            <MobileAchievementCelebration
              key={notification.id}
              achievement={notification.achievement}
              isVisible={true}
              onClose={() => dismissNotification(notification.id)}
              onShare={() => shareAchievement(notification.achievement)}
            />
          );
        } else {
          return (
            <MobileAchievementToast
              key={notification.id}
              achievement={notification.achievement}
              isVisible={true}
              onClose={() => dismissNotification(notification.id)}
              onClick={() => {
                dismissNotification(notification.id);
                showAchievementModal(notification.achievement);
              }}
            />
          );
        }
      })}

      {/* Offline Status Indicator */}
      <OfflineStatusIndicator />

      {/* Swipe hint for first-time users */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-charcoal-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
        ← Wischen zum Navigieren →
      </div>
    </div>
  );
}