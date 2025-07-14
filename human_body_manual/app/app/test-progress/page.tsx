'use client';

import React from 'react';
import CalendarHeatmapComponent from '@/components/progress/calendar-heatmap';
import StreakCounter from '@/components/progress/streak-counter';
import BodyAreaProgressCards from '@/components/progress/body-area-progress-cards';
import RecentActivityFeed from '@/components/progress/recent-activity-feed';
import { BodyAreaStats, ProgressEntry } from '@/lib/types';

export default function TestProgressPage() {
  // Mock data for testing
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
    const bodyAreas = ['nervensystem', 'hormone', 'zirkadian', 'mikrobiom', 'bewegung', 'fasten', 'kaelte', 'licht'];
    
    return bodyAreas.map(area => ({
      bodyArea: area as any,
      totalSessions: Math.floor(Math.random() * 50) + 10,
      totalMinutes: Math.floor(Math.random() * 1000) + 200,
      averageSessionDuration: Math.floor(Math.random() * 30) + 15,
      completionRate: Math.floor(Math.random() * 100),
      lastPracticed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      favoriteExercises: ['Atemübung', 'Meditation', 'Kältetherapie'].slice(0, Math.floor(Math.random() * 3) + 1),
      consistencyScore: Math.floor(Math.random() * 100),
      masteryLevel: ['beginner', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)] as any
    }));
  };

  const generateRecentActivities = (): ProgressEntry[] => {
    const exercises = ['Atemübung Grundlagen', 'Kalte Dusche', 'Morgenlicht', 'Meditation', 'Fasten'];
    const bodyAreas = ['nervensystem', 'kaelte', 'licht', 'fasten', 'bewegung'];
    
    return Array.from({ length: 10 }, (_, index) => ({
      id: `activity-${index}`,
      userId: 'user-1',
      exerciseId: exercises[Math.floor(Math.random() * exercises.length)],
      bodyArea: bodyAreas[Math.floor(Math.random() * bodyAreas.length)] as any,
      completedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      durationMinutes: Math.floor(Math.random() * 45) + 15,
      difficultyLevel: ['Anfänger', 'Fortgeschritten', 'Experte'][Math.floor(Math.random() * 3)] as any,
      sessionNotes: Math.random() > 0.7 ? 'Großartige Session heute!' : undefined,
      mood: ['sehr_gut', 'gut', 'neutral'][Math.floor(Math.random() * 3)] as any,
      energyLevel: ['hoch', 'normal', 'sehr_hoch'][Math.floor(Math.random() * 3)] as any,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
    }));
  };

  const heatmapData = generateHeatmapData();
  const bodyAreaStats = generateBodyAreaStats();
  const recentActivities = generateRecentActivities();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-forest-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-charcoal-900 mb-2">
            Progress Dashboard Components Test
          </h1>
          <p className="text-charcoal-600">
            Testing the enhanced progress tracking components
          </p>
        </div>

        {/* Streak Counter Test */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-charcoal-900">Streak Counter Component</h2>
          <StreakCounter
            currentStreak={15}
            longestStreak={25}
            lastActivityDate={new Date()}
          />
        </div>

        {/* Calendar Heatmap Test */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-charcoal-900">Calendar Heatmap Component</h2>
          <CalendarHeatmapComponent
            values={heatmapData}
            startDate={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)}
            endDate={new Date()}
          />
        </div>

        {/* Body Area Progress Cards Test */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-charcoal-900">Body Area Progress Cards</h2>
          <BodyAreaProgressCards bodyAreaStats={bodyAreaStats} />
        </div>

        {/* Recent Activity Feed Test */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-charcoal-900">Recent Activity Feed</h2>
          <RecentActivityFeed 
            activities={recentActivities}
            maxItems={8}
          />
        </div>
      </div>
    </div>
  );
}