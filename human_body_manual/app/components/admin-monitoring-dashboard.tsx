'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Cell
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface MonitoringData {
  progressMetrics: {
    totalProgressEntries: number;
    averageSessionDuration: number;
    achievementUnlockRate: number;
    streakRetentionRate: number;
    featureAdoptionRate: number;
    errorRate: number;
  };
  featureUsage: Array<{
    feature: string;
    action: string;
    _count: { _all: number };
  }>;
  systemHealth: Array<{
    component: string;
    status: string;
    responseTime?: number;
    errorRate?: number;
    timestamp: string;
  }>;
  performanceMetrics: Array<{
    metricName: string;
    value: number;
    timestamp: string;
  }>;
  engagementAnalytics: {
    featureUsage: Array<{
      feature: string;
      action: string;
      _count: { _all: number };
    }>;
    activeUsers: number;
  };
  errors: Array<{
    id: string;
    errorType: string;
    message: string;
    feature?: string;
    timestamp: string;
    resolved: boolean;
  }>;
  timeRange: string;
  generatedAt: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminMonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/monitoring?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monitoring data');
      }
      const monitoringData = await response.json();
      setData(monitoringData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, [timeRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const featureUsageData = data.featureUsage.reduce((acc, item) => {
    const existing = acc.find(a => a.feature === item.feature);
    if (existing) {
      existing.usage += item._count._all;
    } else {
      acc.push({ feature: item.feature, usage: item._count._all });
    }
    return acc;
  }, [] as Array<{ feature: string; usage: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            System health and user engagement analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button onClick={fetchMonitoringData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress Entries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.progressMetrics.totalProgressEntries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg session: {data.progressMetrics.averageSessionDuration.toFixed(1)} min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.engagementAnalytics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Feature adoption: {(data.progressMetrics.featureAdoptionRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.progressMetrics.achievementUnlockRate.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Streak retention: {(data.progressMetrics.streakRetentionRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data.progressMetrics.errorRate * 100).toFixed(3)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.errors.length} unresolved errors
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system-health">System Health</TabsTrigger>
          <TabsTrigger value="feature-usage">Feature Usage</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={featureUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ feature, percent }) => `${feature} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                    >
                      {featureUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Tracking Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Feature Adoption</span>
                    <span>{(data.progressMetrics.featureAdoptionRate * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={data.progressMetrics.featureAdoptionRate * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Streak Retention</span>
                    <span>{(data.progressMetrics.streakRetentionRate * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={data.progressMetrics.streakRetentionRate * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>System Reliability</span>
                    <span>{((1 - data.progressMetrics.errorRate) * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={(1 - data.progressMetrics.errorRate) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system-health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.systemHealth.map((component, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{component.component}</CardTitle>
                  <div className={getStatusColor(component.status)}>
                    {getStatusIcon(component.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge variant={component.status === 'healthy' ? 'default' : 'destructive'}>
                      {component.status}
                    </Badge>
                  </div>
                  {component.responseTime && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Response time: {component.responseTime}ms
                    </p>
                  )}
                  {component.errorRate !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Error rate: {(component.errorRate * 100).toFixed(2)}%
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feature-usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Over Time</CardTitle>
              <CardDescription>User interactions with progress tracking features</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={featureUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Unresolved system errors requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.errors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No unresolved errors found
                  </p>
                ) : (
                  data.errors.map((error) => (
                    <div key={error.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive">{error.errorType}</Badge>
                            {error.feature && (
                              <Badge variant="outline">{error.feature}</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">{error.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(error.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Mark Resolved
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}