// API client for game and chat endpoints

import type {
  CreateGameRequest,
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
  GameStateResponse,
  MakeMoveRequest,
  MakeMoveResponse,
  SendMessageRequest,
  Message,
  ChatMessagesResponse,
} from './types';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base URL for API requests - relative path for Vercel compatibility
const getBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  // Client-side: use current origin
  return window.location.origin;
};

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message =
        typeof data === 'object' && data !== null && 'detail' in data
          ? (data as { detail: string }).detail
          : typeof data === 'string'
            ? data
            : `HTTP ${response.status}: ${response.statusText}`;

      throw new ApiError(response.status, message, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors or JSON parsing errors
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error', error);
  }
}

// Game API functions

export async function createGame(request: CreateGameRequest): Promise<CreateGameResponse> {
  return fetchJson<CreateGameResponse>('/api/game/create', {
    method: 'POST',
    body: JSON.stringify({
      player_name: request.player_name,
      mode: request.mode || 'classic3',
      is_ai_opponent: request.is_ai_opponent || false,
    }),
  });
}

export async function joinGame(request: JoinGameRequest): Promise<JoinGameResponse> {
  return fetchJson<JoinGameResponse>('/api/game/join', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getGameState(gameId: string): Promise<GameStateResponse> {
  return fetchJson<GameStateResponse>(`/api/game/state?game_id=${encodeURIComponent(gameId)}`);
}

export async function makeMove(request: MakeMoveRequest): Promise<MakeMoveResponse> {
  return fetchJson<MakeMoveResponse>('/api/game/move', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Chat API functions

export async function sendMessage(request: SendMessageRequest): Promise<Message> {
  return fetchJson<Message>('/api/chat/send', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getMessages(gameId: string, since?: string): Promise<ChatMessagesResponse> {
  const params = new URLSearchParams({ game_id: gameId });
  if (since) {
    params.append('since', since);
  }
  return fetchJson<ChatMessagesResponse>(`/api/chat/list?${params.toString()}`);
}

export { ApiError };
