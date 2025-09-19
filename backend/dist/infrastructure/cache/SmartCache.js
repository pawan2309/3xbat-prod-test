"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartCache = exports.SmartCache = void 0;
const redis_1 = require("../redis/redis");
const logger_1 = __importDefault(require("../../monitoring/logging/logger"));
class SmartCache {
    // Do NOT capture redis client at module construction time.
    // Always fetch latest client to avoid race with async connect.
    get redis() {
        return (0, redis_1.getRedisClient)();
    }
    constructor() {
        this.memoryCache = new Map();
        this.configs = new Map();
        this.refreshPromises = new Map();
        this.setupDefaultConfigs();
    }
    setupDefaultConfigs() {
        // Cricket fixtures - refresh every 2 minutes
        this.setConfig('cricket:fixtures', {
            ttl: 120, // 2 minutes
            refreshThreshold: 0.3, // Refresh when 30% time left
            maxRetries: 3,
            fallbackTtl: 300 // 5 minutes fallback
        });
        // Cricket odds - refresh every 10 seconds
        this.setConfig('cricket:odds', {
            ttl: 10,
            refreshThreshold: 0.5, // Refresh when 50% time left
            maxRetries: 2,
            fallbackTtl: 30
        });
        // Cricket scorecard - refresh every 15 seconds
        this.setConfig('cricket:scorecard', {
            ttl: 15,
            refreshThreshold: 0.4,
            maxRetries: 2,
            fallbackTtl: 45
        });
        // TV stream availability - refresh every 30 seconds
        this.setConfig('cricket:tv', {
            ttl: 30,
            refreshThreshold: 0.3,
            maxRetries: 1,
            fallbackTtl: 60
        });
    }
    setConfig(key, config) {
        this.configs.set(key, config);
    }
    /**
     * Get data with smart refresh logic
     */
    async get(key, fetchFn, options) {
        const config = this.configs.get(key) || this.getDefaultConfig();
        const cacheKey = this.buildCacheKey(key, options?.userId);
        try {
            // Try to get from cache first
            if (!options?.forceRefresh) {
                const cached = await this.getFromCache(cacheKey);
                if (cached) {
                    // Check if we need to refresh in background
                    if (this.shouldRefresh(cached, config)) {
                        this.refreshInBackground(cacheKey, fetchFn, config);
                    }
                    return cached.data;
                }
            }
            // Cache miss or force refresh - fetch fresh data
            return await this.fetchAndCache(cacheKey, fetchFn, config);
        }
        catch (error) {
            logger_1.default.error(`❌ Cache error for key ${key}:`, error);
            // Try to return stale data as fallback
            const stale = await this.getFromCache(cacheKey, true);
            if (stale) {
                logger_1.default.warn(`⚠️ Returning stale data for key ${key}`);
                return stale.data;
            }
            throw error;
        }
    }
    /**
     * Batch get multiple keys efficiently
     */
    async getBatch(keys, options) {
        const results = new Map();
        const cacheKeys = keys.map(k => this.buildCacheKey(k.key, options?.userId));
        try {
            // Get all from cache in one Redis call (or in-memory fallback)
            let cached;
            if (this.redis) {
                cached = await this.redis.mGet(cacheKeys);
            }
            else {
                cached = cacheKeys.map(k => this.memoryCache.get(k) ?? null);
            }
            const refreshPromises = [];
            for (let i = 0; i < keys.length; i++) {
                const { key, fetchFn } = keys[i];
                const config = this.configs.get(key) || this.getDefaultConfig();
                if (cached && cached[i]) {
                    try {
                        const raw = cached[i];
                        const entry = JSON.parse(raw);
                        results.set(key, entry.data);
                        // Check if needs refresh
                        if (this.shouldRefresh(entry, config)) {
                            refreshPromises.push(this.refreshInBackground(cacheKeys[i], fetchFn, config));
                        }
                    }
                    catch (parseError) {
                        // Invalid cache entry, fetch fresh
                        refreshPromises.push(this.fetchAndCache(cacheKeys[i], fetchFn, config).then(data => {
                            results.set(key, data);
                        }));
                    }
                }
                else {
                    // Cache miss, fetch fresh
                    refreshPromises.push(this.fetchAndCache(cacheKeys[i], fetchFn, config).then(data => {
                        results.set(key, data);
                    }));
                }
            }
            // Wait for all fresh fetches to complete
            await Promise.all(refreshPromises);
            return results;
        }
        catch (error) {
            logger_1.default.error('❌ Batch cache error:', error);
            throw error;
        }
    }
    /**
     * Invalidate cache for specific patterns
     */
    async invalidate(pattern, userId) {
        try {
            const searchPattern = this.buildCacheKey(pattern, userId);
            if (this.redis) {
                const keys = await this.redis.keys(searchPattern);
                if (keys && keys.length > 0) {
                    await Promise.all(keys.map(k => this.redis.del(k)));
                    logger_1.default.info(`🗑️ Invalidated ${keys.length} cache entries for pattern: ${pattern}`);
                }
            }
            else {
                // In-memory fallback – simple linear scan
                let count = 0;
                for (const key of Array.from(this.memoryCache.keys())) {
                    if (key.includes(pattern)) {
                        this.memoryCache.delete(key);
                        count++;
                    }
                }
                logger_1.default.info(`🗑️ Invalidated ${count} in-memory cache entries for pattern: ${pattern}`);
            }
        }
        catch (error) {
            logger_1.default.error(`❌ Cache invalidation error for pattern ${pattern}:`, error);
        }
    }
    /**
     * Get cache statistics
     */
    async getStats() {
        try {
            const info = this.redis ? await this.redis.info('memory') : undefined;
            const keys = this.redis ? await this.redis.keys('*') : Array.from(this.memoryCache.keys());
            return {
                totalKeys: keys?.length || 0,
                memoryUsage: this.parseMemoryUsage(info),
                hitRate: 0, // TODO: Implement hit rate tracking
                configs: this.configs
            };
        }
        catch (error) {
            logger_1.default.error('❌ Cache stats error:', error);
            return {
                totalKeys: 0,
                memoryUsage: 'Unknown',
                hitRate: 0,
                configs: this.configs
            };
        }
    }
    buildCacheKey(key, userId) {
        return userId ? `${key}:user:${userId}` : key;
    }
    async getFromCache(key, allowStale = false) {
        try {
            const cached = this.redis ? await this.redis.get(key) : this.memoryCache.get(key);
            if (!cached)
                return null;
            const entry = JSON.parse(cached);
            const now = Date.now();
            const age = now - entry.timestamp;
            const isExpired = age > (entry.ttl * 1000);
            if (isExpired && !allowStale) {
                return null;
            }
            return entry;
        }
        catch (error) {
            logger_1.default.error(`❌ Cache get error for key ${key}:`, error);
            return null;
        }
    }
    async fetchAndCache(key, fetchFn, config) {
        const data = await fetchFn();
        const entry = {
            data,
            timestamp: Date.now(),
            ttl: config.ttl,
            version: 1,
            source: 'fresh'
        };
        if (this.redis) {
            await this.redis.setEx(key, config.ttl, JSON.stringify(entry));
            // Publish notification for cricket fixtures updates
            if (key === 'cricket:fixtures') {
                try {
                    await this.redis.publish('cricket:fixtures:updated', JSON.stringify({
                        key,
                        timestamp: Date.now(),
                        dataLength: Array.isArray(data) ? data.length : 'unknown',
                        source: 'smartcache'
                    }));
                    logger_1.default.info('📡 Published cricket:fixtures:updated notification');
                }
                catch (error) {
                    logger_1.default.error('❌ Failed to publish fixtures update notification:', error);
                }
            }
        }
        else {
            // In-memory fallback with naive TTL handling stored in entry
            this.memoryCache.set(key, JSON.stringify(entry));
            // Schedule expiry
            setTimeout(() => this.memoryCache.delete(key), config.ttl * 1000).unref?.();
        }
        return data;
    }
    shouldRefresh(entry, config) {
        const now = Date.now();
        const age = now - entry.timestamp;
        const timeLeft = (entry.ttl * 1000) - age;
        const refreshThreshold = entry.ttl * 1000 * config.refreshThreshold;
        return timeLeft <= refreshThreshold;
    }
    async refreshInBackground(key, fetchFn, config) {
        // Prevent multiple refresh attempts for same key
        if (this.refreshPromises.has(key)) {
            return this.refreshPromises.get(key);
        }
        const refreshPromise = this.fetchAndCache(key, fetchFn, config)
            .then(() => {
            this.refreshPromises.delete(key);
        })
            .catch(error => {
            logger_1.default.error(`❌ Background refresh failed for key ${key}:`, error);
            this.refreshPromises.delete(key);
        });
        this.refreshPromises.set(key, refreshPromise);
        return refreshPromise;
    }
    getDefaultConfig() {
        return {
            ttl: 60,
            refreshThreshold: 0.5,
            maxRetries: 2,
            fallbackTtl: 120
        };
    }
    parseMemoryUsage(info) {
        if (!info)
            return 'Unknown';
        const match = info.match(/used_memory_human:([^\r\n]+)/);
        return match ? match[1] : 'Unknown';
    }
}
exports.SmartCache = SmartCache;
exports.smartCache = new SmartCache();
//# sourceMappingURL=SmartCache.js.map