import EnhancedAPIService from '../../external-apis/EnhancedAPIService';
import { CasinoRedisPublisher } from '../../external-apis/casino/casinoRedisPublisher';
import { RedisClientType } from 'redis';
declare const router: import("express-serve-static-core").Router;
/**
 * Initialize monitoring with dependencies
 */
export declare function initializeMonitoring(enhancedAPIService: EnhancedAPIService, redisPublisher: CasinoRedisPublisher, redis: RedisClientType): void;
export default router;
//# sourceMappingURL=enhancedMonitoringRoutes.d.ts.map