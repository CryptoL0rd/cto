// Pusher hooks for real-time game state and chat updates

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Pusher from 'pusher-js';
import type { GameStateResponse, Message } from './types';

// Get Pusher client instance
function getPusherClient(): Pusher | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1';

  if (!key) {
    console.warn(
      '[Pusher] NEXT_PUBLIC_PUSHER_KEY not configured. Real-time updates will be disabled.'
    );
    return null;
  }

  return new Pusher(key, {
    cluster,
  });
}

// Hook to manage Pusher connection for game state updates
export function useGameStateWebSocket(gameId: string | null, playerId?: string | null) {
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);

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

  useEffect(() => {
    mountedRef.current = true;

    if (!gameId) {
      setGameState(null);
      setError(null);
      return;
    }

    // Fetch initial state
    fetchInitialState();

    // Set up Pusher connection
    const pusher = getPusherClient();

    if (pusher) {
      pusherRef.current = pusher;

      // Subscribe to game channel
      const channel = pusher.subscribe(`game-${gameId}`);
      channelRef.current = channel;

      // Handle connection state
      pusher.connection.bind('connected', () => {
        console.log('[Pusher] Connected');
        setIsConnected(true);
      });

      pusher.connection.bind('disconnected', () => {
        console.log('[Pusher] Disconnected');
        setIsConnected(false);
      });

      pusher.connection.bind('error', (err: any) => {
        console.error('[Pusher] Connection error:', err);
        setError(new Error('Pusher connection error'));
      });

      // Bind to game update events
      channel.bind('game-update', (data: GameStateResponse) => {
        if (mountedRef.current) {
          console.log('[Pusher] Received game update');
          setGameState(data);
          setError(null);
        }
      });

      channel.bind('pusher:subscription_succeeded', () => {
        console.log('[Pusher] Subscribed to game:', gameId);
      });

      channel.bind('pusher:subscription_error', (err: any) => {
        console.error('[Pusher] Subscription error:', err);
        setError(new Error('Failed to subscribe to game updates'));
      });
    } else {
      console.log('[Pusher] Client not configured, real-time updates disabled');
    }

    // Cleanup
    return () => {
      mountedRef.current = false;

      if (channelRef.current && pusherRef.current) {
        pusherRef.current.unsubscribe(`game-${gameId}`);
        channelRef.current = null;
      }

      // Don't disconnect Pusher entirely as it may be used by other hooks
    };
  }, [gameId, fetchInitialState]);

  const refetch = useCallback(async () => {
    await fetchInitialState();
  }, [fetchInitialState]);

  return { gameState, isLoading, error, refetch, isConnected };
}

// Hook to manage Pusher connection for chat updates
export function useChatWebSocket(gameId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);

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

  useEffect(() => {
    mountedRef.current = true;

    if (!gameId) {
      setMessages([]);
      setError(null);
      return;
    }

    // Fetch initial messages
    fetchInitialMessages();

    // Set up Pusher connection
    const pusher = getPusherClient();

    if (pusher) {
      pusherRef.current = pusher;

      // Subscribe to game channel
      const channel = pusher.subscribe(`game-${gameId}`);
      channelRef.current = channel;

      // Handle connection state
      pusher.connection.bind('connected', () => {
        console.log('[Pusher Chat] Connected');
        setIsConnected(true);
      });

      pusher.connection.bind('disconnected', () => {
        console.log('[Pusher Chat] Disconnected');
        setIsConnected(false);
      });

      pusher.connection.bind('error', (err: any) => {
        console.error('[Pusher Chat] Connection error:', err);
        setError(new Error('Pusher connection error'));
      });

      // Bind to chat update events
      channel.bind('chat-update', (newMessages: Message[]) => {
        if (mountedRef.current) {
          console.log('[Pusher Chat] Received chat update');
          // Add new messages, avoiding duplicates
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const uniqueNewMessages = newMessages.filter((m: Message) => !existingIds.has(m.id));
            return [...prev, ...uniqueNewMessages];
          });
          setError(null);
        }
      });

      channel.bind('pusher:subscription_succeeded', () => {
        console.log('[Pusher Chat] Subscribed to game:', gameId);
      });

      channel.bind('pusher:subscription_error', (err: any) => {
        console.error('[Pusher Chat] Subscription error:', err);
        setError(new Error('Failed to subscribe to chat updates'));
      });
    } else {
      console.log('[Pusher Chat] Client not configured, real-time updates disabled');
    }

    // Cleanup
    return () => {
      mountedRef.current = false;

      if (channelRef.current && pusherRef.current) {
        pusherRef.current.unsubscribe(`game-${gameId}`);
        channelRef.current = null;
      }

      // Don't disconnect Pusher entirely as it may be used by other hooks
    };
  }, [gameId, fetchInitialMessages]);

  return { messages, isLoading, error, isConnected };
}
