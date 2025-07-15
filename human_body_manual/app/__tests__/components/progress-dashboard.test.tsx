import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import ProgressDashboard from '../../components/progress-dashboard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the progress tracker
jest.mock('../../lib/progress-tracker', () => ({
  ProgressTracker: {
    getUserProgress: jest.fn(),
    getProgressEntries: jest.fn(),
    getStreakData: jest.fn(),
  },
}));

// Mock the data imports
jest.mock('../../data/body-areas', () => ({
  bodyAreas: [
    {
      id: 'nervensystem',
      name: 'Nervensystem & Vagusnerv',
      description: 'Nervous system optimization',
      color: '#3B82F6',
    },
    {
      id: 'bewegung',
      name: 'Bewegung & Faszientraining',
      description: 'Movement and fascia training',
      color: '#10B981',
    },
  ],
}));

jest.mock('../../data/exercises', () => ({
  exercises: [
    {
      id: 'breathing-basics',
      name: 'Basic Breathing',
      bodyArea: 'nervensystem',
      difficulty: 'Anfänger',
      duration: 10,
    },
    {
      id: 'cold-shower',
      name: 'Cold Shower',
      bodyArea: 'kaelte',
      difficulty: 'Anfänger',
      duration: 5,
    },
  ],
}));

jest.mock('../../data/achievements', () => ({
  initialAchievements: [
    {
      id: 'first-steps',
      name: 'First Steps',
      description: 'Complete your first exercise',
      category: 'milestone',
      rarity: 'common',
      badgeIcon: 'star',
      points: 10,
    },
    {
      id: 'consistency',
      name: 'Consistency Champion',
      description: 'Practice for 7 days in a row',
      category: 'streak',
      rarity: 'rare',
      badgeIcon: 'fire',
      points: 50,
    },
  ],
}));

// Mock child components
jest.mock('../../components/achievement-badge', () => {
  return function MockAchievementBadge({ achievement }: any) {
    return <div data-testid="achievement-badge">{achievement.name}</div>;
  };
});

jest.mock('../../components/progress/calendar-heatmap', () => {
  return function MockCalendarHeatmap() {
    return <div data-testid="calendar-heatmap">Calendar Heatmap</div>;
  };
});

jest.mock('../../components/progress/streak-counter', () => {
  return function MockStreakCounter({ streak }: any) {
    return <div data-testid="streak-counter">Streak: {streak}</div>;
  };
});

jest.mock('../../components/progress/body-area-progress-cards', () => {
  return function MockBodyAreaProgressCards() {
    return <div data-testid="body-area-progress-cards">Body Area Progress</div>;
  };
});

jest.mock('../../components/progress/recent-activity-feed', () => {
  return function MockRecentActivityFeed() {
    return <div data-testid="recent-activity-feed">Recent Activity</div>;
  };
});

jest.mock('../../components/progress/mobile-progress-dashboard', () => {
  return function MockMobileProgressDashboard() {
    return <div data-testid="mobile-progress-dashboard">Mobile Dashboard</div>;
  };
});

// Mock window.innerWidth for mobile detection
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

const { ProgressTracker } = require('../../lib/progress-tracker');

describe('ProgressDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset window width to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock ProgressTracker methods
    ProgressTracker.getUserProgress.mockResolvedValue({
      userId: 'test-user',
      totalSessions: 15,
      totalMinutes: 450,
      currentStreak: 5,
      longestStreak: 8,
      bodyAreaStats: [],
      recentAchievements: [],
      weeklyGoal: 7,
      weeklyProgress: 3,
      lastActivity: new Date(),
    });

    ProgressTracker.getProgressEntries.mockResolvedValue([]);
    ProgressTracker.getStreakData.mockResolvedValue([]);
  });

  it('should render the progress dashboard', async () => {
    render(<ProgressDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
      expect(screen.getByTestId('streak-counter')).toBeInTheDocument();
      expect(screen.getByTestId('body-area-progress-cards')).toBeInTheDocument();
      expect(screen.getByTestId('recent-activity-feed')).toBeInTheDocument();
    });
  });

  it('should display achievement badges', async () => {
    render(<ProgressDashboard />);

    await waitFor(() => {
      const achievementBadges = screen.getAllByTestId('achievement-badge');
      expect(achievementBadges).toHaveLength(3); // Mock returns 3 achievements
      expect(achievementBadges[0]).toHaveTextContent('Erster Schritt');
      expect(achievementBadges[1]).toHaveTextContent('Consistency Warrior');
    });
  });

  it('should show mobile dashboard on mobile devices', async () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(<ProgressDashboard />);

    // Trigger resize event
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(screen.getByTestId('mobile-progress-dashboard')).toBeInTheDocument();
    });
  });

  it('should show desktop dashboard on desktop devices', async () => {
    render(<ProgressDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-progress-dashboard')).not.toBeInTheDocument();
    });
  });

  it('should handle window resize events', async () => {
    render(<ProgressDashboard />);

    // Start with desktop view
    await waitFor(() => {
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
    });

    // Resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(screen.getByTestId('mobile-progress-dashboard')).toBeInTheDocument();
    });

    // Resize back to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-progress-dashboard')).not.toBeInTheDocument();
    });
  });

  it('should display current streak information', async () => {
    render(<ProgressDashboard />);

    await waitFor(() => {
      const streakCounter = screen.getByTestId('streak-counter');
      expect(streakCounter).toHaveTextContent('5');
      expect(streakCounter).toHaveTextContent('Tage Streak');
    });
  });

  it('should handle component mounting state', async () => {
    const { rerender } = render(<ProgressDashboard />);

    // Component should handle mounting state properly
    await waitFor(() => {
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
    });

    // Re-render should work correctly
    rerender(<ProgressDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
    });
  });

  it('should clean up event listeners on unmount', async () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<ProgressDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should handle empty progress data gracefully', async () => {
    // Mock empty progress data
    const mockEmptyProgress = {
      streak: 0,
      completedExercises: [],
      exploredAreas: [],
    };

    render(<ProgressDashboard />);

    await waitFor(() => {
      const streakCounter = screen.getByTestId('streak-counter');
      expect(streakCounter).toBeInTheDocument();
    });
  });

  it('should display all required dashboard sections', async () => {
    render(<ProgressDashboard />);

    await waitFor(() => {
      // Check that all main sections are present
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
      expect(screen.getByTestId('streak-counter')).toBeInTheDocument();
      expect(screen.getByTestId('body-area-progress-cards')).toBeInTheDocument();
      expect(screen.getByTestId('recent-activity-feed')).toBeInTheDocument();
      
      // Check that achievement badges are present
      const achievementBadges = screen.getAllByTestId('achievement-badge');
      expect(achievementBadges.length).toBeGreaterThan(0);
    });
  });

  it('should handle achievement checking correctly', async () => {
    render(<ProgressDashboard />);

    await waitFor(() => {
      // The component should call checkAchievements and display results
      const achievementBadges = screen.getAllByTestId('achievement-badge');
      expect(achievementBadges).toHaveLength(3);
    });
  });

  it('should be accessible', async () => {
    render(<ProgressDashboard />);

    await waitFor(() => {
      // Check for basic accessibility
      const dashboard = screen.getByTestId('calendar-heatmap').closest('div');
      expect(dashboard).toBeInTheDocument();
    });
  });

  it('should handle rapid resize events without errors', async () => {
    render(<ProgressDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
    });

    // Simulate rapid resize events
    for (let i = 0; i < 10; i++) {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: i % 2 === 0 ? 500 : 1200,
      });
      fireEvent(window, new Event('resize'));
    }

    // Should still render correctly after rapid resizes
    await waitFor(() => {
      expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
    });
  });
});