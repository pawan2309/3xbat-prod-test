"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketDataPublisher = exports.WebSocketDataPublisher = void 0;
const WebSocketManager_1 = require("../infrastructure/websockets/WebSocketManager");
const DataAggregationService_1 = require("./DataAggregationService");
const SmartCache_1 = require("../infrastructure/cache/SmartCache");
const RealExternalAPIService_1 = __importDefault(require("../external-apis/RealExternalAPIService"));
const logger_1 = __importDefault(require("../monitoring/logging/logger"));
const TokenBucketService_1 = require("../infrastructure/rateLimit/TokenBucketService");
class WebSocketDataPublisher {
    constructor() {
        this.apiService = new RealExternalAPIService_1.default();
        this.updateIntervals = new Map();
        this.isRunning = false;
        // Per-match backoff states (Step C)
        this.oddsBackoff = new Map();
        this.scorecardBackoff = new Map();
        this.startDataPublishing();
        this.setupRedisSubscriptions();
    }
    /**
     * Setup Redis subscriptions for instant updates
     */
    setupRedisSubscriptions() {
        try {
            const { getRedisPubSubClient } = require('../infrastructure/redis/redis');
            const redis = getRedisPubSubClient();
            if (redis) {
                // Subscribe to cricket fixtures updates
                redis.subscribe('cricket:fixtures:updated', (err) => {
                    if (err) {
                        logger_1.default.error('❌ Failed to subscribe to cricket:fixtures:updated:', err);
                    }
                    else {
                        logger_1.default.info('📡 Subscribed to cricket:fixtures:updated for instant updates');
                    }
                });
                // Handle incoming Redis messages
                redis.on('message', (channel, message) => {
                    if (channel === 'cricket:fixtures:updated') {
                        logger_1.default.info('📡 Received instant fixtures update from Redis');
                        // Publish immediately to WebSocket
                        this.publishMatchesData();
                    }
                });
            }
        }
        catch (error) {
            logger_1.default.error('❌ Error setting up Redis subscriptions:', error);
        }
    }
    /**
     * Start publishing data updates
     */
    startDataPublishing() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        logger_1.default.info('🚀 Starting WebSocket data publishing service');
        // Publish matches data every 30 seconds (reduced from 2 minutes for better responsiveness)
        this.scheduleUpdate('matches', 30000, () => this.publishMatchesData());
        // Publish dashboard stats every 30 seconds
        this.scheduleUpdate('dashboard-stats', 30000, () => this.publishDashboardStats());
        // Publish matches data immediately on startup
        setTimeout(() => {
            this.publishMatchesData();
        }, 1000); // Wait 1 second for server to fully start
        // Publish dashboard stats immediately on startup
        setTimeout(() => {
            this.publishDashboardStats();
        }, 1500); // Wait 1.5 seconds for server to fully start
        // FAST MODE: odds every 1000ms per active room, but guarded by token bucket
        this.scheduleUpdate('odds-fast-loop', 1000, () => this.publishOddsData());
        // FAST MODE: scorecard every 1000ms per active room, guarded by token bucket
        this.scheduleUpdate('scorecard-fast-loop', 1000, () => this.publishScorecardData());
        // TV availability less frequent (120s) to reduce load
        this.scheduleUpdate('tv', 120000, () => this.publishTvAvailability());
        // Casino TV polling every 60s
        this.scheduleUpdate('casino-tv', 60000, () => this.publishCasinoTvData());
        // Casino data polling every 1s
        this.scheduleUpdate('casino-data', 1000, () => this.publishCasinoData());
        // Casino results polling every 1s
        this.scheduleUpdate('casino-results', 1000, () => this.publishCasinoResults());
    }
    /**
     * Schedule a recurring update
     */
    scheduleUpdate(name, interval, updateFn) {
        const existing = this.updateIntervals.get(name);
        if (existing) {
            clearInterval(existing);
        }
        const intervalId = setInterval(async () => {
            try {
                await updateFn();
            }
            catch (error) {
                logger_1.default.error(`❌ Error in ${name} update:`, error);
            }
        }, interval);
        this.updateIntervals.set(name, intervalId);
        logger_1.default.info(`⏰ Scheduled ${name} updates every ${interval}ms`);
    }
    /**
     * Publish matches data to all users
     */
    async publishMatchesData() {
        try {
            if (!WebSocketManager_1.webSocketManager) {
                logger_1.default.warn('⚠️ WebSocket manager not available for matches data');
                return;
            }
            logger_1.default.info('🔄 Fetching cricket fixtures data...');
            // Get fresh matches data
            const matchesData = await SmartCache_1.smartCache.get('cricket:fixtures', () => this.apiService.getCricketFixtures());
            logger_1.default.info('📊 Matches data received:', {
                hasData: !!matchesData,
                dataType: typeof matchesData,
                isArray: Array.isArray(matchesData),
                dataLength: Array.isArray(matchesData) ? matchesData.length : 'N/A'
            });
            // Broadcast to all users
            await WebSocketManager_1.webSocketManager.broadcastToRoom('global:matches', 'matches_updated', {
                data: matchesData,
                timestamp: Date.now()
            });
            logger_1.default.info('📊 Published matches data update to global:matches room');
        }
        catch (error) {
            logger_1.default.error('❌ Error publishing matches data:', error);
        }
    }
    /**
     * Publish odds data for active matches
     */
    async publishOddsData() {
        try {
            if (!WebSocketManager_1.webSocketManager)
                return;
            // Get active matches from subscriber-aware rooms
            const activeMatches = WebSocketManager_1.webSocketManager.getActiveRooms('match:')
                .map(id => id.split(':')[1]);
            if (activeMatches.length === 0)
                return;
            // Respect global and endpoint token buckets
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:global'))
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:odds'))
                return;
            // Batch fetch odds data (still cached)
            const oddsData = await this.batchFetchOdds(activeMatches);
            // Broadcast to specific match rooms
            for (const [matchId, odds] of oddsData.entries()) {
                await WebSocketManager_1.webSocketManager.broadcastToMatch(matchId, 'odds_updated', {
                    matchId,
                    data: odds,
                    timestamp: Date.now()
                });
            }
            logger_1.default.info(`📊 Published odds data for ${oddsData.size} matches`);
        }
        catch (error) {
            logger_1.default.error('❌ Error publishing odds data:', error);
        }
    }
    /**
     * Publish scorecard data for active matches
     */
    async publishScorecardData() {
        try {
            if (!WebSocketManager_1.webSocketManager)
                return;
            const activeMatches = WebSocketManager_1.webSocketManager.getActiveRooms('match:')
                .map(id => id.split(':')[1]);
            if (activeMatches.length === 0)
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:global'))
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:scorecard'))
                return;
            // Batch fetch scorecard data
            const scorecardData = await this.batchFetchScorecards(activeMatches);
            // Broadcast to specific match rooms
            for (const [matchId, scorecard] of scorecardData.entries()) {
                await WebSocketManager_1.webSocketManager.broadcastToMatch(matchId, 'scorecard_updated', {
                    matchId,
                    data: scorecard,
                    timestamp: Date.now()
                });
            }
            logger_1.default.info(`📊 Published scorecard data for ${scorecardData.size} matches`);
        }
        catch (error) {
            logger_1.default.error('❌ Error publishing scorecard data:', error);
        }
    }
    /**
     * Publish TV availability updates
     */
    async publishTvAvailability() {
        try {
            if (!WebSocketManager_1.webSocketManager)
                return;
            const activeMatches = WebSocketManager_1.webSocketManager.getActiveRooms('match:')
                .map(id => id.split(':')[1]);
            if (activeMatches.length === 0)
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:global'))
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:tv'))
                return;
            // Check TV availability
            const tvData = await DataAggregationService_1.dataAggregationService.checkTvAvailability(activeMatches, 'system');
            // Broadcast TV availability updates
            for (const [matchId, available] of tvData.entries()) {
                await WebSocketManager_1.webSocketManager.broadcastToMatch(matchId, 'tv_availability_updated', {
                    matchId,
                    available,
                    timestamp: Date.now()
                });
            }
            logger_1.default.info(`📺 Published TV availability for ${tvData.size} matches`);
        }
        catch (error) {
            logger_1.default.error('❌ Error publishing TV availability:', error);
        }
    }
    /**
     * Publish casino TV data for active casino rooms
     */
    async publishCasinoTvData() {
        try {
            if (!WebSocketManager_1.webSocketManager)
                return;
            const activeCasinoRooms = WebSocketManager_1.webSocketManager.getActiveRooms('casino:');
            if (activeCasinoRooms.length === 0)
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:global'))
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:casino-tv'))
                return;
            // Casino TV stream IDs
            const casinoStreams = [
                { id: '3030', game: 'teen20' },
                { id: '3035', game: 'dt20' },
                { id: '3036', game: 'ab20' },
                { id: '3056', game: 'aaa' },
                { id: '3034', game: 'card32eu' },
                { id: '3032', game: 'lucky7eu' }
            ];
            // Fetch casino TV data for each stream
            for (const stream of casinoStreams) {
                try {
                    const tvData = await SmartCache_1.smartCache.get(`casino:tv:${stream.id}`, () => this.apiService.getCasinoTV(stream.id), { customTtl: 60 } // 1 minute cache
                    );
                    // Broadcast to casino room
                    await WebSocketManager_1.webSocketManager.broadcastToRoom(`casino:${stream.game}`, 'casino_tv_updated', {
                        game: stream.game,
                        streamId: stream.id,
                        data: tvData,
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.default.error(`❌ Error fetching casino TV for ${stream.game}:`, error);
                }
            }
            logger_1.default.info(`🎰 Published casino TV data for ${casinoStreams.length} streams`);
        }
        catch (error) {
            logger_1.default.error('❌ Error publishing casino TV data:', error);
        }
    }
    /**
     * Publish casino data for active casino rooms only
     */
    async publishCasinoData() {
        try {
            if (!WebSocketManager_1.webSocketManager)
                return;
            const activeCasinoRooms = WebSocketManager_1.webSocketManager.getActiveRooms('casino:');
            if (activeCasinoRooms.length === 0)
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:global'))
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:casino-data'))
                return;
            // Only poll games that have active users
            const activeGames = activeCasinoRooms.map(room => room.replace('casino:', ''));
            // Fetch casino data for active games only
            for (const game of activeGames) {
                try {
                    const gameData = await SmartCache_1.smartCache.get(`casino:data:${game}`, () => this.apiService.getCasinoGameData(game), { customTtl: 2 } // 2 seconds cache for live data
                    );
                    // Broadcast to casino room
                    await WebSocketManager_1.webSocketManager.broadcastToRoom(`casino:${game}`, 'casino_data_updated', {
                        game: game,
                        data: gameData,
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.default.error(`❌ Error fetching casino data for ${game}:`, error);
                }
            }
            logger_1.default.info(`🎰 Published casino data for ${activeGames.length} active games: ${activeGames.join(', ')}`);
        }
        catch (error) {
            logger_1.default.error('❌ Error publishing casino data:', error);
        }
    }
    /**
     * Publish casino results for active casino rooms only
     */
    async publishCasinoResults() {
        try {
            if (!WebSocketManager_1.webSocketManager)
                return;
            const activeCasinoRooms = WebSocketManager_1.webSocketManager.getActiveRooms('casino:');
            if (activeCasinoRooms.length === 0)
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:global'))
                return;
            if (!TokenBucketService_1.tokenBucketService.tryTake('provider:casino-results'))
                return;
            // Only poll games that have active users
            const activeGames = activeCasinoRooms.map(room => room.replace('casino:', ''));
            // Fetch casino results for active games only
            for (const game of activeGames) {
                try {
                    const resultsData = await SmartCache_1.smartCache.get(`casino:results:${game}`, () => this.apiService.getCasinoGameResults(game), { customTtl: 2 } // 2 seconds cache for live data
                    );
                    // Broadcast to casino room
                    await WebSocketManager_1.webSocketManager.broadcastToRoom(`casino:${game}`, 'casino_results_updated', {
                        game: game,
                        data: resultsData,
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.default.error(`❌ Error fetching casino results for ${game}:`, error);
                }
            }
            logger_1.default.info(`🎰 Published casino results for ${activeGames.length} active games: ${activeGames.join(', ')}`);
        }
        catch (error) {
            logger_1.default.error('❌ Error publishing casino results:', error);
        }
    }
    /**
     * Get active matches from user sessions
     */
    getActiveMatches() {
        if (!WebSocketManager_1.webSocketManager)
            return [];
        const activeMatches = new Set();
        const stats = WebSocketManager_1.webSocketManager.getStats();
        // In a real implementation, you'd get this from the WebSocketManager
        // For now, return a sample of active matches
        return Array.from(activeMatches);
    }
    /**
     * Batch fetch odds data
     */
    async batchFetchOdds(matchIds) {
        const results = new Map();
        // Process in batches to avoid overwhelming the API
        const batchSize = 5;
        for (let i = 0; i < matchIds.length; i += batchSize) {
            const batch = matchIds.slice(i, i + batchSize);
            const batchPromises = batch.map(async (matchId) => {
                try {
                    // Skip if in backoff window
                    if (this.shouldSkipBackoff(this.oddsBackoff, matchId)) {
                        return { matchId, odds: null };
                    }
                    const odds = await SmartCache_1.smartCache.get(`cricket:odds:${matchId}`, () => this.apiService.getCricketOdds(matchId));
                    // Success: reset backoff for this match
                    this.resetBackoff(this.oddsBackoff, matchId);
                    return { matchId, odds };
                }
                catch (error) {
                    this.registerBackoff(this.oddsBackoff, matchId, error);
                    return { matchId, odds: null };
                }
            });
            const batchResults = await Promise.all(batchPromises);
            batchResults.forEach(({ matchId, odds }) => {
                if (odds)
                    results.set(matchId, odds);
            });
            // Small delay between batches
            if (i + batchSize < matchIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        return results;
    }
    /**
     * Batch fetch scorecard data
     */
    async batchFetchScorecards(matchIds) {
        const results = new Map();
        const batchSize = 3;
        for (let i = 0; i < matchIds.length; i += batchSize) {
            const batch = matchIds.slice(i, i + batchSize);
            const batchPromises = batch.map(async (matchId) => {
                try {
                    // Skip if in backoff window
                    if (this.shouldSkipBackoff(this.scorecardBackoff, matchId)) {
                        return { matchId, scorecard: null };
                    }
                    const scorecard = await SmartCache_1.smartCache.get(`cricket:scorecard:${matchId}`, () => this.apiService.getCricketScorecard(matchId));
                    // Success: reset backoff for this match
                    this.resetBackoff(this.scorecardBackoff, matchId);
                    return { matchId, scorecard };
                }
                catch (error) {
                    this.registerBackoff(this.scorecardBackoff, matchId, error);
                    return { matchId, scorecard: null };
                }
            });
            const batchResults = await Promise.all(batchPromises);
            batchResults.forEach(({ matchId, scorecard }) => {
                if (scorecard)
                    results.set(matchId, scorecard);
            });
            // Delay between batches
            if (i + batchSize < matchIds.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        return results;
    }
    // ==== Step C: Backoff helpers (exponential backoff with jitter per match) ====
    shouldSkipBackoff(map, matchId) {
        const state = map.get(matchId);
        if (!state)
            return false;
        return Date.now() < state.untilMs;
    }
    registerBackoff(map, matchId, error) {
        const prev = map.get(matchId) || { attempts: 0, untilMs: 0 };
        const attempts = Math.min(prev.attempts + 1, 8);
        // Base delay 1s, doubles each attempt, capped (odds 15s, scorecard 30s)
        const isScorecard = map === this.scorecardBackoff;
        const capMs = isScorecard ? 30000 : 15000;
        let delay = Math.min(1000 * Math.pow(2, attempts - 1), capMs);
        // Add jitter ±20%
        const jitter = delay * 0.2 * (Math.random() * 2 - 1);
        delay = Math.max(500, Math.floor(delay + jitter));
        const untilMs = Date.now() + delay;
        map.set(matchId, { attempts, untilMs });
        logger_1.default.warn(`↩️ Backoff for ${isScorecard ? 'scorecard' : 'odds'} ${matchId} attempts=${attempts} delayMs=${delay} status=${error?.status || 'n/a'}`);
    }
    resetBackoff(map, matchId) {
        const prev = map.get(matchId);
        if (prev) {
            // Smooth recovery: step down attempts
            const attempts = Math.max(0, prev.attempts - 1);
            if (attempts === 0) {
                map.delete(matchId);
            }
            else {
                map.set(matchId, { attempts, untilMs: Date.now() });
            }
        }
    }
    /**
     * Publish specific match data to subscribed users
     */
    async publishMatchData(matchId, data) {
        if (!WebSocketManager_1.webSocketManager)
            return;
        await WebSocketManager_1.webSocketManager.broadcastToMatch(matchId, 'match_updated', {
            matchId,
            data,
            timestamp: Date.now()
        });
    }
    /**
     * Publish user-specific data
     */
    async publishUserData(userId, data) {
        if (!WebSocketManager_1.webSocketManager)
            return;
        await WebSocketManager_1.webSocketManager.broadcastToUser(userId, 'user_data_updated', {
            data,
            timestamp: Date.now()
        });
    }
    /**
     * Publish dashboard statistics
     */
    async publishDashboardStats() {
        try {
            const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
            const prisma = new PrismaClient();
            // Get various statistics
            const [totalUsers, activeUsers, totalMatches, liveMatches, pendingBets, totalBets, totalBalance, todayBets] = await Promise.all([
                // User statistics
                prisma.user.count(),
                prisma.user.count({ where: { status: 'ACTIVE' } }),
                // Match statistics
                prisma.match.count(),
                prisma.match.count({ where: { status: 'INPLAY' } }),
                // Bet statistics
                prisma.bet.count({ where: { status: 'PENDING' } }),
                prisma.bet.count(),
                // Balance statistics
                prisma.user.aggregate({
                    _sum: { limit: true }
                }),
                // Today's bets
                prisma.bet.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    }
                })
            ]);
            const dashboardStats = {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: totalUsers - activeUsers
                },
                matches: {
                    total: totalMatches,
                    live: liveMatches,
                    upcoming: await prisma.match.count({ where: { status: 'UPCOMING' } }),
                    closed: await prisma.match.count({ where: { status: 'COMPLETED' } })
                },
                bets: {
                    total: totalBets,
                    pending: pendingBets,
                    today: todayBets,
                    won: await prisma.bet.count({ where: { status: 'WON' } }),
                    lost: await prisma.bet.count({ where: { status: 'LOST' } })
                },
                financial: {
                    totalBalance: totalBalance._sum.limit || 0,
                    totalStake: await prisma.bet.aggregate({
                        _sum: { stake: true }
                    }).then(result => result._sum.stake || 0),
                    totalWinnings: await prisma.bet.aggregate({
                        where: { status: 'WON' },
                        _sum: { profitLoss: true }
                    }).then(result => result._sum.profitLoss || 0)
                }
            };
            if (WebSocketManager_1.webSocketManager) {
                await WebSocketManager_1.webSocketManager.broadcastToRoom('global:dashboard', 'dashboard_stats_updated', {
                    success: true,
                    data: dashboardStats,
                    timestamp: new Date().toISOString()
                });
            }
            logger_1.default.info(`📊 Published dashboard stats: ${activeUsers} active users, ${totalMatches} matches, ${totalBets} bets`);
            await prisma.$disconnect();
        }
        catch (error) {
            logger_1.default.error('❌ Error publishing dashboard stats:', error);
        }
    }
    /**
     * Stop all data publishing
     */
    stop() {
        this.isRunning = false;
        this.updateIntervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.updateIntervals.clear();
        logger_1.default.info('🛑 Stopped WebSocket data publishing service');
    }
    /**
     * Get publishing statistics
     */
    getStats() {
        const toArray = (map) => Array.from(map.entries()).map(([matchId, v]) => ({
            matchId,
            attempts: v.attempts,
            msRemaining: Math.max(0, v.untilMs - Date.now())
        }));
        return {
            isRunning: this.isRunning,
            activeIntervals: this.updateIntervals.size,
            intervals: Array.from(this.updateIntervals.keys()),
            backoff: {
                odds: toArray(this.oddsBackoff),
                scorecard: toArray(this.scorecardBackoff)
            }
        };
    }
}
exports.WebSocketDataPublisher = WebSocketDataPublisher;
exports.webSocketDataPublisher = new WebSocketDataPublisher();
//# sourceMappingURL=WebSocketDataPublisher.js.map