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

    expect(screen.getByText('star')).toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(
      <AchievementBadge achievement={mockAchievement} size="sm" />
    );

    // The size classes are applied to the motion.div element (the badge itself)
    let badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
    expect(badgeElement).toHaveClass('w-12', 'h-12', 'text-lg');

    rerender(<AchievementBadge achievement={mockAchievement} size="md" />);
    badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
    expect(badgeElement).toHaveClass('w-16', 'h-16', 'text-xl');

    rerender(<AchievementBadge achievement={mockAchievement} size="lg" />);
    badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
    expect(badgeElement).toHaveClass('w-20', 'h-20', 'text-2xl');
  });

  it('should apply correct rarity styles', () => {
    const rarities: AchievementRarity[] = ['common', 'rare', 'epic', 'legendary'];

    rarities.forEach((rarity) => {
      const achievementWithRarity = { ...mockAchievement, rarity };
      const { unmount } = render(<AchievementBadge achievement={achievementWithRarity} />);

      // The rarity styles are applied to the motion.div (badge element)
      const badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
      
      switch (rarity) {
        case 'common':
          expect(badgeElement).toHaveClass('from-slate-400', 'to-slate-600');
          break;
        case 'rare':
          expect(badgeElement).toHaveClass('from-blue-400', 'to-blue-600');
          break;
        case 'epic':
          expect(badgeElement).toHaveClass('from-purple-400', 'to-purple-600');
          break;
        case 'legendary':
          expect(badgeElement).toHaveClass('from-yellow-400', 'to-orange-500');
          break;
      }
      
      unmount(); // Clean up after each render
    });
  });

  it('should show different styles for earned vs unearned achievements', () => {
    const { rerender } = render(
      <AchievementBadge achievement={mockAchievement} isEarned={false} />
    );

    let badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
    expect(badgeElement).toHaveClass('opacity-40', 'grayscale');

    rerender(<AchievementBadge achievement={mockAchievement} isEarned={true} />);
    badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
    expect(badgeElement).toHaveClass('opacity-100');
    expect(badgeElement).toHaveClass('shadow-lg');
  });

  it('should apply custom className', () => {
    render(
      <AchievementBadge 
        achievement={mockAchievement} 
        className="custom-class" 
      />
    );

    // Custom className is applied to the outer container
    const container = screen.getByText('star').closest('div')?.parentElement?.parentElement?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('should handle tooltip display', () => {
    const { rerender } = render(
      <AchievementBadge achievement={mockAchievement} showTooltip={true} />
    );

    // With tooltip enabled, should have tooltip attributes
    let badge = screen.getByText('star').closest('div');
    expect(badge).toBeInTheDocument();

    rerender(
      <AchievementBadge achievement={mockAchievement} showTooltip={false} />
    );

    // Should still render without tooltip
    badge = screen.getByText('star').closest('div');
    expect(badge).toBeInTheDocument();
  });

  it('should display achievement points', () => {
    render(<AchievementBadge achievement={mockAchievement} />);

    // Points are displayed in the tooltip
    expect(screen.getByText('50 Punkte')).toBeInTheDocument();
  });

  it('should handle different badge icons', () => {
    const achievementWithIcon = { ...mockAchievement, badgeIcon: 'trophy' };
    render(<AchievementBadge achievement={achievementWithIcon} />);

    // The icon should be rendered (implementation depends on how icons are handled)
    expect(screen.getByText('trophy')).toBeInTheDocument();
  });

  it('should handle hover interactions', () => {
    render(<AchievementBadge achievement={mockAchievement} />);

    const badge = screen.getByText('star').closest('div');
    
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

    const badge = screen.getByText('star').closest('div');
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
      
      const { unmount } = render(<AchievementBadge achievement={achievementWithCategory} />);
      expect(screen.getByText('star')).toBeInTheDocument();
      unmount(); // Clean up after each render
    });
  });

  it('should handle long achievement names gracefully', () => {
    const longNameAchievement = {
      ...mockAchievement,
      name: 'This is a very long achievement name that should be handled gracefully',
    };

    render(<AchievementBadge achievement={longNameAchievement} />);

    expect(screen.getByText('star')).toBeInTheDocument();
  });

  it('should handle achievements with no points', () => {
    const noPointsAchievement = { ...mockAchievement, points: 0 };
    render(<AchievementBadge achievement={noPointsAchievement} />);

    expect(screen.getByText('0 Punkte')).toBeInTheDocument();
  });

  it('should handle achievements with high point values', () => {
    const highPointsAchievement = { ...mockAchievement, points: 9999 };
    render(<AchievementBadge achievement={highPointsAchievement} />);

    expect(screen.getByText('9999 Punkte')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<AchievementBadge achievement={mockAchievement} />);

    // The tabindex is applied to the motion.div (badge element)
    const badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
    
    // Should have proper ARIA attributes
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveAttribute('tabindex', '0');
  });

  it('should handle earned state with glow effects', () => {
    const legendaryAchievement = { ...mockAchievement, rarity: 'legendary' as AchievementRarity };
    
    render(
      <AchievementBadge 
        achievement={legendaryAchievement} 
        isEarned={true} 
      />
    );

    const badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
    
    // Should have glow effects for earned legendary achievements
    expect(badgeElement).toHaveClass('shadow-lg');
  });

  it('should handle missing or undefined props gracefully', () => {
    // Test with minimal props
    const minimalAchievement = {
      id: 'minimal',
      name: 'Minimal Achievement',
      description: 'Minimal',
      category: 'milestone' as any,
      criteria: {},
      badgeIcon: 'empty',
      points: 0,
      rarity: 'common' as AchievementRarity,
      createdAt: new Date(),
    };

    render(<AchievementBadge achievement={minimalAchievement} />);

    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('should handle animation states correctly', () => {
    const { rerender } = render(
      <AchievementBadge achievement={mockAchievement} isEarned={false} />
    );

    let badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
    expect(badgeElement).toBeInTheDocument();

    // Change to earned state
    rerender(
      <AchievementBadge achievement={mockAchievement} isEarned={true} />
    );

    badgeElement = screen.getByText('star').closest('div')?.parentElement?.parentElement;
    expect(badgeElement).toHaveClass('shadow-lg');
  });
});