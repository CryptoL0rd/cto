// WebSocket hooks for real-time game state and chat updates

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { GameStateResponse, Message } from './types';

interface WebSocketMessage {
  type: 'subscribed' | 'unsubscribed' | 'game_update' | 'chat_update' | 'pong' | 'error';
  gameId?: string;
  data?: any;
  message?: string;
}

// Get WebSocket URL based on environment
function getWebSocketUrl(): string {
  if (typeof window === 'undefined') {
    return 'ws://localhost:3001';
  }

  // Check if we have a custom WebSocket URL in environment
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  // Default to port 3001 on the same host
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = process.env.NEXT_PUBLIC_WS_PORT || '3001';

  return `${protocol}//${host}:${port}`;
}

// Hook to manage WebSocket connection for game state updates
export function useGameStateWebSocket(gameId: string | null, playerId?: string | null) {
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  // Fetch initial game state via HTTP
  const fetchInitialState = useCallback(async () => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/game/state?game_id=${encodeURIComponent(gameId)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch game state: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (mountedRef.current) {
        setGameState(data);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch game state'));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [gameId]);

  const connectWebSocket = useCallback(() => {
    if (!gameId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log('[WebSocket] Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Subscribe to game updates
        const subscribeMessage = {
          type: 'subscribe',
          gameId,
          playerId: playerId || undefined,
        };
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'subscribed':
              console.log('[WebSocket] Subscribed to game:', message.gameId);
              break;

            case 'game_update':
              if (message.data && mountedRef.current) {
                console.log('[WebSocket] Received game update');
                setGameState(message.data);
                setError(null);
              }
              break;

            case 'error':
              console.error('[WebSocket] Server error:', message.message);
              break;

            default:
              console.log('[WebSocket] Unknown message type:', message.type);
          }
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        setError(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);

        // Attempt to reconnect if we haven't exceeded max attempts
        if (
          mountedRef.current &&
          gameId &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `[WebSocket] Reconnecting (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connectWebSocket();
            }
          }, RECONNECT_DELAY);
        }
      };
    } catch (err) {
      console.error('[WebSocket] Failed to create connection:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect WebSocket'));
    }
  }, [gameId, playerId]);

  useEffect(() => {
    mountedRef.current = true;

    if (!gameId) {
      setGameState(null);
      setError(null);
      return;
    }

    // Fetch initial state
    fetchInitialState();

    // Connect WebSocket
    connectWebSocket();

    // Cleanup
    return () => {
      mountedRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        // Unsubscribe before closing
        if (wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(
              JSON.stringify({
                type: 'unsubscribe',
                gameId,
              })
            );
          } catch (err) {
            console.error('[WebSocket] Error unsubscribing:', err);
          }
        }

        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [gameId, fetchInitialState, connectWebSocket]);

  const refetch = useCallback(async () => {
    await fetchInitialState();
  }, [fetchInitialState]);

  return { gameState, isLoading, error, refetch, isConnected };
}

// Hook to manage WebSocket connection for chat updates
export function useChatWebSocket(gameId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  // Fetch initial messages via HTTP
  const fetchInitialMessages = useCallback(async () => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/list?game_id=${encodeURIComponent(gameId)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (mountedRef.current) {
        setMessages(data.messages || []);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [gameId]);

  const connectWebSocket = useCallback(() => {
    if (!gameId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log('[WebSocket Chat] Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket Chat] Connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Subscribe to game updates (for chat)
        const subscribeMessage = {
          type: 'subscribe',
          gameId,
        };
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'subscribed':
              console.log('[WebSocket Chat] Subscribed to game:', message.gameId);
              break;

            case 'chat_update':
              if (message.data && mountedRef.current) {
                console.log('[WebSocket Chat] Received chat update');
                // Add new messages, avoiding duplicates
                setMessages((prev) => {
                  const existingIds = new Set(prev.map((m) => m.id));
                  const newMessages = message.data.filter((m: Message) => !existingIds.has(m.id));
                  return [...prev, ...newMessages];
                });
                setError(null);
              }
              break;

            case 'error':
              console.error('[WebSocket Chat] Server error:', message.message);
              break;

            default:
              // Ignore other message types
              break;
          }
        } catch (err) {
          console.error('[WebSocket Chat] Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocket Chat] Error:', event);
        setError(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('[WebSocket Chat] Disconnected');
        setIsConnected(false);

        // Attempt to reconnect if we haven't exceeded max attempts
        if (
          mountedRef.current &&
          gameId &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `[WebSocket Chat] Reconnecting (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connectWebSocket();
            }
          }, RECONNECT_DELAY);
        }
      };
    } catch (err) {
      console.error('[WebSocket Chat] Failed to create connection:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect WebSocket'));
    }
  }, [gameId]);

  useEffect(() => {
    mountedRef.current = true;

    if (!gameId) {
      setMessages([]);
      setError(null);
      return;
    }

    // Fetch initial messages
    fetchInitialMessages();

    // Connect WebSocket
    connectWebSocket();

    // Cleanup
    return () => {
      mountedRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        // Unsubscribe before closing
        if (wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(
              JSON.stringify({
                type: 'unsubscribe',
                gameId,
              })
            );
          } catch (err) {
            console.error('[WebSocket Chat] Error unsubscribing:', err);
          }
        }

        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [gameId, fetchInitialMessages, connectWebSocket]);

  return { messages, isLoading, error, isConnected };
}
