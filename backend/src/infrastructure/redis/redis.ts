import { createClient, RedisClientType } from 'redis';
import logger from '../../monitoring/logging/logger';

let redisClient: RedisClientType | null = null;
let redisPubSubClient: RedisClientType | null = null;

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const getRedisPubSubClient = (): RedisClientType | null => {
  return redisPubSubClient;
};

export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }

    // Prefer REDIS_URL if provided, otherwise construct from REDIS_HOST/PORT/DB/PASSWORD
    const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6380'}`;
    redisClient = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      logger.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis ready to accept commands');
    });

    redisClient.on('end', () => {
      logger.warn('⚠️ Redis connection ended');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

export const connectRedisPubSub = async (): Promise<RedisClientType> => {
  try {
    if (redisPubSubClient && redisPubSubClient.isOpen) {
      return redisPubSubClient;
    }

    // Create a separate client for pub/sub operations
    const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6380'}`;
    redisPubSubClient = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis PubSub connection failed after 10 retries');
            return new Error('Redis PubSub connection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisPubSubClient.on('error', (err) => {
      logger.error('❌ Redis PubSub Client Error:', err);
    });

    redisPubSubClient.on('connect', () => {
      logger.info('✅ Redis PubSub connected successfully');
    });

    redisPubSubClient.on('ready', () => {
      logger.info('✅ Redis PubSub ready to accept commands');
    });

    redisPubSubClient.on('end', () => {
      logger.warn('⚠️ Redis PubSub connection ended');
    });

    await redisPubSubClient.connect();
    return redisPubSubClient;
  } catch (error) {
    logger.error('❌ Failed to connect to Redis PubSub:', error);
    throw error;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    logger.info('✅ Redis disconnected');
  }
  
  if (redisPubSubClient && redisPubSubClient.isOpen) {
    await redisPubSubClient.quit();
    redisPubSubClient = null;
    logger.info('✅ Redis PubSub disconnected');
  }
};

// Initialize Redis connection
connectRedis().catch((error) => {
  logger.error('❌ Redis initialization failed:', error);
});
