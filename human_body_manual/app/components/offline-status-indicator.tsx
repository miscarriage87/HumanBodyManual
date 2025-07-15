'use client';

import React from 'react';
import { useOfflineStatus } from '@/hooks/use-offline-progress';

export function OfflineStatusIndicator() {
  const {
    isOnline,
    pendingSyncCount,
    lastSyncTime,
    isSyncing,
    handleManualSync,
    shouldShow
  } = useOfflineStatus();

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-charcoal-900">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {pendingSyncCount > 0 && (
          <>
            <p className="text-xs text-charcoal-600 mb-2">
              {pendingSyncCount} Einträge warten auf Synchronisation
            </p>
            
            {isOnline && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full bg-forest-600 text-white text-xs py-2 px-3 rounded-md hover:bg-forest-700 disabled:opacity-50 transition-colors"
              >
                {isSyncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
              </button>
            )}
          </>
        )}
        
        {lastSyncTime && (
          <p className="text-xs text-charcoal-500 mt-1">
            Letzte Sync: {lastSyncTime.toLocaleTimeString('de-DE')}
          </p>
        )}
      </div>
    </div>
  );
}