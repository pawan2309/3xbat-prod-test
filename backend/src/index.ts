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
    const { redisCache } = require('../dist/infrastructure/cache/redis');
    await unifiedSocketManager.initialize(httpServer, redisCache);
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
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
