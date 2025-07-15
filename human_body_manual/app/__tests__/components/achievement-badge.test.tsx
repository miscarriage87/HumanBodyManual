import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import AchievementBadge from '../../components/achievement-badge';
import { Achievement, AchievementRarity } from '../../lib/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// Mock utils
jest.mock('../../lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('AchievementBadge', () => {
  const mockAchievement: Achievement = {
    id: 'test-achievement',
    name: 'Test Achievement',
    description: 'This is a test achievement',
    category: 'milestone',
    criteria: { type: 'total_sessions', target: 10 },
    badgeIcon: 'star',
    points: 50,
    rarity: 'common' as AchievementRarity,
    createdAt: new Date(),
  };

  it('should render achievement badge with basic props', () => {
    render(<AchievementBadge achievement={mockAchievement} />);

    expect(screen.getByText('Test Achievement')).toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(
      <AchievementBadge achievement={mockAchievement} size="sm" />
    );

    let badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).toHaveClass('w-12', 'h-12', 'text-lg');

    rerender(<AchievementBadge achievement={mockAchievement} size="md" />);
    badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).toHaveClass('w-16', 'h-16', 'text-xl');

    rerender(<AchievementBadge achievement={mockAchievement} size="lg" />);
    badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).toHaveClass('w-20', 'h-20', 'text-2xl');
  });

  it('should apply correct rarity styles', () => {
    const rarities: AchievementRarity[] = ['common', 'rare', 'epic', 'legendary'];

    rarities.forEach((rarity) => {
      const achievementWithRarity = { ...mockAchievement, rarity };
      const { rerender } = render(
        <AchievementBadge achievement={achievementWithRarity} />
      );

      const badge = screen.getByText('Test Achievement').closest('div');
      
      switch (rarity) {
        case 'common':
          expect(badge).toHaveClass('from-slate-400', 'to-slate-600');
          break;
        case 'rare':
          expect(badge).toHaveClass('from-blue-400', 'to-blue-600');
          break;
        case 'epic':
          expect(badge).toHaveClass('from-purple-400', 'to-purple-600');
          break;
        case 'legendary':
          expect(badge).toHaveClass('from-yellow-400', 'to-orange-500');
          break;
      }
    });
  });

  it('should show different styles for earned vs unearned achievements', () => {
    const { rerender } = render(
      <AchievementBadge achievement={mockAchievement} isEarned={false} />
    );

    let badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).not.toHaveClass('shadow-lg');

    rerender(<AchievementBadge achievement={mockAchievement} isEarned={true} />);
    badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).toHaveClass('shadow-lg');
  });

  it('should apply custom className', () => {
    render(
      <AchievementBadge 
        achievement={mockAchievement} 
        className="custom-class" 
      />
    );

    const badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).toHaveClass('custom-class');
  });

  it('should handle tooltip display', () => {
    const { rerender } = render(
      <AchievementBadge achievement={mockAchievement} showTooltip={true} />
    );

    // With tooltip enabled, should have tooltip attributes
    let badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).toBeInTheDocument();

    rerender(
      <AchievementBadge achievement={mockAchievement} showTooltip={false} />
    );

    // Should still render without tooltip
    badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).toBeInTheDocument();
  });

  it('should display achievement points', () => {
    render(<AchievementBadge achievement={mockAchievement} />);

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('should handle different badge icons', () => {
    const achievementWithIcon = { ...mockAchievement, badgeIcon: 'trophy' };
    render(<AchievementBadge achievement={achievementWithIcon} />);

    // The icon should be rendered (implementation depends on how icons are handled)
    expect(screen.getByText('Test Achievement')).toBeInTheDocument();
  });

  it('should handle hover interactions', () => {
    render(<AchievementBadge achievement={mockAchievement} />);

    const badge = screen.getByText('Test Achievement').closest('div');
    
    // Simulate hover
    fireEvent.mouseEnter(badge!);
    expect(badge).toBeInTheDocument();

    fireEvent.mouseLeave(badge!);
    expect(badge).toBeInTheDocument();
  });

  it('should handle click interactions', () => {
    const handleClick = jest.fn();
    render(
      <div onClick={handleClick}>
        <AchievementBadge achievement={mockAchievement} />
      </div>
    );

    const badge = screen.getByText('Test Achievement').closest('div');
    fireEvent.click(badge!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with all achievement categories', () => {
    const categories = ['milestone', 'streak', 'mastery', 'exploration', 'consistency'];

    categories.forEach((category) => {
      const achievementWithCategory = { 
        ...mockAchievement, 
        category: category as any,
        name: `${category} Achievement`
      };
      
      render(<AchievementBadge achievement={achievementWithCategory} />);
      expect(screen.getByText(`${category} Achievement`)).toBeInTheDocument();
    });
  });

  it('should handle long achievement names gracefully', () => {
    const longNameAchievement = {
      ...mockAchievement,
      name: 'This is a very long achievement name that should be handled gracefully',
    };

    render(<AchievementBadge achievement={longNameAchievement} />);

    expect(screen.getByText(longNameAchievement.name)).toBeInTheDocument();
  });

  it('should handle achievements with no points', () => {
    const noPointsAchievement = { ...mockAchievement, points: 0 };
    render(<AchievementBadge achievement={noPointsAchievement} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle achievements with high point values', () => {
    const highPointsAchievement = { ...mockAchievement, points: 9999 };
    render(<AchievementBadge achievement={highPointsAchievement} />);

    expect(screen.getByText('9999')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<AchievementBadge achievement={mockAchievement} />);

    const badge = screen.getByText('Test Achievement').closest('div');
    
    // Should have proper ARIA attributes
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('role', 'button');
  });

  it('should handle earned state with glow effects', () => {
    const legendaryAchievement = { ...mockAchievement, rarity: 'legendary' as AchievementRarity };
    
    render(
      <AchievementBadge 
        achievement={legendaryAchievement} 
        isEarned={true} 
      />
    );

    const badge = screen.getByText('Test Achievement').closest('div');
    
    // Should have glow effects for earned legendary achievements
    expect(badge).toHaveClass('shadow-lg');
  });

  it('should handle missing or undefined props gracefully', () => {
    // Test with minimal props
    const minimalAchievement = {
      id: 'minimal',
      name: 'Minimal Achievement',
      description: 'Minimal',
      category: 'milestone' as any,
      criteria: {},
      badgeIcon: '',
      points: 0,
      rarity: 'common' as AchievementRarity,
      createdAt: new Date(),
    };

    render(<AchievementBadge achievement={minimalAchievement} />);

    expect(screen.getByText('Minimal Achievement')).toBeInTheDocument();
  });

  it('should handle animation states correctly', () => {
    const { rerender } = render(
      <AchievementBadge achievement={mockAchievement} isEarned={false} />
    );

    let badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).toBeInTheDocument();

    // Change to earned state
    rerender(
      <AchievementBadge achievement={mockAchievement} isEarned={true} />
    );

    badge = screen.getByText('Test Achievement').closest('div');
    expect(badge).toHaveClass('shadow-lg');
  });
});