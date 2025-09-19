export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    minInterval: number;
    backoffMs: number;
    adaptive: boolean;
}
export interface EndpointConfig {
    [endpoint: string]: RateLimitConfig;
}
export declare class RateLimiter {
    private configs;
    private requestCounts;
    private lastRequestTime;
    private backoffUntil;
    private adaptiveDelays;
    constructor(defaultConfig: RateLimitConfig);
    /**
     * Set default rate limit configuration
     */
    setDefaultConfig(config: RateLimitConfig): void;
    /**
     * Set rate limit for specific endpoint
     */
    setEndpointConfig(endpoint: string, config: RateLimitConfig): void;
    /**
     * Check if request is allowed and get delay if needed
     */
    checkRateLimit(endpoint?: string): Promise<{
        allowed: boolean;
        delayMs: number;
        reason?: string;
    }>;
    /**
     * Record a successful request
     */
    recordRequest(endpoint?: string): void;
    /**
     * Handle 429 response - implement backoff and adaptive delay
     */
    handle429Response(endpoint?: string): void;
    /**
     * Handle successful response - reduce adaptive delay
     */
    handleSuccessResponse(endpoint?: string): void;
    /**
     * Get current status for monitoring
     */
    getStatus(endpoint?: string): {
        endpoint: string;
        config: RateLimitConfig;
        currentWindow: {
            requests: number;
            maxRequests: number;
            resetTime: string | null;
            remaining: number;
        };
        lastRequest: string | null;
        timeSinceLastRequest: number;
        backoff: {
            active: boolean;
            until: string | null;
            remaining: number;
        };
        adaptiveDelay: {
            active: boolean;
            delayMs: number;
            remaining: number;
        };
    };
    /**
     * Get all endpoints status
     */
    getAllStatus(): {
        [endpoint: string]: any;
    };
    /**
     * Reset rate limiter for specific endpoint
     */
    reset(endpoint?: string): void;
    /**
     * Reset all rate limiters
     */
    resetAll(): void;
}
export default RateLimiter;
//# sourceMappingURL=RateLimiter.d.ts.map