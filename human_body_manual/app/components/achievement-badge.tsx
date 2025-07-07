
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Achievement } from '@/data/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  isEarned?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export default function AchievementBadge({ 
  achievement, 
  isEarned = false, 
  size = 'md',
  showTooltip = true 
}: AchievementBadgeProps) {
  const IconComponent = Icons[achievement.icon as keyof typeof Icons] as any;

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl'
  };

  const getRarityStyle = (rarity: Achievement['rarity']) => {
    const baseStyle = "achievement-badge relative overflow-hidden transition-all duration-300";
    
    switch (rarity) {
      case 'bronze':
        return `${baseStyle} bronze shadow-[0_4px_15px_rgba(205,127,50,0.4)]`;
      case 'silver':
        return `${baseStyle} silver shadow-[0_4px_15px_rgba(192,192,192,0.4)]`;
      case 'gold':
        return `${baseStyle} gold shadow-[0_4px_15px_rgba(255,215,0,0.6)]`;
      case 'platinum':
        return `${baseStyle} platinum shadow-[0_4px_15px_rgba(229,228,226,0.6)]`;
      default:
        return baseStyle;
    }
  };

  const getCategoryEmoji = (category: Achievement['category']) => {
    switch (category) {
      case 'consistency':
        return '🔥';
      case 'exploration':
        return '🗺️';
      case 'mastery':
        return '⚡';
      case 'transformation':
        return '✨';
      default:
        return '🏆';
    }
  };

  return (
    <div className="group relative">
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`${getRarityStyle(achievement.rarity)} ${sizeClasses[size]} ${
          isEarned ? 'opacity-100' : 'opacity-30 grayscale'
        }`}
      >
        {/* Hauptinhalt */}
        <div className="relative z-10 flex items-center justify-center w-full h-full text-white font-bold">
          <div className="text-center">
            <div className="text-2xl mb-1">{achievement.badge}</div>
            {size === 'lg' && (
              <div className="text-xs opacity-80 font-medium">
                {getCategoryEmoji(achievement.category)}
              </div>
            )}
          </div>
        </div>

        {/* Glitzer-Effekt für earned badges */}
        {isEarned && (
          <>
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.8) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.8) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 0%, transparent 50%)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50" />
          </>
        )}

        {/* Neue Achievement Pulse */}
        {isEarned && (
          <motion.div
            className="absolute inset-0 border-2 border-white/50 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
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
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="bg-charcoal-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
            <div className="font-semibold mb-1">{achievement.title}</div>
            <div className="text-xs opacity-80 max-w-xs">
              {achievement.description}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
              <span className="capitalize">{achievement.rarity}</span>
              <span>•</span>
              <span className="capitalize">{achievement.category}</span>
            </div>
            
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-charcoal-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
