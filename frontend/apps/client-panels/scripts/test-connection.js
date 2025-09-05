#!/usr/bin/env node

const io = require('socket.io-client');

// Configuration
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'http://localhost:4000';

console.log('🔍 Testing WebSocket connection...');
console.log(`URL: ${WEBSOCKET_URL}`);

// Create socket connection
const socket = io(WEBSOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: 5000,
  forceNew: true
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected successfully!');
  console.log(`Socket ID: ${socket.id}`);
  
  // Test joining a room
  socket.emit('join-casino', 'teen20:3030');
  console.log('📡 Joined casino room: teen20:3030');
  
  // Disconnect after 3 seconds
  setTimeout(() => {
    console.log('🔌 Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 3000);
});

socket.on('disconnect', (reason) => {
  console.log(`❌ Disconnected: ${reason}`);
  process.exit(1);
});

socket.on('connect_error', (error) => {
  console.log(`❌ Connection error: ${error.message}`);
  process.exit(1);
});

// Listen for any events
socket.onAny((eventName, ...args) => {
  console.log(`📡 Event received: ${eventName}`);
  if (args.length > 0) {
    console.log('Data:', JSON.stringify(args, null, 2));
  }
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Connection timeout');
  socket.disconnect();
  process.exit(1);
}, 10000);
