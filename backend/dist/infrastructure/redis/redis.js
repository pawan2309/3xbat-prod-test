"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectRedis = exports.connectRedisPubSub = exports.connectRedis = exports.getRedisPubSubClient = exports.getRedisClient = void 0;
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../../monitoring/logging/logger"));
let redisClient = null;
let redisPubSubClient = null;
const getRedisClient = () => {
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const getRedisPubSubClient = () => {
    return redisPubSubClient;
};
exports.getRedisPubSubClient = getRedisPubSubClient;
const connectRedis = async () => {
    try {
        if (redisClient && redisClient.isOpen) {
            return redisClient;
        }
        // Prefer REDIS_URL if provided, otherwise construct from REDIS_HOST/PORT/DB/PASSWORD
        const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6380'}`;
        redisClient = (0, redis_1.createClient)({
            url,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger_1.default.error('❌ Redis connection failed after 10 retries');
                        return new Error('Redis connection failed');
                    }
                    return Math.min(retries * 100, 3000);
                }
            }
        });
        redisClient.on('error', (err) => {
            logger_1.default.error('❌ Redis Client Error:', err);
        });
        redisClient.on('connect', () => {
            logger_1.default.info('✅ Redis connected successfully');
        });
        redisClient.on('ready', () => {
            logger_1.default.info('✅ Redis ready to accept commands');
        });
        redisClient.on('end', () => {
            logger_1.default.warn('⚠️ Redis connection ended');
        });
        await redisClient.connect();
        return redisClient;
    }
    catch (error) {
        logger_1.default.error('❌ Failed to connect to Redis:', error);
        throw error;
    }
};
exports.connectRedis = connectRedis;
const connectRedisPubSub = async () => {
    try {
        if (redisPubSubClient && redisPubSubClient.isOpen) {
            return redisPubSubClient;
        }
        // Create a separate client for pub/sub operations
        const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6380'}`;
        redisPubSubClient = (0, redis_1.createClient)({
            url,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger_1.default.error('❌ Redis PubSub connection failed after 10 retries');
                        return new Error('Redis PubSub connection failed');
                    }
                    return Math.min(retries * 100, 3000);
                }
            }
        });
        redisPubSubClient.on('error', (err) => {
            logger_1.default.error('❌ Redis PubSub Client Error:', err);
        });
        redisPubSubClient.on('connect', () => {
            logger_1.default.info('✅ Redis PubSub connected successfully');
        });
        redisPubSubClient.on('ready', () => {
            logger_1.default.info('✅ Redis PubSub ready to accept commands');
        });
        redisPubSubClient.on('end', () => {
            logger_1.default.warn('⚠️ Redis PubSub connection ended');
        });
        await redisPubSubClient.connect();
        return redisPubSubClient;
    }
    catch (error) {
        logger_1.default.error('❌ Failed to connect to Redis PubSub:', error);
        throw error;
    }
};
exports.connectRedisPubSub = connectRedisPubSub;
const disconnectRedis = async () => {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        redisClient = null;
        logger_1.default.info('✅ Redis disconnected');
    }
    if (redisPubSubClient && redisPubSubClient.isOpen) {
        await redisPubSubClient.quit();
        redisPubSubClient = null;
        logger_1.default.info('✅ Redis PubSub disconnected');
    }
};
exports.disconnectRedis = disconnectRedis;
// Initialize Redis connection
(0, exports.connectRedis)().catch((error) => {
    logger_1.default.error('❌ Redis initialization failed:', error);
});
//# sourceMappingURL=redis.js.map