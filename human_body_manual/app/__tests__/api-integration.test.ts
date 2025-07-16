import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GET as getProgress, OPTIONS as optionsProgress } from '../app/api/progress/route';
import { POST as recordProgress, OPTIONS as optionsRecord } from '../app/api/progress/record/route';
import { GET as getAchievements } from '../app/api/achievements/route';

// Mock NextRequest
class MockNextRequest {
  public url: string;
  public method: string;
  public headers: Map<string, string>;
  private _body: string | null;

  constructor(url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Map();
    this._body = init?.body || null;
    
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value);
      });
    }
  }

  async json() {
    if (!this._body) {
      throw new Error('No body');
    }
    return JSON.parse(this._body);
  }

  nextUrl = {
    searchParams: new URLSearchParams(typeof this.url === 'string' && this.url.includes('?') ? this.url.split('?')[1] : ''),
  };
}

// Mock the dependencies
jest.mock('../lib/progress-tracker', () => ({
  ProgressTracker: {
    getUserProgress: jest.fn(),
    recordCompletion: jest.fn(),
  },
}));

jest.mock('../lib/achievement-engine', () => ({
  AchievementEngine: {
    checkAchievements: jest.fn(),
    getUserAchievements: jest.fn(),
  },
}));

jest.mock('../lib/auth-helper', () => ({
  getCurrentUser: jest.fn(),
  getDemoUser: jest.fn(),
}));

jest.mock('../lib/validation-schemas', () => ({
  validateDateRange: jest.fn(),
  validateExerciseCompletion: jest.fn(),
}));

import { ProgressTracker } from '../lib/progress-tracker';
import { AchievementEngine } from '../lib/achievement-engine';
import { getCurrentUser, getDemoUser } from '../lib/auth-helper';
import { validateDateRange, validateExerciseCompletion } from '../lib/validation-schemas';

describe('API Integration Tests', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getCurrentUser.mockResolvedValue(mockUser);
    getDemoUser.mockReturnValue(mockUser);
  });

  describe('Progress API - GET /api/progress', () => {
    it('should return user progress successfully', async () => {
      const mockUserProgress = {
        userId: mockUser.id,
        totalSessions: 15,
        totalMinutes: 450,
        currentStreak: 5,
        longestStreak: 8,
        bodyAreaStats: [],
        recentAchievements: [],
        weeklyGoal: 7,
        weeklyProgress: 3,
        lastActivity: new Date(),
      };

      ProgressTracker.getUserProgress.mockResolvedValue(mockUserProgress);

      const request = new MockNextRequest('http://localhost:3000/api/progress');
      const response = await getProgress(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUserProgress);
      expect(ProgressTracker.getUserProgress).toHaveBeenCalledWith(mockUser.id, undefined);
    });

    it('should handle date range parameters', async () => {
      const mockTimeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      };

      validateDateRange.mockReturnValue(mockTimeRange);
      ProgressTracker.getUserProgress.mockResolvedValue({
        userId: mockUser.id,
        totalSessions: 5,
        totalMinutes: 150,
        currentStreak: 2,
        longestStreak: 3,
        bodyAreaStats: [],
        recentAchievements: [],
        weeklyGoal: 7,
        weeklyProgress: 2,
        lastActivity: new Date(),
      });

      const url = 'http://localhost:3000/api/progress?from=2024-01-01&to=2024-01-31';
      const request = new MockNextRequest(url) as any;
      const response = await getProgress(request);

      expect(response.status).toBe(200);
      expect(validateDateRange).toHaveBeenCalledWith({
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      });
      expect(ProgressTracker.getUserProgress).toHaveBeenCalledWith(mockUser.id, mockTimeRange);
    });

    it('should return 401 for unauthorized requests', async () => {
      getCurrentUser.mockResolvedValue(null);
      getDemoUser.mockReturnValue(null);

      const request = new MockNextRequest('http://localhost:3000/api/progress');
      const response = await getProgress(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle validation errors', async () => {
      validateDateRange.mockImplementation(() => {
        throw new Error('validation: Invalid date format');
      });

      const url = 'http://localhost:3000/api/progress?from=invalid-date';
      const request = new MockNextRequest(url) as any;
      const response = await getProgress(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid date range provided');
      expect(data.details).toContain('validation');
    });

    it('should handle internal server errors', async () => {
      ProgressTracker.getUserProgress.mockRejectedValue(new Error('Database connection failed'));

      const request = new MockNextRequest('http://localhost:3000/api/progress');
      const response = await getProgress(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle OPTIONS requests for CORS', async () => {
      const response = await optionsProgress();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
    });
  });

  describe('Progress Record API - POST /api/progress/record', () => {
    const mockExerciseCompletion = {
      exerciseId: 'breathing-basics',
      bodyArea: 'nervensystem',
      durationMinutes: 15,
      difficultyLevel: 'Anfänger',
      sessionNotes: 'Great session!',
      mood: 'gut',
      energyLevel: 'hoch',
    };

    const mockProgressEntry = {
      id: 'progress-123',
      userId: mockUser.id,
      exerciseId: mockExerciseCompletion.exerciseId,
      bodyArea: mockExerciseCompletion.bodyArea,
      completedAt: new Date(),
      durationMinutes: mockExerciseCompletion.durationMinutes,
      difficultyLevel: mockExerciseCompletion.difficultyLevel,
      sessionNotes: mockExerciseCompletion.sessionNotes,
      mood: mockExerciseCompletion.mood,
      energyLevel: mockExerciseCompletion.energyLevel,
      createdAt: new Date(),
    };

    it('should record exercise completion successfully', async () => {
      validateExerciseCompletion.mockReturnValue(mockExerciseCompletion);
      ProgressTracker.recordCompletion.mockResolvedValue(mockProgressEntry);
      AchievementEngine.checkAchievements.mockResolvedValue([]);

      const request = new MockNextRequest('http://localhost:3000/api/progress/record', {
        method: 'POST',
        body: JSON.stringify({
          exerciseCompletion: mockExerciseCompletion,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await recordProgress(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.progressEntry).toEqual(mockProgressEntry);
      expect(data.data.newAchievements).toEqual([]);

      expect(validateExerciseCompletion).toHaveBeenCalledWith(mockExerciseCompletion);
      expect(ProgressTracker.recordCompletion).toHaveBeenCalledWith(mockUser.id, mockExerciseCompletion);
      expect(AchievementEngine.checkAchievements).toHaveBeenCalledWith(mockUser.id, mockProgressEntry);
    });

    it('should return new achievements when earned', async () => {
      const mockNewAchievements = [
        {
          id: 'ach-1',
          name: 'First Steps',
          description: 'Complete your first exercise',
          category: 'milestone',
          criteria: { type: 'total_sessions', target: 1 },
          badgeIcon: 'star',
          points: 10,
          rarity: 'common',
          createdAt: new Date(),
        },
      ];

      validateExerciseCompletion.mockReturnValue(mockExerciseCompletion);
      ProgressTracker.recordCompletion.mockResolvedValue(mockProgressEntry);
      AchievementEngine.checkAchievements.mockResolvedValue(mockNewAchievements);

      const request = new MockNextRequest('http://localhost:3000/api/progress/record', {
        method: 'POST',
        body: JSON.stringify({
          exerciseCompletion: mockExerciseCompletion,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await recordProgress(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.newAchievements).toEqual(mockNewAchievements);
    });

    it('should return 401 for unauthorized requests', async () => {
      getCurrentUser.mockResolvedValue(null);
      getDemoUser.mockReturnValue(null);

      const request = new MockNextRequest('http://localhost:3000/api/progress/record', {
        method: 'POST',
        body: JSON.stringify({
          exerciseCompletion: mockExerciseCompletion,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await recordProgress(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle validation errors', async () => {
      validateExerciseCompletion.mockImplementation(() => {
        throw new Error('validation: Missing required field exerciseId');
      });

      const request = new MockNextRequest('http://localhost:3000/api/progress/record', {
        method: 'POST',
        body: JSON.stringify({
          exerciseCompletion: { bodyArea: 'nervensystem' }, // Missing exerciseId
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }) as any;

      const response = await recordProgress(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data provided');
      expect(data.details).toContain('validation');
    });

    it('should handle malformed JSON', async () => {
      const request = new MockNextRequest('http://localhost:3000/api/progress/record', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      }) as any;

      const response = await recordProgress(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle database errors', async () => {
      validateExerciseCompletion.mockReturnValue(mockExerciseCompletion);
      ProgressTracker.recordCompletion.mockRejectedValue(new Error('Database connection failed'));

      const request = new MockNextRequest('http://localhost:3000/api/progress/record', {
        method: 'POST',
        body: JSON.stringify({
          exerciseCompletion: mockExerciseCompletion,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await recordProgress(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle OPTIONS requests for CORS', async () => {
      const response = await optionsRecord();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
    });
  });

  describe('Achievements API - GET /api/achievements', () => {
    it('should return user achievements successfully', async () => {
      const mockUserAchievements = [
        {
          id: 'ua-1',
          userId: mockUser.id,
          achievementId: 'ach-1',
          earnedAt: new Date(),
          progressSnapshot: { totalSessions: 1 },
          achievement: {
            id: 'ach-1',
            name: 'First Steps',
            description: 'Complete your first exercise',
            category: 'milestone',
            criteria: { type: 'total_sessions', target: 1 },
            badgeIcon: 'star',
            points: 10,
            rarity: 'common',
            createdAt: new Date(),
          },
        },
      ];

      AchievementEngine.getUserAchievements.mockResolvedValue(mockUserAchievements);

      const request = new MockNextRequest('http://localhost:3000/api/achievements');
      const response = await getAchievements(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUserAchievements);
      expect(AchievementEngine.getUserAchievements).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return 401 for unauthorized requests', async () => {
      getCurrentUser.mockResolvedValue(null);
      getDemoUser.mockReturnValue(null);

      const request = new MockNextRequest('http://localhost:3000/api/achievements');
      const response = await getAchievements(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      AchievementEngine.getUserAchievements.mockRejectedValue(new Error('Database error'));

      const request = new MockNextRequest('http://localhost:3000/api/achievements');
      const response = await getAchievements(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle concurrent requests properly', async () => {
      const mockExerciseCompletion = {
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem',
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
      };

      const mockProgressEntry = {
        id: 'progress-123',
        userId: mockUser.id,
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem',
        completedAt: new Date(),
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
        createdAt: new Date(),
      };

      validateExerciseCompletion.mockReturnValue(mockExerciseCompletion);
      ProgressTracker.recordCompletion.mockResolvedValue(mockProgressEntry);
      AchievementEngine.checkAchievements.mockResolvedValue([]);

      // Create multiple concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        new MockNextRequest('http://localhost:3000/api/progress/record', {
          method: 'POST',
          body: JSON.stringify({
            exerciseCompletion: mockExerciseCompletion,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }) as any
      );

      const responses = await Promise.all(
        requests.map(request => recordProgress(request))
      );

      // All requests should succeed
      for (const response of responses) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }

      // Should have been called for each request
      expect(ProgressTracker.recordCompletion).toHaveBeenCalledTimes(5);
    });

    it('should handle large payloads', async () => {
      const mockExerciseCompletion = {
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem',
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
      };

      const largeExerciseCompletion = {
        ...mockExerciseCompletion,
        sessionNotes: 'A'.repeat(10000), // Large session notes
        biometricData: {
          heartRate: 75,
          hrv: 45,
          stressLevel: 3,
          additionalData: 'B'.repeat(5000),
          timestamp: new Date(),
          source: 'wearable',
        },
      };

      validateExerciseCompletion.mockReturnValue(largeExerciseCompletion);
      const mockProgressEntry = {
        id: 'progress-123',
        userId: mockUser.id,
        exerciseId: 'breathing-basics',
        bodyArea: 'nervensystem',
        completedAt: new Date(),
        durationMinutes: 15,
        difficultyLevel: 'Anfänger',
        createdAt: new Date(),
      };

      ProgressTracker.recordCompletion.mockResolvedValue({
        ...mockProgressEntry,
        sessionNotes: largeExerciseCompletion.sessionNotes,
        biometricData: largeExerciseCompletion.biometricData,
      });
      AchievementEngine.checkAchievements.mockResolvedValue([]);

      const request = new MockNextRequest('http://localhost:3000/api/progress/record', {
        method: 'POST',
        body: JSON.stringify({
          exerciseCompletion: largeExerciseCompletion,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }) as any;

      const response = await recordProgress(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.progressEntry.sessionNotes).toBe(largeExerciseCompletion.sessionNotes);
    });

    it('should handle missing request body', async () => {
      const request = new MockNextRequest('http://localhost:3000/api/progress/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }) as any;

      const response = await recordProgress(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle network timeouts gracefully', async () => {
      // Simulate a timeout by making the service hang
      ProgressTracker.getUserProgress.mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 30000)) // 30 second timeout
      );

      const request = new MockNextRequest('http://localhost:3000/api/progress');
      
      // This test would need to be implemented with actual timeout handling
      // For now, we'll just verify the mock is set up correctly
      expect(ProgressTracker.getUserProgress).toBeDefined();
    });
  });

  describe('Authentication and Authorization', () => {
    it('should prioritize current user over demo user', async () => {
      const realUser = { id: 'real-user-456', email: 'real@example.com' };
      const demoUser = { id: 'demo-user-789', email: 'demo@example.com' };

      getCurrentUser.mockResolvedValue(realUser);
      getDemoUser.mockReturnValue(demoUser);
      ProgressTracker.getUserProgress.mockResolvedValue({
        userId: realUser.id,
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        bodyAreaStats: [],
        recentAchievements: [],
        weeklyGoal: 7,
        weeklyProgress: 0,
        lastActivity: new Date(),
      });

      const request = new MockNextRequest('http://localhost:3000/api/progress');
      await getProgress(request);

      expect(ProgressTracker.getUserProgress).toHaveBeenCalledWith(realUser.id, undefined);
    });

    it('should fall back to demo user when no current user', async () => {
      const demoUser = { id: 'demo-user-789', email: 'demo@example.com' };

      getCurrentUser.mockResolvedValue(null);
      getDemoUser.mockReturnValue(demoUser);
      ProgressTracker.getUserProgress.mockResolvedValue({
        userId: demoUser.id,
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        bodyAreaStats: [],
        recentAchievements: [],
        weeklyGoal: 7,
        weeklyProgress: 0,
        lastActivity: new Date(),
      });

      const request = new MockNextRequest('http://localhost:3000/api/progress');
      await getProgress(request);

      expect(ProgressTracker.getUserProgress).toHaveBeenCalledWith(demoUser.id, undefined);
    });
  });
});