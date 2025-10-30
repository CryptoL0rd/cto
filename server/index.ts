#!/usr/bin/env node
// Standalone WebSocket server for game state updates
import { getWebSocketServer } from './websocket';

const port = parseInt(process.env.WS_PORT || '3001', 10);

console.log('Starting WebSocket server...');
const server = getWebSocketServer();

console.log(`WebSocket server is running on ws://localhost:${port}`);
console.log('Press Ctrl+C to stop');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down WebSocket server...');
  server.close();
  process.exit(0);
});
