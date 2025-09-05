#!/usr/bin/env node

/**
 * 3xbat External API Proxy
 * Runs on AWS server to forward API requests with whitelisted IP
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: '3xbat API Proxy is running on AWS server'
    });
});

// Cricket Scorecard API
app.get('/cricket/scorecard', async (req, res) => {
    try {
        const { marketId } = req.query;
        const url = `http://172.104.206.227:3000/t10score?marketId=${marketId || 'test'}`;
        
        console.log(`[SCORECARD] Fetching from: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error(`[SCORECARD] Error:`, error.message);
        res.status(500).json({ 
            error: 'Failed to fetch scorecard',
            message: error.message 
        });
    }
});

// Cricket TV Streaming
app.get('/cricket/tv', async (req, res) => {
    try {
        const { eventId } = req.query;
        const url = `https://mis3.sqmr.xyz/rtv.php?eventId=${eventId || 'test'}`;
        
        console.log(`[CRICKET TV] Fetching from: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });
        
        res.json({ data: response.data });
    } catch (error) {
        console.error(`[CRICKET TV] Error:`, error.message);
        res.status(500).json({ 
            error: 'Failed to fetch cricket TV',
            message: error.message 
        });
    }
});

// Cricket Fixtures - Return raw data without transformation
app.get('/cricket/fixtures', async (req, res) => {
    try {
        // Call the raw API that returns {t1: [...], t2: [...]} with beventId
        const url = 'https://marketsarket.qnsports.live/cricketmatches';
        
        console.log(`[FIXTURES] Fetching raw data from: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });
        
        // Return raw data as-is without transformation
        res.json(response.data);
    } catch (error) {
        console.error(`[FIXTURES] Error:`, error.message);
        res.status(500).json({ 
            error: 'Failed to fetch fixtures',
            message: error.message 
        });
    }
});

// Cricket Odds
app.get('/cricket/odds', async (req, res) => {
    try {
        const { eventId } = req.query;
        const url = `https://data.shamexch.xyz/getbm?eventId=${eventId || 'test'}`;
        
        console.log(`[ODDS] Fetching from: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error(`[ODDS] Error:`, error.message);
        res.status(500).json({ 
            error: 'Failed to fetch odds',
            message: error.message 
        });
    }
});

// ==================== CASINO API ENDPOINTS ====================

// Valid game types and stream IDs for validation
const VALID_GAME_TYPES = ['teen20', 'ab20', 'dt20', 'aaa', 'card32eu', 'lucky7eu'];
const VALID_STREAM_IDS = ['3030', '3043', '3035', '3056', '3034', '3032'];

// Casino Game Data
app.get('/casino/data/:gametype', async (req, res) => {
    try {
        const { gametype } = req.params;
        
        // Validate game type
        if (!VALID_GAME_TYPES.includes(gametype)) {
            return res.status(400).json({
                error: 'Invalid game type',
                message: `Game type must be one of: ${VALID_GAME_TYPES.join(', ')}`,
                provided: gametype
            });
        }
        
        const url = `http://159.65.20.25:3000/getdata/${gametype}`;
        
        console.log(`[CASINO DATA] Fetching from: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error(`[CASINO DATA] Error:`, error.message);
        res.status(500).json({ 
            error: 'Failed to fetch casino game data',
            message: error.message,
            gametype: req.params.gametype
        });
    }
});

// Casino Game Results
app.get('/casino/results/:gametype', async (req, res) => {
    try {
        const { gametype } = req.params;
        
        // Validate game type
        if (!VALID_GAME_TYPES.includes(gametype)) {
            return res.status(400).json({
                error: 'Invalid game type',
                message: `Game type must be one of: ${VALID_GAME_TYPES.join(', ')}`,
                provided: gametype
            });
        }
        
        const url = `http://159.65.20.25:3000/getresult/${gametype}`;
        
        console.log(`[CASINO RESULTS] Fetching from: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error(`[CASINO RESULTS] Error:`, error.message);
        res.status(500).json({ 
            error: 'Failed to fetch casino game results',
            message: error.message,
            gametype: req.params.gametype
        });
    }
});

// Casino Detail Results
app.get('/casino/detail-results/:roundid', async (req, res) => {
    try {
        const { roundid } = req.params;
        
        // Basic validation for round ID (should not be empty)
        if (!roundid || roundid.trim() === '') {
            return res.status(400).json({
                error: 'Invalid round ID',
                message: 'Round ID is required and cannot be empty',
                provided: roundid
            });
        }
        
        const url = `http://159.65.20.25:3000/getdetailresult/${roundid}`;
        
        console.log(`[CASINO DETAIL RESULTS] Fetching from: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Betting-ExternalAPI/1.0'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error(`[CASINO DETAIL RESULTS] Error:`, error.message);
        res.status(500).json({ 
            error: 'Failed to fetch casino detail results',
            message: error.message,
            roundid: req.params.roundid
        });
    }
});

// Casino TV Streaming
app.get('/casino/tv', async (req, res) => {
    try {
        const { id: streamid } = req.query;
        
        // Validate stream ID
        if (!streamid) {
            return res.status(400).json({
                error: 'Missing stream ID',
                message: 'Stream ID is required as query parameter "id"',
                validStreamIds: VALID_STREAM_IDS
            });
        }
        
        if (!VALID_STREAM_IDS.includes(streamid)) {
            return res.status(400).json({
                error: 'Invalid stream ID',
                message: `Stream ID must be one of: ${VALID_STREAM_IDS.join(', ')}`,
                provided: streamid
            });
        }
        
        const url = `https://jmdapi.com/tablevideo/?id=${streamid}`;
        
        console.log(`[CASINO TV] Fetching from: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://batxgames.site',
                'Origin': 'https://batxgames.site',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            }
        });
        
        res.json({ data: response.data });
    } catch (error) {
        console.error(`[CASINO TV] Error:`, error.message);
        res.status(500).json({ 
            error: 'Failed to fetch casino TV stream',
            message: error.message,
            streamid: req.query.id
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 3xbat API Proxy running on port ${PORT}`);
    console.log(`📡 All external API requests will be routed through this AWS server`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 