import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { cacheService } from './cache';

// Pagination configuration
export const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Pagination result interface
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

// Cursor-based pagination result interface
export interface CursorPaginatedResult<T> {
  data: T[];
  pagination: {
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

export class PaginationService {
  /**
   * Offset-based pagination for user progress data
   */
  static async paginateUserProgress(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    filters: {
      bodyArea?: string;
      exerciseId?: string;
      dateRange?: { start: Date; end: Date };
      difficultyLevel?: string;
    } = {}
  ): Promise<PaginatedResult<any>> {
    // Validate pagination parameters
    const validatedLimit = Math.min(Math.max(limit, PAGINATION_DEFAULTS.MIN_LIMIT), PAGINATION_DEFAULTS.MAX_LIMIT);
    const validatedPage = Math.max(page, 1);
    const offset = (validatedPage - 1) * validatedLimit;

    // Generate cache key
    const cacheKey = `paginated_progress:${userId}:${validatedPage}:${validatedLimit}:${JSON.stringify(filters)}`;
    
    // Try cache first
    const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Build where clause
    const whereClause: Prisma.UserProgressWhereInput = {
      userId,
      ...(filters.bodyArea && { bodyArea: filters.bodyArea }),
      ...(filters.exerciseId && { exerciseId: filters.exerciseId }),
      ...(filters.difficultyLevel && { difficultyLevel: filters.difficultyLevel }),
      ...(filters.dateRange && {
        completedAt: {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        },
      }),
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      prisma.userProgress.findMany({
        where: whereClause,
        orderBy: { completedAt: 'desc' },
        skip: offset,
        take: validatedLimit,
        select: {
          id: true,
          exerciseId: true,
          bodyArea: true,
          completedAt: true,
          durationMinutes: true,
          difficultyLevel: true,
          sessionNotes: true,
          mood: true,
          energyLevel: true,
        },
      }),
      prisma.userProgress.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / validatedLimit);

    const result: PaginatedResult<any> = {
      data,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
      },
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Cursor-based pagination for better performance on large datasets
   */
  static async cursorPaginateUserProgress(
    userId: string,
    cursor?: string,
    limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    direction: 'forward' | 'backward' = 'forward',
    filters: {
      bodyArea?: string;
      exerciseId?: string;
      dateRange?: { start: Date; end: Date };
    } = {}
  ): Promise<CursorPaginatedResult<any>> {
    const validatedLimit = Math.min(Math.max(limit, PAGINATION_DEFAULTS.MIN_LIMIT), PAGINATION_DEFAULTS.MAX_LIMIT);

    // Generate cache key
    const cacheKey = `cursor_progress:${userId}:${cursor || 'start'}:${validatedLimit}:${direction}:${JSON.stringify(filters)}`;
    
    const cached = await cacheService.get<CursorPaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Build where clause with cursor
    const whereClause: Prisma.UserProgressWhereInput = {
      userId,
      ...(filters.bodyArea && { bodyArea: filters.bodyArea }),
      ...(filters.exerciseId && { exerciseId: filters.exerciseId }),
      ...(filters.dateRange && {
        completedAt: {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        },
      }),
    };

    // Add cursor condition
    if (cursor) {
      if (direction === 'forward') {
        whereClause.id = { lt: cursor };
      } else {
        whereClause.id = { gt: cursor };
      }
    }

    // Fetch one extra item to determine if there are more results
    const data = await prisma.userProgress.findMany({
      where: whereClause,
      orderBy: direction === 'forward' ? { completedAt: 'desc' } : { completedAt: 'asc' },
      take: validatedLimit + 1,
      select: {
        id: true,
        exerciseId: true,
        bodyArea: true,
        completedAt: true,
        durationMinutes: true,
        difficultyLevel: true,
        sessionNotes: true,
        mood: true,
        energyLevel: true,
      },
    });

    // Determine if there are more results
    const hasMore = data.length > validatedLimit;
    const items = hasMore ? data.slice(0, -1) : data;

    // Reverse items if going backward
    if (direction === 'backward') {
      items.reverse();
    }

    const result: CursorPaginatedResult<any> = {
      data: items,
      pagination: {
        limit: validatedLimit,
        hasNext: direction === 'forward' ? hasMore : items.length > 0,
        hasPrev: direction === 'backward' ? hasMore : !!cursor,
        nextCursor: direction === 'forward' && items.length > 0 ? items[items.length - 1].id : undefined,
        prevCursor: direction === 'backward' && items.length > 0 ? items[0].id : undefined,
      },
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Paginate user achievements
   */
  static async paginateUserAchievements(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    category?: string
  ): Promise<PaginatedResult<any>> {
    const validatedLimit = Math.min(Math.max(limit, PAGINATION_DEFAULTS.MIN_LIMIT), PAGINATION_DEFAULTS.MAX_LIMIT);
    const validatedPage = Math.max(page, 1);
    const offset = (validatedPage - 1) * validatedLimit;

    const cacheKey = `paginated_achievements:${userId}:${validatedPage}:${validatedLimit}:${category || 'all'}`;
    
    const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const whereClause: Prisma.UserAchievementWhereInput = {
      userId,
      ...(category && {
        achievement: {
          category,
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.userAchievement.findMany({
        where: whereClause,
        orderBy: { earnedAt: 'desc' },
        skip: offset,
        take: validatedLimit,
        include: {
          achievement: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              badgeIcon: true,
              points: true,
              rarity: true,
            },
          },
        },
      }),
      prisma.userAchievement.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / validatedLimit);

    const result: PaginatedResult<any> = {
      data,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
      },
    };

    // Cache for 30 minutes
    await cacheService.set(cacheKey, result, 1800);

    return result;
  }

  /**
   * Paginate community statistics with time-based filtering
   */
  static async paginateCommunityStats(
    page: number = 1,
    limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    timeframe: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<PaginatedResult<any>> {
    const validatedLimit = Math.min(Math.max(limit, PAGINATION_DEFAULTS.MIN_LIMIT), PAGINATION_DEFAULTS.MAX_LIMIT);
    const validatedPage = Math.max(page, 1);
    const offset = (validatedPage - 1) * validatedLimit;

    const cacheKey = `paginated_community_stats:${validatedPage}:${validatedLimit}:${timeframe}`;
    
    const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const [data, total] = await Promise.all([
      prisma.communityStats.findMany({
        where: { statType: timeframe },
        orderBy: { date: 'desc' },
        skip: offset,
        take: validatedLimit,
      }),
      prisma.communityStats.count({ where: { statType: timeframe } }),
    ]);

    const totalPages = Math.ceil(total / validatedLimit);

    const result: PaginatedResult<any> = {
      data,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
      },
    };

    // Cache for 1 hour
    await cacheService.set(cacheKey, result, 3600);

    return result;
  }

  /**
   * Paginate user insights
   */
  static async paginateUserInsights(
    userId: string,
    page: number = 1,
    limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    insightType?: string
  ): Promise<PaginatedResult<any>> {
    const validatedLimit = Math.min(Math.max(limit, PAGINATION_DEFAULTS.MIN_LIMIT), PAGINATION_DEFAULTS.MAX_LIMIT);
    const validatedPage = Math.max(page, 1);
    const offset = (validatedPage - 1) * validatedLimit;

    const cacheKey = `paginated_insights:${userId}:${validatedPage}:${validatedLimit}:${insightType || 'all'}`;
    
    const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const whereClause: Prisma.UserInsightWhereInput = {
      userId,
      ...(insightType && { insightType }),
    };

    const [data, total] = await Promise.all([
      prisma.userInsight.findMany({
        where: whereClause,
        orderBy: { generatedAt: 'desc' },
        skip: offset,
        take: validatedLimit,
      }),
      prisma.userInsight.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / validatedLimit);

    const result: PaginatedResult<any> = {
      data,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
      },
    };

    // Cache for 15 minutes
    await cacheService.set(cacheKey, result, 900);

    return result;
  }

  /**
   * Advanced search with pagination for user progress
   */
  static async searchUserProgress(
    userId: string,
    searchParams: {
      query?: string;
      bodyAreas?: string[];
      difficultyLevels?: string[];
      dateRange?: { start: Date; end: Date };
      minDuration?: number;
      maxDuration?: number;
      mood?: string[];
      energyLevel?: string[];
    },
    page: number = 1,
    limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT
  ): Promise<PaginatedResult<any>> {
    const validatedLimit = Math.min(Math.max(limit, PAGINATION_DEFAULTS.MIN_LIMIT), PAGINATION_DEFAULTS.MAX_LIMIT);
    const validatedPage = Math.max(page, 1);
    const offset = (validatedPage - 1) * validatedLimit;

    const cacheKey = `search_progress:${userId}:${JSON.stringify(searchParams)}:${validatedPage}:${validatedLimit}`;
    
    const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Build complex where clause
    const whereClause: Prisma.UserProgressWhereInput = {
      userId,
      ...(searchParams.bodyAreas?.length && {
        bodyArea: { in: searchParams.bodyAreas },
      }),
      ...(searchParams.difficultyLevels?.length && {
        difficultyLevel: { in: searchParams.difficultyLevels },
      }),
      ...(searchParams.dateRange && {
        completedAt: {
          gte: searchParams.dateRange.start,
          lte: searchParams.dateRange.end,
        },
      }),
      ...(searchParams.minDuration && {
        durationMinutes: { gte: searchParams.minDuration },
      }),
      ...(searchParams.maxDuration && {
        durationMinutes: { lte: searchParams.maxDuration },
      }),
      ...(searchParams.mood?.length && {
        mood: { in: searchParams.mood },
      }),
      ...(searchParams.energyLevel?.length && {
        energyLevel: { in: searchParams.energyLevel },
      }),
      ...(searchParams.query && {
        OR: [
          { exerciseId: { contains: searchParams.query, mode: 'insensitive' } },
          { sessionNotes: { contains: searchParams.query, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.userProgress.findMany({
        where: whereClause,
        orderBy: { completedAt: 'desc' },
        skip: offset,
        take: validatedLimit,
        select: {
          id: true,
          exerciseId: true,
          bodyArea: true,
          completedAt: true,
          durationMinutes: true,
          difficultyLevel: true,
          sessionNotes: true,
          mood: true,
          energyLevel: true,
        },
      }),
      prisma.userProgress.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / validatedLimit);

    const result: PaginatedResult<any> = {
      data,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
      },
    };

    // Cache search results for 10 minutes
    await cacheService.set(cacheKey, result, 600);

    return result;
  }

  /**
   * Invalidate pagination caches for a user
   */
  static async invalidatePaginationCaches(userId: string) {
    const patterns = [
      `paginated_progress:${userId}:*`,
      `cursor_progress:${userId}:*`,
      `paginated_achievements:${userId}:*`,
      `paginated_insights:${userId}:*`,
      `search_progress:${userId}:*`,
    ];

    for (const pattern of patterns) {
      await cacheService.deletePattern(pattern);
    }
  }
}

// Utility functions for pagination metadata
export class PaginationUtils {
  /**
   * Calculate pagination metadata
   */
  static calculatePaginationMeta(
    page: number,
    limit: number,
    total: number
  ) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      startIndex: (page - 1) * limit + 1,
      endIndex: Math.min(page * limit, total),
    };
  }

  /**
   * Generate pagination links
   */
  static generatePaginationLinks(
    baseUrl: string,
    currentPage: number,
    totalPages: number,
    maxLinks: number = 5
  ) {
    const links = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxLinks / 2));
    const endPage = Math.min(totalPages, startPage + maxLinks - 1);

    for (let page = startPage; page <= endPage; page++) {
      links.push({
        page,
        url: `${baseUrl}?page=${page}`,
        active: page === currentPage,
      });
    }

    return {
      links,
      prev: currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : null,
      next: currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : null,
      first: `${baseUrl}?page=1`,
      last: `${baseUrl}?page=${totalPages}`,
    };
  }
}

// Export pagination service
export { PaginationService as pagination };