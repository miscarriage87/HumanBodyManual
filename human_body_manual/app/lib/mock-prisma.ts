// Mock implementation of Prisma client for development without a database
import { BodyAreaType, DifficultyLevel } from './types';

// In-memory storage
const db = {
  users: new Map(),
  userProgress: new Map(),
  userStreak: new Map(),
  userAchievement: new Map(),
  achievement: new Map(),
};

// Generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock Prisma client
export const mockPrisma = {
  user: {
    findUnique: async ({ where }) => {
      return db.users.get(where.id) || null;
    },
    findMany: async () => {
      return Array.from(db.users.values());
    },
    create: async ({ data }) => {
      const id = data.id || generateId();
      const user = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      db.users.set(id, user);
      return user;
    },
    update: async ({ where, data }) => {
      const user = db.users.get(where.id);
      if (!user) throw new Error('User not found');
      const updated = { ...user, ...data, updatedAt: new Date() };
      db.users.set(where.id, updated);
      return updated;
    },
  },
  userProgress: {
    create: async ({ data }) => {
      const id = generateId();
      const entry = { 
        id, 
        ...data, 
        createdAt: new Date() 
      };
      db.userProgress.set(id, entry);
      return entry;
    },
    findMany: async ({ where, orderBy } = {}) => {
      let entries = Array.from(db.userProgress.values());
      
      // Apply filters if provided
      if (where) {
        if (where.userId) {
          entries = entries.filter(entry => entry.userId === where.userId);
        }
        if (where.bodyArea) {
          entries = entries.filter(entry => entry.bodyArea === where.bodyArea);
        }
        if (where.completedAt) {
          if (where.completedAt.gte) {
            entries = entries.filter(entry => entry.completedAt >= where.completedAt.gte);
          }
          if (where.completedAt.lte) {
            entries = entries.filter(entry => entry.completedAt <= where.completedAt.lte);
          }
        }
      }
      
      // Apply ordering if provided
      if (orderBy) {
        const field = Object.keys(orderBy)[0];
        const direction = orderBy[field];
        entries.sort((a, b) => {
          if (direction === 'asc') {
            return a[field] < b[field] ? -1 : 1;
          } else {
            return a[field] > b[field] ? -1 : 1;
          }
        });
      }
      
      return entries;
    },
    findFirst: async ({ where, orderBy } = {}) => {
      const entries = await mockPrisma.userProgress.findMany({ where, orderBy });
      return entries.length > 0 ? entries[0] : null;
    },
    count: async ({ where } = {}) => {
      const entries = await mockPrisma.userProgress.findMany({ where });
      return entries.length;
    },
    aggregate: async ({ where, _sum }) => {
      const entries = await mockPrisma.userProgress.findMany({ where });
      
      if (_sum && _sum.durationMinutes) {
        const sum = entries.reduce((total, entry) => total + (entry.durationMinutes || 0), 0);
        return { _sum: { durationMinutes: sum } };
      }
      
      return { _sum: { durationMinutes: 0 } };
    },
  },
  userStreak: {
    findUnique: async ({ where }) => {
      // Handle composite key
      if (where.userId_streakType) {
        const { userId, streakType } = where.userId_streakType;
        const streaks = Array.from(db.userStreak.values());
        return streaks.find(s => s.userId === userId && s.streakType === streakType) || null;
      }
      return db.userStreak.get(where.id) || null;
    },
    findMany: async ({ where } = {}) => {
      let streaks = Array.from(db.userStreak.values());
      
      if (where) {
        if (where.userId) {
          streaks = streaks.filter(streak => streak.userId === where.userId);
        }
      }
      
      return streaks;
    },
    create: async ({ data }) => {
      const id = generateId();
      const streak = { id, ...data, updatedAt: new Date() };
      db.userStreak.set(id, streak);
      return streak;
    },
    update: async ({ where, data }) => {
      const streak = db.userStreak.get(where.id);
      if (!streak) throw new Error('Streak not found');
      const updated = { ...streak, ...data, updatedAt: new Date() };
      db.userStreak.set(where.id, updated);
      return updated;
    },
  },
  userAchievement: {
    findMany: async ({ where, include, orderBy, take } = {}) => {
      let achievements = Array.from(db.userAchievement.values());
      
      if (where) {
        if (where.userId) {
          achievements = achievements.filter(a => a.userId === where.userId);
        }
      }
      
      // Apply ordering if provided
      if (orderBy) {
        const field = Object.keys(orderBy)[0];
        const direction = orderBy[field];
        achievements.sort((a, b) => {
          if (direction === 'asc') {
            return a[field] < b[field] ? -1 : 1;
          } else {
            return a[field] > b[field] ? -1 : 1;
          }
        });
      }
      
      // Apply limit if provided
      if (take) {
        achievements = achievements.slice(0, take);
      }
      
      // Include related data if requested
      if (include && include.achievement) {
        achievements = achievements.map(a => {
          const achievement = db.achievement.get(a.achievementId);
          return { ...a, achievement };
        });
      }
      
      return achievements;
    },
  },
  achievement: {
    findMany: async () => {
      return Array.from(db.achievement.values());
    },
  },
  $queryRaw: async () => {
    return [];
  },
  $transaction: async (operations) => {
    // Execute operations sequentially
    const results = [];
    for (const operation of operations) {
      results.push(await operation);
    }
    return results;
  },
};

// Initialize with some sample data
const initializeMockData = () => {
  // Sample user
  mockPrisma.user.create({
    data: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    }
  });
  
  // Sample achievements
  const achievementId = 'ach-1';
  db.achievement.set(achievementId, {
    id: achievementId,
    name: 'First Steps',
    description: 'Complete your first exercise',
    category: 'milestone',
    criteria: { type: 'total_sessions', target: 1 },
    badgeIcon: 'star',
    points: 10,
    rarity: 'common',
    createdAt: new Date(),
  });
  
  // Sample user achievement
  db.userAchievement.set('ua-1', {
    id: 'ua-1',
    userId: 'user-123',
    achievementId: 'ach-1',
    earnedAt: new Date(),
    progressSnapshot: {},
  });
  
  // Sample user streak
  db.userStreak.set('streak-1', {
    id: 'streak-1',
    userId: 'user-123',
    streakType: 'daily',
    currentCount: 3,
    bestCount: 5,
    lastActivityDate: new Date(),
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  });
  
  // Sample progress entries
  const bodyAreas: BodyAreaType[] = [
    'nervensystem', 'hormone', 'zirkadian', 'mikrobiom',
    'bewegung', 'fasten', 'kaelte', 'licht'
  ];
  
  const exercises = [
    { id: 'breathing-basics', bodyArea: 'nervensystem' },
    { id: 'cold-shower', bodyArea: 'kaelte' },
    { id: 'morning-light', bodyArea: 'licht' },
    { id: 'fasting-16-8', bodyArea: 'fasten' },
  ];
  
  // Create some progress entries
  for (let i = 0; i < 10; i++) {
    const exercise = exercises[i % exercises.length];
    mockPrisma.userProgress.create({
      data: {
        userId: 'user-123',
        exerciseId: exercise.id,
        bodyArea: exercise.bodyArea,
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        durationMinutes: 15 + (i % 15),
        difficultyLevel: 'Anfänger' as DifficultyLevel,
        sessionNotes: i % 3 === 0 ? 'Great session!' : undefined,
        mood: i % 2 === 0 ? 'gut' : 'neutral',
        energyLevel: i % 2 === 0 ? 'hoch' : 'normal',
      }
    });
  }
};

// Initialize mock data
initializeMockData();

export default mockPrisma;