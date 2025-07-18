// Mock implementation of Prisma client for development without a database
import { BodyAreaType, DifficultyLevel } from './types';

// In-memory storage
const db: any = {
  users: new Map(),
  userProgress: new Map(),
  userStreak: new Map(),
  userAchievement: new Map(),
  achievement: new Map(),
  userInsight: new Map(),
  streak: new Map(),
};

// Generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock Prisma client
export const mockPrisma = {
  user: {
    findUnique: async ({ where }: { where: any }) => {
      return db.users.get(where.id) || null;
    },
    findMany: async () => {
      return Array.from(db.users.values());
    },
    create: async ({ data }: { data: any }) => {
      const id = data.id || generateId();
      const user = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      db.users.set(id, user);
      return user;
    },
    update: async ({ where, data }: { where: any; data: any }) => {
      const user = db.users.get(where.id);
      if (!user) throw new Error('User not found');
      const updated = { ...user, ...data, updatedAt: new Date() };
      db.users.set(where.id, updated);
      return updated;
    },
    count: async () => {
      return db.users.size;
    },
  },
  userProgress: {
    create: async ({ data }: { data: any }) => {
      const id = generateId();
      const entry = { 
        id, 
        ...data, 
        createdAt: new Date() 
      };
      db.userProgress.set(id, entry);
      return entry;
    },
    findMany: async (options: any = {}) => {
      const { where, orderBy, select, distinct } = options;
      let entries = Array.from(db.userProgress.values());
      
      // Apply filters if provided
      if (where) {
        if (where.userId) {
          entries = entries.filter((entry: any) => entry.userId === where.userId);
        }
        if (where.bodyArea) {
          entries = entries.filter((entry: any) => entry.bodyArea === where.bodyArea);
        }
        if (where.completedAt) {
          if (where.completedAt.gte) {
            entries = entries.filter((entry: any) => entry.completedAt >= where.completedAt.gte);
          }
          if (where.completedAt.lte) {
            entries = entries.filter((entry: any) => entry.completedAt <= where.completedAt.lte);
          }
        }
      }
      
      // Apply ordering if provided
      if (orderBy) {
        const field = Object.keys(orderBy)[0];
        const direction = orderBy[field];
        entries.sort((a: any, b: any) => {
          if (direction === 'asc') {
            return a[field] < b[field] ? -1 : 1;
          } else {
            return a[field] > b[field] ? -1 : 1;
          }
        });
      }
      
      // Apply select if provided
      if (select) {
        entries = entries.map((entry: any) => {
          const result: any = {};
          Object.keys(select).forEach(key => {
            if (select[key]) {
              result[key] = entry[key];
            }
          });
          return result;
        });
      }
      
      // Apply distinct if provided
      if (distinct && distinct.length > 0) {
        const seen = new Set();
        entries = entries.filter((entry: any) => {
          const key = distinct.map((field: string) => entry[field]).join('|');
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
      }
      
      return entries;
    },
    findFirst: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      const entries = await mockPrisma.userProgress.findMany({ where, orderBy });
      return entries.length > 0 ? entries[0] : null;
    },
    count: async ({ where }: { where?: any } = {}) => {
      const entries = await mockPrisma.userProgress.findMany({ where });
      return entries.length;
    },
    aggregate: async (options: any) => {
      const { where, _sum, _avg, _count } = options;
      const entries = await mockPrisma.userProgress.findMany({ where });
      
      const result: any = {};
      
      if (_sum) {
        result._sum = {};
        if (_sum.durationMinutes) {
          result._sum.durationMinutes = entries.reduce((total: number, entry: any) => total + (entry.durationMinutes || 0), 0);
        }
      }
      
      if (_avg) {
        result._avg = {};
        if (_avg.durationMinutes) {
          const total = entries.reduce((sum: number, entry: any) => sum + (entry.durationMinutes || 0), 0);
          result._avg.durationMinutes = entries.length > 0 ? total / entries.length : 0;
        }
      }
      
      if (_count) {
        result._count = {};
        if (_count.exerciseId) {
          result._count.exerciseId = entries.length;
        }
      }
      
      return result;
    },
    groupBy: async (options: any) => {
      const { by, _count, where, orderBy, take } = options;
      let entries = Array.from(db.userProgress.values());
      
      // Apply filters if provided
      if (where) {
        if (where.userId) {
          entries = entries.filter((entry: any) => entry.userId === where.userId);
        }
        if (where.completedAt) {
          if (where.completedAt.gte) {
            entries = entries.filter((entry: any) => entry.completedAt >= where.completedAt.gte);
          }
          if (where.completedAt.lte) {
            entries = entries.filter((entry: any) => entry.completedAt <= where.completedAt.lte);
          }
        }
      }
      
      const groups = new Map();
      
      entries.forEach((entry: any) => {
        const key = by.map((field: string) => {
          if (field === 'completedAt') {
            // Group by date only (not time)
            return entry[field].toDateString();
          }
          return entry[field];
        }).join('|');
        
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key).push(entry);
      });
      
      let result = Array.from(groups.entries()).map(([key, items]) => {
        const keyParts = key.split('|');
        const group: any = {};
        by.forEach((field: string, index: number) => {
          if (field === 'completedAt') {
            group[field] = new Date(keyParts[index]);
          } else {
            group[field] = keyParts[index];
          }
        });
        
        if (_count) {
          group._count = {};
          Object.keys(_count).forEach(countField => {
            if (_count[countField]) {
              group._count[countField] = items.length;
            }
          });
        }
        
        return group;
      });
      
      // Apply ordering if provided
      if (orderBy) {
        if (orderBy._count) {
          const countField = Object.keys(orderBy._count)[0];
          const direction = orderBy._count[countField];
          result.sort((a, b) => {
            const aVal = a._count[countField];
            const bVal = b._count[countField];
            if (direction === 'asc') {
              return aVal - bVal;
            } else {
              return bVal - aVal;
            }
          });
        } else {
          const field = Object.keys(orderBy)[0];
          const direction = orderBy[field];
          result.sort((a, b) => {
            if (direction === 'asc') {
              return a[field] < b[field] ? -1 : 1;
            } else {
              return a[field] > b[field] ? -1 : 1;
            }
          });
        }
      }
      
      // Apply limit if provided
      if (take) {
        result = result.slice(0, take);
      }
      
      return result;
    },
  },
  userStreak: {
    findUnique: async ({ where }: { where: any }) => {
      // Handle composite key
      if (where.userId_streakType) {
        const { userId, streakType } = where.userId_streakType;
        const streaks = Array.from(db.userStreak.values());
        return streaks.find((s: any) => s.userId === userId && s.streakType === streakType) || null;
      }
      return db.userStreak.get(where.id) || null;
    },
    findMany: async ({ where }: { where?: any } = {}) => {
      let streaks = Array.from(db.userStreak.values());
      
      if (where) {
        if (where.userId) {
          streaks = streaks.filter((streak: any) => streak.userId === where.userId);
        }
      }
      
      return streaks;
    },
    create: async ({ data }: { data: any }) => {
      const id = generateId();
      const streak = { id, ...data, updatedAt: new Date() };
      db.userStreak.set(id, streak);
      return streak;
    },
    update: async ({ where, data }: { where: any; data: any }) => {
      const streak = db.userStreak.get(where.id);
      if (!streak) throw new Error('Streak not found');
      const updated = { ...streak, ...data, updatedAt: new Date() };
      db.userStreak.set(where.id, updated);
      return updated;
    },
  },
  userAchievement: {
    findMany: async (options: any = {}) => {
      const { where, include, orderBy, take, select } = options;
      let achievements = Array.from(db.userAchievement.values());
      
      if (where) {
        if (where.userId) {
          achievements = achievements.filter((a: any) => a.userId === where.userId);
        }
      }
      
      // Apply ordering if provided
      if (orderBy) {
        const field = Object.keys(orderBy)[0];
        const direction = orderBy[field];
        achievements.sort((a: any, b: any) => {
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
      
      // Apply select if provided
      if (select) {
        achievements = achievements.map((a: any) => {
          const result: any = {};
          Object.keys(select).forEach(key => {
            if (select[key]) {
              result[key] = a[key];
            }
          });
          return result;
        });
      }
      
      // Include related data if requested
      if (include && include.achievement) {
        achievements = achievements.map((a: any) => {
          const achievement = db.achievement.get(a.achievementId);
          return { ...a, achievement };
        });
      }
      
      return achievements;
    },
    create: async ({ data }: { data: any }) => {
      const id = generateId();
      const userAchievement = { id, ...data, earnedAt: new Date() };
      db.userAchievement.set(id, userAchievement);
      return userAchievement;
    },
    findUnique: async ({ where }: { where: any }) => {
      if (where.userId_achievementId) {
        const { userId, achievementId } = where.userId_achievementId;
        const achievements = Array.from(db.userAchievement.values());
        return achievements.find((a: any) => a.userId === userId && a.achievementId === achievementId) || null;
      }
      return db.userAchievement.get(where.id) || null;
    },
    count: async () => {
      return db.userAchievement.size;
    },
    groupBy: async (options: any) => {
      const { by, _count, orderBy, take } = options;
      const achievements = Array.from(db.userAchievement.values());
      const groups = new Map();
      
      achievements.forEach((achievement: any) => {
        const key = by.map((field: string) => achievement[field]).join('|');
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key).push(achievement);
      });
      
      let result = Array.from(groups.entries()).map(([key, items]) => {
        const keyParts = key.split('|');
        const group: any = {};
        by.forEach((field: string, index: number) => {
          group[field] = keyParts[index];
        });
        
        if (_count) {
          group._count = {};
          Object.keys(_count).forEach(countField => {
            if (_count[countField]) {
              group._count[countField] = items.length;
            }
          });
        }
        
        return group;
      });
      
      // Apply ordering if provided
      if (orderBy && orderBy._count) {
        const countField = Object.keys(orderBy._count)[0];
        const direction = orderBy._count[countField];
        result.sort((a, b) => {
          const aVal = a._count[countField];
          const bVal = b._count[countField];
          if (direction === 'asc') {
            return aVal - bVal;
          } else {
            return bVal - aVal;
          }
        });
      }
      
      // Apply limit if provided
      if (take) {
        result = result.slice(0, take);
      }
      
      return result;
    },
  },
  achievement: {
    findMany: async () => {
      return Array.from(db.achievement.values());
    },
    findUnique: async ({ where }: { where: any }) => {
      return db.achievement.get(where.id) || null;
    },
    count: async () => {
      return db.achievement.size;
    },
  },
  userInsight: {
    create: async ({ data }: { data: any }) => {
      const id = generateId();
      const insight = { id, ...data, generatedAt: new Date() };
      // Store in a simple map for mock purposes
      if (!db.userInsight) db.userInsight = new Map();
      db.userInsight.set(id, insight);
      return insight;
    },
    findMany: async (options: any = {}) => {
      const { where, orderBy } = options;
      if (!db.userInsight) db.userInsight = new Map();
      let insights = Array.from(db.userInsight.values());
      
      if (where) {
        if (where.userId) {
          insights = insights.filter((i: any) => i.userId === where.userId);
        }
        if (where.viewedAt === null) {
          insights = insights.filter((i: any) => !i.viewedAt);
        }
      }
      
      if (orderBy) {
        const field = Object.keys(orderBy)[0];
        const direction = orderBy[field];
        insights.sort((a: any, b: any) => {
          if (direction === 'asc') {
            return a[field] < b[field] ? -1 : 1;
          } else {
            return a[field] > b[field] ? -1 : 1;
          }
        });
      }
      
      return insights;
    },
    updateMany: async ({ where, data }: { where: any; data: any }) => {
      if (!db.userInsight) db.userInsight = new Map();
      let count = 0;
      
      for (const [id, insight] of db.userInsight.entries()) {
        let matches = true;
        
        if (where.userId && insight.userId !== where.userId) matches = false;
        if (where.id && where.id.in && !where.id.in.includes(insight.id)) matches = false;
        
        if (matches) {
          db.userInsight.set(id, { ...insight, ...data });
          count++;
        }
      }
      
      return { count };
    },
    count: async ({ where }: { where?: any } = {}) => {
      if (!db.userInsight) db.userInsight = new Map();
      let insights = Array.from(db.userInsight.values());
      
      if (where) {
        if (where.userId) {
          insights = insights.filter((i: any) => i.userId === where.userId);
        }
        if (where.viewedAt === null) {
          insights = insights.filter((i: any) => !i.viewedAt);
        }
      }
      
      return insights.length;
    },
  },
  streak: {
    findUnique: async ({ where }: { where: any }) => {
      if (!db.streak) db.streak = new Map();
      
      if (where.userId_streakType) {
        const { userId, streakType } = where.userId_streakType;
        const streaks = Array.from(db.streak.values());
        return streaks.find((s: any) => s.userId === userId && s.streakType === streakType) || null;
      }
      
      return db.streak.get(where.id) || null;
    },
  },
  communityStats: {
    findMany: async (options: any = {}) => {
      const { where, orderBy, skip, take } = options;
      if (!db.communityStats) db.communityStats = new Map();
      let stats = Array.from(db.communityStats.values());
      
      if (where) {
        if (where.statType) {
          stats = stats.filter((stat: any) => stat.statType === where.statType);
        }
      }
      
      if (orderBy) {
        const field = Object.keys(orderBy)[0];
        const direction = orderBy[field];
        stats.sort((a: any, b: any) => {
          if (direction === 'asc') {
            return a[field] < b[field] ? -1 : 1;
          } else {
            return a[field] > b[field] ? -1 : 1;
          }
        });
      }
      
      if (skip) {
        stats = stats.slice(skip);
      }
      
      if (take) {
        stats = stats.slice(0, take);
      }
      
      return stats;
    },
    count: async ({ where }: { where?: any } = {}) => {
      if (!db.communityStats) db.communityStats = new Map();
      let stats = Array.from(db.communityStats.values());
      
      if (where) {
        if (where.statType) {
          stats = stats.filter((stat: any) => stat.statType === where.statType);
        }
      }
      
      return stats.length;
    },
  },
  $queryRaw: async () => {
    return [];
  },
  $transaction: async (operations: any[]) => {
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