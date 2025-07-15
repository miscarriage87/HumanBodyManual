'use client';

import React from 'react';
import { PrivacyDashboard } from '@/components/privacy-dashboard';

export default function TestPrivacyPage() {
  // In a real app, this would come from authentication
  const mockUserId = 'test-user-123';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy & Data Control Test</h1>
          <p className="text-muted-foreground">
            Test the privacy dashboard functionality with mock user data
          </p>
        </div>
        
        <PrivacyDashboard userId={mockUserId} />
      </div>
    </div>
  );
}