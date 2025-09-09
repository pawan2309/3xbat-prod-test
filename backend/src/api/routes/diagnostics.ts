import express from 'express';
import os from 'os';
import { getRedisClient } from '../../infrastructure/redis/redis';
import { webSocketManager } from '../../infrastructure/websockets/WebSocketManager';
import { smartCache } from '../../infrastructure/cache/SmartCache';
import { tokenBucketService } from '../../infrastructure/rateLimit/TokenBucketService';
import { webSocketDataPublisher } from '../../services/WebSocketDataPublisher';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const redis = getRedisClient();
    let redisOk = false;
    let redisInfo: any = null;
    try {
      if (redis && redis.isOpen) {
        // ping is optional in redis v4; guard
        if (typeof (redis as any).ping === 'function') {
          await (redis as any).ping();
        }
        redisOk = true;
        const info = await redis.info('server');
        redisInfo = { serverInfo: info?.split('\n')[1] || 'ok' };
      }
    } catch {
      redisOk = false;
    }

    let cacheStats: any = null;
    try {
      cacheStats = await smartCache.getStats();
    } catch {}

    let wsStats: any = null;
    try {
      wsStats = webSocketManager ? webSocketManager.getStats() : null;
    } catch {}

    let rateLimitStats: any = null;
    try {
      rateLimitStats = tokenBucketService.getAllStates();
    } catch {}

    let publisherStats: any = null;
    try {
      publisherStats = webSocketDataPublisher.getStats();
    } catch {}

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
          platform: os.platform(),
          arch: os.arch(),
          cpus: os.cpus().length,
          loadavg: os.loadavg(),
          freeMemMB: Math.round(os.freemem() / 1024 / 1024),
        },
        redis: { ok: redisOk, info: redisInfo },
        websocket: wsStats,
        rateLimit: rateLimitStats,
        publisher: publisherStats,
        cache: cacheStats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Diagnostics failed' });
  }
});

export default router;


