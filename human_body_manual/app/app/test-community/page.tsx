'use client';

import React from 'react';
import { CommunityDashboard } from '@/components/community-dashboard';
import { CommunityAchievements } from '@/components/community-achievements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestCommunityPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Community Features Test</h1>
        <p className="text-muted-foreground">
          Test der Community-Funktionen mit anonymisierten Statistiken und Challenges
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Community Dashboard</TabsTrigger>
          <TabsTrigger value="achievements">Community Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CommunityDashboard />
        </TabsContent>

        <TabsContent value="achievements">
          <CommunityAchievements />
        </TabsContent>
      </Tabs>
    </div>
  );
}