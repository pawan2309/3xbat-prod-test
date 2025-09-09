import http from 'http';
import app from './app';
import { Server as SocketIOServer } from 'socket.io';
import { connectRedis, getRedisClient } from './infrastructure/redis/redis';
import { initializeWebSocketManager } from './infrastructure/websockets/WebSocketManager';
// Optionally import publishers/cron after sockets

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
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

    console.log('🔌 Initializing WebSocket server...');
    initializeWebSocketManager(io);
    console.log('✅ WebSocket server initialized successfully');

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

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await gracefulShutdown();
});

async function gracefulShutdown() {
  try {
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
    
    // Close HTTP server
    console.log('🛑 Closing HTTP server...');
    httpServer.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}
