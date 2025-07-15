'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ProgressEntry } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface RecentActivityFeedProps {
  activities: ProgressEntry[];
  maxItems?: number;
  className?: string;
  mobileOptimized?: boolean;
}

export default function RecentActivityFeed({ 
  activities, 
  maxItems = 10,
  className = '',
  mobileOptimized = false
}: RecentActivityFeedProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'anfänger': return 'text-green-600 bg-green-100';
      case 'fortgeschritten': return 'text-orange-600 bg-orange-100';
      case 'experte': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'sehr_gut': return '😊';
      case 'gut': return '🙂';
      case 'neutral': return '😐';
      case 'schlecht': return '😕';
      case 'sehr_schlecht': return '😞';
      default: return '';
    }
  };

  const getEnergyEmoji = (energy?: string) => {
    switch (energy) {
      case 'sehr_hoch': return '⚡⚡';
      case 'hoch': return '⚡';
      case 'normal': return '🔋';
      case 'niedrig': return '🪫';
      case 'sehr_niedrig': return '💤';
      default: return '';
    }
  };

  const recentActivities = activities
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, maxItems);

  if (recentActivities.length === 0) {
    return (
      <div className={`organic-card p-6 ${className}`}>
        <h3 className="font-playfair font-semibold text-lg text-charcoal-900 mb-4">
          📚 Letzte Aktivitäten
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🌱</div>
          <h4 className="font-semibold text-charcoal-800 mb-2">
            Noch keine Aktivitäten
          </h4>
          <p className="text-charcoal-600 text-sm">
            Beginne deine erste Übung, um deinen Fortschritt zu verfolgen!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`organic-card ${mobileOptimized ? 'p-4' : 'p-6'} ${className}`} data-testid="recent-activity-feed">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-playfair font-semibold ${mobileOptimized ? 'text-base' : 'text-lg'} text-charcoal-900`}>
          📚 Letzte Aktivitäten
        </h3>
        {!mobileOptimized && (
          <span className="text-sm text-charcoal-500">
            {recentActivities.length} von {activities.length}
          </span>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {recentActivities.map((activity, index) => {
          const IconComponent = Icons[getBodyAreaIcon(activity.bodyArea)] as any;
          const areaColor = getBodyAreaColor(activity.bodyArea);
          const timeAgo = formatDistanceToNow(new Date(activity.completedAt), { 
            addSuffix: true, 
            locale: de 
          });

          return (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              className={`flex items-start ${mobileOptimized ? 'gap-3 p-3' : 'gap-4 p-4'} bg-white/50 rounded-xl border border-white/20 hover:bg-white/70 transition-colors duration-200`}
            >
              {/* Icon */}
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-lg shadow-sm flex-shrink-0"
                style={{ backgroundColor: areaColor + '20', color: areaColor }}
              >
                {IconComponent && <IconComponent size={20} />}
              </div>

              {/* Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-grow">
                    <h4 className="font-medium text-charcoal-900 text-sm mb-1">
                      {activity.exerciseId}
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-charcoal-600">
                        {getBodyAreaTitle(activity.bodyArea)}
                      </span>
                      <span className="text-xs text-charcoal-400">•</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(activity.difficultyLevel)}`}>
                        {activity.difficultyLevel}
                      </span>
                    </div>
                  </div>
                  
                  {/* Time and Duration */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-charcoal-500 mb-1">
                      {timeAgo}
                    </div>
                    {activity.durationMinutes && (
                      <div className="text-xs text-charcoal-600 font-medium">
                        {activity.durationMinutes} Min
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Mood and Energy */}
                    {(activity.mood || activity.energyLevel) && (
                      <div className="flex items-center gap-2">
                        {activity.mood && (
                          <span className="text-sm" title={`Stimmung: ${activity.mood}`}>
                            {getMoodEmoji(activity.mood)}
                          </span>
                        )}
                        {activity.energyLevel && (
                          <span className="text-sm" title={`Energie: ${activity.energyLevel}`}>
                            {getEnergyEmoji(activity.energyLevel)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Session Notes Indicator */}
                    {activity.sessionNotes && (
                      <div className="flex items-center gap-1">
                        <Icons.FileText size={12} className="text-charcoal-400" />
                        <span className="text-xs text-charcoal-500">Notizen</span>
                      </div>
                    )}

                    {/* Biometric Data Indicator */}
                    {activity.biometricData && (
                      <div className="flex items-center gap-1">
                        <Icons.Activity size={12} className="text-charcoal-400" />
                        <span className="text-xs text-charcoal-500">Biometrik</span>
                      </div>
                    )}
                  </div>

                  {/* Completion Check */}
                  <Icons.CheckCircle size={16} className="text-forest-500 flex-shrink-0" />
                </div>

                {/* Session Notes Preview */}
                {activity.sessionNotes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-charcoal-600 italic">
                      "{activity.sessionNotes.length > 80 
                        ? `${activity.sessionNotes.substring(0, 80)}...` 
                        : activity.sessionNotes}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Show More Button */}
      {activities.length > maxItems && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4"
        >
          <button className="text-sm text-forest-600 hover:text-forest-700 font-medium transition-colors duration-200">
            Alle {activities.length} Aktivitäten anzeigen
          </button>
        </motion.div>
      )}
    </div>
  );
}