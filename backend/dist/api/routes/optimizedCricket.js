"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DataAggregationService_1 = require("../../services/DataAggregationService");
const SmartCache_1 = require("../../infrastructure/cache/SmartCache");
const logger_1 = __importDefault(require("../../monitoring/logging/logger"));
const router = express_1.default.Router();
/**
 * @route GET /api/cricket/aggregated
 * @desc Get aggregated cricket data for a user
 * @access Public
 */
router.get('/aggregated', async (req, res) => {
    try {
        const { userId = 'anonymous' } = req.query;
        const { showLiveOnly = 'false', showTvOnly = 'false', refreshInterval = '30' } = req.query;
        const preferences = {
            showLiveOnly: showLiveOnly === 'true',
            showTvOnly: showTvOnly === 'true',
            refreshInterval: parseInt(refreshInterval, 10)
        };
        logger_1.default.info(`📊 Getting aggregated data for user: ${userId}`);
        const data = await DataAggregationService_1.dataAggregationService.getUserData(userId, preferences);
        res.json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to get aggregated data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get aggregated data',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @route POST /api/cricket/match-data
 * @desc Get detailed data for specific matches
 * @access Public
 */
router.post('/match-data', async (req, res) => {
    try {
        const { matchIds, userId = 'anonymous' } = req.body;
        if (!matchIds || !Array.isArray(matchIds)) {
            return res.status(400).json({
                success: false,
                error: 'matchIds array is required',
                timestamp: new Date().toISOString()
            });
        }
        logger_1.default.info(`📊 Getting match data for ${matchIds.length} matches, user: ${userId}`);
        const data = await DataAggregationService_1.dataAggregationService.getMatchData(matchIds, userId);
        res.json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to get match data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get match data',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @route POST /api/cricket/tv-availability
 * @desc Check TV availability for multiple matches
 * @access Public
 */
router.post('/tv-availability', async (req, res) => {
    try {
        const { matchIds, userId = 'anonymous' } = req.body;
        if (!matchIds || !Array.isArray(matchIds)) {
            return res.status(400).json({
                success: false,
                error: 'matchIds array is required',
                timestamp: new Date().toISOString()
            });
        }
        logger_1.default.info(`📺 Checking TV availability for ${matchIds.length} matches, user: ${userId}`);
        const data = await DataAggregationService_1.dataAggregationService.checkTvAvailability(matchIds, userId);
        res.json({
            success: true,
            data: Object.fromEntries(data),
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to check TV availability:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check TV availability',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @route POST /api/cricket/user-preferences
 * @desc Update user preferences
 * @access Public
 */
router.post('/user-preferences', async (req, res) => {
    try {
        const { userId, preferences } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required',
                timestamp: new Date().toISOString()
            });
        }
        logger_1.default.info(`👤 Updating preferences for user: ${userId}`);
        DataAggregationService_1.dataAggregationService.updateUserPreferences(userId, preferences);
        res.json({
            success: true,
            message: 'Preferences updated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to update user preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user preferences',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @route GET /api/cricket/cache-stats
 * @desc Get cache statistics
 * @access Public
 */
router.get('/cache-stats', async (req, res) => {
    try {
        const stats = await SmartCache_1.smartCache.getStats();
        const activeUsers = DataAggregationService_1.dataAggregationService.getActiveUsersCount();
        res.json({
            success: true,
            data: {
                ...stats,
                activeUsers,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to get cache stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cache stats',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @route POST /api/cricket/invalidate-cache
 * @desc Invalidate cache for specific patterns
 * @access Public
 */
router.post('/invalidate-cache', async (req, res) => {
    try {
        const { pattern, userId } = req.body;
        if (!pattern) {
            return res.status(400).json({
                success: false,
                error: 'pattern is required',
                timestamp: new Date().toISOString()
            });
        }
        logger_1.default.info(`🗑️ Invalidating cache for pattern: ${pattern}, user: ${userId}`);
        await SmartCache_1.smartCache.invalidate(pattern, userId);
        res.json({
            success: true,
            message: 'Cache invalidated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to invalidate cache:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to invalidate cache',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @route GET /api/cricket/health-optimized
 * @desc Health check for optimized endpoints
 * @access Public
 */
router.get('/health-optimized', async (req, res) => {
    try {
        const stats = await SmartCache_1.smartCache.getStats();
        const activeUsers = DataAggregationService_1.dataAggregationService.getActiveUsersCount();
        res.json({
            success: true,
            data: {
                status: 'HEALTHY',
                service: 'Optimized Cricket API',
                cache: {
                    totalKeys: stats.totalKeys,
                    memoryUsage: stats.memoryUsage,
                    hitRate: stats.hitRate
                },
                users: {
                    active: activeUsers
                },
                lastCheck: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Optimized API health check failed:', error);
        res.status(500).json({
            success: false,
            error: 'Optimized API health check failed',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=optimizedCricket.js.map