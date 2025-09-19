import { RedisClientType } from 'redis';
export declare const getRedisClient: () => RedisClientType | null;
export declare const getRedisPubSubClient: () => RedisClientType | null;
export declare const connectRedis: () => Promise<RedisClientType>;
export declare const connectRedisPubSub: () => Promise<RedisClientType>;
export declare const disconnectRedis: () => Promise<void>;
//# sourceMappingURL=redis.d.ts.map