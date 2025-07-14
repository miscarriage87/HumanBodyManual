'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Target, 
  Brain, 
  Download,
  TrendingUp,
  Activity,
  RefreshCw,
  Calendar
} from 'lucide-react';

// Import the analytics components
import ProgressCharts from './analytics/progress-charts';
import BodyAreaRadarChart from './analytics/body-area-radar-chart';
import InsightsPanel from './analytics/insights-panel';
import ProgressExport from './analytics/progress-export';

// Import existing components and services
import { ProgressTracker } from '@/lib/progress-tracker';
import { AnalyticsService } from '@/lib/analytics-service';
import { BodyAreaStats, TrendData, UserInsight, Recommendation } from '@/lib/types';

interface AnalyticsDashboardProps {
  userId: string;
  className?: string;
}

export default function AnalyticsDashboard({
  userId,
  className = ''
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('charts');
  const [isLoading, setIsLoading] = useState(true);
  const [bodyAreaStats, setBodyAreaStats] = useState<BodyAreaStats[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<TrendData | undefined>();
  const [monthlyTrends, setMonthlyTrends] = useState<TrendData | undefined>();
  const [insights, setInsights] = useState<UserInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadAnalyticsData();
  }, [userId]);

  if (!mounted) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      // Load user progress and body area stats
      const userProgress = await ProgressTracker.getUserProgress(userId);
      setBodyAreaStats(userProgress.bodyAreaStats);

      // Load trends data
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weeklyTrendData = await AnalyticsService.getProgressTrends(userId, {
        from: weekStart,
        to: new Date()
      });
      setWeeklyTrends(weeklyTrendData);

      const monthStart = new Date();
      monthStart.setDate(monthStart.getDate() - 30);
      const monthlyTrendData = await AnalyticsService.getProgressTrends(userId, {
        from: monthStart,
        to: new Date()
      });
      setMonthlyTrends(monthlyTrendData);

      // Load insights and recommendations
      const userInsights = await AnalyticsService.generateInsights(userId);
      setInsights(userInsights);

      const userRecommendations = await AnalyticsService.getRecommendations(userId);
      setRecommendations(userRecommendations);

    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Use mock data as fallback
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    // Generate mock body area stats
    const areas = [
      'nervensystem', 'hormone', 'zirkadian', 'mikrobiom',
      'bewegung', 'fasten', 'kaelte', 'licht'
    ];

    const mockBodyAreaStats: BodyAreaStats[] = areas.map(area => ({
      bodyArea: area as any,
      totalSessions: Math.floor(Math.random() * 50) + 10,
      totalMinutes: Math.floor(Math.random() * 1000) + 200,
      averageSessionDuration: Math.floor(Math.random() * 30) + 15,
      completionRate: Math.floor(Math.random() * 100),
      lastPracticed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      favoriteExercises: [],
      consistencyScore: Math.random(),
      masteryLevel: ['beginner', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)] as any
    }));

    setBodyAreaStats(mockBodyAreaStats);

    // Generate mock trend data
    const generateTrendData = (days: number): TrendData => {
      const dataPoints = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dataPoints.push({
          date,
          value: Math.floor(Math.random() * 5) + 1,
          label: date.toLocaleDateString('de-DE'),
        });
      }

      return {
        period: days <= 7 ? 'week' : 'month',
        dataPoints,
        trend: 'increasing',
        changePercentage: Math.floor(Math.random() * 30) + 5
      };
    };

    setWeeklyTrends(generateTrendData(7));
    setMonthlyTrends(generateTrendData(30));
  };

  const handleRefreshData = () => {
    loadAnalyticsData();
  };

  const handleInsightViewed = async (insightIds: string[]) => {
    try {
      // Mark insights as viewed
      await AnalyticsService.markInsightsAsViewed(userId, insightIds);
      
      // Update local state
      setInsights(prev => prev.map(insight => 
        insightIds.includes(insight.id) 
          ? { ...insight, viewedAt: new Date() }
          : insight
      ));
    } catch (error) {
      console.error('Error marking insights as viewed:', error);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'charts':
        return <BarChart3 className="w-4 h-4" />;
      case 'radar':
        return <Target className="w-4 h-4" />;
      case 'insights':
        return <Brain className="w-4 h-4" />;
      case 'export':
        return <Download className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-playfair font-semibold text-3xl text-charcoal-900 mb-2">
            📊 Analytics Dashboard
          </h1>
          <p className="text-charcoal-600">
            Detaillierte Einblicke in deine Fortschritte und Übungsmuster
          </p>
        </div>
        <Button
          onClick={handleRefreshData}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Aktualisieren
        </Button>
      </motion.div>

      {/* Quick Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gesamt Sessions</p>
                <p className="text-xl font-bold text-gray-900">
                  {bodyAreaStats.reduce((sum, stat) => sum + stat.totalSessions, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Übungszeit</p>
                <p className="text-xl font-bold text-gray-900">
                  {Math.round(bodyAreaStats.reduce((sum, stat) => sum + stat.totalMinutes, 0) / 60)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktive Bereiche</p>
                <p className="text-xl font-bold text-gray-900">
                  {bodyAreaStats.filter(stat => stat.totalSessions > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Wöchentlicher Trend</p>
                <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                  {weeklyTrends?.changePercentage && weeklyTrends.changePercentage > 0 ? '+' : ''}
                  {weeklyTrends?.changePercentage || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Analytics Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="charts" className="flex items-center gap-2">
              {getTabIcon('charts')}
              Diagramme
            </TabsTrigger>
            <TabsTrigger value="radar" className="flex items-center gap-2">
              {getTabIcon('radar')}
              Vergleich
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              {getTabIcon('insights')}
              Einblicke
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              {getTabIcon('export')}
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="mt-6">
            <ProgressCharts
              weeklyTrends={weeklyTrends}
              monthlyTrends={monthlyTrends}
              bodyAreaStats={bodyAreaStats}
            />
          </TabsContent>

          <TabsContent value="radar" className="mt-6">
            <BodyAreaRadarChart
              bodyAreaStats={bodyAreaStats}
            />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <InsightsPanel
              insights={insights}
              recommendations={recommendations}
              onInsightViewed={handleInsightViewed}
              onRefreshInsights={handleRefreshData}
            />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ProgressExport
              userId={userId}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}