'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { TrendData, BodyAreaStats, ProgressEntry } from '@/lib/types';

interface ProgressChartsProps {
  weeklyTrends?: TrendData;
  monthlyTrends?: TrendData;
  bodyAreaStats?: BodyAreaStats[];
  recentProgress?: ProgressEntry[];
  className?: string;
}

const COLORS = {
  primary: '#2D5016',
  secondary: '#8B4513',
  accent: '#DAA520',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',
  bodyAreas: [
    '#2D5016', '#8B4513', '#DAA520', '#22C55E',
    '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'
  ]
};

export default function ProgressCharts({
  weeklyTrends,
  monthlyTrends,
  bodyAreaStats = [],
  recentProgress = [],
  className = ''
}: ProgressChartsProps) {
  const [activeTab, setActiveTab] = useState('weekly');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Generate mock data if not provided
  const generateMockWeeklyData = () => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        sessions: Math.floor(Math.random() * 5) + 1,
        minutes: Math.floor(Math.random() * 120) + 30,
        day: date.toLocaleDateString('de-DE', { weekday: 'short' })
      });
    }
    return data;
  };

  const generateMockMonthlyData = () => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        sessions: Math.floor(Math.random() * 8) + 1,
        minutes: Math.floor(Math.random() * 180) + 20,
        week: Math.ceil((30 - i) / 7)
      });
    }
    return data;
  };

  const generateBodyAreaData = () => {
    if (bodyAreaStats.length > 0) {
      return bodyAreaStats.map((stat, index) => ({
        name: getBodyAreaName(stat.bodyArea),
        sessions: stat.totalSessions,
        minutes: stat.totalMinutes,
        consistency: Math.round(stat.consistencyScore * 100),
        color: COLORS.bodyAreas[index % COLORS.bodyAreas.length]
      }));
    }

    // Mock data
    const areas = [
      'Nervensystem', 'Hormone', 'Zirkadianer Rhythmus', 'Mikrobiom',
      'Bewegung', 'Fasten', 'Kältetherapie', 'Lichttherapie'
    ];

    return areas.map((name, index) => ({
      name,
      sessions: Math.floor(Math.random() * 50) + 10,
      minutes: Math.floor(Math.random() * 1000) + 200,
      consistency: Math.floor(Math.random() * 100),
      color: COLORS.bodyAreas[index]
    }));
  };

  const weeklyData = weeklyTrends?.dataPoints.map(point => ({
    date: point.date.toISOString().split('T')[0],
    sessions: point.value,
    minutes: Math.floor(Math.random() * 120) + 30,
    day: point.date.toLocaleDateString('de-DE', { weekday: 'short' })
  })) || generateMockWeeklyData();

  const monthlyData = monthlyTrends?.dataPoints.map(point => ({
    date: point.date.toISOString().split('T')[0],
    sessions: point.value,
    minutes: Math.floor(Math.random() * 180) + 20,
    week: Math.ceil(point.date.getDate() / 7)
  })) || generateMockMonthlyData();

  const bodyAreaData = generateBodyAreaData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'minutes' && ' Min'}
              {entry.dataKey === 'sessions' && ' Sessions'}
              {entry.dataKey === 'consistency' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = (trend?: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-playfair font-semibold text-2xl text-charcoal-900 mb-2">
            📈 Fortschritts-Analyse
          </h2>
          <p className="text-sm text-charcoal-600">
            Detaillierte Einblicke in deine Übungstrends und Entwicklung
          </p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Wöchentlich
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Monatlich
          </TabsTrigger>
          <TabsTrigger value="areas" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Körperbereiche
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Verteilung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Wöchentliche Aktivität
                  {getTrendIcon(weeklyTrends?.trend)}
                  {weeklyTrends?.changePercentage && (
                    <span className={`text-sm ${
                      weeklyTrends.changePercentage > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {weeklyTrends.changePercentage > 0 ? '+' : ''}{weeklyTrends.changePercentage}%
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Übungszeit pro Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="minutes" 
                      fill={COLORS.accent}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  30-Tage Trend
                  {getTrendIcon(monthlyTrends?.trend)}
                  {monthlyTrends?.changePercentage && (
                    <span className={`text-sm ${
                      monthlyTrends.changePercentage > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {monthlyTrends.changePercentage > 0 ? '+' : ''}{monthlyTrends.changePercentage}%
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date"
                      stroke="#666"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).getDate().toString()}
                    />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      content={<CustomTooltip />}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('de-DE')}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
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
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={bodyAreaData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#666" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#666" 
                      fontSize={12}
                      width={120}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="sessions" 
                      fill={COLORS.secondary}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Konsistenz-Score pro Bereich</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={bodyAreaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#666" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="consistency"
                      stroke={COLORS.success}
                      fill={COLORS.success}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Verteilung der Übungszeit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={bodyAreaData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="minutes"
                    >
                      {bodyAreaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
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
    zirkadian: 'Zirkadianer Rhythmus',
    mikrobiom: 'Mikrobiom',
    bewegung: 'Bewegung',
    fasten: 'Fasten',
    kaelte: 'Kältetherapie',
    licht: 'Lichttherapie',
  };
  return names[bodyArea] || bodyArea;
}