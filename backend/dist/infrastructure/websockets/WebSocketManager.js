"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocketManager = exports.webSocketManager = exports.WebSocketManager = void 0;
const redis_1 = require("../redis/redis");
const logger_1 = __importDefault(require("../../monitoring/logging/logger"));
class WebSocketManager {
    constructor(io) {
        this.userSessions = new Map();
        this.roomData = new Map();
        this.redis = (0, redis_1.getRedisClient)();
        this.cleanupInterval = null;
        this.io = io;
        this.setupEventHandlers();
        this.startCleanupInterval();
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }
    handleConnection(socket) {
        const userId = socket.handshake.query.userId || 'anonymous';
        logger_1.default.info(`🔌 New WebSocket connection: ${socket.id} for user: ${userId}`);
        // Create user session
        const session = {
            userId,
            socketId: socket.id,
            rooms: new Set(),
            lastActivity: Date.now(),
            preferences: {
                favoriteMatches: [],
                autoRefresh: true,
                refreshInterval: 30
            }
        };
        this.userSessions.set(socket.id, session);
        // Join user-specific room and track subscriber
        const userRoom = `user:${userId}`;
        socket.join(userRoom);
        this.addSubscriber(userRoom, 'user', socket.id);
        // Handle room subscriptions
        socket.on('join_room', (data) => {
            this.handleJoinRoom(socket, data);
        });
        socket.on('leave_room', (data) => {
            this.handleLeaveRoom(socket, data);
        });
        socket.on('subscribe_match', (data) => {
            this.handleSubscribeMatch(socket, data);
        });
        socket.on('unsubscribe_match', (data) => {
            this.handleUnsubscribeMatch(socket, data);
        });
        socket.on('update_preferences', (data) => {
            this.handleUpdatePreferences(socket, data);
        });
        socket.on('request_data', (data) => {
            this.handleDataRequest(socket, data);
        });
        // Handle casino room joining
        socket.on('join_casino_room', (data) => {
            this.handleJoinCasinoRoom(socket, data);
        });
        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });
        // Send initial data
        this.sendInitialData(socket, userId);
    }
    async handleJoinRoom(socket, data) {
        const session = this.userSessions.get(socket.id);
        if (!session)
            return;
        const { roomId, type } = data;
        const fullRoomId = `${type}:${roomId}`;
        socket.join(fullRoomId);
        session.rooms.add(fullRoomId);
        session.lastActivity = Date.now();
        logger_1.default.info(`👤 User ${session.userId} joined room: ${fullRoomId}`);
        // Track subscriber
        this.addSubscriber(fullRoomId, type || 'match', socket.id);
        // Send room data if available
        const roomData = this.roomData.get(fullRoomId);
        if (roomData) {
            socket.emit('room_data', {
                roomId: fullRoomId,
                data: roomData.data,
                timestamp: roomData.lastUpdate
            });
        }
    }
    async handleLeaveRoom(socket, data) {
        const session = this.userSessions.get(socket.id);
        if (!session)
            return;
        const { roomId } = data;
        const fullRoomId = roomId.includes(':') ? roomId : `match:${roomId}`;
        socket.leave(fullRoomId);
        session.rooms.delete(fullRoomId);
        session.lastActivity = Date.now();
        logger_1.default.info(`👤 User ${session.userId} left room: ${fullRoomId}`);
        // Untrack subscriber
        this.removeSubscriber(fullRoomId, socket.id);
    }
    async handleJoinCasinoRoom(socket, data) {
        const session = this.userSessions.get(socket.id);
        if (!session)
            return;
        const { game } = data;
        const roomId = `casino:${game}`;
        socket.join(roomId);
        session.rooms.add(roomId);
        session.lastActivity = Date.now();
        logger_1.default.info(`🎰 User ${session.userId} joined casino room: ${roomId}`);
        // Track subscriber
        this.addSubscriber(roomId, 'casino', socket.id);
        // Send room data if available
        const roomData = this.roomData.get(roomId);
        if (roomData) {
            socket.emit('room_data', {
                roomId: roomId,
                data: roomData.data,
                timestamp: roomData.lastUpdate
            });
        }
    }
    async handleSubscribeMatch(socket, data) {
        const session = this.userSessions.get(socket.id);
        if (!session)
            return;
        const { matchId } = data;
        const roomId = `match:${matchId}`;
        // Join match room
        socket.join(roomId);
        session.rooms.add(roomId);
        session.preferences.favoriteMatches.push(matchId);
        // Remove duplicates
        session.preferences.favoriteMatches = [...new Set(session.preferences.favoriteMatches)];
        logger_1.default.info(`📺 User ${session.userId} subscribed to match: ${matchId}`);
        // Send current match data
        const matchData = this.roomData.get(roomId);
        if (matchData) {
            socket.emit('match_data', {
                matchId,
                data: matchData.data,
                timestamp: matchData.lastUpdate
            });
        }
        // Track subscriber
        this.addSubscriber(roomId, 'match', socket.id);
    }
    async handleUnsubscribeMatch(socket, data) {
        const session = this.userSessions.get(socket.id);
        if (!session)
            return;
        const { matchId } = data;
        const roomId = `match:${matchId}`;
        socket.leave(roomId);
        session.rooms.delete(roomId);
        session.preferences.favoriteMatches = session.preferences.favoriteMatches.filter(id => id !== matchId);
        logger_1.default.info(`📺 User ${session.userId} unsubscribed from match: ${matchId}`);
        // Untrack subscriber
        this.removeSubscriber(roomId, socket.id);
    }
    async handleUpdatePreferences(socket, data) {
        const session = this.userSessions.get(socket.id);
        if (!session)
            return;
        session.preferences = { ...session.preferences, ...data };
        session.lastActivity = Date.now();
        logger_1.default.info(`⚙️ User ${session.userId} updated preferences:`, data);
        // Rejoin rooms based on new preferences
        this.updateUserSubscriptions(socket, session);
    }
    async handleDataRequest(socket, data) {
        const session = this.userSessions.get(socket.id);
        if (!session)
            return;
        const { type, matchId } = data;
        switch (type) {
            case 'matches':
                this.sendMatchesData(socket);
                break;
            case 'match_details':
                if (matchId) {
                    this.sendMatchDetails(socket, matchId);
                }
                break;
            case 'odds':
                if (matchId) {
                    this.sendOddsData(socket, matchId);
                }
                break;
            case 'scorecard':
                if (matchId) {
                    this.sendScorecardData(socket, matchId);
                }
                break;
        }
    }
    handleDisconnect(socket) {
        const session = this.userSessions.get(socket.id);
        if (session) {
            logger_1.default.info(`👤 User ${session.userId} disconnected`);
            // Remove from all rooms' subscriber sets
            session.rooms.forEach(roomId => this.removeSubscriber(roomId, socket.id));
            this.userSessions.delete(socket.id);
        }
    }
    async sendInitialData(socket, userId) {
        try {
            // Send basic matches data
            this.sendMatchesData(socket);
            // Send user-specific data if available
            const userRoom = `user:${userId}`;
            const userData = this.roomData.get(userRoom);
            if (userData) {
                socket.emit('user_data', {
                    data: userData.data,
                    timestamp: userData.lastUpdate
                });
            }
        }
        catch (error) {
            logger_1.default.error('❌ Error sending initial data:', error);
        }
    }
    async sendMatchesData(socket) {
        try {
            const matchesData = this.roomData.get('global:matches');
            if (matchesData) {
                socket.emit('matches_data', {
                    data: matchesData.data,
                    timestamp: matchesData.lastUpdate
                });
            }
        }
        catch (error) {
            logger_1.default.error('❌ Error sending matches data:', error);
        }
    }
    async sendMatchDetails(socket, matchId) {
        try {
            const roomId = `match:${matchId}`;
            const matchData = this.roomData.get(roomId);
            if (matchData) {
                socket.emit('match_details', {
                    matchId,
                    data: matchData.data,
                    timestamp: matchData.lastUpdate
                });
            }
        }
        catch (error) {
            logger_1.default.error(`❌ Error sending match details for ${matchId}:`, error);
        }
    }
    async sendOddsData(socket, matchId) {
        try {
            const roomId = `odds:${matchId}`;
            const oddsData = this.roomData.get(roomId);
            if (oddsData) {
                socket.emit('odds_data', {
                    matchId,
                    data: oddsData.data,
                    timestamp: oddsData.lastUpdate
                });
            }
        }
        catch (error) {
            logger_1.default.error(`❌ Error sending odds data for ${matchId}:`, error);
        }
    }
    async sendScorecardData(socket, matchId) {
        try {
            const roomId = `scorecard:${matchId}`;
            const scorecardData = this.roomData.get(roomId);
            if (scorecardData) {
                socket.emit('scorecard_data', {
                    matchId,
                    data: scorecardData.data,
                    timestamp: scorecardData.lastUpdate
                });
            }
        }
        catch (error) {
            logger_1.default.error(`❌ Error sending scorecard data for ${matchId}:`, error);
        }
    }
    updateUserSubscriptions(socket, session) {
        // Leave all current rooms
        session.rooms.forEach(roomId => {
            socket.leave(roomId);
        });
        session.rooms.clear();
        // Rejoin based on preferences
        session.rooms.add(`user:${session.userId}`);
        if (session.preferences.favoriteMatches.length > 0) {
            session.preferences.favoriteMatches.forEach(matchId => {
                const roomId = `match:${matchId}`;
                socket.join(roomId);
                session.rooms.add(roomId);
            });
        }
    }
    // Public methods for broadcasting data
    async broadcastToRoom(roomId, event, data) {
        try {
            // Change detection (Step D): skip if payload hasn't changed
            const existing = this.roomData.get(roomId);
            const newHash = this.computeHash(data);
            if (existing && existing.hash === newHash) {
                logger_1.default.info(`⏭️ Skipped broadcast (unchanged) for room: ${roomId}`);
                return;
            }
            this.io.to(roomId).emit(event, data);
            // Update room data cache
            this.roomData.set(roomId, {
                roomId,
                type: roomId.split(':')[0],
                subscribers: existing?.subscribers || new Set(),
                lastUpdate: Date.now(),
                data,
                hash: newHash
            });
            logger_1.default.info(`📡 Broadcasted ${event} to room: ${roomId}`);
        }
        catch (error) {
            logger_1.default.error(`❌ Error broadcasting to room ${roomId}:`, error);
        }
    }
    async broadcastToUser(userId, event, data) {
        try {
            this.io.to(`user:${userId}`).emit(event, data);
            logger_1.default.info(`📡 Broadcasted ${event} to user: ${userId}`);
        }
        catch (error) {
            logger_1.default.error(`❌ Error broadcasting to user ${userId}:`, error);
        }
    }
    async broadcastToMatch(matchId, event, data) {
        const roomId = `match:${matchId}`;
        await this.broadcastToRoom(roomId, event, data);
    }
    async broadcastToAll(event, data) {
        try {
            this.io.emit(event, data);
            logger_1.default.info(`📡 Broadcasted ${event} to all connected clients`);
        }
        catch (error) {
            logger_1.default.error(`❌ Error broadcasting to all:`, error);
        }
    }
    // Cleanup inactive sessions
    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveSessions();
        }, 60000); // Every minute
    }
    cleanupInactiveSessions() {
        const now = Date.now();
        const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
        for (const [socketId, session] of this.userSessions.entries()) {
            if (now - session.lastActivity > inactiveThreshold) {
                logger_1.default.info(`🧹 Cleaning up inactive session: ${session.userId}`);
                session.rooms.forEach(roomId => this.removeSubscriber(roomId, socketId));
                this.userSessions.delete(socketId);
            }
        }
    }
    // Get statistics
    getStats() {
        const rooms = {};
        for (const [roomId, data] of this.roomData.entries()) {
            rooms[roomId] = data.subscribers?.size || 0;
        }
        return {
            connectedUsers: this.userSessions.size,
            activeRooms: this.roomData.size,
            totalConnections: this.io.engine.clientsCount,
            rooms
        };
    }
    // Cleanup on shutdown
    cleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.userSessions.clear();
        this.roomData.clear();
    }
    // --- Subscriber helpers & room queries ---
    computeHash(payload) {
        try {
            const s = JSON.stringify(payload);
            let hash = 5381;
            for (let i = 0; i < s.length; i++) {
                hash = ((hash << 5) + hash) ^ s.charCodeAt(i);
            }
            return (hash >>> 0).toString(16);
        }
        catch {
            return Date.now().toString(16);
        }
    }
    addSubscriber(roomId, type, socketId) {
        const existing = this.roomData.get(roomId);
        if (existing) {
            existing.subscribers?.add(socketId);
            this.roomData.set(roomId, existing);
        }
        else {
            this.roomData.set(roomId, {
                roomId,
                type,
                subscribers: new Set([socketId]),
                lastUpdate: Date.now(),
                data: null
            });
        }
    }
    removeSubscriber(roomId, socketId) {
        const data = this.roomData.get(roomId);
        if (data && data.subscribers) {
            data.subscribers.delete(socketId);
            this.roomData.set(roomId, data);
        }
    }
    hasSubscribers(roomId) {
        const data = this.roomData.get(roomId);
        return !!(data && data.subscribers && data.subscribers.size > 0);
    }
    getSubscriberCount(roomId) {
        const data = this.roomData.get(roomId);
        return data?.subscribers?.size || 0;
    }
    getActiveRooms(prefix) {
        const rooms = [];
        for (const [roomId, data] of this.roomData.entries()) {
            if (data.subscribers && data.subscribers.size > 0) {
                if (!prefix || roomId.startsWith(prefix))
                    rooms.push(roomId);
            }
        }
        return rooms;
    }
}
exports.WebSocketManager = WebSocketManager;
exports.webSocketManager = null;
const initializeWebSocketManager = (io) => {
    exports.webSocketManager = new WebSocketManager(io);
    return exports.webSocketManager;
};
exports.initializeWebSocketManager = initializeWebSocketManager;
//# sourceMappingURL=WebSocketManager.js.map