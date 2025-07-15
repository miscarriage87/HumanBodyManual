'use client';

import { useState, useCallback, useEffect } from 'react';
import { Achievement } from '@/lib/types';

interface AchievementNotification {
  id: string;
  achievement: Achievement;
  timestamp: number;
  type: 'toast' | 'modal';
}

interface UseMobileAchievementsReturn {
  notifications: AchievementNotification[];
  showAchievementModal: (achievement: Achievement) => void;
  showAchievementToast: (achievement: Achievement) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export function useMobileAchievements(): UseMobileAchievementsReturn {
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);

  const showAchievementModal = useCallback((achievement: Achievement) => {
    const notification: AchievementNotification = {
      id: `modal-${Date.now()}-${Math.random()}`,
      achievement,
      timestamp: Date.now(),
      type: 'modal'
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  const showAchievementToast = useCallback((achievement: Achievement) => {
    const notification: AchievementNotification = {
      id: `toast-${Date.now()}-${Math.random()}`,
      achievement,
      timestamp: Date.now(),
      type: 'toast'
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-dismiss toast notifications after 4 seconds
  useEffect(() => {
    const toastNotifications = notifications.filter(n => n.type === 'toast');
    
    toastNotifications.forEach(notification => {
      const timeElapsed = Date.now() - notification.timestamp;
      const remainingTime = Math.max(0, 4000 - timeElapsed);
      
      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          dismissNotification(notification.id);
        }, remainingTime);
        
        return () => clearTimeout(timer);
      } else {
        dismissNotification(notification.id);
      }
    });
  }, [notifications, dismissNotification]);

  return {
    notifications,
    showAchievementModal,
    showAchievementToast,
    dismissNotification,
    clearAllNotifications
  };
}

// Hook for managing achievement sharing
export function useAchievementSharing() {
  const shareAchievement = useCallback(async (achievement: Achievement) => {
    const shareData = {
      title: `Neue Errungenschaft: ${achievement.name}`,
      text: `Ich habe gerade "${achievement.name}" in der Human Body Manual App freigeschaltet! ${achievement.description}`,
      url: window.location.origin
    };

    try {
      // Use Web Share API if available (mobile browsers)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      }
      
      // Fallback to clipboard
      if (navigator.clipboard) {
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        
        // Show a toast notification that content was copied
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sharing achievement:', error);
      return false;
    }
  }, []);

  return { shareAchievement };
}

// Hook for managing offline achievement storage
export function useOfflineAchievements() {
  const STORAGE_KEY = 'hbm_offline_achievements';

  const saveOfflineAchievement = useCallback((achievement: Achievement) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const achievements = stored ? JSON.parse(stored) : [];
      
      const newAchievement = {
        ...achievement,
        earnedAt: new Date().toISOString(),
        synced: false
      };
      
      achievements.push(newAchievement);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
      
      return true;
    } catch (error) {
      console.error('Error saving offline achievement:', error);
      return false;
    }
  }, []);

  const getOfflineAchievements = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting offline achievements:', error);
      return [];
    }
  }, []);

  const markAchievementSynced = useCallback((achievementId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const achievements = stored ? JSON.parse(stored) : [];
      
      const updatedAchievements = achievements.map((achievement: any) => 
        achievement.id === achievementId 
          ? { ...achievement, synced: true }
          : achievement
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAchievements));
      return true;
    } catch (error) {
      console.error('Error marking achievement as synced:', error);
      return false;
    }
  }, []);

  const clearSyncedAchievements = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const achievements = stored ? JSON.parse(stored) : [];
      
      const unsyncedAchievements = achievements.filter((achievement: any) => !achievement.synced);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unsyncedAchievements));
      
      return true;
    } catch (error) {
      console.error('Error clearing synced achievements:', error);
      return false;
    }
  }, []);

  return {
    saveOfflineAchievement,
    getOfflineAchievements,
    markAchievementSynced,
    clearSyncedAchievements
  };
}