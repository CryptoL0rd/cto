// React hooks for game state, chat, and local player management

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { GameStateResponse, Message } from "./types";
import { getGameState, getMessages } from "./api";

// Hook to manage local player ID in localStorage with SSR guards
export function useLocalPlayer() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // SSR guard - only run on client
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem("player_id");
      setPlayerId(stored);
    } catch (error) {
      console.error("Failed to read player_id from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePlayerId = useCallback((id: string | null) => {
    // SSR guard
    if (typeof window === "undefined") return;

    setPlayerId(id);
    try {
      if (id === null) {
        localStorage.removeItem("player_id");
      } else {
        localStorage.setItem("player_id", id);
      }
    } catch (error) {
      console.error("Failed to save player_id to localStorage:", error);
    }
  }, []);

  return { playerId, savePlayerId, isLoading };
}

// Hook to poll game state at regular intervals
export function useGameState(gameId: string | null, pollingInterval = 2000) {
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchGameState = useCallback(async () => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      const state = await getGameState(gameId);

      if (mountedRef.current) {
        setGameState(state);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch game state")
        );
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

    // Initial fetch
    fetchGameState();

    // Set up polling
    intervalRef.current = setInterval(fetchGameState, pollingInterval);

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameId, pollingInterval, fetchGameState]);

  const refetch = useCallback(() => {
    fetchGameState();
  }, [fetchGameState]);

  return { gameState, isLoading, error, refetch };
}

// Hook to poll chat messages with deduplication
export function useChat(gameId: string | null, pollingInterval = 2000) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const lastFetchTimeRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      const response = await getMessages(
        gameId,
        lastFetchTimeRef.current || undefined
      );

      if (mountedRef.current) {
        if (response.messages.length > 0) {
          // Deduplicate messages by ID
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = response.messages.filter(
              (m) => !existingIds.has(m.id)
            );

            if (newMessages.length > 0) {
              // Update last fetch time to most recent message
              const latestMessage = newMessages[newMessages.length - 1];
              lastFetchTimeRef.current = latestMessage.created_at;

              return [...prev, ...newMessages];
            }
            return prev;
          });
        }
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch messages")
        );
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
      lastFetchTimeRef.current = null;
      return;
    }

    // Initial fetch - get all messages
    const initialFetch = async () => {
      try {
        setIsLoading(true);
        const response = await getMessages(gameId);

        if (mountedRef.current) {
          setMessages(response.messages);
          if (response.messages.length > 0) {
            const latestMessage =
              response.messages[response.messages.length - 1];
            lastFetchTimeRef.current = latestMessage.created_at;
          }
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch messages")
          );
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initialFetch();

    // Set up polling for new messages
    intervalRef.current = setInterval(fetchMessages, pollingInterval);

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameId, pollingInterval, fetchMessages]);

  return { messages, isLoading, error };
}
