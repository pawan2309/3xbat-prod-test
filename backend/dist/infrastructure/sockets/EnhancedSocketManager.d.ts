import { Server as SocketIOServer } from 'socket.io';
import { RedisClientType } from 'redis';
export interface SocketRoom {
    name: string;
    clients: Set<string>;
    gameType?: string;
    dataType?: string;
}
export declare class EnhancedSocketManager {
    private io;
    private redis;
    private redisPublisher;
    private enhancedAPIService;
    private rooms;
    private clientRooms;
    private stats;
    constructor(io: SocketIOServer, redis: RedisClientType);
    /**
     * Setup Socket.IO event handlers
     */
    private setupSocketHandlers;
    /**
     * Setup Redis subscriptions for real-time updates
     */
    private setupRedisSubscriptions;
    /**
     * Handle incoming Redis messages and broadcast to appropriate rooms
     */
    private handleRedisMessage;
    /**
     * Join casino game room
     */
    private joinCasinoGame;
    /**
     * Leave casino game room
     */
    private leaveCasinoGame;
    /**
     * Join cricket room
     */
    private joinCricketRoom;
    /**
     * Leave cricket room
     */
    private leaveCricketRoom;
    /**
     * Handle manual data refresh requests
     */
    private handleRefreshRequest;
    /**
     * Send current casino data to client
     */
    private sendCurrentCasinoData;
    /**
     * Send current cricket data to client
     */
    private sendCurrentCricketData;
    /**
     * Broadcast to casino room
     */
    private broadcastToCasinoRoom;
    /**
     * Broadcast to cricket room
     */
    private broadcastToCricketRoom;
    /**
     * Handle client disconnect
     */
    private handleDisconnect;
    /**
     * Get manager statistics
     */
    getStats(): {
        socket: {
            rooms: string[];
            roomDetails: {
                name: string;
                clients: number;
                gameType: string | undefined;
                dataType: string | undefined;
            }[];
            totalConnections: number;
            activeConnections: number;
            totalRooms: number;
            messagesSent: number;
            errors: number;
        };
        api: {
            queue: {
                processing: number;
                queued: number;
                isRunning: boolean;
                totalProcessed: number;
                totalFailed: number;
                totalRetries: number;
                averageWaitTime: number;
                queueSize: number;
            };
            rateLimiter: {
                [endpoint: string]: any;
            };
            totalCalls: number;
            successfulCalls: number;
            failedCalls: number;
            rateLimitedCalls: number;
            retriedCalls: number;
            averageResponseTime: number;
        };
    };
    /**
     * Get detailed status for monitoring
     */
    getDetailedStatus(): {
        stats: {
            socket: {
                rooms: string[];
                roomDetails: {
                    name: string;
                    clients: number;
                    gameType: string | undefined;
                    dataType: string | undefined;
                }[];
                totalConnections: number;
                activeConnections: number;
                totalRooms: number;
                messagesSent: number;
                errors: number;
            };
            api: {
                queue: {
                    processing: number;
                    queued: number;
                    isRunning: boolean;
                    totalProcessed: number;
                    totalFailed: number;
                    totalRetries: number;
                    averageWaitTime: number;
                    queueSize: number;
                };
                rateLimiter: {
                    [endpoint: string]: any;
                };
                totalCalls: number;
                successfulCalls: number;
                failedCalls: number;
                rateLimitedCalls: number;
                retriedCalls: number;
                averageResponseTime: number;
            };
        };
        rateLimiterStatus: {
            [endpoint: string]: any;
        };
        queueStatus: {
            processing: number;
            queued: number;
            isRunning: boolean;
            totalProcessed: number;
            totalFailed: number;
            totalRetries: number;
            averageWaitTime: number;
            queueSize: number;
        };
    };
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
export default EnhancedSocketManager;
//# sourceMappingURL=EnhancedSocketManager.d.ts.map