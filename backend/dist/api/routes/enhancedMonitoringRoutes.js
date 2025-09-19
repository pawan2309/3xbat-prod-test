"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeMonitoring = initializeMonitoring;
const express_1 = require("express");
const logger_1 = require("../../monitoring/logging/logger");
const EnhancedMonitoring_1 = __importDefault(require("../../monitoring/EnhancedMonitoring"));
const router = (0, express_1.Router)();
// Store monitoring instance (will be initialized by main app)
let monitoring = null;
/**
 * Initialize monitoring with dependencies
 */
function initializeMonitoring(enhancedAPIService, redisPublisher, redis) {
    monitoring = new EnhancedMonitoring_1.default(enhancedAPIService, redisPublisher, redis);
    (0, logger_1.logInfo)('📊 Enhanced monitoring initialized');
}
/**
 * Get comprehensive monitoring statistics
 */
router.get('/stats', async (req, res) => {
    try {
        if (!monitoring) {
            return res.status(503).json({
                error: 'Monitoring not initialized',
                message: 'Enhanced monitoring service is not available'
            });
        }
        const stats = await monitoring.getMonitoringStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ Error getting monitoring stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get monitoring statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * Get health check status
 */
router.get('/health', async (req, res) => {
    try {
        if (!monitoring) {
            return res.status(503).json({
                status: 'unhealthy',
                message: 'Monitoring not initialized'
            });
        }
        const health = await monitoring.getHealthCheck();
        // Set appropriate HTTP status code
        const statusCode = health.status === 'healthy' ? 200 :
            health.status === 'degraded' ? 200 : 503;
        res.status(statusCode).json(health);
    }
    catch (error) {
        (0, logger_1.logError)('❌ Error in health check:', error);
        res.status(500).json({
            status: 'unhealthy',
            message: 'Health check failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * Get performance metrics
 */
router.get('/performance', async (req, res) => {
    try {
        if (!monitoring) {
            return res.status(503).json({
                error: 'Monitoring not initialized',
                message: 'Enhanced monitoring service is not available'
            });
        }
        const metrics = monitoring.getPerformanceMetrics();
        res.json({
            success: true,
            data: metrics
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ Error getting performance metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get performance metrics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * Get alerts
 */
router.get('/alerts', async (req, res) => {
    try {
        if (!monitoring) {
            return res.status(503).json({
                error: 'Monitoring not initialized',
                message: 'Enhanced monitoring service is not available'
            });
        }
        const level = req.query.level;
        const alerts = level ? monitoring.getAlertsByLevel(level) : monitoring['alerts'];
        res.json({
            success: true,
            data: {
                alerts,
                total: alerts.length,
                levels: {
                    critical: monitoring.getAlertsByLevel('critical').length,
                    error: monitoring.getAlertsByLevel('error').length,
                    warning: monitoring.getAlertsByLevel('warning').length,
                    info: monitoring.getAlertsByLevel('info').length
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ Error getting alerts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get alerts',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * Clear alerts
 */
router.post('/alerts/clear', async (req, res) => {
    try {
        if (!monitoring) {
            return res.status(503).json({
                error: 'Monitoring not initialized',
                message: 'Enhanced monitoring service is not available'
            });
        }
        monitoring.clearAlerts();
        res.json({
            success: true,
            message: 'All alerts cleared'
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ Error clearing alerts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear alerts',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * Get real-time dashboard data
 */
router.get('/dashboard', async (req, res) => {
    try {
        if (!monitoring) {
            return res.status(503).json({
                error: 'Monitoring not initialized',
                message: 'Enhanced monitoring service is not available'
            });
        }
        const [stats, health, performance] = await Promise.all([
            monitoring.getMonitoringStats(),
            monitoring.getHealthCheck(),
            monitoring.getPerformanceMetrics()
        ]);
        res.json({
            success: true,
            data: {
                stats,
                health,
                performance,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ Error getting dashboard data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get dashboard data',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * Get system configuration
 */
router.get('/config', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                features: {
                    queue: true,
                    rateLimiting: true,
                    retryBackoff: true,
                    batching: true,
                    caching: true,
                    websockets: true,
                    monitoring: true
                },
                limits: {
                    maxConcurrentRequests: 3,
                    maxQueueSize: 1000,
                    defaultRetryAttempts: 3,
                    rateLimitWindow: 60000,
                    maxRateLimitRequests: 30
                },
                supportedGames: ['teen20', 'ab20', 'dt20', 'aaa', 'card32eu', 'lucky7eu'],
                pollingIntervals: {
                    gameData: '*/1 * * * * *',
                    results: '*/4 * * * * *',
                    markets: '*/10 * * * * *'
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ Error getting config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get configuration',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=enhancedMonitoringRoutes.js.map