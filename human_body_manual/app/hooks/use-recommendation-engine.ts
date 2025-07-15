import { useState, useEffect } from 'react';
import { 
  OptimalPracticeTime, 
  PlateauDetection, 
  MotivationalMessage, 
  ComplementaryTechnique 
} from '../lib/recommendation-engine';
import { UserInsight } from '../lib/types';

interface RecommendationState {
  optimalTimes: OptimalPracticeTime[];
  plateauDetection: PlateauDetection | null;
  motivationalMessage: MotivationalMessage | null;
  complementaryTechniques: ComplementaryTechnique[];
  insights: UserInsight[];
  isLoading: boolean;
  error: string | null;
}

export function useRecommendationEngine(userId: string | null) {
  const [state, setState] = useState<RecommendationState>({
    optimalTimes: [],
    plateauDetection: null,
    motivationalMessage: null,
    complementaryTechniques: [],
    insights: [],
    isLoading: false,
    error: null,
  });

  const fetchRecommendations = async (type?: string) => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({ userId });
      if (type) params.append('type', type);

      const response = await fetch(`/api/recommendations?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        ...data,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
    }
  };

  const generateInsights = async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'generate-insights',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        insights: data.insights,
        isLoading: false,
      }));

      return data.insights;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
      throw error;
    }
  };

  const fetchOptimalTimes = () => fetchRecommendations('optimal-times');
  const fetchPlateauDetection = () => fetchRecommendations('plateau-detection');
  const fetchMotivationalMessage = () => fetchRecommendations('motivational-message');
  const fetchComplementaryTechniques = () => fetchRecommendations('complementary-techniques');
  const fetchComprehensiveInsights = () => fetchRecommendations('comprehensive');

  // Auto-fetch comprehensive insights when userId changes
  useEffect(() => {
    if (userId) {
      fetchComprehensiveInsights();
    }
  }, [userId]);

  return {
    ...state,
    actions: {
      fetchOptimalTimes,
      fetchPlateauDetection,
      fetchMotivationalMessage,
      fetchComplementaryTechniques,
      fetchComprehensiveInsights,
      generateInsights,
      refresh: () => fetchComprehensiveInsights(),
    },
  };
}

// Specialized hooks for specific recommendation types
export function useOptimalPracticeTimes(userId: string | null) {
  const [optimalTimes, setOptimalTimes] = useState<OptimalPracticeTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimalTimes = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/recommendations?userId=${userId}&type=optimal-times`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch optimal practice times');
      }

      const data = await response.json();
      setOptimalTimes(data.optimalTimes || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOptimalTimes();
    }
  }, [userId]);

  return {
    optimalTimes,
    isLoading,
    error,
    refresh: fetchOptimalTimes,
  };
}

export function usePlateauDetection(userId: string | null) {
  const [plateauDetection, setPlateauDetection] = useState<PlateauDetection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlateauDetection = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/recommendations?userId=${userId}&type=plateau-detection`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch plateau detection');
      }

      const data = await response.json();
      setPlateauDetection(data.plateauDetection);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPlateauDetection();
    }
  }, [userId]);

  return {
    plateauDetection,
    isLoading,
    error,
    refresh: fetchPlateauDetection,
  };
}

export function useMotivationalMessage(userId: string | null) {
  const [motivationalMessage, setMotivationalMessage] = useState<MotivationalMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMotivationalMessage = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/recommendations?userId=${userId}&type=motivational-message`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch motivational message');
      }

      const data = await response.json();
      setMotivationalMessage(data.motivationalMessage);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMotivationalMessage();
    }
  }, [userId]);

  return {
    motivationalMessage,
    isLoading,
    error,
    refresh: fetchMotivationalMessage,
  };
}

export function useComplementaryTechniques(userId: string | null) {
  const [complementaryTechniques, setComplementaryTechniques] = useState<ComplementaryTechnique[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplementaryTechniques = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/recommendations?userId=${userId}&type=complementary-techniques`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch complementary techniques');
      }

      const data = await response.json();
      setComplementaryTechniques(data.complementaryTechniques || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchComplementaryTechniques();
    }
  }, [userId]);

  return {
    complementaryTechniques,
    isLoading,
    error,
    refresh: fetchComplementaryTechniques,
  };
}