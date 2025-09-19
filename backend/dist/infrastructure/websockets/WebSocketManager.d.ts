import { Server as SocketIOServer } from 'socket.io';
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
    type: 'match' | 'user' | 'global' | 'casino';
    subscribers: Set<string>;
    lastUpdate: number;
    data: any;
    hash?: string;
}
export declare class WebSocketManager {
    private io;
    private userSessions;
    private roomData;
    private redis;
    private cleanupInterval;
    constructor(io: SocketIOServer);
    private setupEventHandlers;
    private handleConnection;
    private handleJoinRoom;
    private handleLeaveRoom;
    private handleJoinCasinoRoom;
    private handleSubscribeMatch;
    private handleUnsubscribeMatch;
    private handleUpdatePreferences;
    private handleDataRequest;
    private handleDisconnect;
    private sendInitialData;
    private sendMatchesData;
    private sendMatchDetails;
    private sendOddsData;
    private sendScorecardData;
    private updateUserSubscriptions;
    broadcastToRoom(roomId: string, event: string, data: any): Promise<void>;
    broadcastToUser(userId: string, event: string, data: any): Promise<void>;
    broadcastToMatch(matchId: string, event: string, data: any): Promise<void>;
    broadcastToAll(event: string, data: any): Promise<void>;
    private startCleanupInterval;
    private cleanupInactiveSessions;
    getStats(): {
        connectedUsers: number;
        activeRooms: number;
        totalConnections: number;
        rooms: Record<string, number>;
    };
    cleanup(): void;
    private computeHash;
    private addSubscriber;
    private removeSubscriber;
    hasSubscribers(roomId: string): boolean;
    getSubscriberCount(roomId: string): number;
    getActiveRooms(prefix?: string): string[];
}
export declare let webSocketManager: WebSocketManager | null;
export declare const initializeWebSocketManager: (io: SocketIOServer) => WebSocketManager;
//# sourceMappingURL=WebSocketManager.d.ts.map