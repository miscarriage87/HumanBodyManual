'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MobileProgressDashboard from '@/components/progress/mobile-progress-dashboard';
import MobileAchievementCelebration, { MobileAchievementToast } from '@/components/mobile-achievement-celebration';
import { OfflineStatusIndicator } from '@/components/offline-status-indicator';
import { useMobileAchievements, useAchievementSharing } from '@/hooks/use-mobile-achievements';
import { useOfflineAwareProgress } from '@/hooks/use-offline-progress';
import { initialAchievements } from '@/data/achievements';
import * as Icons from 'lucide-react';

export default function TestMobileProgressPage() {
  const [showDemo, setShowDemo] = useState(false);
  const { 
    notifications, 
    showAchievementModal, 
    showAchievementToast, 
    dismissNotification 
  } = useMobileAchievements();
  const { shareAchievement } = useAchievementSharing();
  const { recordProgress, isOnline, pendingSyncCount } = useOfflineAwareProgress();

  const handleTestAchievementModal = () => {
    const testAchievement = {
      ...initialAchievements[0],
      id: 'test-achievement-1',
      createdAt: new Date()
    };
    showAchievementModal(testAchievement);
  };

  const handleTestAchievementToast = () => {
    const testAchievement = {
      ...initialAchievements[1],
      id: 'test-achievement-2',
      createdAt: new Date()
    };
    showAchievementToast(testAchievement);
  };

  const handleTestOfflineProgress = async () => {
    try {
      await recordProgress({
        userId: 'test-user',
        exerciseId: 'Test Exercise',
        bodyArea: 'bewegung',
        completedAt: new Date(),
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
        sessionNotes: 'Test offline progress recording',
        mood: 'gut',
        energyLevel: 'hoch'
      });
      alert('Progress recorded! Check offline status indicator.');
    } catch (error) {
      alert('Error recording progress: ' + error);
    }
  };

  if (showDemo) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-playfair font-bold text-xl text-charcoal-900">
              Mobile Progress Demo
            </h1>
            <button
              onClick={() => setShowDemo(false)}
              className="flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 transition-colors"
            >
              <Icons.ArrowLeft size={20} />
              Zurück
            </button>
          </div>
        </div>
        
        <MobileProgressDashboard />
        
        {/* Achievement Notifications */}
        {notifications.map((notification) => {
          if (notification.type === 'modal') {
            return (
              <MobileAchievementCelebration
                key={notification.id}
                achievement={notification.achievement}
                isVisible={true}
                onClose={() => dismissNotification(notification.id)}
                onShare={() => shareAchievement(notification.achievement)}
              />
            );
          } else {
            return (
              <MobileAchievementToast
                key={notification.id}
                achievement={notification.achievement}
                isVisible={true}
                onClose={() => dismissNotification(notification.id)}
                onClick={() => {
                  dismissNotification(notification.id);
                  showAchievementModal(notification.achievement);
                }}
              />
            );
          }
        })}
        
        <OfflineStatusIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="organic-card p-6 mb-6"
        >
          <h1 className="font-playfair font-bold text-2xl text-charcoal-900 mb-4">
            📱 Mobile Progress Tracking Test
          </h1>
          <p className="text-charcoal-600 mb-6">
            Teste die mobile-optimierte Fortschrittsverfolgung mit Touch-Gesten, 
            Offline-Funktionalität und Achievement-Benachrichtigungen.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setShowDemo(true)}
              className="w-full bg-forest-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-forest-700 transition-colors duration-200"
            >
              📊 Mobile Dashboard Demo
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleTestAchievementModal}
                className="bg-gold-100 text-gold-800 py-3 px-4 rounded-xl font-medium text-sm hover:bg-gold-200 transition-colors duration-200"
              >
                🏆 Achievement Modal
              </button>

              <button
                onClick={handleTestAchievementToast}
                className="bg-blue-100 text-blue-800 py-3 px-4 rounded-xl font-medium text-sm hover:bg-blue-200 transition-colors duration-200"
              >
                🔔 Achievement Toast
              </button>
            </div>

            <button
              onClick={handleTestOfflineProgress}
              className="w-full bg-orange-100 text-orange-800 py-3 px-4 rounded-xl font-medium hover:bg-orange-200 transition-colors duration-200"
            >
              📴 Test Offline Progress
            </button>
          </div>
        </motion.div>

        {/* Status Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="organic-card p-4"
        >
          <h3 className="font-playfair font-semibold text-lg text-charcoal-900 mb-3">
            📊 System Status
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-charcoal-600">Online Status:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium text-charcoal-900">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-charcoal-600">Pending Sync:</span>
              <span className="font-medium text-charcoal-900">
                {pendingSyncCount} Einträge
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-charcoal-600">Active Notifications:</span>
              <span className="font-medium text-charcoal-900">
                {notifications.length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Feature List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="organic-card p-4 mt-4"
        >
          <h3 className="font-playfair font-semibold text-lg text-charcoal-900 mb-3">
            ✨ Mobile Features
          </h3>
          
          <div className="space-y-2 text-sm text-charcoal-600">
            <div className="flex items-center gap-2">
              <Icons.Smartphone size={16} className="text-forest-600" />
              <span>Touch-optimierte Benutzeroberfläche</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Navigation size={16} className="text-forest-600" />
              <span>Swipe-Gesten für Navigation</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Trophy size={16} className="text-forest-600" />
              <span>Mobile Achievement-Animationen</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.WifiOff size={16} className="text-forest-600" />
              <span>Offline-Fortschrittsverfolgung</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.RefreshCw size={16} className="text-forest-600" />
              <span>Automatische Synchronisation</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Bell size={16} className="text-forest-600" />
              <span>Push-ähnliche Benachrichtigungen</span>
            </div>
          </div>
        </motion.div>

        {/* Achievement Notifications */}
        {notifications.map((notification) => {
          if (notification.type === 'modal') {
            return (
              <MobileAchievementCelebration
                key={notification.id}
                achievement={notification.achievement}
                isVisible={true}
                onClose={() => dismissNotification(notification.id)}
                onShare={() => shareAchievement(notification.achievement)}
              />
            );
          } else {
            return (
              <MobileAchievementToast
                key={notification.id}
                achievement={notification.achievement}
                isVisible={true}
                onClose={() => dismissNotification(notification.id)}
                onClick={() => {
                  dismissNotification(notification.id);
                  showAchievementModal(notification.achievement);
                }}
              />
            );
          }
        })}

        <OfflineStatusIndicator />
      </div>
    </div>
  );
}