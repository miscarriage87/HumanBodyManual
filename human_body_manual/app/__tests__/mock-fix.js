// Helper file to fix mocking issues in tests
const mockPrisma = {
  userProgress: {
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: 'progress-123',
        ...data.data,
        completedAt: new Date(),
        createdAt: new Date(),
      });
    }),
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    count: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue({ _sum: { durationMinutes: 0 } }),
  },
  userStreak: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: 'streak-1',
        ...data.data,
      });
    }),
    update: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: data.where.id,
        ...data.data,
      });
    }),
  },
  userAchievement: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: 'ua-1',
        ...data.data,
        earnedAt: new Date(),
      });
    }),
  },
  achievement: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

// Export the mock
module.exports = { mockPrisma };