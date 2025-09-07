import express from 'express';

const router = express.Router();

// Simple logger function
const logger = {
    error: (message: string, error?: any) => {
        console.error(message, error);
    },
    info: (message: string) => {
        console.log(message);
    }
};

/**
 * @route GET /api/casino/health
 * @desc Check Casino API health status
 * @access Public
 */
router.get('/health', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                status: 'HEALTHY',
                provider: 'Casino API via External Service',
                baseUrl: 'Multiple via proxy',
                lastCheck: new Date().toISOString(),
                endpoints: [
                    '/casino/tv',
                    '/casino/data/:gameType',
                    '/casino/results/:gameType',
                    '/casino/data',
                    '/casino/results'
                ]
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Casino API health check failed:', error);
        res.status(500).json({
            success: false,
            error: 'Casino API health check failed',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/casino/tv
 * @desc Get casino TV streaming data
 * @access Public
 */
router.get('/tv', async (req, res) => {
    try {
        const { streamid } = req.query;
        
        if (!streamid) {
            return res.status(400).json({
                success: false,
                error: 'streamid query parameter is required',
                timestamp: new Date().toISOString()
            });
        }

        // Call external API via localhost:8000 proxy
        const response = await fetch(`http://localhost:8000/casino/tv?streamid=${streamid}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const tvData = await response.json();

        res.json({
            success: true,
            data: tvData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to fetch casino TV:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch casino TV',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/casino/data/:gameType
 * @desc Get casino game data for specific game type
 * @access Public
 */
router.get('/data/:gameType', async (req, res) => {
    try {
        const { gameType } = req.params;
        const { streamingId = '3030' } = req.query;

        // Call external API via localhost:8000 proxy
        const response = await fetch(`http://localhost:8000/casino/data/${gameType}?streamingId=${streamingId}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const gameData = await response.json();

        res.json({
            success: true,
            data: gameData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to fetch casino game data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch casino game data',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/casino/results/:gameType
 * @desc Get casino game results for specific game type
 * @access Public
 */
router.get('/results/:gameType', async (req, res) => {
    try {
        const { gameType } = req.params;
        const { streamingId = '3030' } = req.query;

        // Call external API via localhost:8000 proxy
        const response = await fetch(`http://localhost:8000/casino/results/${gameType}?streamingId=${streamingId}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const resultsData = await response.json();

        res.json({
            success: true,
            data: resultsData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to fetch casino results:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch casino results',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/casino/data
 * @desc Get all casino game data
 * @access Public
 */
router.get('/data', async (req, res) => {
    try {
        const { streamingId = '3030' } = req.query;

        // Call external API via localhost:8000 proxy
        const response = await fetch(`http://localhost:8000/casino/data?streamingId=${streamingId}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const allGameData = await response.json();

        res.json({
            success: true,
            data: allGameData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to fetch all casino game data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch all casino game data',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/casino/results
 * @desc Get all casino game results
 * @access Public
 */
router.get('/results', async (req, res) => {
    try {
        const { streamingId = '3030' } = req.query;

        // Call external API via localhost:8000 proxy
        const response = await fetch(`http://localhost:8000/casino/results?streamingId=${streamingId}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const allResultsData = await response.json();

        res.json({
            success: true,
            data: allResultsData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Failed to fetch all casino results:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch all casino results',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
