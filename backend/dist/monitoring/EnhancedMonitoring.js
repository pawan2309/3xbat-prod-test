"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMonitoring = void 0;
const logger_1 = require("./logging/logger");
class EnhancedMonitoring {
    constructor(enhancedAPIService, redisPublisher, redis) {
        this.alerts = [];
        this.enhancedAPIService = enhancedAPIService;
        this.redisPublisher = redisPublisher;
        this.redis = redis;
        this.startTime = Date.now();
    }
    /**
     * Get comprehensive monitoring statistics
     */
    async getMonitoringStats() {
        try {
            const apiStats = this.enhancedAPIService.getStats();
            const queueStats = this.enhancedAPIService.getQueueStats();
            const rateLimiterStatus = this.enhancedAPIService.getRateLimiterStatus();
            const redisStats = await this.getRedisStats();
            const systemStats = this.getSystemStats();
            // Calculate success rate
            const successRate = apiStats.totalCalls > 0
                ? (apiStats.successfulCalls / apiStats.totalCalls) * 100
                : 100;
            // Check for alerts
            await this.checkAlerts(apiStats, queueStats, rateLimiterStatus);
            return {
                timestamp: new Date().toISOString(),
                system: systemStats,
                api: {
                    ...apiStats,
                    successRate: Math.round(successRate * 100) / 100
                },
                queue: queueStats,
                rateLimiter: rateLimiterStatus,
                redis: redisStats,
                alerts: this.alerts.slice(-10) // Keep last 10 alerts
            };
        }
        catch (error) {
            (0, logger_1.logError)('❌ Error getting monitoring stats:', error);
            throw error;
        }
    }
    /**
     * Get system statistics
     */
    getSystemStats() {
        const memoryUsage = process.memoryUsage();
        const uptime = Date.now() - this.startTime;
        return {
            uptime: Math.floor(uptime / 1000), // seconds
            memory: memoryUsage,
            cpu: process.cpuUsage().user / 1000000 // Convert to seconds
        };
    }
    /**
     * Get Redis statistics
     */
    async getRedisStats() {
        try {
            const info = await this.redis.info('memory');
            const keys = await this.redis.dbSize();
            // Parse memory info
            const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
            const memory = memoryMatch ? memoryMatch[1].trim() : 'Unknown';
            return {
                connected: this.redis.isOpen,
                memory,
                keys
            };
        }
        catch (error) {
            (0, logger_1.logError)('❌ Error getting Redis stats:', error);
            return {
                connected: false,
                memory: 'Unknown',
                keys: 0
            };
        }
    }
    /**
     * Check for alerts and warnings
     */
    async checkAlerts(apiStats, queueStats, rateLimiterStatus) {
        const now = new Date().toISOString();
        // Check API success rate
        const successRate = apiStats.totalCalls > 0
            ? (apiStats.successfulCalls / apiStats.totalCalls) * 100
            : 100;
        if (successRate < 80) {
            this.addAlert('error', `Low API success rate: ${successRate.toFixed(2)}%`, now);
        }
        else if (successRate < 90) {
            this.addAlert('warning', `API success rate below 90%: ${successRate.toFixed(2)}%`, now);
        }
        // Check rate limiting
        const rateLimitedCalls = apiStats.rateLimitedCalls;
        if (rateLimitedCalls > 10) {
            this.addAlert('warning', `High rate limiting detected: ${rateLimitedCalls} calls`, now);
        }
        // Check queue size
        if (queueStats.queued > 100) {
            this.addAlert('error', `Large queue size: ${queueStats.queued} items`, now);
        }
        else if (queueStats.queued > 50) {
            this.addAlert('warning', `Queue size growing: ${queueStats.queued} items`, now);
        }
        // Check average response time
        if (apiStats.averageResponseTime > 10000) {
            this.addAlert('warning', `High average response time: ${apiStats.averageResponseTime}ms`, now);
        }
        // Check for active backoffs
        Object.entries(rateLimiterStatus).forEach(([endpoint, status]) => {
            if (status.backoff?.active) {
                this.addAlert('warning', `Rate limiter backoff active for ${endpoint}`, now);
            }
            if (status.adaptiveDelay?.active) {
                this.addAlert('info', `Adaptive delay active for ${endpoint}: ${status.adaptiveDelay.delayMs}ms`, now);
            }
        });
        // Check Redis connection
        if (!this.redis.isOpen) {
            this.addAlert('critical', 'Redis connection lost', now);
        }
    }
    /**
     * Add alert to the alerts array
     */
    addAlert(level, message, timestamp) {
        this.alerts.push({
            level,
            message,
            timestamp
        });
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
        // Log based on level
        switch (level) {
            case 'critical':
                (0, logger_1.logError)(`🚨 CRITICAL: ${message}`);
                break;
            case 'error':
                (0, logger_1.logError)(`❌ ERROR: ${message}`);
                break;
            case 'warning':
                (0, logger_1.logInfo)(`⚠️ WARNING: ${message}`);
                break;
            case 'info':
                (0, logger_1.logInfo)(`ℹ️ INFO: ${message}`);
                break;
        }
    }
    /**
     * Get health check status
     */
    async getHealthCheck() {
        try {
            const apiStats = this.enhancedAPIService.getStats();
            const queueStats = this.enhancedAPIService.getQueueStats();
            const redisConnected = this.redis.isOpen;
            // Check API health
            const apiHealthy = apiStats.totalCalls === 0 ||
                (apiStats.successfulCalls / apiStats.totalCalls) > 0.8;
            // Check queue health
            const queueHealthy = queueStats.queued < 100 && queueStats.processing < 10;
            // Check Redis health
            const redisHealthy = redisConnected;
            // Check rate limiter health (no critical backoffs)
            const rateLimiterStatus = this.enhancedAPIService.getRateLimiterStatus();
            const rateLimiterHealthy = !Object.values(rateLimiterStatus).some((status) => status.backoff?.active && status.backoff.remaining > 30000);
            const checks = {
                api: apiHealthy,
                queue: queueHealthy,
                redis: redisHealthy,
                rateLimiter: rateLimiterHealthy
            };
            const allHealthy = Object.values(checks).every(check => check);
            const someHealthy = Object.values(checks).some(check => check);
            let status;
            let message;
            if (allHealthy) {
                status = 'healthy';
                message = 'All systems operational';
            }
            else if (someHealthy) {
                status = 'degraded';
                message = 'Some systems experiencing issues';
            }
            else {
                status = 'unhealthy';
                message = 'Multiple systems down';
            }
            return {
                status,
                checks,
                message,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            (0, logger_1.logError)('❌ Error in health check:', error);
            return {
                status: 'unhealthy',
                checks: {
                    api: false,
                    queue: false,
                    redis: false,
                    rateLimiter: false
                },
                message: 'Health check failed',
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const apiStats = this.enhancedAPIService.getStats();
        const queueStats = this.enhancedAPIService.getQueueStats();
        return {
            throughput: {
                requestsPerMinute: apiStats.totalCalls / ((Date.now() - this.startTime) / 60000),
                successfulPerMinute: apiStats.successfulCalls / ((Date.now() - this.startTime) / 60000),
                failedPerMinute: apiStats.failedCalls / ((Date.now() - this.startTime) / 60000)
            },
            latency: {
                averageResponseTime: apiStats.averageResponseTime,
                averageWaitTime: queueStats.averageWaitTime
            },
            reliability: {
                successRate: apiStats.totalCalls > 0 ? (apiStats.successfulCalls / apiStats.totalCalls) * 100 : 100,
                retryRate: apiStats.totalCalls > 0 ? (apiStats.retriedCalls / apiStats.totalCalls) * 100 : 0,
                rateLimitRate: apiStats.totalCalls > 0 ? (apiStats.rateLimitedCalls / apiStats.totalCalls) * 100 : 0
            }
        };
    }
    /**
     * Clear alerts
     */
    clearAlerts() {
        this.alerts = [];
        (0, logger_1.logInfo)('🧹 Cleared all monitoring alerts');
    }
    /**
     * Get alerts by level
     */
    getAlertsByLevel(level) {
        return this.alerts.filter(alert => alert.level === level);
    }
}
exports.EnhancedMonitoring = EnhancedMonitoring;
exports.default = EnhancedMonitoring;
//# sourceMappingURL=EnhancedMonitoring.js.map