"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedCasinoScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../../monitoring/logging/logger");
const casinoRedisPublisher_1 = require("../casino/casinoRedisPublisher");
const EnhancedAPIService_1 = __importDefault(require("../EnhancedAPIService"));
// Scheduler configuration
const SCHEDULE_CONFIG = {
    // Polling intervals for different data types
    INTERVALS: {
        GAME_DATA: '*/1 * * * * *', // Every 1 second
        RESULTS: '*/4 * * * * *', // Every 4 seconds
        MARKETS: '*/10 * * * * *' // Every 10 seconds
    },
    // Game types to poll
    SUPPORTED_GAMES: ['teen20', 'ab20', 'dt20', 'aaa', 'card32eu', 'lucky7eu'],
    // Streaming IDs for each game
    STREAMING_IDS: {
        teen20: '3030',
        ab20: '3043',
        dt20: '3035',
        aaa: '3056',
        card32eu: '3034',
        lucky7eu: '3032'
    }
};
class EnhancedCasinoScheduler {
    constructor() {
        this.isInitialized = false;
        this.activeJobs = new Map();
        this.redisPublisher = null;
        this.schedulerStats = {
            totalJobs: 0,
            activeJobs: 0,
            lastRun: null,
            errors: 0,
            successfulRuns: 0,
            queuedRequests: 0,
            rateLimitedRequests: 0
        };
        this.enhancedAPIService = new EnhancedAPIService_1.default();
    }
    async initialize(redisClient) {
        if (this.isInitialized)
            return;
        try {
            // Initialize Redis publisher
            this.redisPublisher = new casinoRedisPublisher_1.CasinoRedisPublisher(redisClient);
            // Configure rate limits for different endpoints
            this.configureRateLimits();
            this.isInitialized = true;
            (0, logger_1.logInfo)('✅ Enhanced Casino Scheduler initialized successfully');
        }
        catch (error) {
            (0, logger_1.logError)('❌ Failed to initialize Enhanced Casino Scheduler:', error);
            throw error;
        }
    }
    /**
     * Configure rate limits for different API endpoints
     */
    configureRateLimits() {
        // Casino data - optimized for 1s polling (20-30s game rounds)
        this.enhancedAPIService.updateRateLimiterConfig('casino_data_teen20', {
            windowMs: 60000, // 1 minute
            maxRequests: 60, // 60 requests per minute (1 per second)
            minInterval: 1000, // 1 second between requests
            backoffMs: 10000, // 10 seconds backoff
            adaptive: true
        });
        // Casino results - optimized for 1s polling (20-30s game rounds)
        this.enhancedAPIService.updateRateLimiterConfig('casino_results_teen20', {
            windowMs: 60000, // 1 minute
            maxRequests: 60, // 60 requests per minute (1 per second)
            minInterval: 1000, // 1 second between requests
            backoffMs: 10000, // 10 seconds backoff
            adaptive: true
        });
        // Apply same config to all games - optimized for 1s polling
        SCHEDULE_CONFIG.SUPPORTED_GAMES.forEach(gameType => {
            if (gameType !== 'teen20') {
                this.enhancedAPIService.updateRateLimiterConfig(`casino_data_${gameType}`, {
                    windowMs: 60000,
                    maxRequests: 60, // 60 requests per minute (1 per second)
                    minInterval: 1000, // 1 second between requests
                    backoffMs: 10000, // 10 seconds backoff
                    adaptive: true
                });
                this.enhancedAPIService.updateRateLimiterConfig(`casino_results_${gameType}`, {
                    windowMs: 60000,
                    maxRequests: 60, // 60 requests per minute (1 per second)
                    minInterval: 1000, // 1 second between requests
                    backoffMs: 10000, // 10 seconds backoff
                    adaptive: true
                });
            }
        });
        (0, logger_1.logInfo)('📊 Configured rate limits for all casino endpoints');
    }
    /**
     * Start all casino polling jobs
     */
    async startAllGamePolling() {
        if (!this.isInitialized) {
            throw new Error('Scheduler not initialized');
        }
        try {
            // Start game data polling for all games
            await this.startGameDataPolling();
            // Start results polling for all games
            await this.startResultsPolling();
            // Start markets polling for all games
            await this.startMarketsPolling();
            (0, logger_1.logInfo)('🚀 Started all casino polling jobs');
        }
        catch (error) {
            (0, logger_1.logError)('❌ Failed to start all casino polling:', error);
            throw error;
        }
    }
    /**
     * Start game data polling for all games
     */
    async startGameDataPolling() {
        const jobName = 'casino-game-data';
        if (this.activeJobs.has(jobName)) {
            (0, logger_1.logInfo)(`⚠️ Job ${jobName} already running`);
            return;
        }
        const job = node_cron_1.default.schedule(SCHEDULE_CONFIG.INTERVALS.GAME_DATA, async () => {
            await this.pollAllGameData();
        }, {
            scheduled: false
        });
        this.activeJobs.set(jobName, job);
        job.start();
        this.schedulerStats.totalJobs++;
        this.schedulerStats.activeJobs++;
        (0, logger_1.logInfo)(`✅ Started ${jobName} polling (${SCHEDULE_CONFIG.INTERVALS.GAME_DATA})`);
    }
    /**
     * Start results polling for all games
     */
    async startResultsPolling() {
        const jobName = 'casino-results';
        if (this.activeJobs.has(jobName)) {
            (0, logger_1.logInfo)(`⚠️ Job ${jobName} already running`);
            return;
        }
        const job = node_cron_1.default.schedule(SCHEDULE_CONFIG.INTERVALS.RESULTS, async () => {
            await this.pollAllResults();
        }, {
            scheduled: false
        });
        this.activeJobs.set(jobName, job);
        job.start();
        this.schedulerStats.totalJobs++;
        this.schedulerStats.activeJobs++;
        (0, logger_1.logInfo)(`✅ Started ${jobName} polling (${SCHEDULE_CONFIG.INTERVALS.RESULTS})`);
    }
    /**
     * Start markets polling for all games
     */
    async startMarketsPolling() {
        const jobName = 'casino-markets';
        if (this.activeJobs.has(jobName)) {
            (0, logger_1.logInfo)(`⚠️ Job ${jobName} already running`);
            return;
        }
        const job = node_cron_1.default.schedule(SCHEDULE_CONFIG.INTERVALS.MARKETS, async () => {
            await this.pollAllMarkets();
        }, {
            scheduled: false
        });
        this.activeJobs.set(jobName, job);
        job.start();
        this.schedulerStats.totalJobs++;
        this.schedulerStats.activeJobs++;
        (0, logger_1.logInfo)(`✅ Started ${jobName} polling (${SCHEDULE_CONFIG.INTERVALS.MARKETS})`);
    }
    /**
     * Poll game data for all games using batch queuing
     */
    async pollAllGameData() {
        try {
            this.schedulerStats.lastRun = Date.now();
            // Batch queue all game data requests
            const gameTypes = SCHEDULE_CONFIG.SUPPORTED_GAMES;
            const requestIds = await this.enhancedAPIService.batchQueueCasinoRequests(gameTypes, ['data'], undefined, // Use default streaming IDs
            1 // High priority
            );
            this.schedulerStats.queuedRequests += requestIds.length;
            this.schedulerStats.successfulRuns++;
            (0, logger_1.logInfo)(`📊 Queued ${requestIds.length} game data requests for all games`);
        }
        catch (error) {
            (0, logger_1.logError)('❌ Error polling all game data:', error);
            this.schedulerStats.errors++;
        }
    }
    /**
     * Poll results for all games using batch queuing
     */
    async pollAllResults() {
        try {
            this.schedulerStats.lastRun = Date.now();
            // Batch queue all results requests
            const gameTypes = SCHEDULE_CONFIG.SUPPORTED_GAMES;
            const requestIds = await this.enhancedAPIService.batchQueueCasinoRequests(gameTypes, ['results'], undefined, // Use default streaming IDs
            2 // Medium priority
            );
            this.schedulerStats.queuedRequests += requestIds.length;
            this.schedulerStats.successfulRuns++;
            (0, logger_1.logInfo)(`📊 Queued ${requestIds.length} results requests for all games`);
        }
        catch (error) {
            (0, logger_1.logError)('❌ Error polling all results:', error);
            this.schedulerStats.errors++;
        }
    }
    /**
     * Poll markets for all games (placeholder for future implementation)
     */
    async pollAllMarkets() {
        try {
            this.schedulerStats.lastRun = Date.now();
            // For now, just log that markets polling is active
            // This can be expanded when market data endpoints are available
            (0, logger_1.logInfo)('📊 Markets polling active (placeholder)');
        }
        catch (error) {
            (0, logger_1.logError)('❌ Error polling all markets:', error);
            this.schedulerStats.errors++;
        }
    }
    /**
     * Stop all polling jobs
     */
    stopAllPolling() {
        try {
            this.activeJobs.forEach((job, jobName) => {
                job.stop();
                (0, logger_1.logInfo)(`🛑 Stopped job: ${jobName}`);
            });
            this.activeJobs.clear();
            this.schedulerStats.activeJobs = 0;
            (0, logger_1.logInfo)('🛑 Stopped all casino polling jobs');
        }
        catch (error) {
            (0, logger_1.logError)('❌ Error stopping polling jobs:', error);
        }
    }
    /**
     * Stop specific polling job
     */
    stopPolling(jobName) {
        const job = this.activeJobs.get(jobName);
        if (job) {
            job.stop();
            this.activeJobs.delete(jobName);
            this.schedulerStats.activeJobs--;
            (0, logger_1.logInfo)(`🛑 Stopped job: ${jobName}`);
        }
        else {
            (0, logger_1.logInfo)(`⚠️ Job ${jobName} not found`);
        }
    }
    /**
     * Get scheduler statistics
     */
    getStats() {
        const apiStats = this.enhancedAPIService.getStats();
        return {
            scheduler: {
                ...this.schedulerStats,
                activeJobs: this.activeJobs.size,
                jobNames: Array.from(this.activeJobs.keys())
            },
            api: apiStats,
            config: SCHEDULE_CONFIG
        };
    }
    /**
     * Get detailed status for monitoring
     */
    getDetailedStatus() {
        return {
            isInitialized: this.isInitialized,
            activeJobs: Array.from(this.activeJobs.keys()),
            stats: this.getStats(),
            rateLimiterStatus: this.enhancedAPIService.getRateLimiterStatus(),
            queueStatus: this.enhancedAPIService.getQueueStats()
        };
    }
    /**
     * Force refresh all data (bypass queue for immediate processing)
     */
    async forceRefreshAll() {
        if (!this.isInitialized) {
            throw new Error('Scheduler not initialized');
        }
        try {
            (0, logger_1.logInfo)('🔄 Force refreshing all casino data...');
            // Immediately poll all data types
            await Promise.all([
                this.pollAllGameData(),
                this.pollAllResults(),
                this.pollAllMarkets()
            ]);
            (0, logger_1.logInfo)('✅ Force refresh completed');
        }
        catch (error) {
            (0, logger_1.logError)('❌ Error during force refresh:', error);
            throw error;
        }
    }
    /**
     * Update polling intervals
     */
    updateIntervals(newIntervals) {
        Object.assign(SCHEDULE_CONFIG.INTERVALS, newIntervals);
        (0, logger_1.logInfo)('🔧 Updated polling intervals:', SCHEDULE_CONFIG.INTERVALS);
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        this.stopAllPolling();
        this.enhancedAPIService.reset();
        (0, logger_1.logInfo)('🧹 Cleaned up enhanced casino scheduler');
    }
}
exports.EnhancedCasinoScheduler = EnhancedCasinoScheduler;
exports.default = EnhancedCasinoScheduler;
//# sourceMappingURL=EnhancedCasinoScheduler.js.map