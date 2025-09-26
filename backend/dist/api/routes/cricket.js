"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RealExternalAPIService_1 = __importDefault(require("../../external-apis/RealExternalAPIService"));
const logger_1 = __importDefault(require("../../monitoring/logging/logger"));
// Simple in-memory cache for HLS streams (short TTL)
const hlsCache = new Map();
// Rate limiter to prevent too many external API calls
const requestLimiter = new Map();
const RATE_LIMIT = 10; // Max 10 requests per second per stream
const RATE_WINDOW = 1000; // 1 second window
// Clean up expired cache entries every 30 seconds
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of hlsCache.entries()) {
        if (value.expires < now) {
            hlsCache.delete(key);
        }
    }
    // Clean up rate limiter
    for (const [key, value] of requestLimiter.entries()) {
        if (value.resetTime < now) {
            requestLimiter.delete(key);
        }
    }
}, 30000);
const router = express_1.default.Router();
const apiService = new RealExternalAPIService_1.default();
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
    }
    catch (error) {
        logger_1.default.error('❌ Cricket API health check failed:', error);
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
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: Array.isArray(fixtures) ? fixtures.length : 0
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to fetch fixtures:', error);
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
        logger_1.default.info(`📺 Fetching cricket TV for event: ${eventId}`);
        // Use external API service with retry logic
        const tvData = await apiService.getCricketTV(eventId);
        logger_1.default.info(`✅ Successfully fetched TV data for event: ${eventId}`);
        res.json({
            success: true,
            data: tvData,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to fetch TV data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch TV data',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @route GET /api/cricket/tv/html
 * @desc Get cricket TV streaming HTML (for iframe embedding)
 * @access Public
 */
router.get('/tv/html', async (req, res) => {
    try {
        const { eventId } = req.query;
        if (!eventId) {
            return res.status(400).send('Missing eventId parameter');
        }
        logger_1.default.info(`📺 Fetching cricket TV HTML for event: ${eventId}`);
        // Use external API service with retry logic
        const tvData = await apiService.getCricketTV(eventId);
        logger_1.default.info(`✅ Successfully fetched TV HTML for event: ${eventId}`);
        // Return HTML directly with corrected asset paths
        if (tvData.html) {
            // Fix relative paths to absolute paths for iframe embedding
            const correctedHtml = tvData.html
                .replace(/href="\.\/css\//g, 'href="https://mis3.sqmr.xyz/css/')
                .replace(/src="\.\/js\//g, 'src="https://mis3.sqmr.xyz/js/')
                .replace(/href='\.\/css\//g, "href='https://mis3.sqmr.xyz/css/")
                .replace(/src='\.\/js\//g, "src='https://mis3.sqmr.xyz/js/")
                // Replace HLS stream URLs to use our proxy
                .replace(/https:\/\/mis3\.sqmr\.xyz:3334\/app\//g, `${process.env.API_BASE_URL || 'http://13.60.145.70:4000'}/api/cricket/tv/stream/`)
                // Replace the HLS stream URL in JavaScript (handle multiline with dotall flag)
                .replace(/"file":\s*"https:\/\/mis3\.sqmr\.xyz:3334\/app\/"\s*\+\s*eventId\s*\+\s*"\/llhls\.m3u8"/gs, `"file": "${process.env.API_BASE_URL || 'http://13.60.145.70:4000'}/api/cricket/tv/stream/" + eventId + "/llhls.m3u8"`);
            res.setHeader('Content-Type', 'text/html');
            res.send(correctedHtml);
        }
        else {
            res.status(404).send('No TV stream available for this event');
        }
    }
    catch (error) {
        logger_1.default.error('❌ Failed to fetch TV HTML:', error);
        res.status(500).send('Failed to fetch TV stream');
    }
});
/**
 * @route GET /api/cricket/tv/stream/*
 * @desc Proxy HLS stream requests with proper headers
 * @access Public
 */
router.get('/tv/stream/*', async (req, res) => {
    try {
        const streamPath = req.params[0]; // Get everything after /tv/stream/
        const queryString = req.url.split('?')[1] || ''; // Get query string
        const streamUrl = `https://mis3.sqmr.xyz:3334/app/${streamPath}${queryString ? '?' + queryString : ''}`;
        // Create cache key for this stream resource
        const cacheKey = `tv_stream:${streamPath}:${queryString}`;
        logger_1.default.info(`📺 Proxying HLS stream: ${streamUrl}`);
        // Check cache first (short TTL for HLS content)
        const cached = hlsCache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            logger_1.default.info(`📺 Serving HLS stream from cache: ${streamPath}`);
            // Set appropriate headers for HLS stream
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Range');
            res.send(cached.content);
            return;
        }
        // Check rate limit for external API calls
        const streamId = streamPath.split('/')[0]; // Get event ID
        const now = Date.now();
        const limiterKey = `stream:${streamId}`;
        const limiter = requestLimiter.get(limiterKey);
        if (limiter && limiter.resetTime > now && limiter.count >= RATE_LIMIT) {
            logger_1.default.warn(`⚠️ Rate limit exceeded for stream ${streamId}, serving stale cache or 429`);
            res.status(429).send('Rate limit exceeded, please try again later');
            return;
        }
        // Update rate limiter
        if (!limiter || limiter.resetTime <= now) {
            requestLimiter.set(limiterKey, { count: 1, resetTime: now + RATE_WINDOW });
        }
        else {
            limiter.count++;
        }
        // Fetch from external API only if not cached and within rate limit
        const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://3xbat.com',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1',
                'Connection': 'keep-alive'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        // Set appropriate headers for HLS stream
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Range');
        // Stream the response
        if (response.body) {
            const reader = response.body.getReader();
            const pump = async () => {
                try {
                    let content = '';
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done)
                            break;
                        content += new TextDecoder().decode(value);
                    }
                    // If this is an HLS playlist, replace relative paths with our proxy URLs
                    if (content.includes('#EXTM3U') && content.includes('/app/')) {
                        content = content.replace(/\/app\//g, '/api/cricket/tv/stream/');
                        logger_1.default.info(`🔄 Replaced relative paths in HLS playlist`);
                    }
                    // Cache the content for future requests (2 seconds TTL for video chunks)
                    const ttl = streamPath.includes('part_') || streamPath.includes('chunklist_') ? 2000 : 5000; // 2s for chunks, 5s for playlists
                    hlsCache.set(cacheKey, {
                        content,
                        expires: Date.now() + ttl
                    });
                    res.write(content);
                    res.end();
                }
                catch (error) {
                    logger_1.default.error('Error streaming response:', error);
                    res.end();
                }
            };
            pump();
        }
        else {
            res.status(500).send('No response body');
        }
        logger_1.default.info(`✅ Successfully proxied HLS stream: ${streamUrl}`);
    }
    catch (error) {
        logger_1.default.error('❌ Failed to proxy HLS stream:', error);
        res.status(500).send('Failed to proxy stream');
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
        logger_1.default.info(`📊 Fetching scorecard for market: ${marketId}`);
        // For now, use direct API call with retry logic
        // TODO: Implement proper queue processing
        const result = await apiService.getCricketScorecard(marketId);
        logger_1.default.info(`✅ Successfully fetched scorecard for market: ${marketId}`);
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to fetch scorecard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch scorecard',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @route GET /api/cricket/scorecard/:eventId
 * @desc Get cricket scorecard for a specific event
 * @access Public
 */
router.get('/scorecard/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) {
            return res.status(400).json({
                success: false,
                error: 'Event ID is required',
                timestamp: new Date().toISOString()
            });
        }
        logger_1.default.info(`📊 Fetching scorecard for event: ${eventId}`);
        // Use eventId as marketId for now (they might be the same)
        const result = await apiService.getCricketScorecard(eventId);
        logger_1.default.info(`✅ Successfully fetched scorecard for event: ${eventId}`);
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to fetch scorecard:', error);
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
        logger_1.default.info(`🎯 Queueing odds request for event: ${eventId}`);
        // For now, use direct API call with retry logic
        // TODO: Implement proper queue processing
        const result = await apiService.getCricketOdds(eventId);
        logger_1.default.info(`✅ Successfully fetched odds for event: ${eventId}`);
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.default.error('❌ Failed to fetch odds:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch odds',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=cricket.js.map