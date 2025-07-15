'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProgressEntry } from '@/lib/types';

interface OfflineProgressEntry extends ProgressEntry {
  synced: boolean;
  offlineId: string;
}

interface UseOfflineProgressReturn {
  isOnline: boolean;
  pendingSyncCount: number;
  recordOfflineProgress: (entry: Omit<ProgressEntry, 'id' | 'createdAt'>) => Promise<string>;
  syncOfflineProgress: () => Promise<boolean>;
  getOfflineProgress: () => OfflineProgressEntry[];
  clearSyncedProgress: () => void;
  lastSyncTime: Date | null;
}

export function useOfflineProgress(): UseOfflineProgressReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const syncInProgress = useRef(false);

  const STORAGE_KEY = 'hbm_offline_progress';
  const LAST_SYNC_KEY = 'hbm_last_sync';

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Load last sync time on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAST_SYNC_KEY);
      if (stored) {
        setLastSyncTime(new Date(stored));
      }
    } catch (error) {
      console.error('Error loading last sync time:', error);
    }
  }, []);

  // Update pending sync count when storage changes
  const updatePendingSyncCount = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const entries = stored ? JSON.parse(stored) : [];
      const unsynced = entries.filter((entry: OfflineProgressEntry) => !entry.synced);
      setPendingSyncCount(unsynced.length);
    } catch (error) {
      console.error('Error updating pending sync count:', error);
      setPendingSyncCount(0);
    }
  }, []);

  // Update count on mount and when online status changes
  useEffect(() => {
    updatePendingSyncCount();
  }, [updatePendingSyncCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0 && !syncInProgress.current) {
      // Delay sync slightly to ensure connection is stable
      const timer = setTimeout(() => {
        syncOfflineProgress();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingSyncCount]);

  const recordOfflineProgress = useCallback(async (entry: Omit<ProgressEntry, 'id' | 'createdAt'>): Promise<string> => {
    const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const offlineEntry: OfflineProgressEntry = {
      ...entry,
      id: offlineId,
      offlineId,
      createdAt: new Date(),
      synced: false
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const entries = stored ? JSON.parse(stored) : [];
      entries.push(offlineEntry);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      updatePendingSyncCount();
      
      // If online, try to sync immediately
      if (isOnline) {
        setTimeout(() => syncOfflineProgress(), 500);
      }
      
      return offlineId;
    } catch (error) {
      console.error('Error recording offline progress:', error);
      throw new Error('Failed to save progress offline');
    }
  }, [isOnline, updatePendingSyncCount]);

  const syncOfflineProgress = useCallback(async (): Promise<boolean> => {
    if (!isOnline || syncInProgress.current) {
      return false;
    }

    syncInProgress.current = true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const entries: OfflineProgressEntry[] = stored ? JSON.parse(stored) : [];
      const unsyncedEntries = entries.filter(entry => !entry.synced);

      if (unsyncedEntries.length === 0) {
        syncInProgress.current = false;
        return true;
      }

      // Simulate API sync - replace with actual API calls
      const syncPromises = unsyncedEntries.map(async (entry) => {
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // In a real implementation, this would be:
          // const response = await fetch('/api/progress/record', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(entry)
          // });
          // 
          // if (!response.ok) throw new Error('Sync failed');
          // const result = await response.json();
          
          // For now, simulate success
          return { success: true, offlineId: entry.offlineId, serverId: `server_${Date.now()}` };
        } catch (error) {
          console.error(`Failed to sync entry ${entry.offlineId}:`, error);
          return { success: false, offlineId: entry.offlineId, error };
        }
      });

      const results = await Promise.all(syncPromises);
      const successfulSyncs = results.filter(result => result.success);

      if (successfulSyncs.length > 0) {
        // Mark successful entries as synced
        const updatedEntries = entries.map(entry => {
          const syncResult = successfulSyncs.find(result => result.offlineId === entry.offlineId);
          if (syncResult) {
            return {
              ...entry,
              synced: true,
              id: syncResult.serverId || entry.id // Update with server ID if available
            };
          }
          return entry;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
        setLastSyncTime(new Date());
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        updatePendingSyncCount();
      }

      syncInProgress.current = false;
      return successfulSyncs.length === unsyncedEntries.length;
    } catch (error) {
      console.error('Error syncing offline progress:', error);
      syncInProgress.current = false;
      return false;
    }
  }, [isOnline, updatePendingSyncCount]);

  const getOfflineProgress = useCallback((): OfflineProgressEntry[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting offline progress:', error);
      return [];
    }
  }, []);

  const clearSyncedProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const entries: OfflineProgressEntry[] = stored ? JSON.parse(stored) : [];
      const unsyncedEntries = entries.filter(entry => !entry.synced);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unsyncedEntries));
      updatePendingSyncCount();
    } catch (error) {
      console.error('Error clearing synced progress:', error);
    }
  }, [updatePendingSyncCount]);

  return {
    isOnline,
    pendingSyncCount,
    recordOfflineProgress,
    syncOfflineProgress,
    getOfflineProgress,
    clearSyncedProgress,
    lastSyncTime
  };
}

// Hook for offline-aware progress tracking
export function useOfflineAwareProgress() {
  const {
    isOnline,
    pendingSyncCount,
    recordOfflineProgress,
    syncOfflineProgress,
    lastSyncTime
  } = useOfflineProgress();

  const recordProgress = useCallback(async (entry: Omit<ProgressEntry, 'id' | 'createdAt'>) => {
    if (isOnline) {
      try {
        // Try to record online first
        // In a real implementation:
        // const response = await fetch('/api/progress/record', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(entry)
        // });
        // 
        // if (response.ok) {
        //   return await response.json();
        // }
        
        // Simulate online success
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id: `online_${Date.now()}`, success: true };
      } catch (error) {
        console.warn('Online recording failed, falling back to offline:', error);
        return await recordOfflineProgress(entry);
      }
    } else {
      // Record offline
      return await recordOfflineProgress(entry);
    }
  }, [isOnline, recordOfflineProgress]);

  return {
    recordProgress,
    isOnline,
    pendingSyncCount,
    syncOfflineProgress,
    lastSyncTime
  };
}

// Hook data for offline status component
export function useOfflineStatus() {
  const { isOnline, pendingSyncCount, syncOfflineProgress, lastSyncTime } = useOfflineProgress();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncOfflineProgress();
    setIsSyncing(false);
  };

  return {
    isOnline,
    pendingSyncCount,
    lastSyncTime,
    isSyncing,
    handleManualSync,
    shouldShow: !isOnline || pendingSyncCount > 0
  };
}