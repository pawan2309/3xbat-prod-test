"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiters = exports.createRateLimiters = exports.AdaptiveRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = __importDefault(require("../monitoring/logging/logger"));
class AdaptiveRateLimiter {
    constructor(config) {
        this.loadHistory = [];
        this.lastAdaptation = 0;
        this.adaptationCooldown = 60000; // 1 minute
        this.config = config;
        this.currentConfig = {
            windowMs: config.baseWindowMs,
            max: config.baseMaxRequests
        };
        // Create the rate limiter instance at initialization
        this.createRateLimiter();
    }
    /**
     * Create the rate limiter instance
     */
    createRateLimiter() {
        this.rateLimiter = (0, express_rate_limit_1.default)({
            windowMs: this.currentConfig.windowMs,
            max: this.currentConfig.max,
            message: {
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil(this.currentConfig.windowMs / 1000),
                currentLimit: this.currentConfig.max,
                windowMs: this.currentConfig.windowMs
            },
            standardHeaders: true,
            legacyHeaders: false,
            skip: (req) => {
                // Skip rate limiting for health checks and selected endpoints
                if (req.path.includes('/health'))
                    return true;
                // Skip rate limiting for authentication endpoints
                if (req.path.startsWith('/api/auth/'))
                    return true;
                // Skip rate limiting for internal API routes (user management, dashboard, etc.)
                const internalApiRoutes = [
                    '/api/users',
                    '/api/dashboard',
                    '/api/transactions',
                    '/api/commissions',
                    '/api/games',
                    '/api/matches',
                    '/api/bets',
                    '/api/reports'
                ];
                if (internalApiRoutes.some((route) => req.path.startsWith(route)))
                    return true;
                // Allow fixtures and TV endpoints (these are server-polled and cached)
                const allowlist = [
                    '/api/cricket/fixtures',
                    '/api/cricket/tv',
                    '/api/cricket/tv/html'
                ];
                if (allowlist.some((p) => req.path.startsWith(p)))
                    return true;
                // Ignore HEAD probes entirely
                if (req.method === 'HEAD')
                    return true;
                return false;
            }
        });
    }
    /**
     * Create adaptive rate limiter middleware
     */
    createMiddleware() {
        return (req, res, next) => {
            // Check if we need to adapt
            this.adaptIfNeeded();
            // Apply the existing rate limiter
            this.rateLimiter(req, res, next);
        };
    }
    /**
     * Adapt rate limiting based on current load
     */
    adaptIfNeeded() {
        const now = Date.now();
        // Don't adapt too frequently
        if (now - this.lastAdaptation < this.adaptationCooldown) {
            return;
        }
        const currentLoad = this.getCurrentLoad();
        this.loadHistory.push(currentLoad);
        // Keep only last 10 measurements
        if (this.loadHistory.length > 10) {
            this.loadHistory.shift();
        }
        const avgLoad = this.loadHistory.reduce((a, b) => a + b, 0) / this.loadHistory.length;
        if (avgLoad > this.config.loadThreshold) {
            this.scaleDown();
        }
        else if (avgLoad < this.config.loadThreshold * 0.5) {
            this.scaleUp();
        }
        this.lastAdaptation = now;
    }
    /**
     * Get current system load (simplified)
     */
    getCurrentLoad() {
        // In a real implementation, you'd check:
        // - CPU usage
        // - Memory usage
        // - Active connections
        // - Queue lengths
        // - Response times
        // For now, return a random value between 0 and 1
        // In production, replace with actual system metrics
        return Math.random();
    }
    /**
     * Scale down rate limits when under high load
     */
    scaleDown() {
        const newMax = Math.max(Math.floor(this.currentConfig.max * this.config.scaleFactor), Math.floor(this.config.baseMaxRequests * 0.1) // Don't go below 10% of base
        );
        const newWindowMs = Math.min(this.currentConfig.windowMs * 1.5, // Increase window
        this.config.maxWindowMs);
        if (newMax !== this.currentConfig.max || newWindowMs !== this.currentConfig.windowMs) {
            this.currentConfig = { max: newMax, windowMs: newWindowMs };
            // Recreate the rate limiter with new configuration
            this.createRateLimiter();
            logger_1.default.warn(`📉 Scaled down rate limiting: ${newMax} requests per ${newWindowMs}ms`);
        }
    }
    /**
     * Scale up rate limits when load is low
     */
    scaleUp() {
        const newMax = Math.min(Math.floor(this.currentConfig.max / this.config.scaleFactor), this.config.maxMaxRequests);
        const newWindowMs = Math.max(this.currentConfig.windowMs / 1.2, // Decrease window
        this.config.baseWindowMs);
        if (newMax !== this.currentConfig.max || newWindowMs !== this.currentConfig.windowMs) {
            this.currentConfig = { max: newMax, windowMs: newWindowMs };
            // Recreate the rate limiter with new configuration
            this.createRateLimiter();
            logger_1.default.info(`📈 Scaled up rate limiting: ${newMax} requests per ${newWindowMs}ms`);
        }
    }
    /**
     * Get current rate limiting configuration
     */
    getCurrentConfig() {
        return { ...this.currentConfig };
    }
    /**
     * Reset to base configuration
     */
    reset() {
        this.currentConfig = {
            windowMs: this.config.baseWindowMs,
            max: this.config.baseMaxRequests
        };
        this.loadHistory = [];
        // Recreate the rate limiter with base configuration
        this.createRateLimiter();
        logger_1.default.info('🔄 Reset rate limiting to base configuration');
    }
}
exports.AdaptiveRateLimiter = AdaptiveRateLimiter;
// Create different rate limiters for different endpoints
const createRateLimiters = () => {
    // General API rate limiter
    const generalLimiter = new AdaptiveRateLimiter({
        baseWindowMs: 15 * 60 * 1000, // 15 minutes
        baseMaxRequests: 100,
        maxWindowMs: 30 * 60 * 1000, // 30 minutes
        maxMaxRequests: 200,
        loadThreshold: 0.7,
        scaleFactor: 0.7
    });
    // Aggregated data rate limiter (more lenient)
    const aggregatedLimiter = new AdaptiveRateLimiter({
        baseWindowMs: 5 * 60 * 1000, // 5 minutes
        baseMaxRequests: 50,
        maxWindowMs: 15 * 60 * 1000, // 15 minutes
        maxMaxRequests: 100,
        loadThreshold: 0.6,
        scaleFactor: 0.8
    });
    // Match data rate limiter (stricter)
    const matchDataLimiter = new AdaptiveRateLimiter({
        baseWindowMs: 1 * 60 * 1000, // 1 minute
        baseMaxRequests: 20,
        maxWindowMs: 5 * 60 * 1000, // 5 minutes
        maxMaxRequests: 50,
        loadThreshold: 0.5,
        scaleFactor: 0.6
    });
    // TV availability rate limiter (very strict)
    const tvLimiter = new AdaptiveRateLimiter({
        baseWindowMs: 30 * 1000, // 30 seconds
        baseMaxRequests: 10,
        maxWindowMs: 2 * 60 * 1000, // 2 minutes
        maxMaxRequests: 20,
        loadThreshold: 0.4,
        scaleFactor: 0.5
    });
    // Authentication rate limiter (lenient but protects against brute force)
    const authLimiter = new AdaptiveRateLimiter({
        baseWindowMs: 15 * 60 * 1000, // 15 minutes
        baseMaxRequests: 20, // 20 login attempts per 15 minutes
        maxWindowMs: 30 * 60 * 1000, // 30 minutes
        maxMaxRequests: 40,
        loadThreshold: 0.8,
        scaleFactor: 0.8
    });
    return {
        general: generalLimiter.createMiddleware(),
        aggregated: aggregatedLimiter.createMiddleware(),
        matchData: matchDataLimiter.createMiddleware(),
        tv: tvLimiter.createMiddleware(),
        auth: authLimiter.createMiddleware()
    };
};
exports.createRateLimiters = createRateLimiters;
exports.rateLimiters = (0, exports.createRateLimiters)();
//# sourceMappingURL=AdaptiveRateLimiter.js.map