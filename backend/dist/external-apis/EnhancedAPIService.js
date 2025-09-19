"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedAPIService = void 0;
const logger_1 = require("../monitoring/logging/logger");
const RequestQueue_1 = __importDefault(require("./queue/RequestQueue"));
const RateLimiter_1 = __importDefault(require("./rateLimiter/RateLimiter"));
const RealExternalAPIService_1 = __importDefault(require("./RealExternalAPIService"));
class EnhancedAPIService {
    constructor() {
        this.stats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            rateLimitedCalls: 0,
            retriedCalls: 0,
            averageResponseTime: 0
        };
        this.realService = new RealExternalAPIService_1.default();
        this.queue = new RequestQueue_1.default({
            maxConcurrent: 3,
            maxQueueSize: 1000,
            defaultPriority: 3,
            retryDelay: 1000,
            maxRetryDelay: 30000,
            backoffMultiplier: 2
        });
        this.rateLimiter = new RateLimiter_1.default({
            windowMs: 60000, // 1 minute window
            maxRequests: 30, // 30 requests per minute
            minInterval: 2000, // 2 seconds between requests
            backoffMs: 30000, // 30 seconds backoff on 429
            adaptive: true
        });
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            jitter: true
        };
        this.setupProcessors();
    }
    /**
     * Setup queue processors for different API types
     */
    setupProcessors() {
        // Casino data processor
        this.queue.registerProcessor('casino_data', async (item) => {
            return await this.makeAPICall(() => this.realService.getCasinoGameData(item.gameType), `casino_data_${item.gameType}`);
        });
        // Casino results processor
        this.queue.registerProcessor('casino_results', async (item) => {
            return await this.makeAPICall(() => this.realService.getCasinoGameResults(item.gameType), `casino_results_${item.gameType}`);
        });
        // Casino TV processor
        this.queue.registerProcessor('casino_tv', async (item) => {
            return await this.makeAPICall(() => this.realService.getCasinoTV(item.streamingId), `casino_tv_${item.streamingId}`);
        });
        // Cricket scorecard processor
        this.queue.registerProcessor('cricket_scorecard', async (item) => {
            return await this.makeAPICall(() => this.realService.getCricketScorecard(item.data?.beventId), 'cricket_scorecard');
        });
        // Cricket odds processor
        this.queue.registerProcessor('cricket_odds', async (item) => {
            return await this.makeAPICall(() => this.realService.getCricketOdds(item.data?.beventId), 'cricket_odds');
        });
    }
    /**
     * Make API call with rate limiting, retry, and error handling
     */
    async makeAPICall(apiCall, endpoint) {
        const startTime = Date.now();
        let lastError;
        let retryCount = 0;
        while (retryCount <= this.retryConfig.maxRetries) {
            try {
                // Check rate limit
                const rateLimitCheck = await this.rateLimiter.checkRateLimit(endpoint);
                if (!rateLimitCheck.allowed) {
                    if (rateLimitCheck.delayMs > 0) {
                        await this.sleep(rateLimitCheck.delayMs);
                        continue; // Retry after delay
                    }
                    throw new Error(`Rate limited: ${rateLimitCheck.reason}`);
                }
                // Make the API call
                const data = await apiCall();
                const responseTime = Date.now() - startTime;
                // Record successful request
                this.rateLimiter.recordRequest(endpoint);
                this.rateLimiter.handleSuccessResponse(endpoint);
                // Update stats
                this.stats.totalCalls++;
                this.stats.successfulCalls++;
                this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2;
                (0, logger_1.logInfo)(`✅ API call successful for ${endpoint} (${responseTime}ms, retry: ${retryCount})`);
                return {
                    success: true,
                    data,
                    retryCount,
                    responseTime
                };
            }
            catch (error) {
                lastError = error;
                const responseTime = Date.now() - startTime;
                // Check if it's a 429 error
                if (error.message?.includes('429') || error.status === 429) {
                    this.stats.rateLimitedCalls++;
                    this.rateLimiter.handle429Response(endpoint);
                    (0, logger_1.logWarn)(`🚨 Rate limited on ${endpoint}, implementing backoff`);
                }
                // Check if we should retry
                if (retryCount < this.retryConfig.maxRetries) {
                    retryCount++;
                    this.stats.retriedCalls++;
                    // Calculate exponential backoff with jitter
                    const baseDelay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount - 1);
                    const jitter = this.retryConfig.jitter ? Math.random() * 1000 : 0;
                    const delay = Math.min(baseDelay + jitter, this.retryConfig.maxDelay);
                    (0, logger_1.logWarn)(`🔄 Retrying ${endpoint} in ${Math.round(delay)}ms (attempt ${retryCount}/${this.retryConfig.maxRetries})`);
                    await this.sleep(delay);
                }
                else {
                    // Max retries exceeded
                    this.stats.totalCalls++;
                    this.stats.failedCalls++;
                    this.stats.averageResponseTime = (this.stats.averageResponseTime + responseTime) / 2;
                    (0, logger_1.logError)(`💀 Max retries exceeded for ${endpoint}:`, error);
                    return {
                        success: false,
                        error: error.message || 'Unknown error',
                        statusCode: error.status || 500,
                        retryCount,
                        responseTime
                    };
                }
            }
        }
        // This should never be reached, but just in case
        return {
            success: false,
            error: lastError?.message || 'Max retries exceeded',
            retryCount,
            responseTime: Date.now() - startTime
        };
    }
    /**
     * Queue casino data request
     */
    async queueCasinoData(gameType, streamingId = '3030', priority = 2) {
        return await this.queue.enqueue({
            type: 'casino_data',
            gameType,
            streamingId,
            priority,
            maxRetries: this.retryConfig.maxRetries
        });
    }
    /**
     * Queue casino results request
     */
    async queueCasinoResults(gameType, streamingId = '3030', priority = 2) {
        return await this.queue.enqueue({
            type: 'casino_results',
            gameType,
            streamingId,
            priority,
            maxRetries: this.retryConfig.maxRetries
        });
    }
    /**
     * Queue casino TV request
     */
    async queueCasinoTV(streamingId, priority = 3) {
        return await this.queue.enqueue({
            type: 'casino_tv',
            streamingId,
            priority,
            maxRetries: this.retryConfig.maxRetries
        });
    }
    /**
     * Queue cricket scorecard request
     */
    async queueCricketScorecard(beventId, priority = 1) {
        return await this.queue.enqueue({
            type: 'cricket_scorecard',
            priority,
            maxRetries: this.retryConfig.maxRetries,
            data: { beventId }
        });
    }
    /**
     * Queue cricket odds request
     */
    async queueCricketOdds(beventId, priority = 1) {
        return await this.queue.enqueue({
            type: 'cricket_odds',
            priority,
            maxRetries: this.retryConfig.maxRetries,
            data: { beventId }
        });
    }
    /**
     * Batch queue multiple casino requests
     */
    async batchQueueCasinoRequests(gameTypes, requestTypes, streamingId = '3030', priority = 2) {
        const promises = [];
        for (const gameType of gameTypes) {
            for (const requestType of requestTypes) {
                if (requestType === 'data') {
                    promises.push(this.queueCasinoData(gameType, streamingId, priority));
                }
                else if (requestType === 'results') {
                    promises.push(this.queueCasinoResults(gameType, streamingId, priority));
                }
            }
        }
        return await Promise.all(promises);
    }
    /**
     * Get queue statistics
     */
    getQueueStats() {
        return this.queue.getStats();
    }
    /**
     * Get rate limiter status
     */
    getRateLimiterStatus() {
        return this.rateLimiter.getAllStatus();
    }
    /**
     * Get API service statistics
     */
    getStats() {
        return {
            ...this.stats,
            queue: this.getQueueStats(),
            rateLimiter: this.getRateLimiterStatus()
        };
    }
    /**
     * Update retry configuration
     */
    updateRetryConfig(config) {
        this.retryConfig = { ...this.retryConfig, ...config };
        (0, logger_1.logInfo)(`🔧 Updated retry config:`, this.retryConfig);
    }
    /**
     * Update rate limiter configuration
     */
    updateRateLimiterConfig(endpoint, config) {
        this.rateLimiter.setEndpointConfig(endpoint, config);
    }
    /**
     * Clear all queues and reset rate limiters
     */
    reset() {
        this.queue.clear();
        this.rateLimiter.resetAll();
        this.stats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            rateLimitedCalls: 0,
            retriedCalls: 0,
            averageResponseTime: 0
        };
        (0, logger_1.logInfo)('🔄 Reset enhanced API service');
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.EnhancedAPIService = EnhancedAPIService;
exports.default = EnhancedAPIService;
//# sourceMappingURL=EnhancedAPIService.js.map