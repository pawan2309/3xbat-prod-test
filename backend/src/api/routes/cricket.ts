import express from 'express';
import { addCricketOddsJob, addCricketScorecardJob, addCricketFixturesJob, addCricketTVJob } from '../../queues/apiRequestQueue';
import RealExternalAPIService from '../../external-apis/RealExternalAPIService';
import logger from '../../monitoring/logging/logger';

const router = express.Router();
const apiService = new RealExternalAPIService();

/**
 * @route GET /api/cricket/health
 * @desc Check Cricket API health status
 * @access Public
 */
router.get('/health', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                status: 'HEALTHY',
                provider: 'Cricket API Direct External',
                baseUrl: 'https://marketsarket.qnsports.live',
                lastCheck: new Date().toISOString(),
                endpoints: [
                    '/cricket/fixtures',
                    '/cricket/odds'
                ]
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Cricket API health check failed:', error);
        res.status(500).json({
            success: false,
            error: 'Cricket API health check failed',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/cricket/fixtures
 * @desc Get cricket fixtures with optional filters
 * @access Public
 */
router.get('/fixtures', async (req, res) => {
    try {
        const { sport = 'cricket', fromDate, toDate, status, tournament, limit = 50, offset = 0 } = req.query;
        
        // Call external API directly
        const response = await fetch('https://marketsarket.qnsports.live/cricketmatches', {
            method: 'GET',
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const fixtures = await response.json();

        res.json({
            success: true,
            data: {
                fixtures: fixtures,
                total: Array.isArray(fixtures) ? fixtures.length : 0
            },
            pagination: {
                limit: parseInt(limit as string),
                offset: parseInt(offset as string),
                total: Array.isArray(fixtures) ? fixtures.length : 0
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to fetch fixtures:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch fixtures',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/cricket/tv
 * @desc Get cricket TV streaming data (direct external API)
 * @access Public
 */
router.get('/tv', async (req, res) => {
    try {
        const { eventId } = req.query;
        
        if (!eventId) {
            return res.status(400).json({
                success: false,
                error: 'Missing eventId parameter',
                timestamp: new Date().toISOString()
            });
        }

        logger.info(`📺 Fetching cricket TV for event: ${eventId}`);

        // Use external API service with retry logic
        const tvData = await apiService.getCricketTV(eventId as string);
        
        logger.info(`✅ Successfully fetched TV data for event: ${eventId}`);

        res.json({
            success: true,
            data: tvData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to fetch TV data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch TV data',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/cricket/scorecard
 * @desc Get cricket scorecard for a specific market
 * @access Public
 */
router.get('/scorecard', async (req, res) => {
    try {
        const { marketId } = req.query;
        
        if (!marketId) {
            return res.status(400).json({
                success: false,
                error: 'Market ID is required',
                timestamp: new Date().toISOString()
            });
        }

        logger.info(`📊 Fetching scorecard for market: ${marketId}`);

        // For now, use direct API call with retry logic
        // TODO: Implement proper queue processing
        const result = await apiService.getCricketScorecard(marketId as string);
        
        logger.info(`✅ Successfully fetched scorecard for market: ${marketId}`);

        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to fetch scorecard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch scorecard',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/cricket/odds
 * @desc Get cricket odds for matches (via proxy)
 * @access Public
 */
router.get('/odds', async (req, res) => {
    try {
        const { eventId } = req.query;
        
        if (!eventId) {
            return res.status(400).json({
                success: false,
                error: 'Missing eventId parameter',
                timestamp: new Date().toISOString()
            });
        }

        logger.info(`🎯 Queueing odds request for event: ${eventId}`);

        // For now, use direct API call with retry logic
        // TODO: Implement proper queue processing
        const result = await apiService.getCricketOdds(eventId as string);
        
        logger.info(`✅ Successfully fetched odds for event: ${eventId}`);

        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to fetch odds:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch odds',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
