"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
const logger_1 = require("../../monitoring/logging/logger");
class RateLimiter {
    constructor(defaultConfig) {
        this.configs = {};
        this.requestCounts = new Map();
        this.lastRequestTime = new Map();
        this.backoffUntil = new Map();
        this.adaptiveDelays = new Map();
        this.setDefaultConfig(defaultConfig);
    }
    /**
     * Set default rate limit configuration
     */
    setDefaultConfig(config) {
        this.configs['default'] = config;
        (0, logger_1.logInfo)(`📊 Set default rate limit: ${config.maxRequests} requests per ${config.windowMs}ms`);
    }
    /**
     * Set rate limit for specific endpoint
     */
    setEndpointConfig(endpoint, config) {
        this.configs[endpoint] = config;
        (0, logger_1.logInfo)(`📊 Set rate limit for ${endpoint}: ${config.maxRequests} requests per ${config.windowMs}ms`);
    }
    /**
     * Check if request is allowed and get delay if needed
     */
    async checkRateLimit(endpoint = 'default') {
        const config = this.configs[endpoint] || this.configs['default'];
        const now = Date.now();
        const key = endpoint;
        // Check if in backoff period
        const backoffUntil = this.backoffUntil.get(key) || 0;
        if (now < backoffUntil) {
            const remainingBackoff = backoffUntil - now;
            return {
                allowed: false,
                delayMs: remainingBackoff,
                reason: `In backoff period, ${Math.ceil(remainingBackoff / 1000)}s remaining`
            };
        }
        // Check minimum interval between requests
        const lastRequest = this.lastRequestTime.get(key) || 0;
        const timeSinceLastRequest = now - lastRequest;
        if (timeSinceLastRequest < config.minInterval) {
            const delay = config.minInterval - timeSinceLastRequest;
            return {
                allowed: false,
                delayMs: delay,
                reason: `Minimum interval not met, need ${Math.ceil(delay)}ms more`
            };
        }
        // Check window-based rate limit
        const windowData = this.requestCounts.get(key);
        if (windowData) {
            // Reset window if expired
            if (now >= windowData.resetTime) {
                this.requestCounts.delete(key);
            }
            else if (windowData.count >= config.maxRequests) {
                const delay = windowData.resetTime - now;
                return {
                    allowed: false,
                    delayMs: delay,
                    reason: `Rate limit exceeded, ${Math.ceil(delay / 1000)}s until reset`
                };
            }
        }
        // Check adaptive delay
        const adaptiveDelay = this.adaptiveDelays.get(key) || 0;
        if (adaptiveDelay > 0) {
            return {
                allowed: false,
                delayMs: adaptiveDelay,
                reason: `Adaptive delay active, ${Math.ceil(adaptiveDelay)}ms remaining`
            };
        }
        return { allowed: true, delayMs: 0 };
    }
    /**
     * Record a successful request
     */
    recordRequest(endpoint = 'default') {
        const now = Date.now();
        const key = endpoint;
        const config = this.configs[endpoint] || this.configs['default'];
        // Update last request time
        this.lastRequestTime.set(key, now);
        // Update window counter
        const windowData = this.requestCounts.get(key);
        if (windowData && now < windowData.resetTime) {
            windowData.count++;
        }
        else {
            this.requestCounts.set(key, {
                count: 1,
                resetTime: now + config.windowMs
            });
        }
        // Reduce adaptive delay on success
        const currentAdaptiveDelay = this.adaptiveDelays.get(key) || 0;
        if (currentAdaptiveDelay > 0) {
            const reducedDelay = Math.max(0, currentAdaptiveDelay - 1000); // Reduce by 1 second
            this.adaptiveDelays.set(key, reducedDelay);
        }
    }
    /**
     * Handle 429 response - implement backoff and adaptive delay
     */
    handle429Response(endpoint = 'default') {
        const config = this.configs[endpoint] || this.configs['default'];
        const now = Date.now();
        const key = endpoint;
        // Set backoff period
        const backoffTime = now + config.backoffMs;
        this.backoffUntil.set(key, backoffTime);
        // Increase adaptive delay
        const currentDelay = this.adaptiveDelays.get(key) || 0;
        const newDelay = Math.min(currentDelay * 2 + 5000, 60000); // Double delay + 5s, max 60s
        this.adaptiveDelays.set(key, newDelay);
        (0, logger_1.logWarn)(`🚨 Rate limited on ${endpoint}, backoff until ${new Date(backoffTime).toISOString()}, adaptive delay: ${newDelay}ms`);
        // Reset window counter to start fresh after backoff
        this.requestCounts.delete(key);
    }
    /**
     * Handle successful response - reduce adaptive delay
     */
    handleSuccessResponse(endpoint = 'default') {
        const key = endpoint;
        const currentDelay = this.adaptiveDelays.get(key) || 0;
        if (currentDelay > 0) {
            const reducedDelay = Math.max(0, currentDelay - 2000); // Reduce by 2 seconds
            this.adaptiveDelays.set(key, reducedDelay);
            if (reducedDelay === 0) {
                this.adaptiveDelays.delete(key);
                (0, logger_1.logInfo)(`✅ Adaptive delay cleared for ${endpoint}`);
            }
        }
    }
    /**
     * Get current status for monitoring
     */
    getStatus(endpoint = 'default') {
        const config = this.configs[endpoint] || this.configs['default'];
        const now = Date.now();
        const key = endpoint;
        const windowData = this.requestCounts.get(key);
        const lastRequest = this.lastRequestTime.get(key) || 0;
        const backoffUntil = this.backoffUntil.get(key) || 0;
        const adaptiveDelay = this.adaptiveDelays.get(key) || 0;
        return {
            endpoint,
            config,
            currentWindow: {
                requests: windowData?.count || 0,
                maxRequests: config.maxRequests,
                resetTime: windowData?.resetTime ? new Date(windowData.resetTime).toISOString() : null,
                remaining: Math.max(0, config.maxRequests - (windowData?.count || 0))
            },
            lastRequest: lastRequest ? new Date(lastRequest).toISOString() : null,
            timeSinceLastRequest: now - lastRequest,
            backoff: {
                active: now < backoffUntil,
                until: backoffUntil ? new Date(backoffUntil).toISOString() : null,
                remaining: Math.max(0, backoffUntil - now)
            },
            adaptiveDelay: {
                active: adaptiveDelay > 0,
                delayMs: adaptiveDelay,
                remaining: adaptiveDelay
            }
        };
    }
    /**
     * Get all endpoints status
     */
    getAllStatus() {
        const endpoints = new Set(['default', ...Object.keys(this.configs)]);
        const status = {};
        for (const endpoint of endpoints) {
            status[endpoint] = this.getStatus(endpoint);
        }
        return status;
    }
    /**
     * Reset rate limiter for specific endpoint
     */
    reset(endpoint = 'default') {
        const key = endpoint;
        this.requestCounts.delete(key);
        this.lastRequestTime.delete(key);
        this.backoffUntil.delete(key);
        this.adaptiveDelays.delete(key);
        (0, logger_1.logInfo)(`🔄 Reset rate limiter for ${endpoint}`);
    }
    /**
     * Reset all rate limiters
     */
    resetAll() {
        this.requestCounts.clear();
        this.lastRequestTime.clear();
        this.backoffUntil.clear();
        this.adaptiveDelays.clear();
        (0, logger_1.logInfo)('🔄 Reset all rate limiters');
    }
}
exports.RateLimiter = RateLimiter;
exports.default = RateLimiter;
//# sourceMappingURL=RateLimiter.js.map