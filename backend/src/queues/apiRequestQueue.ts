import { Queue, Worker, Job } from 'bullmq';
import { redisConfig } from '../config/environment';
import logger from '../monitoring/logging/logger';
import RealExternalAPIService from '../external-apis/RealExternalAPIService';

// Queue configuration
const queueConfig = {
  connection: {
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    db: redisConfig.db,
  },
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential' as const,
      delay: 2000, // Start with 2 second delay
    },
  },
};

// Create queues for different API types
export const cricketOddsQueue = new Queue('cricket-odds', queueConfig);
export const cricketScorecardQueue = new Queue('cricket-scorecard', queueConfig);
export const cricketFixturesQueue = new Queue('cricket-fixtures', queueConfig);
export const cricketTVQueue = new Queue('cricket-tv', queueConfig);
export const casinoDataQueue = new Queue('casino-data', queueConfig);

// API service instance
const apiService = new RealExternalAPIService();

// Job data interfaces
export interface CricketOddsJobData {
  eventId: string;
  priority?: number;
  retryCount?: number;
}

export interface CricketScorecardJobData {
  marketId: string;
  priority?: number;
  retryCount?: number;
}

export interface CricketFixturesJobData {
  priority?: number;
  retryCount?: number;
}

export interface CricketTVJobData {
  eventId: string;
  priority?: number;
  retryCount?: number;
}

export interface CasinoDataJobData {
  gameType: string;
  priority?: number;
  retryCount?: number;
}

// Rate limiting configuration
const RATE_LIMITS = {
  'cricket-odds': { maxConcurrent: 5, delayBetweenJobs: 200 }, // 5 requests per second
  'cricket-scorecard': { maxConcurrent: 3, delayBetweenJobs: 300 }, // 3 requests per second
  'cricket-fixtures': { maxConcurrent: 1, delayBetweenJobs: 1000 }, // 1 request per second
  'cricket-tv': { maxConcurrent: 2, delayBetweenJobs: 500 }, // 2 requests per second
  'casino-data': { maxConcurrent: 3, delayBetweenJobs: 300 }, // 3 requests per second
};

// Create workers for each queue
export function createWorkers() {
  // Cricket Odds Worker
  const cricketOddsWorker = new Worker(
    'cricket-odds',
    async (job: Job<CricketOddsJobData>) => {
      const { eventId } = job.data;
      
      logger.info(`🎯 Processing cricket odds for event: ${eventId}`);
      
      try {
        const result = await apiService.getCricketOdds(eventId);
        
        // Cache the odds data in Redis
        const { getRedisClient } = require('../infrastructure/redis/redis');
        const redis = getRedisClient();
        
        const anyResult: any = result as any;
        if (redis && anyResult.data) {
          const oddsKey = `odds:${eventId}`;
          const ttl = 6; // 6 seconds TTL
          
          // Redis v4 setEx
          if (typeof (redis as any).setEx === 'function') {
            await (redis as any).setEx(oddsKey, ttl, JSON.stringify(anyResult.data));
          } else {
            await (redis as any).setex(oddsKey, ttl, JSON.stringify(anyResult.data));
          }
          logger.info(`🎯 Cached ${anyResult.data.length} odds for event: ${eventId} with TTL: ${ttl}s`);
          
          // Publish update notification
          await redis.publish('odds:updated', JSON.stringify({
            eventId,
            data: anyResult.data,
            timestamp: Date.now(),
            count: anyResult.data.length,
            changed: true
          }));
        }
        
        logger.info(`✅ Successfully fetched and cached odds for event: ${eventId}`);
        return result;
      } catch (error) {
        logger.error(`❌ Failed to fetch odds for event ${eventId}:`, error);
        throw error;
      }
    },
    {
      ...queueConfig,
      concurrency: RATE_LIMITS['cricket-odds'].maxConcurrent,
      limiter: {
        max: RATE_LIMITS['cricket-odds'].maxConcurrent,
        duration: 1000, // Per second
      },
    }
  );

  // Cricket Scorecard Worker
  const cricketScorecardWorker = new Worker(
    'cricket-scorecard',
    async (job: Job<CricketScorecardJobData>) => {
      const { marketId } = job.data;
      
      logger.info(`📊 Processing cricket scorecard for market: ${marketId}`);
      
      try {
        const result = await apiService.getCricketScorecard(marketId);
        
        logger.info(`✅ Successfully fetched scorecard for market: ${marketId}`);
        return result;
      } catch (error) {
        logger.error(`❌ Failed to fetch scorecard for market ${marketId}:`, error);
        throw error;
      }
    },
    {
      ...queueConfig,
      concurrency: RATE_LIMITS['cricket-scorecard'].maxConcurrent,
      limiter: {
        max: RATE_LIMITS['cricket-scorecard'].maxConcurrent,
        duration: 1000,
      },
    }
  );

  // Cricket Fixtures Worker
  const cricketFixturesWorker = new Worker(
    'cricket-fixtures',
    async (job: Job<CricketFixturesJobData>) => {
      logger.info(`🏏 Processing cricket fixtures`);
      
      try {
        const result = await apiService.getCricketFixtures();
        
        logger.info(`✅ Successfully fetched fixtures`);
        return result;
      } catch (error) {
        logger.error(`❌ Failed to fetch fixtures:`, error);
        throw error;
      }
    },
    {
      ...queueConfig,
      concurrency: RATE_LIMITS['cricket-fixtures'].maxConcurrent,
      limiter: {
        max: RATE_LIMITS['cricket-fixtures'].maxConcurrent,
        duration: 1000,
      },
    }
  );

  // Cricket TV Worker
  const cricketTVWorker = new Worker(
    'cricket-tv',
    async (job: Job<CricketTVJobData>) => {
      const { eventId } = job.data;
      
      logger.info(`📺 Processing cricket TV for event: ${eventId}`);
      
      try {
        const result = await apiService.getCricketTV(eventId);
        
        logger.info(`✅ Successfully fetched TV for event: ${eventId}`);
        return result;
      } catch (error) {
        logger.error(`❌ Failed to fetch TV for event ${eventId}:`, error);
        throw error;
      }
    },
    {
      ...queueConfig,
      concurrency: RATE_LIMITS['cricket-tv'].maxConcurrent,
      limiter: {
        max: RATE_LIMITS['cricket-tv'].maxConcurrent,
        duration: 1000,
      },
    }
  );

  // Casino Data Worker
  const casinoDataWorker = new Worker(
    'casino-data',
    async (job: Job<CasinoDataJobData>) => {
      const { gameType } = job.data;
      
      logger.info(`🎰 Processing casino data for game: ${gameType}`);
      
      try {
        const result = await apiService.getCasinoGameData(gameType);
        
        logger.info(`✅ Successfully fetched casino data for game: ${gameType}`);
        return result;
      } catch (error) {
        logger.error(`❌ Failed to fetch casino data for game ${gameType}:`, error);
        throw error;
      }
    },
    {
      ...queueConfig,
      concurrency: RATE_LIMITS['casino-data'].maxConcurrent,
      limiter: {
        max: RATE_LIMITS['casino-data'].maxConcurrent,
        duration: 1000,
      },
    }
  );

  // Error handling for all workers
  [cricketOddsWorker, cricketScorecardWorker, cricketFixturesWorker, cricketTVWorker, casinoDataWorker].forEach(worker => {
    worker.on('error', (error) => {
      logger.error('❌ Worker error:', error);
    });

    worker.on('failed', (job, error) => {
      logger.error(`❌ Job ${job?.id} failed:`, error);
    });

    worker.on('completed', (job) => {
      logger.info(`✅ Job ${job.id} completed successfully`);
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
export async function addCricketOddsJob(eventId: string, priority: number = 0) {
  return cricketOddsQueue.add('fetch-odds', { eventId, priority }, {
    priority,
    delay: RATE_LIMITS['cricket-odds'].delayBetweenJobs,
  });
}

export async function addCricketScorecardJob(marketId: string, priority: number = 0) {
  return cricketScorecardQueue.add('fetch-scorecard', { marketId, priority }, {
    priority,
    delay: RATE_LIMITS['cricket-scorecard'].delayBetweenJobs,
  });
}

export async function addCricketFixturesJob(priority: number = 0) {
  return cricketFixturesQueue.add('fetch-fixtures', { priority }, {
    priority,
    delay: RATE_LIMITS['cricket-fixtures'].delayBetweenJobs,
  });
}

export async function addCricketTVJob(eventId: string, priority: number = 0) {
  return cricketTVQueue.add('fetch-tv', { eventId, priority }, {
    priority,
    delay: RATE_LIMITS['cricket-tv'].delayBetweenJobs,
  });
}

export async function addCasinoDataJob(gameType: string, priority: number = 0) {
  return casinoDataQueue.add('fetch-casino-data', { gameType, priority }, {
    priority,
    delay: RATE_LIMITS['casino-data'].delayBetweenJobs,
  });
}

// Queue status monitoring
export async function getQueueStatus() {
  const queues = [
    { name: 'cricket-odds', queue: cricketOddsQueue },
    { name: 'cricket-scorecard', queue: cricketScorecardQueue },
    { name: 'cricket-fixtures', queue: cricketFixturesQueue },
    { name: 'cricket-tv', queue: cricketTVQueue },
    { name: 'casino-data', queue: casinoDataQueue },
  ];

  const status = await Promise.all(
    queues.map(async ({ name, queue }) => ({
      name,
      waiting: await queue.getWaiting(),
      active: await queue.getActive(),
      completed: await queue.getCompleted(),
      failed: await queue.getFailed(),
      delayed: await queue.getDelayed(),
    }))
  );

  return status;
}

// Cleanup function
export async function closeQueues() {
  await Promise.all([
    cricketOddsQueue.close(),
    cricketScorecardQueue.close(),
    cricketFixturesQueue.close(),
    cricketTVQueue.close(),
    casinoDataQueue.close(),
  ]);
}

export default {
  createWorkers,
  addCricketOddsJob,
  addCricketScorecardJob,
  addCricketFixturesJob,
  addCricketTVJob,
  addCasinoDataJob,
  getQueueStatus,
  closeQueues,
};

