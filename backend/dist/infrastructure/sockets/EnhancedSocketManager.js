"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedSocketManager = void 0;
const logger_1 = require("../../monitoring/logging/logger");
const casinoRedisPublisher_1 = require("../../external-apis/casino/casinoRedisPublisher");
const EnhancedAPIService_1 = __importDefault(require("../../external-apis/EnhancedAPIService"));
class EnhancedSocketManager {
    constructor(io, redis) {
        this.rooms = new Map();
        this.clientRooms = new Map();
        this.stats = {
            totalConnections: 0,
            activeConnections: 0,
            totalRooms: 0,
            messagesSent: 0,
            errors: 0
        };
        this.io = io;
        this.redis = redis;
        this.redisPublisher = new casinoRedisPublisher_1.CasinoRedisPublisher(redis);
        this.enhancedAPIService = new EnhancedAPIService_1.default();
        this.setupSocketHandlers();
        this.setupRedisSubscriptions();
    }
    /**
     * Setup Socket.IO event handlers
     */
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            this.stats.totalConnections++;
            this.stats.activeConnections++;
            (0, logger_1.logInfo)(`🔌 Client connected: ${socket.id} (Total: ${this.stats.activeConnections})`);
            // Handle joining casino game rooms (support both legacy and new names)
            socket.on('join-casino-game', (data) => {
                this.joinCasinoGame(socket, data.gameType);
            });
            socket.on('join-casino', (payload) => {
                const gameType = typeof payload === 'string' ? payload : payload?.gameType;
                if (gameType)
                    this.joinCasinoGame(socket, gameType);
            });
            // Handle leaving casino game rooms (support both legacy and new names)
            socket.on('leave-casino-game', (data) => {
                this.leaveCasinoGame(socket, data.gameType);
            });
            socket.on('leave-casino', (payload) => {
                const gameType = typeof payload === 'string' ? payload : payload?.gameType;
                if (gameType)
                    this.leaveCasinoGame(socket, gameType);
            });
            // Handle joining cricket rooms
            socket.on('join-cricket', (data) => {
                this.joinCricketRoom(socket, data.beventId);
            });
            // Handle leaving cricket rooms
            socket.on('leave-cricket', (data) => {
                this.leaveCricketRoom(socket, data.beventId);
            });
            // Handle manual data refresh requests
            socket.on('refresh-data', async (data) => {
                await this.handleRefreshRequest(socket, data);
            });
            // Handle client disconnect
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
            // Send initial connection confirmation
            socket.emit('connected', {
                message: 'Connected to enhanced real-time service',
                timestamp: new Date().toISOString(),
                features: ['casino-games', 'cricket', 'rate-limiting', 'queue-management']
            });
        });
    }
    /**
     * Setup Redis subscriptions for real-time updates
     */
    setupRedisSubscriptions() {
        // Subscribe to all casino game channels
        const casinoGames = ['teen20', 'ab20', 'dt20', 'aaa', 'card32eu', 'lucky7eu'];
        casinoGames.forEach(gameType => {
            const channel = `casino_${gameType}`;
            this.redis.subscribe(channel, (err) => {
                if (err) {
                    (0, logger_1.logError)(`❌ Failed to subscribe to ${channel}:`, err);
                }
                else {
                    (0, logger_1.logInfo)(`📡 Subscribed to ${channel}`);
                }
            });
        });
        // Subscribe to cricket channels
        this.redis.subscribe('cricket_scorecard', (err) => {
            if (err) {
                (0, logger_1.logError)('❌ Failed to subscribe to cricket_scorecard:', err);
            }
            else {
                (0, logger_1.logInfo)('📡 Subscribed to cricket_scorecard');
            }
        });
        this.redis.subscribe('cricket_odds', (err) => {
            if (err) {
                (0, logger_1.logError)('❌ Failed to subscribe to cricket_odds:', err);
            }
            else {
                (0, logger_1.logInfo)('📡 Subscribed to cricket_odds');
            }
        });
        // Handle incoming Redis messages
        this.redis.on('message', (channel, message) => {
            this.handleRedisMessage(channel, message);
        });
    }
    /**
     * Handle incoming Redis messages and broadcast to appropriate rooms
     */
    handleRedisMessage(channel, message) {
        try {
            const data = JSON.parse(message);
            if (channel.startsWith('casino_')) {
                const gameType = channel.replace('casino_', '');
                this.broadcastToCasinoRoom(gameType, data);
            }
            else if (channel.startsWith('cricket_')) {
                this.broadcastToCricketRoom(data);
            }
            this.stats.messagesSent++;
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Error handling Redis message from ${channel}:`, error);
            this.stats.errors++;
        }
    }
    /**
     * Join casino game room
     */
    joinCasinoGame(socket, gameType) {
        const roomName = `casino_${gameType}`;
        // Create room if it doesn't exist
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, {
                name: roomName,
                clients: new Set(),
                gameType,
                dataType: 'casino'
            });
            this.stats.totalRooms++;
        }
        // Add client to room
        const room = this.rooms.get(roomName);
        room.clients.add(socket.id);
        socket.join(roomName);
        // Track client rooms
        if (!this.clientRooms.has(socket.id)) {
            this.clientRooms.set(socket.id, new Set());
        }
        this.clientRooms.get(socket.id).add(roomName);
        (0, logger_1.logInfo)(`🎰 Client ${socket.id} joined casino game: ${gameType} (Room: ${roomName})`);
        // Send current data if available
        this.sendCurrentCasinoData(socket, gameType);
    }
    /**
     * Leave casino game room
     */
    leaveCasinoGame(socket, gameType) {
        const roomName = `casino_${gameType}`;
        const room = this.rooms.get(roomName);
        if (room) {
            room.clients.delete(socket.id);
            socket.leave(roomName);
            // Remove client from tracking
            const clientRooms = this.clientRooms.get(socket.id);
            if (clientRooms) {
                clientRooms.delete(roomName);
            }
            // Clean up empty room
            if (room.clients.size === 0) {
                this.rooms.delete(roomName);
                this.stats.totalRooms--;
            }
            (0, logger_1.logInfo)(`🎰 Client ${socket.id} left casino game: ${gameType}`);
        }
    }
    /**
     * Join cricket room
     */
    joinCricketRoom(socket, beventId) {
        const roomName = `cricket_${beventId}`;
        // Create room if it doesn't exist
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, {
                name: roomName,
                clients: new Set(),
                dataType: 'cricket'
            });
            this.stats.totalRooms++;
        }
        // Add client to room
        const room = this.rooms.get(roomName);
        room.clients.add(socket.id);
        socket.join(roomName);
        // Track client rooms
        if (!this.clientRooms.has(socket.id)) {
            this.clientRooms.set(socket.id, new Set());
        }
        this.clientRooms.get(socket.id).add(roomName);
        (0, logger_1.logInfo)(`🏏 Client ${socket.id} joined cricket room: ${beventId}`);
        // Send current data if available
        this.sendCurrentCricketData(socket, beventId);
    }
    /**
     * Leave cricket room
     */
    leaveCricketRoom(socket, beventId) {
        const roomName = `cricket_${beventId}`;
        const room = this.rooms.get(roomName);
        if (room) {
            room.clients.delete(socket.id);
            socket.leave(roomName);
            // Remove client from tracking
            const clientRooms = this.clientRooms.get(socket.id);
            if (clientRooms) {
                clientRooms.delete(roomName);
            }
            // Clean up empty room
            if (room.clients.size === 0) {
                this.rooms.delete(roomName);
                this.stats.totalRooms--;
            }
            (0, logger_1.logInfo)(`🏏 Client ${socket.id} left cricket room: ${beventId}`);
        }
    }
    /**
     * Handle manual data refresh requests
     */
    async handleRefreshRequest(socket, data) {
        try {
            let requestId;
            if (data.type === 'casino_data' && data.gameType) {
                requestId = await this.enhancedAPIService.queueCasinoData(data.gameType, undefined, 1);
            }
            else if (data.type === 'casino_results' && data.gameType) {
                requestId = await this.enhancedAPIService.queueCasinoResults(data.gameType, undefined, 1);
            }
            else if (data.type === 'cricket_scorecard' && data.beventId) {
                requestId = await this.enhancedAPIService.queueCricketScorecard(data.beventId, 1);
            }
            else if (data.type === 'cricket_odds' && data.beventId) {
                requestId = await this.enhancedAPIService.queueCricketOdds(data.beventId, 1);
            }
            socket.emit('refresh-queued', {
                type: data.type,
                requestId,
                message: 'Refresh request queued successfully',
                timestamp: new Date().toISOString()
            });
            (0, logger_1.logInfo)(`🔄 Client ${socket.id} requested refresh: ${data.type} for ${data.gameType || data.beventId}`);
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Error handling refresh request from ${socket.id}:`, error);
            socket.emit('refresh-error', {
                type: data.type,
                error: 'Failed to queue refresh request',
                timestamp: new Date().toISOString()
            });
        }
    }
    /**
     * Send current casino data to client
     */
    async sendCurrentCasinoData(socket, gameType) {
        try {
            // Queue a request for current data
            const requestId = await this.enhancedAPIService.queueCasinoData(gameType, undefined, 1);
            socket.emit('data-requested', {
                gameType,
                requestId,
                message: 'Current data requested',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Error requesting current casino data for ${gameType}:`, error);
        }
    }
    /**
     * Send current cricket data to client
     */
    async sendCurrentCricketData(socket, beventId) {
        try {
            // Queue requests for current data
            const scorecardId = await this.enhancedAPIService.queueCricketScorecard(beventId, 1);
            const oddsId = await this.enhancedAPIService.queueCricketOdds(beventId, 1);
            socket.emit('data-requested', {
                beventId,
                scorecardId,
                oddsId,
                message: 'Current data requested',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Error requesting current cricket data for ${beventId}:`, error);
        }
    }
    /**
     * Broadcast to casino room
     */
    broadcastToCasinoRoom(gameType, data) {
        const roomName = `casino_${gameType}`;
        const room = this.rooms.get(roomName);
        if (room && room.clients.size > 0) {
            // Emit both hyphen and underscore variants for compatibility with clients
            this.io.to(roomName).emit('casino-update', {
                gameType,
                data,
                timestamp: new Date().toISOString()
            });
            this.io.to(roomName).emit('casino_update', {
                gameType,
                data,
                timestamp: new Date().toISOString()
            });
            (0, logger_1.logInfo)(`📡 Broadcasted casino update to ${room.clients.size} clients in ${roomName}`);
        }
    }
    /**
     * Broadcast to cricket room
     */
    broadcastToCricketRoom(data) {
        // For cricket, we need to determine which rooms to broadcast to
        // This would depend on the data structure and beventId
        this.rooms.forEach((room, roomName) => {
            if (room.dataType === 'cricket' && room.clients.size > 0) {
                this.io.to(roomName).emit('cricket-update', {
                    data,
                    timestamp: new Date().toISOString()
                });
                (0, logger_1.logInfo)(`📡 Broadcasted cricket update to ${room.clients.size} clients in ${roomName}`);
            }
        });
    }
    /**
     * Handle client disconnect
     */
    handleDisconnect(socket) {
        this.stats.activeConnections--;
        // Remove client from all rooms
        const clientRooms = this.clientRooms.get(socket.id);
        if (clientRooms) {
            clientRooms.forEach(roomName => {
                const room = this.rooms.get(roomName);
                if (room) {
                    room.clients.delete(socket.id);
                    // Clean up empty room
                    if (room.clients.size === 0) {
                        this.rooms.delete(roomName);
                        this.stats.totalRooms--;
                    }
                }
            });
            this.clientRooms.delete(socket.id);
        }
        (0, logger_1.logInfo)(`🔌 Client disconnected: ${socket.id} (Active: ${this.stats.activeConnections})`);
    }
    /**
     * Get manager statistics
     */
    getStats() {
        const apiStats = this.enhancedAPIService.getStats();
        return {
            socket: {
                ...this.stats,
                rooms: Array.from(this.rooms.keys()),
                roomDetails: Array.from(this.rooms.values()).map(room => ({
                    name: room.name,
                    clients: room.clients.size,
                    gameType: room.gameType,
                    dataType: room.dataType
                }))
            },
            api: apiStats
        };
    }
    /**
     * Get detailed status for monitoring
     */
    getDetailedStatus() {
        return {
            stats: this.getStats(),
            rateLimiterStatus: this.enhancedAPIService.getRateLimiterStatus(),
            queueStatus: this.enhancedAPIService.getQueueStats()
        };
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        this.rooms.clear();
        this.clientRooms.clear();
        this.enhancedAPIService.reset();
        (0, logger_1.logInfo)('🧹 Cleaned up enhanced socket manager');
    }
}
exports.EnhancedSocketManager = EnhancedSocketManager;
exports.default = EnhancedSocketManager;
//# sourceMappingURL=EnhancedSocketManager.js.map