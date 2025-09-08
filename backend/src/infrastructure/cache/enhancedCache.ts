import { redisConfig } from '../../config/environment';
import logger from '../../monitoring/logging/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
  serialize?: boolean; // Whether to JSON serialize/deserialize
  compress?: boolean; // Whether to compress large values
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
}

export class EnhancedCache {
  private redis: any;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0
  };

  constructor(redisClient: any) {
    this.redis = redisClient;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const value = await this.redis.get(fullKey);
      
      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      if (options.serialize !== false) {
        return JSON.parse(value);
      }
      
      return value as T;
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      let serializedValue: string;

      if (options.serialize !== false) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = value as string;
      }

      // Apply compression for large values
      if (options.compress && serializedValue.length > 1024) {
        // TODO: Implement compression
        logger.info(`📦 Large value detected for key: ${fullKey} (${serializedValue.length} bytes)`);
      }

      const ttl = options.ttl || 3600; // Default 1 hour
      await this.redis.setex(fullKey, ttl, serializedValue);
      
      this.stats.sets++;
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.del(fullKey);
      
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys with pattern
   */
  async deletePattern(pattern: string, options: CacheOptions = {}): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern, options.prefix);
      const keys = await this.redis.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      this.stats.deletes += result;
      return result;
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key, options);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch and store
      const value = await fetcher();
      if (value !== null && value !== undefined) {
        await this.set(key, value, options);
      }
      
      return value;
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache getOrSet error:', error);
      return null;
    }
  }

  /**
   * Set with conditional logic
   */
  async setIfNotExists<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const exists = await this.exists(key, options);
      
      if (exists) {
        return false; // Key already exists
      }

      return await this.set(key, value, options);
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache setIfNotExists error:', error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.incr(fullKey);
      
      // Set TTL if specified
      if (options.ttl) {
        await this.redis.expire(fullKey, options.ttl);
      }
      
      return result;
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Get TTL for key
   */
  async getTTL(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache getTTL error:', error);
      return -1;
    }
  }

  /**
   * Set TTL for key
   */
  async setTTL(key: string, ttl: number, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.expire(fullKey, ttl);
      return result === 1;
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache setTTL error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0
    };
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    if (prefix) {
      return `${prefix}:${key}`;
    }
    return key;
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Clear all cache data (use with caution)
   */
  async clearAll(): Promise<boolean> {
    try {
      await this.redis.flushdb();
      logger.warn('🗑️ All cache data cleared');
      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error('❌ Cache clearAll error:', error);
      return false;
    }
  }
}

// Cache key constants
export const CACHE_KEYS = {
  CRICKET_FIXTURES: 'cricket:fixtures',
  CRICKET_ODDS: (eventId: string) => `cricket:odds:${eventId}`,
  CRICKET_SCORECARD: (marketId: string) => `cricket:scorecard:${marketId}`,
  CRICKET_TV: (eventId: string) => `cricket:tv:${eventId}`,
  CASINO_DATA: (gameType: string) => `casino:data:${gameType}`,
  CASINO_RESULTS: (gameType: string) => `casino:results:${gameType}`,
  API_RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
  USER_SESSION: (userId: string) => `user:session:${userId}`,
} as const;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  CRICKET_FIXTURES: 7200, // 2 hours
  CRICKET_ODDS: 1, // 1 second (real-time)
  CRICKET_SCORECARD: 2, // 2 seconds
  CRICKET_TV: 3600, // 1 hour
  CASINO_DATA: 30, // 30 seconds
  CASINO_RESULTS: 60, // 1 minute
  API_RATE_LIMIT: 900, // 15 minutes
  USER_SESSION: 86400, // 24 hours
} as const;

export default EnhancedCache;
