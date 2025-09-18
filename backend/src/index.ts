import http from 'http';
import app from './app';
import { Server as SocketIOServer } from 'socket.io';
import { connectRedis, connectRedisPubSub, getRedisClient } from './infrastructure/redis/redis';
import { initializeWebSocketManager } from './infrastructure/websockets/WebSocketManager';
import { webSocketDataPublisher } from './services/WebSocketDataPublisher';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001", 
      "http://localhost:3002",
      "http://13.60.145.70:3000",
      "http://13.60.145.70:3001", 
      "http://13.60.145.70:3002",
      "https://3xbat.com",
      "https://control.3xbat.com",
      "https://adm.3xbat.com",
      "https://suo.3xbat.com",
      "https://sup.3xbat.com",
      "https://mas.3xbat.com",
      "https://sua.3xbat.com",
      "https://age.3xbat.com",
      "https://sub.3xbat.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Redis and WebSocket server
async function initializeServices() {
  try {
    console.log('🔌 Initializing Redis...');
    await connectRedis();
    const redisClient = getRedisClient();
    if (!redisClient) throw new Error('Redis client not available after connect');
    console.log('✅ Redis initialized successfully');
    
    console.log('🔌 Initializing Redis PubSub...');
    await connectRedisPubSub();
    console.log('✅ Redis PubSub initialized successfully');

    console.log('🔌 Initializing WebSocket server...');
    initializeWebSocketManager(io);
    console.log('✅ WebSocket server initialized successfully');

    console.log('🔌 Starting WebSocket data publisher...');
    // WebSocketDataPublisher starts automatically in constructor
    console.log('✅ WebSocket data publisher started successfully');

    // Defer cron/BullMQ startup to avoid double-runs; wire here later if needed
    // const { startOddsUpdates, startScorecardUpdates } = require('./external-apis/jobs/oddsCron');
    // startOddsUpdates();
    // startScorecardUpdates();
    // console.log('✅ Cron jobs initialized successfully');
  } catch (error) {
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
      webSocketDataPublisher.stop();
      console.log('✅ WebSocket data publisher stopped');
    } catch (e) {
      console.warn('⚠️ WebSocket data publisher stop failed:', (e as any)?.message);
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
      } catch (e) {
        console.warn('⚠️ Cron stop skipped (module not available):', (e as any)?.message);
      }
    }
    
    // Close WebSocket server
    console.log('🛑 Closing WebSocket server...');
    try {
      io.close();
      console.log('✅ WebSocket server closed');
    } catch (e) {
      console.warn('⚠️ WebSocket server close failed:', (e as any)?.message);
    }
    
    // Close Redis connection
    console.log('🛑 Closing Redis connection...');
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.quit();
        console.log('✅ Redis connection closed');
      }
    } catch (e) {
      console.warn('⚠️ Redis close failed:', (e as any)?.message);
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
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}
