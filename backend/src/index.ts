import http from 'http';
import app from './app';
import { unifiedSocketManager } from '../dist/infrastructure/websockets/unifiedSocketManager';
import { initializeRedis } from '../dist/infrastructure/redis/redis';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Redis and WebSocket server
async function initializeServices() {
  try {
    console.log('🔌 Initializing Redis...');
    await initializeRedis();
    console.log('✅ Redis initialized successfully');
    
    console.log('🔌 Initializing WebSocket server...');
    const { getRedisClient } = require('../dist/infrastructure/redis/redis');
    const redisClient = getRedisClient();
    await unifiedSocketManager.initialize(httpServer, redisClient);
    console.log('✅ WebSocket server initialized successfully');
    
    console.log('🔌 Initializing Cron Jobs...');
    const { startOddsUpdates, startScorecardUpdates } = require('../dist/external-apis/jobs/oddsCron');
    startOddsUpdates();
    startScorecardUpdates();
    console.log('✅ Cron jobs initialized successfully');
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
    // Stop cron jobs first
    console.log('🛑 Stopping cron jobs...');
    const { stopAllUpdates } = require('../dist/external-apis/jobs/oddsCron');
    stopAllUpdates();
    console.log('✅ Cron jobs stopped');
    
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
