'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AchievementProgress, AchievementRarity } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import AchievementBadge from './achievement-badge';

interface AchievementProgressBarProps {
  achievementProgress: AchievementProgress;
  showBadge?: boolean;
  className?: string;
}

export default function AchievementProgressBar({ 
  achievementProgress, 
  showBadge = true,
  className 
}: AchievementProgressBarProps) {
  const { achievement, currentProgress, targetProgress, progressPercentage, isCompleted } = achievementProgress;

  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'common':
        return 'from-slate-400 to-slate-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityTextColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'common':
        return 'text-slate-600';
      case 'rare':
        return 'text-blue-600';
      case 'epic':
        return 'text-purple-600';
      case 'legendary':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Achievement Badge */}
        {showBadge && (
          <div className="flex-shrink-0">
            <AchievementBadge 
              achievement={achievement}
              isEarned={isCompleted}
              size="sm"
              showTooltip={false}
            />
          </div>
        )}

        {/* Progress Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {achievement.name}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {achievement.description}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className={cn("text-xs font-medium capitalize", getRarityTextColor(achievement.rarity))}>
                {achievement.rarity}
              </span>
              <span className="text-xs text-gray-500">
                {achievement.points} Punkte
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Fortschritt</span>
              <span>
                {currentProgress} / {targetProgress}
                {isCompleted && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 text-green-600 font-medium"
                  >
                    ✓ Abgeschlossen
                  </motion.span>
                )}
              </span>
            </div>
            
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
              {/* Custom gradient overlay for rarity */}
              <motion.div
                className={cn(
                  "absolute inset-0 h-2 rounded-full bg-gradient-to-r opacity-80",
                  getRarityColor(achievement.rarity)
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            {/* Progress percentage */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {Math.round(progressPercentage)}% abgeschlossen
              </span>
              
              {/* Estimated completion (if not completed and progress > 0) */}
              {!isCompleted && currentProgress > 0 && (
                <span className="text-xs text-gray-400">
                  {targetProgress - currentProgress} verbleibend
                </span>
              )}
            </div>
          </div>

          {/* Unlocks content preview */}
          {achievement.unlocksContent && achievement.unlocksContent.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Schaltet frei:</div>
              <div className="flex flex-wrap gap-1">
                {achievement.unlocksContent.map((content, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    🔓 {content.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}