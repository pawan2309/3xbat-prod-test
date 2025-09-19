export interface CacheOptions {
    ttl?: number;
    prefix?: string;
    serialize?: boolean;
    compress?: boolean;
}
export interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    errors: number;
    hitRate: number;
}
export declare class EnhancedCache {
    private redis;
    private stats;
    constructor(redisClient: any);
    /**
     * Get value from cache
     */
    get<T>(key: string, options?: CacheOptions): Promise<T | null>;
    /**
     * Set value in cache
     */
    set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>;
    /**
     * Delete value from cache
     */
    delete(key: string, options?: CacheOptions): Promise<boolean>;
    /**
     * Delete multiple keys with pattern
     */
    deletePattern(pattern: string, options?: CacheOptions): Promise<number>;
    /**
     * Check if key exists
     */
    exists(key: string, options?: CacheOptions): Promise<boolean>;
    /**
     * Get or set pattern (cache-aside)
     */
    getOrSet<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T | null>;
    /**
     * Set with conditional logic
     */
    setIfNotExists<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>;
    /**
     * Increment counter
     */
    increment(key: string, options?: CacheOptions): Promise<number>;
    /**
     * Get TTL for key
     */
    getTTL(key: string, options?: CacheOptions): Promise<number>;
    /**
     * Set TTL for key
     */
    setTTL(key: string, ttl: number, options?: CacheOptions): Promise<boolean>;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Reset cache statistics
     */
    resetStats(): void;
    /**
     * Build full cache key with prefix
     */
    private buildKey;
    /**
     * Update hit rate calculation
     */
    private updateHitRate;
    /**
     * Clear all cache data (use with caution)
     */
    clearAll(): Promise<boolean>;
}
export declare const CACHE_KEYS: {
    readonly CRICKET_FIXTURES: "cricket:fixtures";
    readonly CRICKET_ODDS: (eventId: string) => string;
    readonly CRICKET_SCORECARD: (marketId: string) => string;
    readonly CRICKET_TV: (eventId: string) => string;
    readonly CASINO_DATA: (gameType: string) => string;
    readonly CASINO_RESULTS: (gameType: string) => string;
    readonly API_RATE_LIMIT: (ip: string) => string;
    readonly USER_SESSION: (userId: string) => string;
};
export declare const CACHE_TTL: {
    readonly CRICKET_FIXTURES: 7200;
    readonly CRICKET_ODDS: 1;
    readonly CRICKET_SCORECARD: 2;
    readonly CRICKET_TV: 3600;
    readonly CASINO_DATA: 30;
    readonly CASINO_RESULTS: 60;
    readonly API_RATE_LIMIT: 900;
    readonly USER_SESSION: 86400;
};
export default EnhancedCache;
//# sourceMappingURL=enhancedCache.d.ts.map