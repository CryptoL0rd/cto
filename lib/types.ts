// Type definitions matching backend Pydantic models

export type GameMode = "classic3" | "gomoku";
export type GameStatus = "waiting" | "active" | "completed" | "abandoned";
export type Symbol = "X" | "O" | null;
export type MessageType = "chat" | "system";

export interface Game {
  id: string;
  mode: GameMode;
  status: GameStatus;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  current_turn: number | null;
  winner_id: string | null;
}

export interface Player {
  id: string;
  game_id: string;
  player_number: 1 | 2;
  player_name: string;
  joined_at: string;
  is_ai: boolean;
}

export interface Move {
  id: number;
  game_id: string;
  player_id: string;
  move_number: number;
  column_index: number;
  row_index: number;
  created_at: string;
}

export interface Message {
  id: number;
  game_id: string;
  player_id: string | null;
  message_type: MessageType;
  content: string;
  created_at: string;
}

// Request DTOs
export interface CreateGameRequest {
  player_name: string;
  mode?: GameMode;
  is_ai_opponent?: boolean;
}

export interface CreateGameResponse {
  game: Game;
  player_id: string;
  invite_code: string;
}

export interface JoinGameRequest {
  invite_code: string;
  player_name: string;
}

export interface JoinGameResponse {
  player: Player;
  game_id: string;
  mode: GameMode;
}

export interface MakeMoveRequest {
  game_id: string;
  player_id: string;
  column_index: number;
  row_index: number;
}

export interface MakeMoveResponse {
  move: Move;
  is_winner: boolean;
  is_draw: boolean;
  game_status: GameStatus;
}

export interface SendMessageRequest {
  game_id: string;
  player_id: string;
  text: string;
}

export interface GameStateResponse {
  game: Game;
  players: Player[];
  moves: Move[];
  messages: Message[];
}

export interface ChatMessagesResponse {
  messages: Message[];
}

// Client-side types for UI
export interface BoardCell {
  symbol: Symbol;
  player_number: number | null;
}

export interface GameBoard {
  size: number;
  cells: BoardCell[][];
}
