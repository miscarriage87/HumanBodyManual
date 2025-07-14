'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AchievementProgress, AchievementCategory, AchievementRarity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AchievementBadge from './achievement-badge';
import AchievementProgressBar from './achievement-progress-bar';
import { cn } from '@/lib/utils';

interface AchievementGalleryProps {
  achievements: AchievementProgress[];
  className?: string;
}

type FilterType = 'all' | 'earned' | 'available' | 'in-progress';
type SortType = 'rarity' | 'progress' | 'points' | 'category';

export default function AchievementGallery({ 
  achievements, 
  className 
}: AchievementGalleryProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('rarity');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  // Statistics
  const stats = useMemo(() => {
    const earned = achievements.filter(a => a.isCompleted);
    const inProgress = achievements.filter(a => !a.isCompleted && a.currentProgress > 0);
    const totalPoints = earned.reduce((sum, a) => sum + a.achievement.points, 0);
    
    return {
      total: achievements.length,
      earned: earned.length,
      inProgress: inProgress.length,
      available: achievements.length - earned.length,
      totalPoints,
      completionRate: Math.round((earned.length / achievements.length) * 100)
    };
  }, [achievements]);

  // Filter and sort achievements
  const filteredAndSortedAchievements = useMemo(() => {
    let filtered = achievements;

    // Apply filter
    switch (filter) {
      case 'earned':
        filtered = achievements.filter(a => a.isCompleted);
        break;
      case 'available':
        filtered = achievements.filter(a => !a.isCompleted);
        break;
      case 'in-progress':
        filtered = achievements.filter(a => !a.isCompleted && a.currentProgress > 0);
        break;
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.achievement.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          const rarityOrder = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
          return rarityOrder[b.achievement.rarity] - rarityOrder[a.achievement.rarity];
        case 'progress':
          return b.progressPercentage - a.progressPercentage;
        case 'points':
          return b.achievement.points - a.achievement.points;
        case 'category':
          return a.achievement.category.localeCompare(b.achievement.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [achievements, filter, sortBy, selectedCategory]);

  const categories: (AchievementCategory | 'all')[] = [
    'all', 'consistency', 'mastery', 'milestone', 'community', 'special'
  ];

  const getCategoryLabel = (category: AchievementCategory | 'all') => {
    switch (category) {
      case 'all': return 'Alle';
      case 'consistency': return 'Beständigkeit';
      case 'mastery': return 'Meisterschaft';
      case 'milestone': return 'Meilensteine';
      case 'community': return 'Community';
      case 'special': return 'Besondere';
      default: return category;
    }
  };

  const getRarityBadgeColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'common': return 'bg-slate-100 text-slate-700';
      case 'rare': return 'bg-blue-100 text-blue-700';
      case 'epic': return 'bg-purple-100 text-purple-700';
      case 'legendary': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Statistics Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Achievement Galerie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.earned}</div>
              <div className="text-sm text-gray-600">Erhalten</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Arbeit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600">Punkte</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600">Abgeschlossen</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Alle ({achievements.length})</TabsTrigger>
              <TabsTrigger value="earned">Erhalten ({stats.earned})</TabsTrigger>
              <TabsTrigger value="in-progress">In Arbeit ({stats.inProgress})</TabsTrigger>
              <TabsTrigger value="available">Verfügbar ({stats.available})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2 mt-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {getCategoryLabel(category)}
                </Button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="ml-auto flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md"
              >
                <option value="rarity">Nach Seltenheit</option>
                <option value="progress">Nach Fortschritt</option>
                <option value="points">Nach Punkten</option>
                <option value="category">Nach Kategorie</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Grid */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredAndSortedAchievements.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 text-lg mb-2">🏆</div>
              <div className="text-gray-600">Keine Achievements in dieser Kategorie gefunden.</div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredAndSortedAchievements.map((achievementProgress, index) => (
                <motion.div
                  key={achievementProgress.achievementId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {achievementProgress.isCompleted ? (
                    // Completed Achievement Card
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <AchievementBadge
                            achievement={achievementProgress.achievement}
                            isEarned={true}
                            size="md"
                            showTooltip={false}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {achievementProgress.achievement.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {achievementProgress.achievement.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge className={getRarityBadgeColor(achievementProgress.achievement.rarity)}>
                                  {achievementProgress.achievement.rarity}
                                </Badge>
                                <Badge variant="outline">
                                  {achievementProgress.achievement.points} Punkte
                                </Badge>
                              </div>
                            </div>
                            
                            {achievementProgress.achievement.unlocksContent && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {achievementProgress.achievement.unlocksContent.map((content, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700"
                                  >
                                    🔓 {content.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // In-Progress Achievement
                    <AchievementProgressBar
                      achievementProgress={achievementProgress}
                      showBadge={true}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}