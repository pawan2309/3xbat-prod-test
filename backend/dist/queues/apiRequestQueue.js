"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.casinoDataQueue = exports.cricketTVQueue = exports.cricketFixturesQueue = exports.cricketScorecardQueue = exports.cricketOddsQueue = void 0;
exports.createWorkers = createWorkers;
exports.addCricketOddsJob = addCricketOddsJob;
exports.addCricketScorecardJob = addCricketScorecardJob;
exports.addCricketFixturesJob = addCricketFixturesJob;
exports.addCricketTVJob = addCricketTVJob;
exports.addCasinoDataJob = addCasinoDataJob;
exports.getQueueStatus = getQueueStatus;
exports.closeQueues = closeQueues;
const bullmq_1 = require("bullmq");
const environment_1 = require("../config/environment");
const logger_1 = __importDefault(require("../monitoring/logging/logger"));
const RealExternalAPIService_1 = __importDefault(require("../external-apis/RealExternalAPIService"));
// Queue configuration
const queueConfig = {
    connection: {
        host: environment_1.redisConfig.host,
        port: environment_1.redisConfig.port,
        password: environment_1.redisConfig.password,
        db: environment_1.redisConfig.db,
    },
    defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2 second delay
        },
    },
};
// Create queues for different API types
exports.cricketOddsQueue = new bullmq_1.Queue('cricket-odds', queueConfig);
exports.cricketScorecardQueue = new bullmq_1.Queue('cricket-scorecard', queueConfig);
exports.cricketFixturesQueue = new bullmq_1.Queue('cricket-fixtures', queueConfig);
exports.cricketTVQueue = new bullmq_1.Queue('cricket-tv', queueConfig);
exports.casinoDataQueue = new bullmq_1.Queue('casino-data', queueConfig);
// API service instance
const apiService = new RealExternalAPIService_1.default();
// Rate limiting configuration
const RATE_LIMITS = {
    'cricket-odds': { maxConcurrent: 5, delayBetweenJobs: 200 }, // 5 requests per second
    'cricket-scorecard': { maxConcurrent: 3, delayBetweenJobs: 300 }, // 3 requests per second
    'cricket-fixtures': { maxConcurrent: 1, delayBetweenJobs: 1000 }, // 1 request per second
    'cricket-tv': { maxConcurrent: 2, delayBetweenJobs: 500 }, // 2 requests per second
    'casino-data': { maxConcurrent: 3, delayBetweenJobs: 300 }, // 3 requests per second
};
// Create workers for each queue
function createWorkers() {
    // Cricket Odds Worker
    const cricketOddsWorker = new bullmq_1.Worker('cricket-odds', async (job) => {
        const { eventId } = job.data;
        logger_1.default.info(`🎯 Processing cricket odds for event: ${eventId}`);
        try {
            const result = await apiService.getCricketOdds(eventId);
            // Cache the odds data in Redis
            const { getRedisClient } = require('../infrastructure/redis/redis');
            const redis = getRedisClient();
            const anyResult = result;
            if (redis && anyResult.data) {
                const oddsKey = `odds:${eventId}`;
                const ttl = 6; // 6 seconds TTL
                // Redis v4 setEx
                if (typeof redis.setEx === 'function') {
                    await redis.setEx(oddsKey, ttl, JSON.stringify(anyResult.data));
                }
                else {
                    await redis.setex(oddsKey, ttl, JSON.stringify(anyResult.data));
                }
                logger_1.default.info(`🎯 Cached ${anyResult.data.length} odds for event: ${eventId} with TTL: ${ttl}s`);
                // Publish update notification
                await redis.publish('odds:updated', JSON.stringify({
                    eventId,
                    data: anyResult.data,
                    timestamp: Date.now(),
                    count: anyResult.data.length,
                    changed: true
                }));
            }
            logger_1.default.info(`✅ Successfully fetched and cached odds for event: ${eventId}`);
            return result;
        }
        catch (error) {
            logger_1.default.error(`❌ Failed to fetch odds for event ${eventId}:`, error);
            throw error;
        }
    }, {
        ...queueConfig,
        concurrency: RATE_LIMITS['cricket-odds'].maxConcurrent,
        limiter: {
            max: RATE_LIMITS['cricket-odds'].maxConcurrent,
            duration: 1000, // Per second
        },
    });
    // Cricket Scorecard Worker
    const cricketScorecardWorker = new bullmq_1.Worker('cricket-scorecard', async (job) => {
        const { marketId } = job.data;
        logger_1.default.info(`📊 Processing cricket scorecard for market: ${marketId}`);
        try {
            const result = await apiService.getCricketScorecard(marketId);
            logger_1.default.info(`✅ Successfully fetched scorecard for market: ${marketId}`);
            return result;
        }
        catch (error) {
            logger_1.default.error(`❌ Failed to fetch scorecard for market ${marketId}:`, error);
            throw error;
        }
    }, {
        ...queueConfig,
        concurrency: RATE_LIMITS['cricket-scorecard'].maxConcurrent,
        limiter: {
            max: RATE_LIMITS['cricket-scorecard'].maxConcurrent,
            duration: 1000,
        },
    });
    // Cricket Fixtures Worker
    const cricketFixturesWorker = new bullmq_1.Worker('cricket-fixtures', async (job) => {
        logger_1.default.info(`🏏 Processing cricket fixtures`);
        try {
            const result = await apiService.getCricketFixtures();
            logger_1.default.info(`✅ Successfully fetched fixtures`);
            return result;
        }
        catch (error) {
            logger_1.default.error(`❌ Failed to fetch fixtures:`, error);
            throw error;
        }
    }, {
        ...queueConfig,
        concurrency: RATE_LIMITS['cricket-fixtures'].maxConcurrent,
        limiter: {
            max: RATE_LIMITS['cricket-fixtures'].maxConcurrent,
            duration: 1000,
        },
    });
    // Cricket TV Worker
    const cricketTVWorker = new bullmq_1.Worker('cricket-tv', async (job) => {
        const { eventId } = job.data;
        logger_1.default.info(`📺 Processing cricket TV for event: ${eventId}`);
        try {
            const result = await apiService.getCricketTV(eventId);
            logger_1.default.info(`✅ Successfully fetched TV for event: ${eventId}`);
            return result;
        }
        catch (error) {
            logger_1.default.error(`❌ Failed to fetch TV for event ${eventId}:`, error);
            throw error;
        }
    }, {
        ...queueConfig,
        concurrency: RATE_LIMITS['cricket-tv'].maxConcurrent,
        limiter: {
            max: RATE_LIMITS['cricket-tv'].maxConcurrent,
            duration: 1000,
        },
    });
    // Casino Data Worker
    const casinoDataWorker = new bullmq_1.Worker('casino-data', async (job) => {
        const { gameType } = job.data;
        logger_1.default.info(`🎰 Processing casino data for game: ${gameType}`);
        try {
            const result = await apiService.getCasinoGameData(gameType);
            logger_1.default.info(`✅ Successfully fetched casino data for game: ${gameType}`);
            return result;
        }
        catch (error) {
            logger_1.default.error(`❌ Failed to fetch casino data for game ${gameType}:`, error);
            throw error;
        }
    }, {
        ...queueConfig,
        concurrency: RATE_LIMITS['casino-data'].maxConcurrent,
        limiter: {
            max: RATE_LIMITS['casino-data'].maxConcurrent,
            duration: 1000,
        },
    });
    // Error handling for all workers
    [cricketOddsWorker, cricketScorecardWorker, cricketFixturesWorker, cricketTVWorker, casinoDataWorker].forEach(worker => {
        worker.on('error', (error) => {
            logger_1.default.error('❌ Worker error:', error);
        });
        worker.on('failed', (job, error) => {
            logger_1.default.error(`❌ Job ${job?.id} failed:`, error);
        });
        worker.on('completed', (job) => {
            logger_1.default.info(`✅ Job ${job.id} completed successfully`);
        });
    });
    return {
        cricketOddsWorker,
        cricketScorecardWorker,
        cricketFixturesWorker,
        cricketTVWorker,
        casinoDataWorker,
    };
}
// Queue management functions
async function addCricketOddsJob(eventId, priority = 0) {
    return exports.cricketOddsQueue.add('fetch-odds', { eventId, priority }, {
        priority,
        delay: RATE_LIMITS['cricket-odds'].delayBetweenJobs,
    });
}
async function addCricketScorecardJob(marketId, priority = 0) {
    return exports.cricketScorecardQueue.add('fetch-scorecard', { marketId, priority }, {
        priority,
        delay: RATE_LIMITS['cricket-scorecard'].delayBetweenJobs,
    });
}
async function addCricketFixturesJob(priority = 0) {
    return exports.cricketFixturesQueue.add('fetch-fixtures', { priority }, {
        priority,
        delay: RATE_LIMITS['cricket-fixtures'].delayBetweenJobs,
    });
}
async function addCricketTVJob(eventId, priority = 0) {
    return exports.cricketTVQueue.add('fetch-tv', { eventId, priority }, {
        priority,
        delay: RATE_LIMITS['cricket-tv'].delayBetweenJobs,
    });
}
async function addCasinoDataJob(gameType, priority = 0) {
    return exports.casinoDataQueue.add('fetch-casino-data', { gameType, priority }, {
        priority,
        delay: RATE_LIMITS['casino-data'].delayBetweenJobs,
    });
}
// Queue status monitoring
async function getQueueStatus() {
    const queues = [
        { name: 'cricket-odds', queue: exports.cricketOddsQueue },
        { name: 'cricket-scorecard', queue: exports.cricketScorecardQueue },
        { name: 'cricket-fixtures', queue: exports.cricketFixturesQueue },
        { name: 'cricket-tv', queue: exports.cricketTVQueue },
        { name: 'casino-data', queue: exports.casinoDataQueue },
    ];
    const status = await Promise.all(queues.map(async ({ name, queue }) => ({
        name,
        waiting: await queue.getWaiting(),
        active: await queue.getActive(),
        completed: await queue.getCompleted(),
        failed: await queue.getFailed(),
        delayed: await queue.getDelayed(),
    })));
    return status;
}
// Cleanup function
async function closeQueues() {
    await Promise.all([
        exports.cricketOddsQueue.close(),
        exports.cricketScorecardQueue.close(),
        exports.cricketFixturesQueue.close(),
        exports.cricketTVQueue.close(),
        exports.casinoDataQueue.close(),
    ]);
}
exports.default = {
    createWorkers,
    addCricketOddsJob,
    addCricketScorecardJob,
    addCricketFixturesJob,
    addCricketTVJob,
    addCasinoDataJob,
    getQueueStatus,
    closeQueues,
};
//# sourceMappingURL=apiRequestQueue.js.map