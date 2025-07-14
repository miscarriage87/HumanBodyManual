'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BodyAreaStats } from '@/lib/types';

interface BodyAreaProgressCardsProps {
  bodyAreaStats: BodyAreaStats[];
  className?: string;
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
}

function CircularProgress({ 
  percentage, 
  size = 80, 
  strokeWidth = 8, 
  color = '#10b981',
  backgroundColor = '#e5e7eb'
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-charcoal-900">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

export default function BodyAreaProgressCards({ 
  bodyAreaStats, 
  className = '' 
}: BodyAreaProgressCardsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#f59e0b';
      case 'intermediate': return '#10b981';
      case 'advanced': return '#3b82f6';
      case 'expert': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getMasteryLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Anfänger';
      case 'intermediate': return 'Fortgeschritten';
      case 'advanced': return 'Experte';
      case 'expert': return 'Meister';
      default: return 'Unbekannt';
    }
  };

  const getMasteryIcon = (level: string) => {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      case 'expert': return '🏔️';
      default: return '⭐';
    }
  };

  const getBodyAreaIcon = (bodyArea: string) => {
    const iconMap: Record<string, keyof typeof Icons> = {
      'nervensystem': 'Brain',
      'hormone': 'Activity',
      'zirkadian': 'Sun',
      'mikrobiom': 'Zap',
      'bewegung': 'Dumbbell',
      'fasten': 'Clock',
      'kaelte': 'Snowflake',
      'licht': 'Lightbulb'
    };
    return iconMap[bodyArea] || 'Circle';
  };

  const getBodyAreaTitle = (bodyArea: string) => {
    const titleMap: Record<string, string> = {
      'nervensystem': 'Nervensystem',
      'hormone': 'Hormone',
      'zirkadian': 'Zirkadianer Rhythmus',
      'mikrobiom': 'Mikrobiom',
      'bewegung': 'Bewegung',
      'fasten': 'Fasten',
      'kaelte': 'Kälte',
      'licht': 'Licht'
    };
    return titleMap[bodyArea] || bodyArea;
  };

  const getBodyAreaColor = (bodyArea: string) => {
    const colorMap: Record<string, string> = {
      'nervensystem': '#8b5cf6',
      'hormone': '#f59e0b',
      'zirkadian': '#f97316',
      'mikrobiom': '#10b981',
      'bewegung': '#3b82f6',
      'fasten': '#06b6d4',
      'kaelte': '#0ea5e9',
      'licht': '#eab308'
    };
    return colorMap[bodyArea] || '#6b7280';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {bodyAreaStats.map((stats) => {
        const IconComponent = Icons[getBodyAreaIcon(stats.bodyArea)] as any;
        const areaColor = getBodyAreaColor(stats.bodyArea);
        const masteryColor = getMasteryColor(stats.masteryLevel);

        return (
          <motion.div
            key={stats.bodyArea}
            variants={cardVariants}
            className="organic-card p-6 hover:shadow-lg transition-shadow duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-lg shadow-sm"
                    style={{ backgroundColor: areaColor + '20', color: areaColor }}
                  >
                    <IconComponent size={20} />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-charcoal-900 text-sm">
                    {getBodyAreaTitle(stats.bodyArea)}
                  </h4>
                  <div className="text-xs text-charcoal-600">
                    {stats.totalSessions} Sitzungen
                  </div>
                </div>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center mb-4">
              <CircularProgress
                percentage={stats.completionRate}
                color={areaColor}
                size={80}
                strokeWidth={6}
              />
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {/* Mastery Level */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-600">Meisterschaft</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">{getMasteryIcon(stats.masteryLevel)}</span>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: masteryColor }}
                  >
                    {getMasteryLabel(stats.masteryLevel)}
                  </span>
                </div>
              </div>

              {/* Total Time */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-600">Gesamtzeit</span>
                <span className="text-xs font-medium text-charcoal-900">
                  {Math.round(stats.totalMinutes)} Min
                </span>
              </div>

              {/* Average Session */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-600">Ø Sitzung</span>
                <span className="text-xs font-medium text-charcoal-900">
                  {Math.round(stats.averageSessionDuration)} Min
                </span>
              </div>

              {/* Consistency Score */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-600">Konsistenz</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: areaColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.consistencyScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-charcoal-900">
                    {Math.round(stats.consistencyScore)}%
                  </span>
                </div>
              </div>

              {/* Last Practiced */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-charcoal-600">Zuletzt</span>
                <span className="text-xs font-medium text-charcoal-900">
                  {stats.lastPracticed.toLocaleDateString('de-DE', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </span>
              </div>
            </div>

            {/* Favorite Exercises Preview */}
            {stats.favoriteExercises.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-charcoal-600 mb-2">Favoriten</div>
                <div className="flex flex-wrap gap-1">
                  {stats.favoriteExercises.slice(0, 2).map((exercise, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-charcoal-700 rounded-full"
                    >
                      {exercise.length > 12 ? `${exercise.substring(0, 12)}...` : exercise}
                    </span>
                  ))}
                  {stats.favoriteExercises.length > 2 && (
                    <span className="inline-block px-2 py-1 text-xs text-charcoal-500 rounded-full">
                      +{stats.favoriteExercises.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}