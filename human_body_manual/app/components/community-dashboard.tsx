'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { CommunityStats, CommunityChallenge, Leaderboard } from '@/lib/types';

interface CommunityDashboardProps {
  className?: string;
}

export function CommunityDashboard({ className }: CommunityDashboardProps) {
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    fetchCommunityData();
  }, [selectedPeriod]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, challengesResponse, leaderboardResponse] = await Promise.all([
        fetch(`/api/community?statType=${selectedPeriod}`),
        fetch('/api/community/challenges'),
        fetch(`/api/community/leaderboard?metric=total_sessions&period=${selectedPeriod}`)
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setCommunityStats(statsData.data);
      }

      if (challengesResponse.ok) {
        const challengesData = await challengesResponse.json();
        setChallenges(challengesData.data);
      }

      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData.data);
      }

    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/community/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
          challengeId
        })
      });

      if (response.ok) {
        // Refresh challenges data
        fetchCommunityData();
      } else {
        const error = await response.json();
        console.error('Error joining challenge:', error.error);
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Community</h2>
          <p className="text-muted-foreground">
            Verbinde dich mit anderen Praktizierenden und teile deine Reise
          </p>
        </div>
        
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
          <TabsList>
            <TabsTrigger value="daily">Täglich</TabsTrigger>
            <TabsTrigger value="weekly">Wöchentlich</TabsTrigger>
            <TabsTrigger value="monthly">Monatlich</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Community Statistics */}
      {communityStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Nutzer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.totalActiveUsers}</div>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod === 'daily' ? 'heute' : 
                 selectedPeriod === 'weekly' ? 'diese Woche' : 'diesen Monat'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Sessions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityStats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Durchschnitt: {Math.round(communityStats.averageSessionDuration)} Min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beliebteste Übung</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {communityStats.popularExercises[0]?.exerciseId || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {communityStats.popularExercises[0]?.completionCount || 0} Durchführungen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Körperbereich</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {communityStats.bodyAreaStats[0]?.bodyArea || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {communityStats.bodyAreaStats[0]?.practitionerCount || 0} Praktizierende
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="challenges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Rangliste</TabsTrigger>
          <TabsTrigger value="popular">Beliebte Übungen</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {Math.ceil((challenge.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Tage
                    </Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Teilnehmer: {challenge.participantCount}</span>
                    <span>Ziel: {challenge.targetValue} {challenge.targetMetric}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Belohnungen:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {challenge.rewards.map((reward, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reward.type === 'badge' && <Award className="h-3 w-3 mr-1" />}
                          {reward.description}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => joinChallenge(challenge.id)}
                    className="w-full"
                    size="sm"
                  >
                    Challenge beitreten
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {challenges.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Derzeit sind keine aktiven Challenges verfügbar.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          {leaderboard && (
            <Card>
              <CardHeader>
                <CardTitle>Rangliste - {leaderboard.metric}</CardTitle>
                <CardDescription>
                  Anonymisierte Rankings basierend auf {leaderboard.period === 'weekly' ? 'wöchentlicher' : 
                  leaderboard.period === 'monthly' ? 'monatlicher' : 'täglicher'} Aktivität
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.entries.slice(0, 10).map((entry) => (
                    <div 
                      key={entry.rank}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        entry.isCurrentUser ? 'bg-primary/5 border-primary' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                          entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <div className="font-medium">
                            {entry.isCurrentUser ? 'Du' : entry.anonymizedId}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.percentile}. Perzentil
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{entry.value}</div>
                        <div className="text-sm text-muted-foreground">
                          {leaderboard.metric === 'total_sessions' ? 'Sessions' :
                           leaderboard.metric === 'total_minutes' ? 'Minuten' :
                           leaderboard.metric === 'current_streak' ? 'Streak' : 'Punkte'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Gesamt {leaderboard.totalParticipants} Teilnehmer
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          {communityStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Beliebteste Übungen</CardTitle>
                  <CardDescription>Basierend auf Community-Aktivität</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {communityStats.popularExercises.slice(0, 5).map((exercise) => (
                      <div key={exercise.exerciseId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                            {exercise.rank}
                          </div>
                          <span className="font-medium">{exercise.exerciseId}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.completionCount} mal
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Körperbereiche</CardTitle>
                  <CardDescription>Beliebtheit nach Praktizierenden</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {communityStats.bodyAreaStats.slice(0, 5).map((area) => (
                      <div key={area.bodyArea} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{area.bodyArea}</span>
                          <span className="text-sm text-muted-foreground">
                            {area.practitionerCount} Praktizierende
                          </span>
                        </div>
                        <Progress 
                          value={(area.practitionerCount / communityStats.totalActiveUsers) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}