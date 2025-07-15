'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Calendar } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  className?: string;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  lastActivityDate,
  className = ''
}: StreakCounterProps) {
  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'text-gray-400';
    if (streak < 3) return 'text-orange-500';
    if (streak < 7) return 'text-orange-600';
    if (streak < 14) return 'text-red-500';
    if (streak < 30) return 'text-red-600';
    return 'text-red-700';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Starte deine Streak!';
    if (streak === 1) return 'Großartiger Start! 🌱';
    if (streak < 7) return 'Du baust Momentum auf! 🔥';
    if (streak < 14) return 'Fantastische Konsistenz! 🚀';
    if (streak < 30) return 'Du bist auf Feuer! 🔥🔥';
    if (streak < 100) return 'Unglaubliche Disziplin! 🏆';
    return 'Wahre Meisterschaft! 👑';
  };

  const getFlameIntensity = (streak: number) => {
    if (streak === 0) return 0;
    if (streak < 3) return 1;
    if (streak < 7) return 2;
    if (streak < 14) return 3;
    if (streak < 30) return 4;
    return 5;
  };

  const flameIntensity = getFlameIntensity(currentStreak);

  const flameVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      opacity: 0.7,
    },
    burning: {
      scale: 1.1,
      rotate: 2,
      opacity: 1,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`organic-card p-6 ${className}`}
      data-testid="streak-counter"
    >
      <div className="text-center">
        {/* Flame Animation */}
        <motion.div
          className="relative mb-4 flex justify-center"
          variants={itemVariants}
        >
          <div className="relative">
            {/* Multiple flames for intensity */}
            {Array.from({ length: Math.max(1, flameIntensity) }).map((_, index) => (
              <motion.div
                key={index}
                variants={flameVariants}
                animate={currentStreak > 0 ? "burning" : "idle"}
                className={`absolute inset-0 ${getStreakColor(currentStreak)}`}
                style={{
                  transform: `scale(${1 - index * 0.1}) translateX(${index * 2}px)`,
                  zIndex: flameIntensity - index
                }}
              >
                <Flame 
                  size={48 + (flameIntensity * 4)} 
                  className="drop-shadow-lg"
                />
              </motion.div>
            ))}
            
            {/* Base flame */}
            <motion.div
              variants={flameVariants}
              animate={currentStreak > 0 ? "burning" : "idle"}
              className={getStreakColor(currentStreak)}
            >
              <Flame size={48} className="drop-shadow-lg" />
            </motion.div>
          </div>
        </motion.div>

        {/* Current Streak */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className={`text-4xl font-playfair font-bold ${getStreakColor(currentStreak)} mb-2`}>
            {currentStreak}
          </div>
          <div className="text-charcoal-600 text-sm font-medium mb-1">
            {currentStreak === 1 ? 'Tag Streak' : 'Tage Streak'}
          </div>
          <div className="text-xs text-charcoal-500">
            {getStreakMessage(currentStreak)}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center gap-6 pt-4 border-t border-gray-200"
        >
          {/* Longest Streak */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={16} className="text-gold-600 mr-1" />
              <span className="text-lg font-semibold text-gold-600">
                {longestStreak}
              </span>
            </div>
            <div className="text-xs text-charcoal-500">
              Beste Streak
            </div>
          </div>

          {/* Last Activity */}
          {lastActivityDate && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar size={16} className="text-forest-600 mr-1" />
                <span className="text-sm font-medium text-forest-600">
                  {lastActivityDate.toLocaleDateString('de-DE', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </span>
              </div>
              <div className="text-xs text-charcoal-500">
                Letzte Aktivität
              </div>
            </div>
          )}
        </motion.div>

        {/* Motivational Progress Bar */}
        {currentStreak > 0 && (
          <motion.div 
            variants={itemVariants}
            className="mt-4"
          >
            <div className="text-xs text-charcoal-500 mb-2">
              Nächstes Ziel: {currentStreak < 7 ? '7 Tage' : currentStreak < 30 ? '30 Tage' : '100 Tage'}
            </div>
            <div className="progress-bar h-2">
              <motion.div
                className={`h-full rounded-full ${
                  currentStreak < 7 ? 'bg-orange-500' :
                  currentStreak < 30 ? 'bg-red-500' : 'bg-red-700'
                }`}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(100, (currentStreak / (
                    currentStreak < 7 ? 7 : 
                    currentStreak < 30 ? 30 : 100
                  )) * 100)}%` 
                }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}