// Client-side game logic helpers

import type {
  GameBoard,
  BoardCell,
  GameMode,
  Move,
  Symbol,
  Player,
} from "./types";

// Get board size based on game mode
export function getBoardSize(mode: GameMode): number {
  return mode === "classic3" ? 3 : 15;
}

// Convert moves array into a 2D board representation
export function buildBoard(
  mode: GameMode,
  moves: Move[],
  players: Player[]
): GameBoard {
  const size = getBoardSize(mode);
  const cells: BoardCell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      symbol: null,
      player_number: null,
    }))
  );

  // Build player lookup map
  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Apply moves to board
  for (const move of moves) {
    const player = playerMap.get(move.player_id);
    if (player && isValidPosition(mode, move.row_index, move.column_index)) {
      cells[move.row_index][move.column_index] = {
        symbol: player.player_number === 1 ? "X" : "O",
        player_number: player.player_number,
      };
    }
  }

  return { size, cells };
}

// Check if a position is valid for the given mode
export function isValidPosition(
  mode: GameMode,
  row: number,
  column: number
): boolean {
  const size = getBoardSize(mode);
  return row >= 0 && row < size && column >= 0 && column < size;
}

// Check if a position is occupied on the board
export function isPositionOccupied(
  board: GameBoard,
  row: number,
  column: number
): boolean {
  if (row < 0 || row >= board.size || column < 0 || column >= board.size) {
    return true; // Out of bounds counts as occupied
  }
  return board.cells[row][column].symbol !== null;
}

// Validate a move before submission
export function validateMove(
  board: GameBoard,
  row: number,
  column: number
): { valid: boolean; error?: string } {
  if (!isValidPosition(board.size === 3 ? "classic3" : "gomoku", row, column)) {
    return { valid: false, error: "Position out of bounds" };
  }

  if (isPositionOccupied(board, row, column)) {
    return { valid: false, error: "Position already occupied" };
  }

  return { valid: true };
}

// Check for winner in Classic 3x3
function checkWinnerClassic3(board: GameBoard): Symbol {
  const { cells } = board;

  // Check rows
  for (let row = 0; row < 3; row++) {
    if (
      cells[row][0].symbol &&
      cells[row][0].symbol === cells[row][1].symbol &&
      cells[row][1].symbol === cells[row][2].symbol
    ) {
      return cells[row][0].symbol;
    }
  }

  // Check columns
  for (let col = 0; col < 3; col++) {
    if (
      cells[0][col].symbol &&
      cells[0][col].symbol === cells[1][col].symbol &&
      cells[1][col].symbol === cells[2][col].symbol
    ) {
      return cells[0][col].symbol;
    }
  }

  // Check diagonals
  if (
    cells[0][0].symbol &&
    cells[0][0].symbol === cells[1][1].symbol &&
    cells[1][1].symbol === cells[2][2].symbol
  ) {
    return cells[0][0].symbol;
  }

  if (
    cells[0][2].symbol &&
    cells[0][2].symbol === cells[1][1].symbol &&
    cells[1][1].symbol === cells[2][0].symbol
  ) {
    return cells[0][2].symbol;
  }

  return null;
}

// Check for winner in Gomoku (5 in a row)
function checkWinnerGomoku(board: GameBoard): Symbol {
  const { cells, size } = board;

  // Helper to check a line of cells
  const checkLine = (positions: [number, number][]): Symbol => {
    if (positions.length < 5) return null;

    let count = 0;
    let currentSymbol: Symbol = null;

    for (const [row, col] of positions) {
      const symbol = cells[row][col].symbol;

      if (symbol && symbol === currentSymbol) {
        count++;
        if (count >= 5) return currentSymbol;
      } else {
        currentSymbol = symbol;
        count = symbol ? 1 : 0;
      }
    }

    return null;
  };

  // Check all rows
  for (let row = 0; row < size; row++) {
    const positions: [number, number][] = [];
    for (let col = 0; col < size; col++) {
      positions.push([row, col]);
    }
    const winner = checkLine(positions);
    if (winner) return winner;
  }

  // Check all columns
  for (let col = 0; col < size; col++) {
    const positions: [number, number][] = [];
    for (let row = 0; row < size; row++) {
      positions.push([row, col]);
    }
    const winner = checkLine(positions);
    if (winner) return winner;
  }

  // Check diagonal lines (top-left to bottom-right)
  for (let startRow = 0; startRow < size; startRow++) {
    const positions: [number, number][] = [];
    for (let i = 0; startRow + i < size && i < size; i++) {
      positions.push([startRow + i, i]);
    }
    const winner = checkLine(positions);
    if (winner) return winner;
  }

  for (let startCol = 1; startCol < size; startCol++) {
    const positions: [number, number][] = [];
    for (let i = 0; i < size && startCol + i < size; i++) {
      positions.push([i, startCol + i]);
    }
    const winner = checkLine(positions);
    if (winner) return winner;
  }

  // Check diagonal lines (top-right to bottom-left)
  for (let startRow = 0; startRow < size; startRow++) {
    const positions: [number, number][] = [];
    for (let i = 0; startRow + i < size && size - 1 - i >= 0; i++) {
      positions.push([startRow + i, size - 1 - i]);
    }
    const winner = checkLine(positions);
    if (winner) return winner;
  }

  for (let startCol = size - 2; startCol >= 0; startCol--) {
    const positions: [number, number][] = [];
    for (let i = 0; i < size && startCol - i >= 0; i++) {
      positions.push([i, startCol - i]);
    }
    const winner = checkLine(positions);
    if (winner) return winner;
  }

  return null;
}

// Check if there's a winner on the board
export function checkWinner(mode: GameMode, board: GameBoard): Symbol {
  if (mode === "classic3") {
    return checkWinnerClassic3(board);
  } else {
    return checkWinnerGomoku(board);
  }
}

// Check if the board is full (for draw detection in Classic 3x3)
export function isBoardFull(board: GameBoard): boolean {
  for (let row = 0; row < board.size; row++) {
    for (let col = 0; col < board.size; col++) {
      if (board.cells[row][col].symbol === null) {
        return false;
      }
    }
  }
  return true;
}

// Get cell position from click coordinates (for rendering)
export function getCellFromCoordinates(
  cellSize: number,
  x: number,
  y: number
): { row: number; column: number } {
  return {
    row: Math.floor(y / cellSize),
    column: Math.floor(x / cellSize),
  };
}

// Get coordinates for rendering a cell
export function getCellCoordinates(
  cellSize: number,
  row: number,
  column: number
): { x: number; y: number } {
  return {
    x: column * cellSize,
    y: row * cellSize,
  };
}

// Determine whose turn it is
export function getCurrentPlayer(
  currentTurn: number | null,
  players: Player[]
): Player | null {
  if (currentTurn === null) return null;
  return players.find((p) => p.player_number === currentTurn) || null;
}

// Check if it's a specific player's turn
export function isPlayerTurn(
  playerId: string,
  currentTurn: number | null,
  players: Player[]
): boolean {
  if (currentTurn === null) return false;
  const player = players.find((p) => p.id === playerId);
  return player?.player_number === currentTurn;
}

// Type for winning line positions
export type WinningLineType =
  | "row-0"
  | "row-1"
  | "row-2"
  | "col-0"
  | "col-1"
  | "col-2"
  | "diag-main"
  | "diag-anti";

export interface WinningLine {
  type: WinningLineType;
  positions: [number, number][];
}

// Get the winning line for Classic 3x3 if there is one
export function getWinningLineClassic3(board: GameBoard): WinningLine | null {
  const { cells } = board;

  // Check rows
  for (let row = 0; row < 3; row++) {
    if (
      cells[row][0].symbol &&
      cells[row][0].symbol === cells[row][1].symbol &&
      cells[row][1].symbol === cells[row][2].symbol
    ) {
      return {
        type: `row-${row}` as WinningLineType,
        positions: [
          [row, 0],
          [row, 1],
          [row, 2],
        ],
      };
    }
  }

  // Check columns
  for (let col = 0; col < 3; col++) {
    if (
      cells[0][col].symbol &&
      cells[0][col].symbol === cells[1][col].symbol &&
      cells[1][col].symbol === cells[2][col].symbol
    ) {
      return {
        type: `col-${col}` as WinningLineType,
        positions: [
          [0, col],
          [1, col],
          [2, col],
        ],
      };
    }
  }

  // Check main diagonal (top-left to bottom-right)
  if (
    cells[0][0].symbol &&
    cells[0][0].symbol === cells[1][1].symbol &&
    cells[1][1].symbol === cells[2][2].symbol
  ) {
    return {
      type: "diag-main",
      positions: [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
    };
  }

  // Check anti-diagonal (top-right to bottom-left)
  if (
    cells[0][2].symbol &&
    cells[0][2].symbol === cells[1][1].symbol &&
    cells[1][1].symbol === cells[2][0].symbol
  ) {
    return {
      type: "diag-anti",
      positions: [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    };
  }

  return null;
}
