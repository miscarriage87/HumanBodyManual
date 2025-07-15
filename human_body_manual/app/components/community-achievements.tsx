'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Target, 
  Calendar, 
  Award, 
  Star,
  Crown,
  Zap,
  Heart
} from 'lucide-react';
import { CommunityAchievement, UserCommunityAchievement } from '@/lib/types';

interface CommunityAchievementsProps {
  className?: string;
}

export function CommunityAchievements({ className }: CommunityAchievementsProps) {
  const [earnedAchievements, setEarnedAchievements] = useState<UserCommunityAchievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<CommunityAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, you would have separate endpoints for community achievements
      // For now, we'll create some mock data to demonstrate the UI
      
      const mockEarnedAchievements: UserCommunityAchievement[] = [
        {
          id: '1',
          userId: 'user1',
          achievementId: 'community-1',
          achievement: {
            id: 'community-1',
            name: 'Community Starter',
            description: 'Tritt deiner ersten Community Challenge bei',
            criteria: {
              type: 'community_participation',
              requirements: { participationCount: 1 }
            },
            badgeIcon: '🌟',
            points: 50,
            rarity: 'common',
            isActive: true,
            createdAt: new Date()
          },
          earnedAt: new Date(),
          context: { challengeId: 'challenge-1' }
        }
      ];

      const mockAvailableAchievements: CommunityAchievement[] = [
        {
          id: 'community-2',
          name: 'Challenge Champion',
          description: 'Schließe 5 Community Challenges erfolgreich ab',
          criteria: {
            type: 'challenge_completion',
            requirements: { challengeCount: 5 }
          },
          badgeIcon: '🏆',
          points: 200,
          rarity: 'rare',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'community-3',
          name: 'Community Leader',
          description: 'Erreiche die Top 10% in der monatlichen Rangliste',
          criteria: {
            type: 'leaderboard_rank',
            requirements: { percentile: 90 },
            timeframe: 'monthly'
          },
          badgeIcon: '👑',
          points: 500,
          rarity: 'epic',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'community-4',
          name: 'Social Butterfly',
          description: 'Nimm an 10 verschiedenen Community Challenges teil',
          criteria: {
            type: 'community_participation',
            requirements: { participationCount: 10 }
          },
          badgeIcon: '🦋',
          points: 300,
          rarity: 'rare',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'community-5',
          name: 'Inspiration',
          description: 'Halte eine 30-Tage Streak während einer Community Challenge',
          criteria: {
            type: 'challenge_completion',
            requirements: { streakDays: 30 }
          },
          badgeIcon: '✨',
          points: 400,
          rarity: 'epic',
          isActive: true,
          createdAt: new Date()
        }
      ];

      setEarnedAchievements(mockEarnedAchievements);
      setAvailableAchievements(mockAvailableAchievements);

    } catch (error) {
      console.error('Error fetching community achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Star className="h-4 w-4" />;
      case 'rare':
        return <Trophy className="h-4 w-4" />;
      case 'epic':
        return <Crown className="h-4 w-4" />;
      case 'legendary':
        return <Zap className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Community Achievements</h2>
        <p className="text-muted-foreground">
          Verdiene spezielle Auszeichnungen durch Community-Teilnahme
        </p>
      </div>

      <Tabs defaultValue="earned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earned">
            Verdient ({earnedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Verfügbar ({availableAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-4">
          {earnedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((userAchievement) => (
                <Card key={userAchievement.id} className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-400 to-transparent opacity-20"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl">{userAchievement.achievement.badgeIcon}</div>
                      <Badge className={`${getRarityColor(userAchievement.achievement.rarity)} border`}>
                        {getRarityIcon(userAchievement.achievement.rarity)}
                        <span className="ml-1 capitalize">{userAchievement.achievement.rarity}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{userAchievement.achievement.name}</CardTitle>
                    <CardDescription>{userAchievement.achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span>{userAchievement.achievement.points} Punkte</span>
                      </div>
                      <div className="text-muted-foreground">
                        {userAchievement.earnedAt.toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Du hast noch keine Community Achievements verdient.
                </p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Nimm an Community Challenges teil, um deine ersten Auszeichnungen zu sammeln!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAchievements.map((achievement) => (
              <Card key={achievement.id} className="relative overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-400 to-transparent opacity-10"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl grayscale">{achievement.badgeIcon}</div>
                    <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                      {getRarityIcon(achievement.rarity)}
                      <span className="ml-1 capitalize">{achievement.rarity}</span>
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{achievement.name}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span>{achievement.points} Punkte</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Nicht verdient
                    </Badge>
                  </div>

                  {/* Progress indicator (mock data) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Fortschritt</span>
                      <span>
                        {achievement.criteria.type === 'challenge_completion' ? '1/5' :
                         achievement.criteria.type === 'community_participation' ? '1/10' :
                         '0/1'}
                      </span>
                    </div>
                    <Progress 
                      value={
                        achievement.criteria.type === 'challenge_completion' ? 20 :
                        achievement.criteria.type === 'community_participation' ? 10 :
                        0
                      } 
                      className="h-2"
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {achievement.criteria.type === 'challenge_completion' && 'Schließe mehr Challenges ab'}
                    {achievement.criteria.type === 'community_participation' && 'Nimm an mehr Community-Aktivitäten teil'}
                    {achievement.criteria.type === 'leaderboard_rank' && 'Verbessere deine Ranglisten-Position'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Deine Community Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{earnedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Verdiente Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {earnedAchievements.reduce((sum, a) => sum + a.achievement.points, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Community Punkte</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {availableAchievements.length}
              </div>
              <div className="text-sm text-muted-foreground">Verfügbare Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((earnedAchievements.length / (earnedAchievements.length + availableAchievements.length)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}