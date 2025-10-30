// Shared in-memory storage for game state (for MVP/demo purposes)
// In production, this would be in a database

interface GameState {
  game: {
    id: string;
    invite_code: string;
    mode: string;
    status: string;
    created_at: string;
    started_at: string | null;
    finished_at: string | null;
    current_turn: number | null;
    winner_id: string | null;
  };
  players: Array<{
    id: string;
    game_id: string;
    player_number: 1 | 2;
    player_name: string;
    joined_at: string;
    is_ai: boolean;
  }>;
  moves: Array<{
    id: number;
    game_id: string;
    player_id: string;
    move_number: number;
    column_index: number;
    row_index: number;
    created_at: string;
  }>;
  messages: Array<any>;
}

const gameStates = new Map<string, GameState>();

export function getGameState(gameId: string): GameState | undefined {
  return gameStates.get(gameId);
}

export function setGameState(gameId: string, state: GameState): void {
  gameStates.set(gameId, state);
}

export function createGameState(gameId: string): GameState {
  const now = new Date().toISOString();
  const createdAt = new Date(Date.now() - 120000).toISOString();
  const startedAt = new Date(Date.now() - 60000).toISOString();

  const state: GameState = {
    game: {
      id: gameId,
      invite_code: 'DEMO' + gameId.substring(0, 4).toUpperCase(),
      mode: 'classic3',
      status: 'active',
      created_at: createdAt,
      started_at: startedAt,
      finished_at: null,
      current_turn: 1,
      winner_id: null,
    },
    players: [
      {
        id: 'player1',
        game_id: gameId,
        player_number: 1,
        player_name: 'Player 1',
        joined_at: createdAt,
        is_ai: false,
      },
      {
        id: 'player2',
        game_id: gameId,
        player_number: 2,
        player_name: 'Player 2',
        joined_at: startedAt,
        is_ai: false,
      },
    ],
    moves: [],
    messages: [],
  };

  gameStates.set(gameId, state);
  return state;
}
