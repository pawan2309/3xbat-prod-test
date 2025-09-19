"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const socket_io_1 = require("socket.io");
const redis_1 = require("./infrastructure/redis/redis");
const WebSocketManager_1 = require("./infrastructure/websockets/WebSocketManager");
const WebSocketDataPublisher_1 = require("./services/WebSocketDataPublisher");
const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';
// Create HTTP server
const httpServer = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
// Initialize Redis and WebSocket server
async function initializeServices() {
    try {
        console.log('🔌 Initializing Redis...');
        await (0, redis_1.connectRedis)();
        const redisClient = (0, redis_1.getRedisClient)();
        if (!redisClient)
            throw new Error('Redis client not available after connect');
        console.log('✅ Redis initialized successfully');
        console.log('🔌 Initializing Redis PubSub...');
        await (0, redis_1.connectRedisPubSub)();
        console.log('✅ Redis PubSub initialized successfully');
        console.log('🔌 Initializing WebSocket server...');
        (0, WebSocketManager_1.initializeWebSocketManager)(io);
        console.log('✅ WebSocket server initialized successfully');
        console.log('🔌 Starting WebSocket data publisher...');
        // WebSocketDataPublisher starts automatically in constructor
        console.log('✅ WebSocket data publisher started successfully');
        // Defer cron/BullMQ startup to avoid double-runs; wire here later if needed
        // const { startOddsUpdates, startScorecardUpdates } = require('./external-apis/jobs/oddsCron');
        // startOddsUpdates();
        // startScorecardUpdates();
        // console.log('✅ Cron jobs initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize services:', error);
    }
}
// Start server
httpServer.listen(PORT, HOST, async () => {
    console.log(`🚀 3xbat Backend API Server running on ${HOST}:${PORT}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
    console.log(`🔐 Auth API: http://${HOST}:${PORT}/api/auth`);
    console.log(`👥 Users API: http://${HOST}:${PORT}/api/users`);
    console.log(`🔌 WebSocket: ws://${HOST}:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    // Initialize Redis and WebSockets after server starts
    await initializeServices();
});
// Graceful shutdown handlers
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await gracefulShutdown();
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await gracefulShutdown();
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown();
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown();
});
async function gracefulShutdown() {
    try {
        console.log('🛑 Starting graceful shutdown...');
        // Stop WebSocket data publisher
        console.log('🛑 Stopping WebSocket data publisher...');
        try {
            WebSocketDataPublisher_1.webSocketDataPublisher.stop();
            console.log('✅ WebSocket data publisher stopped');
        }
        catch (e) {
            console.warn('⚠️ WebSocket data publisher stop failed:', e?.message);
        }
        // Stop cron jobs if enabled
        if (process.env.CRON_ENABLED === 'true') {
            console.log('🛑 Stopping cron jobs...');
            try {
                const { stopAllUpdates } = require('./external-apis/jobs/oddsCron');
                if (typeof stopAllUpdates === 'function') {
                    stopAllUpdates();
                    console.log('✅ Cron jobs stopped');
                }
            }
            catch (e) {
                console.warn('⚠️ Cron stop skipped (module not available):', e?.message);
            }
        }
        // Close WebSocket server
        console.log('🛑 Closing WebSocket server...');
        try {
            io.close();
            console.log('✅ WebSocket server closed');
        }
        catch (e) {
            console.warn('⚠️ WebSocket server close failed:', e?.message);
        }
        // Close Redis connection
        console.log('🛑 Closing Redis connection...');
        try {
            const redisClient = (0, redis_1.getRedisClient)();
            if (redisClient) {
                await redisClient.quit();
                console.log('✅ Redis connection closed');
            }
        }
        catch (e) {
            console.warn('⚠️ Redis close failed:', e?.message);
        }
        // Close HTTP server
        console.log('🛑 Closing HTTP server...');
        httpServer.close(() => {
            console.log('✅ HTTP server closed');
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
        });
        // Force exit after timeout
        setTimeout(() => {
            console.log('⚠️ Forced shutdown after timeout');
            process.exit(1);
        }, 10000); // 10 second timeout
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}
//# sourceMappingURL=index.js.map