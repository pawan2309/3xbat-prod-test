export interface APICallResult {
    success: boolean;
    data?: any;
    error?: string;
    statusCode?: number;
    retryCount?: number;
    responseTime?: number;
}
export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
}
export declare class EnhancedAPIService {
    private realService;
    private queue;
    private rateLimiter;
    private retryConfig;
    private stats;
    constructor();
    /**
     * Setup queue processors for different API types
     */
    private setupProcessors;
    /**
     * Make API call with rate limiting, retry, and error handling
     */
    private makeAPICall;
    /**
     * Queue casino data request
     */
    queueCasinoData(gameType: string, streamingId?: string, priority?: number): Promise<string>;
    /**
     * Queue casino results request
     */
    queueCasinoResults(gameType: string, streamingId?: string, priority?: number): Promise<string>;
    /**
     * Queue casino TV request
     */
    queueCasinoTV(streamingId: string, priority?: number): Promise<string>;
    /**
     * Queue cricket scorecard request
     */
    queueCricketScorecard(beventId: string, priority?: number): Promise<string>;
    /**
     * Queue cricket odds request
     */
    queueCricketOdds(beventId: string, priority?: number): Promise<string>;
    /**
     * Batch queue multiple casino requests
     */
    batchQueueCasinoRequests(gameTypes: string[], requestTypes: ('data' | 'results')[], streamingId?: string, priority?: number): Promise<string[]>;
    /**
     * Get queue statistics
     */
    getQueueStats(): {
        processing: number;
        queued: number;
        isRunning: boolean;
        totalProcessed: number;
        totalFailed: number;
        totalRetries: number;
        averageWaitTime: number;
        queueSize: number;
    };
    /**
     * Get rate limiter status
     */
    getRateLimiterStatus(): {
        [endpoint: string]: any;
    };
    /**
     * Get API service statistics
     */
    getStats(): {
        queue: {
            processing: number;
            queued: number;
            isRunning: boolean;
            totalProcessed: number;
            totalFailed: number;
            totalRetries: number;
            averageWaitTime: number;
            queueSize: number;
        };
        rateLimiter: {
            [endpoint: string]: any;
        };
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        rateLimitedCalls: number;
        retriedCalls: number;
        averageResponseTime: number;
    };
    /**
     * Update retry configuration
     */
    updateRetryConfig(config: Partial<RetryConfig>): void;
    /**
     * Update rate limiter configuration
     */
    updateRateLimiterConfig(endpoint: string, config: any): void;
    /**
     * Clear all queues and reset rate limiters
     */
    reset(): void;
    private sleep;
}
export default EnhancedAPIService;
//# sourceMappingURL=EnhancedAPIService.d.ts.map