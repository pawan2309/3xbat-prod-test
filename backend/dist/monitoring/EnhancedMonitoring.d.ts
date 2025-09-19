import EnhancedAPIService from '../external-apis/EnhancedAPIService';
import { CasinoRedisPublisher } from '../external-apis/casino/casinoRedisPublisher';
import { RedisClientType } from 'redis';
export interface MonitoringStats {
    timestamp: string;
    system: {
        uptime: number;
        memory: NodeJS.MemoryUsage;
        cpu: number;
    };
    api: {
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        rateLimitedCalls: number;
        retriedCalls: number;
        averageResponseTime: number;
        successRate: number;
    };
    queue: {
        queued: number;
        processing: number;
        totalProcessed: number;
        totalFailed: number;
        averageWaitTime: number;
    };
    rateLimiter: {
        [endpoint: string]: {
            requests: number;
            maxRequests: number;
            remaining: number;
            resetTime: string | null;
            backoff: {
                active: boolean;
                remaining: number;
            };
            adaptiveDelay: {
                active: boolean;
                delayMs: number;
            };
        };
    };
    redis: {
        connected: boolean;
        memory: string;
        keys: number;
    };
    alerts: {
        level: 'info' | 'warning' | 'error' | 'critical';
        message: string;
        timestamp: string;
    }[];
}
export declare class EnhancedMonitoring {
    private enhancedAPIService;
    private redisPublisher;
    private redis;
    private alerts;
    private startTime;
    constructor(enhancedAPIService: EnhancedAPIService, redisPublisher: CasinoRedisPublisher, redis: RedisClientType);
    /**
     * Get comprehensive monitoring statistics
     */
    getMonitoringStats(): Promise<MonitoringStats>;
    /**
     * Get system statistics
     */
    private getSystemStats;
    /**
     * Get Redis statistics
     */
    private getRedisStats;
    /**
     * Check for alerts and warnings
     */
    private checkAlerts;
    /**
     * Add alert to the alerts array
     */
    private addAlert;
    /**
     * Get health check status
     */
    getHealthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        checks: {
            api: boolean;
            queue: boolean;
            redis: boolean;
            rateLimiter: boolean;
        };
        message: string;
        timestamp: string;
    }>;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        throughput: {
            requestsPerMinute: number;
            successfulPerMinute: number;
            failedPerMinute: number;
        };
        latency: {
            averageResponseTime: number;
            averageWaitTime: number;
        };
        reliability: {
            successRate: number;
            retryRate: number;
            rateLimitRate: number;
        };
    };
    /**
     * Clear alerts
     */
    clearAlerts(): void;
    /**
     * Get alerts by level
     */
    getAlertsByLevel(level: MonitoringStats['alerts'][0]['level']): {
        level: "info" | "warning" | "error" | "critical";
        message: string;
        timestamp: string;
    }[];
}
export default EnhancedMonitoring;
//# sourceMappingURL=EnhancedMonitoring.d.ts.map