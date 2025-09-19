export interface CacheConfig {
    ttl: number;
    refreshThreshold: number;
    maxRetries: number;
    fallbackTtl: number;
}
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
    version: number;
    source: 'fresh' | 'stale' | 'fallback';
}
export declare class SmartCache {
    private get redis();
    private memoryCache;
    private configs;
    private refreshPromises;
    constructor();
    private setupDefaultConfigs;
    setConfig(key: string, config: CacheConfig): void;
    /**
     * Get data with smart refresh logic
     */
    get<T>(key: string, fetchFn: () => Promise<T>, options?: {
        forceRefresh?: boolean;
        userId?: string;
        customTtl?: number;
    }): Promise<T>;
    /**
     * Batch get multiple keys efficiently
     */
    getBatch<T>(keys: Array<{
        key: string;
        fetchFn: () => Promise<T>;
    }>, options?: {
        userId?: string;
    }): Promise<Map<string, T>>;
    /**
     * Invalidate cache for specific patterns
     */
    invalidate(pattern: string, userId?: string): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): Promise<{
        totalKeys: number;
        memoryUsage: string;
        hitRate: number;
        configs: Map<string, CacheConfig>;
    }>;
    private buildCacheKey;
    private getFromCache;
    private fetchAndCache;
    private shouldRefresh;
    private refreshInBackground;
    private getDefaultConfig;
    private parseMemoryUsage;
}
export declare const smartCache: SmartCache;
//# sourceMappingURL=SmartCache.d.ts.map