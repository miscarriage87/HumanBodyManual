
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Achievement, AchievementRarity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: Achievement;
  isEarned?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export default function AchievementBadge({ 
  achievement, 
  isEarned = false, 
  size = 'md',
  showTooltip = true,
  className
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl'
  };

  const getRarityStyle = (rarity: AchievementRarity) => {
    const baseStyle = "relative overflow-hidden rounded-full border-2 transition-all duration-300 flex items-center justify-center";
    
    switch (rarity) {
      case 'common':
        return `${baseStyle} bg-gradient-to-br from-slate-400 to-slate-600 border-slate-300 shadow-lg shadow-slate-400/30`;
      case 'rare':
        return `${baseStyle} bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-lg shadow-blue-400/40`;
      case 'epic':
        return `${baseStyle} bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300 shadow-lg shadow-purple-400/50`;
      case 'legendary':
        return `${baseStyle} bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-lg shadow-yellow-400/60`;
      default:
        return baseStyle;
    }
  };

  const getRarityGlow = (rarity: AchievementRarity) => {
    if (!isEarned) return '';
    
    switch (rarity) {
      case 'common':
        return 'shadow-slate-400/50';
      case 'rare':
        return 'shadow-blue-400/60';
      case 'epic':
        return 'shadow-purple-400/70';
      case 'legendary':
        return 'shadow-yellow-400/80';
      default:
        return '';
    }
  };

  return (
    <div className={cn("group relative", className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          getRarityStyle(achievement.rarity),
          sizeClasses[size],
          isEarned ? `opacity-100 ${getRarityGlow(achievement.rarity)}` : 'opacity-40 grayscale',
          'cursor-pointer'
        )}
      >
        {/* Badge Icon */}
        <div className="relative z-10 text-white font-bold text-center">
          <div className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'}>
            {achievement.badgeIcon}
          </div>
        </div>

        {/* Shimmer effect for earned badges */}
        {isEarned && (
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)',
                'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)',
              ],
              backgroundPosition: ['-100% -100%', '100% 100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 200%'
            }}
          />
        )}

        {/* Pulse effect for legendary achievements */}
        {isEarned && achievement.rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 border-2 border-yellow-300/50 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg max-w-xs">
            <div className="font-semibold mb-1">{achievement.name}</div>
            <div className="text-xs opacity-80 mb-1">
              {achievement.description}
            </div>
            <div className="flex items-center gap-1 text-xs opacity-70">
              <span className="capitalize">{achievement.rarity}</span>
              <span>•</span>
              <span>{achievement.points} Punkte</span>
            </div>
            
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
