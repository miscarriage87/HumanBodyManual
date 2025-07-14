'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BodyAreaStats } from '@/lib/types';
import { Activity, Target, TrendingUp, Clock } from 'lucide-react';

interface BodyAreaRadarChartProps {
  bodyAreaStats?: BodyAreaStats[];
  className?: string;
}

const COLORS = {
  primary: '#2D5016',
  secondary: '#8B4513',
  accent: '#DAA520',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export default function BodyAreaRadarChart({
  bodyAreaStats = [],
  className = ''
}: BodyAreaRadarChartProps) {
  const [activeTab, setActiveTab] = useState('overall');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Generate mock data if not provided
  const generateMockBodyAreaStats = (): BodyAreaStats[] => {
    const areas = [
      'nervensystem', 'hormone', 'zirkadian', 'mikrobiom',
      'bewegung', 'fasten', 'kaelte', 'licht'
    ];

    return areas.map(area => ({
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
  };

  const stats = bodyAreaStats.length > 0 ? bodyAreaStats : generateMockBodyAreaStats();

  // Prepare radar chart data
  const radarData = stats.map(stat => ({
    area: getBodyAreaName(stat.bodyArea),
    sessions: Math.min(stat.totalSessions, 100), // Normalize to 0-100
    consistency: Math.round(stat.consistencyScore * 100),
    duration: Math.min(stat.averageSessionDuration, 60), // Normalize to 0-60
    mastery: getMasteryScore(stat.masteryLevel),
    completion: stat.completionRate,
    fullName: getBodyAreaName(stat.bodyArea),
    rawData: stat
  }));

  // Prepare comparison data for different metrics
  const sessionData = radarData.map(item => ({
    area: item.area,
    value: item.sessions,
    fullName: item.fullName
  }));

  const consistencyData = radarData.map(item => ({
    area: item.area,
    value: item.consistency,
    fullName: item.fullName
  }));

  const masteryData = radarData.map(item => ({
    area: item.area,
    value: item.mastery,
    fullName: item.fullName
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.fullName}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {getMetricLabel(entry.dataKey)}: {entry.value}
              {getMetricUnit(entry.dataKey)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTopPerformingAreas = () => {
    return stats
      .sort((a, b) => (b.totalSessions + b.consistencyScore * 50) - (a.totalSessions + a.consistencyScore * 50))
      .slice(0, 3);
  };

  const getAreasNeedingAttention = () => {
    return stats
      .sort((a, b) => (a.totalSessions + a.consistencyScore * 50) - (b.totalSessions + b.consistencyScore * 50))
      .slice(0, 3);
  };

  const topAreas = getTopPerformingAreas();
  const attentionAreas = getAreasNeedingAttention();

  return (
    <div className={`space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-playfair font-semibold text-2xl text-charcoal-900 mb-2">
            🎯 Körperbereich-Analyse
          </h2>
          <p className="text-sm text-charcoal-600">
            Vergleiche deine Fortschritte in allen acht Körperbereichen
          </p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overall" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Gesamt
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="consistency" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Konsistenz
          </TabsTrigger>
          <TabsTrigger value="mastery" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Meisterschaft
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Gesamtübersicht aller Körperbereiche</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis 
                      dataKey="area" 
                      tick={{ fontSize: 12, fill: '#374151' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <Radar
                      name="Sessions"
                      dataKey="sessions"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Konsistenz"
                      dataKey="consistency"
                      stroke={COLORS.accent}
                      fill={COLORS.accent}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Meisterschaft"
                      dataKey="mastery"
                      stroke={COLORS.success}
                      fill={COLORS.success}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="w-5 h-5" />
                    Top Bereiche
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topAreas.map((area, index) => (
                    <div key={area.bodyArea} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">
                          {index + 1}. {getBodyAreaName(area.bodyArea)}
                        </p>
                        <p className="text-sm text-green-700">
                          {area.totalSessions} Sessions • {Math.round(area.consistencyScore * 100)}% Konsistenz
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {area.masteryLevel}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <Target className="w-5 h-5" />
                    Verbesserungspotential
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {attentionAreas.map((area, index) => (
                    <div key={area.bodyArea} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium text-amber-900">
                          {getBodyAreaName(area.bodyArea)}
                        </p>
                        <p className="text-sm text-amber-700">
                          {area.totalSessions} Sessions • {Math.round(area.consistencyScore * 100)}% Konsistenz
                        </p>
                      </div>
                      <Badge variant="outline" className="border-amber-300 text-amber-800">
                        Fokus
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Sessions pro Körperbereich</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={sessionData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis 
                      dataKey="area" 
                      tick={{ fontSize: 12, fill: '#374151' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <Radar
                      name="Sessions"
                      dataKey="value"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Konsistenz-Score pro Bereich</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={consistencyData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis 
                      dataKey="area" 
                      tick={{ fontSize: 12, fill: '#374151' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <Radar
                      name="Konsistenz"
                      dataKey="value"
                      stroke={COLORS.accent}
                      fill={COLORS.accent}
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="mastery" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Meisterschafts-Level pro Bereich</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={masteryData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis 
                      dataKey="area" 
                      tick={{ fontSize: 12, fill: '#374151' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <Radar
                      name="Meisterschaft"
                      dataKey="value"
                      stroke={COLORS.success}
                      fill={COLORS.success}
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getBodyAreaName(bodyArea: string): string {
  const names: Record<string, string> = {
    nervensystem: 'Nervensystem',
    hormone: 'Hormone',
    zirkadian: 'Zirkadian',
    mikrobiom: 'Mikrobiom',
    bewegung: 'Bewegung',
    fasten: 'Fasten',
    kaelte: 'Kälte',
    licht: 'Licht',
  };
  return names[bodyArea] || bodyArea;
}

function getMasteryScore(masteryLevel: string): number {
  const scores: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };
  return scores[masteryLevel] || 25;
}

function getMetricLabel(dataKey: string): string {
  const labels: Record<string, string> = {
    sessions: 'Sessions',
    consistency: 'Konsistenz',
    duration: 'Durchschnittsdauer',
    mastery: 'Meisterschaft',
    completion: 'Abschlussrate',
    value: 'Wert'
  };
  return labels[dataKey] || dataKey;
}

function getMetricUnit(dataKey: string): string {
  const units: Record<string, string> = {
    sessions: '',
    consistency: '%',
    duration: ' Min',
    mastery: '%',
    completion: '%',
    value: ''
  };
  return units[dataKey] || '';
}