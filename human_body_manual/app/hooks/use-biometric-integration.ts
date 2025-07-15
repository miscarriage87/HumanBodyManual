import { useState, useEffect, useCallback } from 'react';
import { BiometricSnapshot, BiometricCorrelation, BiometricTrend, PrivacySettings } from '@/lib/types';

interface UseBiometricIntegrationProps {
  userId: string;
  autoFetch?: boolean;
}

interface BiometricIntegrationState {
  biometricData: BiometricSnapshot[];
  correlations: BiometricCorrelation[];
  trends: Record<string, BiometricTrend>;
  privacySettings: PrivacySettings | null;
  loading: boolean;
  error: string | null;
}

export function useBiometricIntegration({ userId, autoFetch = true }: UseBiometricIntegrationProps) {
  const [state, setState] = useState<BiometricIntegrationState>({
    biometricData: [],
    correlations: [],
    trends: {},
    privacySettings: null,
    loading: false,
    error: null
  });

  // Store biometric data
  const storeBiometricData = useCallback(async (
    biometricData: Omit<BiometricSnapshot, 'timestamp'> & { timestamp?: Date },
    exerciseId?: string
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const dataToSubmit = {
        ...biometricData,
        timestamp: biometricData.timestamp || new Date()
      };

      const response = await fetch('/api/biometric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          biometricData: {
            ...dataToSubmit,
            timestamp: dataToSubmit.timestamp.toISOString()
          },
          exerciseId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to store biometric data');
      }

      // Refresh data after successful storage
      await fetchBiometricData();

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      }));
    }
  }, [userId]);

  // Fetch biometric data
  const fetchBiometricData = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({ userId });
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/biometric?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch biometric data');
      }

      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        biometricData: result.data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })),
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      }));
    }
  }, [userId]);

  // Fetch correlation analysis
  const fetchCorrelations = useCallback(async (timeframe: 'week' | 'month' | 'quarter' = 'month') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/biometric/correlation?userId=${userId}&timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch correlations');
      }

      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        correlations: result.data,
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      }));
    }
  }, [userId]);

  // Fetch biometric trends
  const fetchTrends = useCallback(async (
    metric: 'heartRate' | 'hrv' | 'stressLevel' | 'sleepQuality' | 'recoveryScore',
    period: 'week' | 'month' | 'quarter' = 'month'
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/biometric/trends?userId=${userId}&metric=${metric}&period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trends');
      }

      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        trends: {
          ...prev.trends,
          [`${metric}_${period}`]: result.data
        },
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      }));
    }
  }, [userId]);

  // Fetch privacy settings
  const fetchPrivacySettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/biometric/privacy?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch privacy settings');
      }

      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        privacySettings: result.data
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [userId]);

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/biometric/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...settings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update privacy settings');
      }

      // Refresh privacy settings
      await fetchPrivacySettings();

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      }));
    }
  }, [userId, fetchPrivacySettings]);

  // Delete all biometric data
  const deleteBiometricData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/biometric?userId=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete biometric data');
      }

      // Clear local state
      setState(prev => ({
        ...prev,
        biometricData: [],
        correlations: [],
        trends: {},
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      }));
    }
  }, [userId]);

  // Auto-fetch data on mount
  useEffect(() => {
    if (autoFetch && userId) {
      fetchPrivacySettings();
      fetchBiometricData();
    }
  }, [userId, autoFetch, fetchPrivacySettings, fetchBiometricData]);

  return {
    // State
    biometricData: state.biometricData,
    correlations: state.correlations,
    trends: state.trends,
    privacySettings: state.privacySettings,
    loading: state.loading,
    error: state.error,

    // Actions
    storeBiometricData,
    fetchBiometricData,
    fetchCorrelations,
    fetchTrends,
    fetchPrivacySettings,
    updatePrivacySettings,
    deleteBiometricData,

    // Utility functions
    clearError: () => setState(prev => ({ ...prev, error: null })),
    refresh: () => {
      fetchBiometricData();
      fetchPrivacySettings();
    }
  };
}