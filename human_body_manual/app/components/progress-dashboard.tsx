
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getProgressData, getStreakColor, getStreakEmoji } from '@/lib/progress-tracker';
import { bodyAreas } from '@/data/body-areas';
import { exercises } from '@/data/exercises';
import { achievements, checkAchievements } from '@/data/achievements';
import AchievementBadge from './achievement-badge';

export default function ProgressDashboard() {
  const [progress, setProgress] = useState(getProgressData());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getProgressData());
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

  return (
    <div className="space-y-8">
      {/* Hauptstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="organic-card p-6 text-center"
        >
          <div className={`text-4xl font-playfair font-bold ${getStreakColor(progress.streak)} mb-2`}>
            {progress.streak}
          </div>
          <div className="text-charcoal-600 text-sm font-medium mb-2">
            Tage Streak {getStreakEmoji(progress.streak)}
          </div>
          <div className="text-xs text-charcoal-500">
            Kontinuität ist der Schlüssel
          </div>
        </motion.div>

        {/* Abgeschlossene Übungen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="organic-card p-6 text-center"
        >
          <div className="text-4xl font-playfair font-bold text-forest-600 mb-2">
            {completedExercises}
          </div>
          <div className="text-charcoal-600 text-sm font-medium mb-2">
            Übungen gemeistert ✨
          </div>
          <div className="text-xs text-charcoal-500">
            von {totalExercises} verfügbaren
          </div>
        </motion.div>

        {/* Erkundete Bereiche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="organic-card p-6 text-center"
        >
          <div className="text-4xl font-playfair font-bold text-ocher-600 mb-2">
            {progress.exploredAreas.length}
          </div>
          <div className="text-charcoal-600 text-sm font-medium mb-2">
            Bereiche erkundet 🗺️
          </div>
          <div className="text-xs text-charcoal-500">
            von {bodyAreas.length} Körperbereichen
          </div>
        </motion.div>

        {/* Errungenschaften */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="organic-card p-6 text-center"
        >
          <div className="text-4xl font-playfair font-bold text-gold-600 mb-2">
            {earnedAchievements.length}
          </div>
          <div className="text-charcoal-600 text-sm font-medium mb-2">
            Errungenschaften 🏆
          </div>
          <div className="text-xs text-charcoal-500">
            von {achievements.length} möglichen
          </div>
        </motion.div>
      </div>

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

      {/* Fortschritt nach Bereichen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="organic-card p-6"
      >
        <h3 className="font-playfair font-semibold text-xl text-charcoal-900 mb-6">
          📊 Fortschritt nach Körperbereichen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completionByArea.map((area, index) => {
            const IconComponent = Icons[area.icon as keyof typeof Icons] as any;
            
            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white/50 rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  {IconComponent && (
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-lg shadow-sm"
                      style={{ backgroundColor: area.color + '20', color: area.color }}
                    >
                      <IconComponent size={20} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-charcoal-900 text-sm">
                      {area.title}
                    </h4>
                    <div className="text-xs text-charcoal-600">
                      {area.completed} / {area.total} abgeschlossen
                    </div>
                  </div>
                </div>
                <div className="progress-bar h-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: area.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${area.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                  />
                </div>
                <div className="text-right text-xs text-charcoal-500 mt-1">
                  {Math.round(area.percentage)}%
                </div>
              </motion.div>
            );
          })}
        </div>
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
            {['bronze', 'silver', 'gold', 'platinum'].map(rarity => {
              const rarityAchievements = earnedAchievements.filter(a => a.rarity === rarity);
              
              if (rarityAchievements.length === 0) return null;
              
              return (
                <div key={rarity}>
                  <h4 className="font-semibold text-charcoal-800 mb-3 capitalize">
                    {rarity === 'bronze' && '🥉 Bronze'}
                    {rarity === 'silver' && '🥈 Silber'}
                    {rarity === 'gold' && '🥇 Gold'}
                    {rarity === 'platinum' && '💎 Platin'}
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

      {/* Letzte Aktivitäten */}
      {progress.completedExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="organic-card p-6"
        >
          <h3 className="font-playfair font-semibold text-xl text-charcoal-900 mb-4">
            📚 Kürzlich abgeschlossen
          </h3>
          <div className="space-y-2">
            {progress.completedExercises.slice(-5).reverse().map((exerciseSlug, index) => {
              const exercise = exercises.find(ex => ex.slug === exerciseSlug);
              if (!exercise) return null;
              
              const IconComponent = Icons[exercise.icon as keyof typeof Icons] as any;
              
              return (
                <div key={exerciseSlug} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  {IconComponent && (
                    <div className="flex items-center justify-center w-8 h-8 bg-forest-100 text-forest-600 rounded-lg">
                      <IconComponent size={16} />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="font-medium text-charcoal-900 text-sm">
                      {exercise.title}
                    </div>
                    <div className="text-xs text-charcoal-600">
                      {exercise.difficulty} • {exercise.duration}
                    </div>
                  </div>
                  <Icons.CheckCircle size={20} className="text-forest-500" />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
