
// Mock implementation for achievement engine tests
const mockAchievementEngine = {
  checkAchievements: jest.fn().mockImplementation((userId, progressData) => {
    return Promise.resolve([{
      id: 'ach-1',
      name: 'First Steps',
      description: 'Complete your first exercise',
      category: 'milestone',
      criteria: { type: 'total_sessions', target: 1 },
      badgeIcon: 'star',
      points: 10,
      rarity: 'common',
      createdAt: new Date(),
    }]);
  }),
  getUserAchievements: jest.fn().mockImplementation((userId) => {
    return Promise.resolve([{
      id: 'ua-1',
      userId,
      achievementId: 'ach-1',
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
      earnedAt: new Date(),
      progressSnapshot: {},
    }]);
  }),
  calculateProgress: jest.fn().mockImplementation((userId, achievementId) => {
    return Promise.resolve({
      achievementId,
      achievement: {
        id: achievementId,
        name: 'Test Achievement',
        description: 'Test description',
        category: 'milestone',
        criteria: { type: 'total_sessions', target: 10 },
        badgeIcon: 'star',
        points: 10,
        rarity: 'common',
        createdAt: new Date(),
      },
      currentProgress: 6,
      targetProgress: 10,
      progressPercentage: 60,
      isCompleted: false,
    });
  }),
  getAllAchievementsWithProgress: jest.fn().mockImplementation((userId) => {
    return Promise.resolve([
      {
        achievementId: 'ach-1',
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
        currentProgress: 1,
        targetProgress: 1,
        progressPercentage: 100,
        isCompleted: true,
      },
      {
        achievementId: 'ach-2',
        achievement: {
          id: 'ach-2',
          name: 'Regular Practice',
          description: 'Complete 10 exercises',
          category: 'milestone',
          criteria: { type: 'total_sessions', target: 10 },
          badgeIcon: 'medal',
          points: 20,
          rarity: 'uncommon',
          createdAt: new Date(),
        },
        currentProgress: 7,
        targetProgress: 10,
        progressPercentage: 70,
        isCompleted: false,
      },
    ]);
  }),
  getAchievementStats: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      totalAchievements: 25,
      totalAwarded: 150,
      mostEarnedAchievement: {
        name: 'First Steps',
        count: 50,
      },
      rareAchievements: [
        {
          name: 'Master of All',
          count: 3,
        },
      ],
    });
  }),
};

// Export the mock
module.exports = { mockAchievementEngine };
