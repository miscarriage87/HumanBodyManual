'use client';

import React, { useState } from 'react';
import { Achievement, AchievementProgress } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AchievementBadge from '@/components/achievement-badge';
import AchievementProgressBar from '@/components/achievement-progress-bar';
import AchievementCelebrationModal from '@/components/achievement-celebration-modal';
import AchievementGallery from '@/components/achievement-gallery';

// Mock data for testing
const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'Erster Schritt',
    description: 'Vervollständige deine erste Übung',
    category: 'milestone',
    criteria: { type: 'total_sessions', target: 1, timeframe: 'all_time' },
    badgeIcon: '🌱',
    points: 10,
    rarity: 'common',
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Consistency Warrior',
    description: 'Praktiziere 7 Tage in Folge',
    category: 'consistency',
    criteria: { type: 'streak', target: 7, timeframe: 'daily' },
    badgeIcon: '🔥',
    points: 50,
    rarity: 'rare',
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Unaufhaltsam',
    description: 'Erreiche eine 30-Tage Streak',
    category: 'consistency',
    criteria: { type: 'streak', target: 30, timeframe: 'daily' },
    badgeIcon: '⚡',
    points: 200,
    rarity: 'epic',
    unlocksContent: ['advanced_techniques'],
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'Legende der Beständigkeit',
    description: 'Halte eine 100-Tage Streak aufrecht',
    category: 'consistency',
    criteria: { type: 'streak', target: 100, timeframe: 'daily' },
    badgeIcon: '👑',
    points: 500,
    rarity: 'legendary',
    unlocksContent: ['master_techniques', 'exclusive_content'],
    createdAt: new Date()
  },
  {
    id: '5',
    name: 'Nervensystem Novize',
    description: 'Vervollständige 10 Nervensystem-Übungen',
    category: 'mastery',
    criteria: { type: 'body_area_mastery', target: 10, bodyArea: 'nervensystem', timeframe: 'all_time' },
    badgeIcon: '🧠',
    points: 30,
    rarity: 'common',
    createdAt: new Date()
  }
];

const mockAchievementProgress: AchievementProgress[] = [
  {
    achievementId: '1',
    achievement: mockAchievements[0],
    currentProgress: 1,
    targetProgress: 1,
    progressPercentage: 100,
    isCompleted: true
  },
  {
    achievementId: '2',
    achievement: mockAchievements[1],
    currentProgress: 5,
    targetProgress: 7,
    progressPercentage: 71,
    isCompleted: false
  },
  {
    achievementId: '3',
    achievement: mockAchievements[2],
    currentProgress: 12,
    targetProgress: 30,
    progressPercentage: 40,
    isCompleted: false
  },
  {
    achievementId: '4',
    achievement: mockAchievements[3],
    currentProgress: 0,
    targetProgress: 100,
    progressPercentage: 0,
    isCompleted: false
  },
  {
    achievementId: '5',
    achievement: mockAchievements[4],
    currentProgress: 10,
    targetProgress: 10,
    progressPercentage: 100,
    isCompleted: true
  }
];

export default function TestAchievementsPage() {
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleCelebrate = (achievement: Achievement) => {
    setCelebrationAchievement(achievement);
    setShowCelebration(true);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Achievement System Test
        </h1>
        <p className="text-gray-600">
          Teste alle Achievement UI Komponenten
        </p>
      </div>

      {/* Achievement Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Different sizes */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Verschiedene Größen</h3>
              <div className="flex items-center gap-4">
                <AchievementBadge achievement={mockAchievements[0]} isEarned={true} size="sm" />
                <AchievementBadge achievement={mockAchievements[1]} isEarned={true} size="md" />
                <AchievementBadge achievement={mockAchievements[2]} isEarned={true} size="lg" />
              </div>
            </div>

            {/* Different rarities */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Verschiedene Seltenheiten</h3>
              <div className="flex items-center gap-4">
                {mockAchievements.map((achievement) => (
                  <AchievementBadge 
                    key={achievement.id}
                    achievement={achievement} 
                    isEarned={true} 
                    size="md" 
                  />
                ))}
              </div>
            </div>

            {/* Earned vs Unearned */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Erhalten vs. Nicht erhalten</h3>
              <div className="flex items-center gap-4">
                <AchievementBadge achievement={mockAchievements[0]} isEarned={true} size="md" />
                <AchievementBadge achievement={mockAchievements[1]} isEarned={false} size="md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Progress Bars Section */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Progress Bars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAchievementProgress.filter(ap => !ap.isCompleted).map((progress) => (
              <AchievementProgressBar 
                key={progress.achievementId}
                achievementProgress={progress}
                showBadge={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Celebration Modal Test */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Celebration Modal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Klicke auf ein Achievement, um die Celebration Modal zu testen:
            </p>
            <div className="flex flex-wrap gap-4">
              {mockAchievements.map((achievement) => (
                <Button
                  key={achievement.id}
                  variant="outline"
                  onClick={() => handleCelebrate(achievement)}
                  className="flex items-center gap-2"
                >
                  <span>{achievement.badgeIcon}</span>
                  {achievement.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Gallery */}
      <AchievementGallery achievements={mockAchievementProgress} />

      {/* Celebration Modal */}
      <AchievementCelebrationModal
        achievement={celebrationAchievement}
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
      />
    </div>
  );
}