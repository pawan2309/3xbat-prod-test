import { RedisClientType } from 'redis';
declare const SCHEDULE_CONFIG: {
    INTERVALS: {
        GAME_DATA: string;
        RESULTS: string;
        MARKETS: string;
    };
    SUPPORTED_GAMES: string[];
    STREAMING_IDS: {
        teen20: string;
        ab20: string;
        dt20: string;
        aaa: string;
        card32eu: string;
        lucky7eu: string;
    };
};
export declare class EnhancedCasinoScheduler {
    private isInitialized;
    private activeJobs;
    private redisPublisher;
    private enhancedAPIService;
    private schedulerStats;
    constructor();
    initialize(redisClient: RedisClientType): Promise<void>;
    /**
     * Configure rate limits for different API endpoints
     */
    private configureRateLimits;
    /**
     * Start all casino polling jobs
     */
    startAllGamePolling(): Promise<void>;
    /**
     * Start game data polling for all games
     */
    private startGameDataPolling;
    /**
     * Start results polling for all games
     */
    private startResultsPolling;
    /**
     * Start markets polling for all games
     */
    private startMarketsPolling;
    /**
     * Poll game data for all games using batch queuing
     */
    private pollAllGameData;
    /**
     * Poll results for all games using batch queuing
     */
    private pollAllResults;
    /**
     * Poll markets for all games (placeholder for future implementation)
     */
    private pollAllMarkets;
    /**
     * Stop all polling jobs
     */
    stopAllPolling(): void;
    /**
     * Stop specific polling job
     */
    stopPolling(jobName: string): void;
    /**
     * Get scheduler statistics
     */
    getStats(): {
        scheduler: {
            activeJobs: number;
            jobNames: string[];
            totalJobs: number;
            lastRun: number | null;
            errors: number;
            successfulRuns: number;
            queuedRequests: number;
            rateLimitedRequests: number;
        };
        api: {
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
        config: {
            INTERVALS: {
                GAME_DATA: string;
                RESULTS: string;
                MARKETS: string;
            };
            SUPPORTED_GAMES: string[];
            STREAMING_IDS: {
                teen20: string;
                ab20: string;
                dt20: string;
                aaa: string;
                card32eu: string;
                lucky7eu: string;
            };
        };
    };
    /**
     * Get detailed status for monitoring
     */
    getDetailedStatus(): {
        isInitialized: boolean;
        activeJobs: string[];
        stats: {
            scheduler: {
                activeJobs: number;
                jobNames: string[];
                totalJobs: number;
                lastRun: number | null;
                errors: number;
                successfulRuns: number;
                queuedRequests: number;
                rateLimitedRequests: number;
            };
            api: {
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
            config: {
                INTERVALS: {
                    GAME_DATA: string;
                    RESULTS: string;
                    MARKETS: string;
                };
                SUPPORTED_GAMES: string[];
                STREAMING_IDS: {
                    teen20: string;
                    ab20: string;
                    dt20: string;
                    aaa: string;
                    card32eu: string;
                    lucky7eu: string;
                };
            };
        };
        rateLimiterStatus: {
            [endpoint: string]: any;
        };
        queueStatus: {
            processing: number;
            queued: number;
            isRunning: boolean;
            totalProcessed: number;
            totalFailed: number;
            totalRetries: number;
            averageWaitTime: number;
            queueSize: number;
        };
    };
    /**
     * Force refresh all data (bypass queue for immediate processing)
     */
    forceRefreshAll(): Promise<void>;
    /**
     * Update polling intervals
     */
    updateIntervals(newIntervals: Partial<typeof SCHEDULE_CONFIG.INTERVALS>): void;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
export default EnhancedCasinoScheduler;
//# sourceMappingURL=EnhancedCasinoScheduler.d.ts.map