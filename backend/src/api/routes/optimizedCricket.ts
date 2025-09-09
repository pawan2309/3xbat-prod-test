import express from 'express';
import { dataAggregationService } from '../../services/DataAggregationService';
import { smartCache } from '../../infrastructure/cache/SmartCache';
import logger from '../../monitoring/logging/logger';

const router = express.Router();

/**
 * @route GET /api/cricket/aggregated
 * @desc Get aggregated cricket data for a user
 * @access Public
 */
router.get('/aggregated', async (req, res) => {
    try {
        const { userId = 'anonymous' } = req.query;
        const { 
            showLiveOnly = 'false',
            showTvOnly = 'false',
            refreshInterval = '30'
        } = req.query;

        const preferences = {
            showLiveOnly: showLiveOnly === 'true',
            showTvOnly: showTvOnly === 'true',
            refreshInterval: parseInt(refreshInterval as string, 10)
        };

        logger.info(`📊 Getting aggregated data for user: ${userId}`);

        const data = await dataAggregationService.getUserData(
            userId as string, 
            preferences
        );

        res.json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to get aggregated data:', error);
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

        logger.info(`📊 Getting match data for ${matchIds.length} matches, user: ${userId}`);

        const data = await dataAggregationService.getMatchData(
            matchIds, 
            userId as string
        );

        res.json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to get match data:', error);
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

        logger.info(`📺 Checking TV availability for ${matchIds.length} matches, user: ${userId}`);

        const data = await dataAggregationService.checkTvAvailability(
            matchIds, 
            userId as string
        );

        res.json({
            success: true,
            data: Object.fromEntries(data),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to check TV availability:', error);
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

        logger.info(`👤 Updating preferences for user: ${userId}`);

        dataAggregationService.updateUserPreferences(userId, preferences);

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to update user preferences:', error);
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
        const stats = await smartCache.getStats();
        const activeUsers = dataAggregationService.getActiveUsersCount();

        res.json({
            success: true,
            data: {
                ...stats,
                activeUsers,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error('❌ Failed to get cache stats:', error);
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

        logger.info(`🗑️ Invalidating cache for pattern: ${pattern}, user: ${userId}`);

        await smartCache.invalidate(pattern, userId);

        res.json({
            success: true,
            message: 'Cache invalidated successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to invalidate cache:', error);
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
        const stats = await smartCache.getStats();
        const activeUsers = dataAggregationService.getActiveUsersCount();

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
    } catch (error) {
        logger.error('❌ Optimized API health check failed:', error);
        res.status(500).json({
            success: false,
            error: 'Optimized API health check failed',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
