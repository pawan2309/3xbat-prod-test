import { Request, Response, NextFunction } from 'express';
interface AdaptiveConfig {
    baseWindowMs: number;
    baseMaxRequests: number;
    maxWindowMs: number;
    maxMaxRequests: number;
    loadThreshold: number;
    scaleFactor: number;
}
export declare class AdaptiveRateLimiter {
    private config;
    private currentConfig;
    private loadHistory;
    private lastAdaptation;
    private adaptationCooldown;
    private rateLimiter;
    private internalRateLimiter;
    constructor(config: AdaptiveConfig);
    /**
     * Create the rate limiter instance
     */
    private createRateLimiter;
    /**
     * Create the internal rate limiter instance (lighter limits)
     */
    private createInternalRateLimiter;
    /**
     * Create adaptive rate limiter middleware
     */
    createMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Adapt rate limiting based on current load
     */
    private adaptIfNeeded;
    /**
     * Get current system load (simplified)
     */
    private getCurrentLoad;
    /**
     * Scale down rate limits when under high load
     */
    private scaleDown;
    /**
     * Scale up rate limits when load is low
     */
    private scaleUp;
    /**
     * Get current rate limiting configuration
     */
    getCurrentConfig(): {
        windowMs: number;
        max: number;
    };
    /**
     * Reset to base configuration
     */
    reset(): void;
}
export declare const createRateLimiters: () => {
    general: (req: Request, res: Response, next: NextFunction) => void;
    aggregated: (req: Request, res: Response, next: NextFunction) => void;
    matchData: (req: Request, res: Response, next: NextFunction) => void;
    tv: (req: Request, res: Response, next: NextFunction) => void;
    auth: (req: Request, res: Response, next: NextFunction) => void;
};
export declare const rateLimiters: {
    general: (req: Request, res: Response, next: NextFunction) => void;
    aggregated: (req: Request, res: Response, next: NextFunction) => void;
    matchData: (req: Request, res: Response, next: NextFunction) => void;
    tv: (req: Request, res: Response, next: NextFunction) => void;
    auth: (req: Request, res: Response, next: NextFunction) => void;
};
export {};
//# sourceMappingURL=AdaptiveRateLimiter.d.ts.map