"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const os_1 = __importDefault(require("os"));
const redis_1 = require("../../infrastructure/redis/redis");
const WebSocketManager_1 = require("../../infrastructure/websockets/WebSocketManager");
const SmartCache_1 = require("../../infrastructure/cache/SmartCache");
const TokenBucketService_1 = require("../../infrastructure/rateLimit/TokenBucketService");
const WebSocketDataPublisher_1 = require("../../services/WebSocketDataPublisher");
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    try {
        const redis = (0, redis_1.getRedisClient)();
        let redisOk = false;
        let redisInfo = null;
        try {
            if (redis && redis.isOpen) {
                // ping is optional in redis v4; guard
                if (typeof redis.ping === 'function') {
                    await redis.ping();
                }
                redisOk = true;
                const info = await redis.info('server');
                redisInfo = { serverInfo: info?.split('\n')[1] || 'ok' };
            }
        }
        catch {
            redisOk = false;
        }
        let cacheStats = null;
        try {
            cacheStats = await SmartCache_1.smartCache.getStats();
        }
        catch { }
        let wsStats = null;
        try {
            wsStats = WebSocketManager_1.webSocketManager ? WebSocketManager_1.webSocketManager.getStats() : null;
        }
        catch { }
        let rateLimitStats = null;
        try {
            rateLimitStats = TokenBucketService_1.tokenBucketService.getAllStates();
        }
        catch { }
        let publisherStats = null;
        try {
            publisherStats = WebSocketDataPublisher_1.webSocketDataPublisher.getStats();
        }
        catch { }
        res.json({
            success: true,
            data: {
                server: {
                    pid: process.pid,
                    uptimeSec: Math.round(process.uptime()),
                    node: process.version,
                    env: process.env.NODE_ENV || 'development',
                },
                system: {
                    platform: os_1.default.platform(),
                    arch: os_1.default.arch(),
                    cpus: os_1.default.cpus().length,
                    loadavg: os_1.default.loadavg(),
                    freeMemMB: Math.round(os_1.default.freemem() / 1024 / 1024),
                },
                redis: { ok: redisOk, info: redisInfo },
                websocket: wsStats,
                rateLimit: rateLimitStats,
                publisher: publisherStats,
                cache: cacheStats,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error?.message || 'Diagnostics failed' });
    }
});
exports.default = router;
//# sourceMappingURL=diagnostics.js.map