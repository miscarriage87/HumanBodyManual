import { CACHE_KEYS, CACHE_TTL } from './cache';

// In-memory cache for development
const memoryCache: Record<string, { value: any; expiry: number }> = {};

export class MockCacheService {
  /**
   * Generate cache key with prefix and identifier
   */
  private generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`;
  }

  /**
   * Set cache with TTL
   */
  async set(key: string, value: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    try {
      const expiry = Date.now() + ttl * 1000;
      memoryCache[key] = { value, expiry };
    } catch (error) {
      console.error('Cache set error:', error);
      // Fail silently to not break the application
    }
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = memoryCache[key];
      if (!cached) return null;
      
      // Check if expired
      if (cached.expiry < Date.now()) {
        delete memoryCache[key];
        return null;
      }
      
      return cached.value as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    try {
      delete memoryCache[key];
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple cache entries by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const regex = new RegExp(pattern.replace('*', '.*'));
      Object.keys(memoryCache).forEach(key => {
        if (regex.test(key)) {
          delete memoryCache[key];
        }
      });
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Cache user progress data
   */
  async cacheUserProgress(userId: string, data: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.USER_PROGRESS, userId);
    await this.set(key, data, ttl);
  }

  /**
   * Get cached user progress data
   */
  async getUserProgress<T>(userId: string): Promise<T | null> {
    const key = this.generateKey(CACHE_KEYS.USER_PROGRESS, userId);
    return await this.get<T>(key);
  }

  /**
   * Cache user statistics
   */
  async cacheUserStats(userId: string, data: any, ttl: number = CACHE_TTL.LONG): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.USER_STATS, userId);
    await this.set(key, data, ttl);
  }

  /**
   * Get cached user statistics
   */
  async getUserStats<T>(userId: string): Promise<T | null> {
    const key = this.generateKey(CACHE_KEYS.USER_STATS, userId);
    return await this.get<T>(key);
  }

  /**
   * Cache body area statistics
   */
  async cacheBodyAreaStats(userId: string, bodyArea: string, data: any, ttl: number = CACHE_TTL.LONG): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.BODY_AREA_STATS, `${userId}:${bodyArea}`);
    await this.set(key, data, ttl);
  }

  /**
   * Get cached body area statistics
   */
  async getBodyAreaStats<T>(userId: string, bodyArea: string): Promise<T | null> {
    const key = this.generateKey(CACHE_KEYS.BODY_AREA_STATS, `${userId}:${bodyArea}`);
    return await this.get<T>(key);
  }

  /**
   * Cache achievements data
   */
  async cacheAchievements(userId: string, data: any, ttl: number = CACHE_TTL.LONG): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.ACHIEVEMENTS, userId);
    await this.set(key, data, ttl);
  }

  /**
   * Get cached achievements data
   */
  async getAchievements<T>(userId: string): Promise<T | null> {
    const key = this.generateKey(CACHE_KEYS.ACHIEVEMENTS, userId);
    return await this.get<T>(key);
  }

  /**
   * Cache community statistics
   */
  async cacheCommunityStats(statType: string, data: any, ttl: number = CACHE_TTL.DAILY): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.COMMUNITY_STATS, statType);
    await this.set(key, data, ttl);
  }

  /**
   * Get cached community statistics
   */
  async getCommunityStats<T>(statType: string): Promise<T | null> {
    const key = this.generateKey(CACHE_KEYS.COMMUNITY_STATS, statType);
    return await this.get<T>(key);
  }

  /**
   * Cache user insights
   */
  async cacheInsights(userId: string, data: any, ttl: number = CACHE_TTL.LONG): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.INSIGHTS, userId);
    await this.set(key, data, ttl);
  }

  /**
   * Get cached user insights
   */
  async getInsights<T>(userId: string): Promise<T | null> {
    const key = this.generateKey(CACHE_KEYS.INSIGHTS, userId);
    return await this.get<T>(key);
  }

  /**
   * Cache user streaks
   */
  async cacheStreaks(userId: string, data: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    const key = this.generateKey(CACHE_KEYS.STREAKS, userId);
    await this.set(key, data, ttl);
  }

  /**
   * Get cached user streaks
   */
  async getStreaks<T>(userId: string): Promise<T | null> {
    const key = this.generateKey(CACHE_KEYS.STREAKS, userId);
    return await this.get<T>(key);
  }

  /**
   * Invalidate user-related caches when progress is updated
   */
  async invalidateUserCaches(userId: string): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.USER_PROGRESS}:${userId}`,
      `${CACHE_KEYS.USER_STATS}:${userId}`,
      `${CACHE_KEYS.BODY_AREA_STATS}:${userId}:*`,
      `${CACHE_KEYS.ACHIEVEMENTS}:${userId}`,
      `${CACHE_KEYS.INSIGHTS}:${userId}`,
      `${CACHE_KEYS.STREAKS}:${userId}`,
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    return true; // Always healthy for mock
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    // No-op for mock
  }
}

// Export singleton instance
export const mockCacheService = new MockCacheService();