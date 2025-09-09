import { Server as SocketIOServer, Socket } from 'socket.io';
import { getRedisClient } from '../redis/redis';
import logger from '../../monitoring/logging/logger';

export interface UserSession {
  userId: string;
  socketId: string;
  rooms: Set<string>;
  lastActivity: number;
  preferences: {
    favoriteMatches: string[];
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

export interface RoomData {
  roomId: string;
  type: 'match' | 'user' | 'global';
  subscribers: Set<string>;
  lastUpdate: number;
  data: any;
  hash?: string;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private userSessions = new Map<string, UserSession>();
  private roomData = new Map<string, RoomData>();
  private redis = getRedisClient();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
    this.startCleanupInterval();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string || 'anonymous';
    
    logger.info(`🔌 New WebSocket connection: ${socket.id} for user: ${userId}`);

    // Create user session
    const session: UserSession = {
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
    socket.on('join_room', (data: { roomId: string; type: string }) => {
      this.handleJoinRoom(socket, data);
    });

    socket.on('leave_room', (data: { roomId: string }) => {
      this.handleLeaveRoom(socket, data);
    });

    socket.on('subscribe_match', (data: { matchId: string }) => {
      this.handleSubscribeMatch(socket, data);
    });

    socket.on('unsubscribe_match', (data: { matchId: string }) => {
      this.handleUnsubscribeMatch(socket, data);
    });

    socket.on('update_preferences', (data: any) => {
      this.handleUpdatePreferences(socket, data);
    });

    socket.on('request_data', (data: { type: string; matchId?: string }) => {
      this.handleDataRequest(socket, data);
    });

    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });

    // Send initial data
    this.sendInitialData(socket, userId);
  }

  private async handleJoinRoom(socket: Socket, data: { roomId: string; type: string }) {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    const { roomId, type } = data;
    const fullRoomId = `${type}:${roomId}`;

    socket.join(fullRoomId);
    session.rooms.add(fullRoomId);
    session.lastActivity = Date.now();

    logger.info(`👤 User ${session.userId} joined room: ${fullRoomId}`);

    // Track subscriber
    this.addSubscriber(fullRoomId, (type as any) || 'match', socket.id);

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

  private async handleLeaveRoom(socket: Socket, data: { roomId: string }) {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    const { roomId } = data;
    const fullRoomId = roomId.includes(':') ? roomId : `match:${roomId}`;

    socket.leave(fullRoomId);
    session.rooms.delete(fullRoomId);
    session.lastActivity = Date.now();

    logger.info(`👤 User ${session.userId} left room: ${fullRoomId}`);

    // Untrack subscriber
    this.removeSubscriber(fullRoomId, socket.id);
  }

  private async handleSubscribeMatch(socket: Socket, data: { matchId: string }) {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    const { matchId } = data;
    const roomId = `match:${matchId}`;

    // Join match room
    socket.join(roomId);
    session.rooms.add(roomId);
    session.preferences.favoriteMatches.push(matchId);

    // Remove duplicates
    session.preferences.favoriteMatches = [...new Set(session.preferences.favoriteMatches)];

    logger.info(`📺 User ${session.userId} subscribed to match: ${matchId}`);

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

  private async handleUnsubscribeMatch(socket: Socket, data: { matchId: string }) {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    const { matchId } = data;
    const roomId = `match:${matchId}`;

    socket.leave(roomId);
    session.rooms.delete(roomId);
    session.preferences.favoriteMatches = session.preferences.favoriteMatches.filter(
      id => id !== matchId
    );

    logger.info(`📺 User ${session.userId} unsubscribed from match: ${matchId}`);

    // Untrack subscriber
    this.removeSubscriber(roomId, socket.id);
  }

  private async handleUpdatePreferences(socket: Socket, data: any) {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

    session.preferences = { ...session.preferences, ...data };
    session.lastActivity = Date.now();

    logger.info(`⚙️ User ${session.userId} updated preferences:`, data);

    // Rejoin rooms based on new preferences
    this.updateUserSubscriptions(socket, session);
  }

  private async handleDataRequest(socket: Socket, data: { type: string; matchId?: string }) {
    const session = this.userSessions.get(socket.id);
    if (!session) return;

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

  private handleDisconnect(socket: Socket) {
    const session = this.userSessions.get(socket.id);
    if (session) {
      logger.info(`👤 User ${session.userId} disconnected`);
      // Remove from all rooms' subscriber sets
      session.rooms.forEach(roomId => this.removeSubscriber(roomId, socket.id));
      this.userSessions.delete(socket.id);
    }
  }

  private async sendInitialData(socket: Socket, userId: string) {
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
    } catch (error) {
      logger.error('❌ Error sending initial data:', error);
    }
  }

  private async sendMatchesData(socket: Socket) {
    try {
      const matchesData = this.roomData.get('global:matches');
      if (matchesData) {
        socket.emit('matches_data', {
          data: matchesData.data,
          timestamp: matchesData.lastUpdate
        });
      }
    } catch (error) {
      logger.error('❌ Error sending matches data:', error);
    }
  }

  private async sendMatchDetails(socket: Socket, matchId: string) {
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
    } catch (error) {
      logger.error(`❌ Error sending match details for ${matchId}:`, error);
    }
  }

  private async sendOddsData(socket: Socket, matchId: string) {
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
    } catch (error) {
      logger.error(`❌ Error sending odds data for ${matchId}:`, error);
    }
  }

  private async sendScorecardData(socket: Socket, matchId: string) {
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
    } catch (error) {
      logger.error(`❌ Error sending scorecard data for ${matchId}:`, error);
    }
  }

  private updateUserSubscriptions(socket: Socket, session: UserSession) {
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
  public async broadcastToRoom(roomId: string, event: string, data: any) {
    try {
      // Change detection (Step D): skip if payload hasn't changed
      const existing = this.roomData.get(roomId);
      const newHash = this.computeHash(data);
      if (existing && existing.hash === newHash) {
        logger.info(`⏭️ Skipped broadcast (unchanged) for room: ${roomId}`);
        return;
      }

      this.io.to(roomId).emit(event, data);

      // Update room data cache
      this.roomData.set(roomId, {
        roomId,
        type: roomId.split(':')[0] as any,
        subscribers: existing?.subscribers || new Set<string>(),
        lastUpdate: Date.now(),
        data,
        hash: newHash
      });

      logger.info(`📡 Broadcasted ${event} to room: ${roomId}`);
    } catch (error) {
      logger.error(`❌ Error broadcasting to room ${roomId}:`, error);
    }
  }

  public async broadcastToUser(userId: string, event: string, data: any) {
    try {
      this.io.to(`user:${userId}`).emit(event, data);
      logger.info(`📡 Broadcasted ${event} to user: ${userId}`);
    } catch (error) {
      logger.error(`❌ Error broadcasting to user ${userId}:`, error);
    }
  }

  public async broadcastToMatch(matchId: string, event: string, data: any) {
    const roomId = `match:${matchId}`;
    await this.broadcastToRoom(roomId, event, data);
  }

  public async broadcastToAll(event: string, data: any) {
    try {
      this.io.emit(event, data);
      logger.info(`📡 Broadcasted ${event} to all connected clients`);
    } catch (error) {
      logger.error(`❌ Error broadcasting to all:`, error);
    }
  }

  // Cleanup inactive sessions
  private startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 60000); // Every minute
  }

  private cleanupInactiveSessions() {
    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [socketId, session] of this.userSessions.entries()) {
      if (now - session.lastActivity > inactiveThreshold) {
        logger.info(`🧹 Cleaning up inactive session: ${session.userId}`);
        session.rooms.forEach(roomId => this.removeSubscriber(roomId, socketId));
        this.userSessions.delete(socketId);
      }
    }
  }

  // Get statistics
  public getStats() {
    const rooms: Record<string, number> = {};
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
  public cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.userSessions.clear();
    this.roomData.clear();
  }

  // --- Subscriber helpers & room queries ---
  private computeHash(payload: any): string {
    try {
      const s = JSON.stringify(payload);
      let hash = 5381;
      for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) + hash) ^ s.charCodeAt(i);
      }
      return (hash >>> 0).toString(16);
    } catch {
      return Date.now().toString(16);
    }
  }

  private addSubscriber(roomId: string, type: 'match' | 'user' | 'global', socketId: string) {
    const existing = this.roomData.get(roomId);
    if (existing) {
      existing.subscribers?.add(socketId);
      this.roomData.set(roomId, existing);
    } else {
      this.roomData.set(roomId, {
        roomId,
        type,
        subscribers: new Set<string>([socketId]),
        lastUpdate: Date.now(),
        data: null
      });
    }
  }

  private removeSubscriber(roomId: string, socketId: string) {
    const data = this.roomData.get(roomId);
    if (data && data.subscribers) {
      data.subscribers.delete(socketId);
      this.roomData.set(roomId, data);
    }
  }

  public hasSubscribers(roomId: string): boolean {
    const data = this.roomData.get(roomId);
    return !!(data && data.subscribers && data.subscribers.size > 0);
  }

  public getSubscriberCount(roomId: string): number {
    const data = this.roomData.get(roomId);
    return data?.subscribers?.size || 0;
  }

  public getActiveRooms(prefix?: string): string[] {
    const rooms: string[] = [];
    for (const [roomId, data] of this.roomData.entries()) {
      if (data.subscribers && data.subscribers.size > 0) {
        if (!prefix || roomId.startsWith(prefix)) rooms.push(roomId);
      }
    }
    return rooms;
  }
}

export let webSocketManager: WebSocketManager | null = null;

export const initializeWebSocketManager = (io: SocketIOServer) => {
  webSocketManager = new WebSocketManager(io);
  return webSocketManager;
};
