// WebSocket hooks for real-time game state and chat updates
// Now using Pusher for Vercel compatibility

'use client';

// Re-export Pusher hooks with the same names for backward compatibility
export { useGameStateWebSocket, useChatWebSocket } from './usePusher';
