// Basic tests for game logic utilities
// Run with: npx tsx lib/__tests__/game-logic.test.ts

import {
  getBoardSize,
  buildBoard,
  isValidPosition,
  isPositionOccupied,
  validateMove,
  checkWinner,
  isBoardFull,
  getCellFromCoordinates,
  getCellCoordinates,
  getCurrentPlayer,
  isPlayerTurn,
} from '../game-logic';
import type { Move, Player } from '../types';

// Simple test runner
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`);
  }
}

// Test suite
function runTests() {
  console.log('Running game logic tests...\n');

  // Test getBoardSize
  console.log('Testing getBoardSize...');
  assertEqual(getBoardSize('classic3'), 3, 'Classic 3x3 board size should be 3');
  assertEqual(getBoardSize('gomoku'), 15, 'Gomoku board size should be 15');
  console.log('✓ getBoardSize tests passed\n');

  // Test isValidPosition
  console.log('Testing isValidPosition...');
  assert(isValidPosition('classic3', 0, 0), 'Position (0,0) should be valid for classic3');
  assert(isValidPosition('classic3', 2, 2), 'Position (2,2) should be valid for classic3');
  assert(!isValidPosition('classic3', 3, 0), 'Position (3,0) should be invalid for classic3');
  assert(!isValidPosition('classic3', 0, -1), 'Position (0,-1) should be invalid for classic3');
  assert(isValidPosition('gomoku', 14, 14), 'Position (14,14) should be valid for gomoku');
  assert(!isValidPosition('gomoku', 15, 0), 'Position (15,0) should be invalid for gomoku');
  console.log('✓ isValidPosition tests passed\n');

  // Test buildBoard
  console.log('Testing buildBoard...');
  const players: Player[] = [
    {
      id: 'p1',
      game_id: 'game1',
      player_number: 1,
      player_name: 'Alice',
      joined_at: '2024-01-01T00:00:00Z',
      is_ai: false,
    },
    {
      id: 'p2',
      game_id: 'game1',
      player_number: 2,
      player_name: 'Bob',
      joined_at: '2024-01-01T00:01:00Z',
      is_ai: false,
    },
  ];

  const moves: Move[] = [
    {
      id: 1,
      game_id: 'game1',
      player_id: 'p1',
      move_number: 1,
      column_index: 0,
      row_index: 0,
      created_at: '2024-01-01T00:02:00Z',
    },
    {
      id: 2,
      game_id: 'game1',
      player_id: 'p2',
      move_number: 2,
      column_index: 1,
      row_index: 0,
      created_at: '2024-01-01T00:03:00Z',
    },
  ];

  const board = buildBoard('classic3', moves, players);
  assertEqual(board.size, 3, 'Board size should be 3');
  assertEqual(board.cells[0][0].symbol, 'X', 'Cell (0,0) should be X');
  assertEqual(board.cells[0][1].symbol, 'O', 'Cell (0,1) should be O');
  assertEqual(board.cells[0][2].symbol, null, 'Cell (0,2) should be empty');
  console.log('✓ buildBoard tests passed\n');

  // Test isPositionOccupied
  console.log('Testing isPositionOccupied...');
  assert(isPositionOccupied(board, 0, 0), 'Position (0,0) should be occupied');
  assert(isPositionOccupied(board, 0, 1), 'Position (0,1) should be occupied');
  assert(!isPositionOccupied(board, 0, 2), 'Position (0,2) should not be occupied');
  assert(isPositionOccupied(board, -1, 0), 'Out of bounds should be occupied');
  console.log('✓ isPositionOccupied tests passed\n');

  // Test validateMove
  console.log('Testing validateMove...');
  const validMove = validateMove(board, 0, 2);
  assert(validMove.valid, 'Move to empty position should be valid');

  const occupiedMove = validateMove(board, 0, 0);
  assert(!occupiedMove.valid, 'Move to occupied position should be invalid');
  assertEqual(
    occupiedMove.error,
    'Position already occupied',
    'Error message should indicate occupied position'
  );

  const outOfBoundsMove = validateMove(board, 5, 5);
  assert(!outOfBoundsMove.valid, 'Move out of bounds should be invalid');
  console.log('✓ validateMove tests passed\n');

  // Test checkWinner for Classic 3x3
  console.log('Testing checkWinner...');
  const winningMoves: Move[] = [
    {
      id: 1,
      game_id: 'game1',
      player_id: 'p1',
      move_number: 1,
      column_index: 0,
      row_index: 0,
      created_at: '2024-01-01T00:02:00Z',
    },
    {
      id: 2,
      game_id: 'game1',
      player_id: 'p2',
      move_number: 2,
      column_index: 0,
      row_index: 1,
      created_at: '2024-01-01T00:03:00Z',
    },
    {
      id: 3,
      game_id: 'game1',
      player_id: 'p1',
      move_number: 3,
      column_index: 1,
      row_index: 0,
      created_at: '2024-01-01T00:04:00Z',
    },
    {
      id: 4,
      game_id: 'game1',
      player_id: 'p2',
      move_number: 4,
      column_index: 1,
      row_index: 1,
      created_at: '2024-01-01T00:05:00Z',
    },
    {
      id: 5,
      game_id: 'game1',
      player_id: 'p1',
      move_number: 5,
      column_index: 2,
      row_index: 0,
      created_at: '2024-01-01T00:06:00Z',
    },
  ];

  const winningBoard = buildBoard('classic3', winningMoves, players);
  const winner = checkWinner('classic3', winningBoard);
  assertEqual(winner, 'X', 'Player 1 (X) should be the winner');
  console.log('✓ checkWinner tests passed\n');

  // Test isBoardFull
  console.log('Testing isBoardFull...');
  assert(!isBoardFull(board), 'Partially filled board should not be full');

  const fullMoves: Move[] = [
    {
      id: 1,
      game_id: 'g1',
      player_id: 'p1',
      move_number: 1,
      column_index: 0,
      row_index: 0,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      game_id: 'g1',
      player_id: 'p2',
      move_number: 2,
      column_index: 1,
      row_index: 0,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      game_id: 'g1',
      player_id: 'p1',
      move_number: 3,
      column_index: 2,
      row_index: 0,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 4,
      game_id: 'g1',
      player_id: 'p2',
      move_number: 4,
      column_index: 0,
      row_index: 1,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 5,
      game_id: 'g1',
      player_id: 'p1',
      move_number: 5,
      column_index: 1,
      row_index: 1,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 6,
      game_id: 'g1',
      player_id: 'p2',
      move_number: 6,
      column_index: 2,
      row_index: 1,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 7,
      game_id: 'g1',
      player_id: 'p1',
      move_number: 7,
      column_index: 0,
      row_index: 2,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 8,
      game_id: 'g1',
      player_id: 'p2',
      move_number: 8,
      column_index: 1,
      row_index: 2,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 9,
      game_id: 'g1',
      player_id: 'p1',
      move_number: 9,
      column_index: 2,
      row_index: 2,
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  const fullBoard = buildBoard('classic3', fullMoves, players);
  assert(isBoardFull(fullBoard), 'Full board should be detected as full');
  console.log('✓ isBoardFull tests passed\n');

  // Test getCellFromCoordinates
  console.log('Testing getCellFromCoordinates...');
  const cell1 = getCellFromCoordinates(50, 25, 75);
  assertEqual(cell1.row, 1, 'Row should be 1');
  assertEqual(cell1.column, 0, 'Column should be 0');

  const cell2 = getCellFromCoordinates(100, 250, 150);
  assertEqual(cell2.row, 1, 'Row should be 1');
  assertEqual(cell2.column, 2, 'Column should be 2');
  console.log('✓ getCellFromCoordinates tests passed\n');

  // Test getCellCoordinates
  console.log('Testing getCellCoordinates...');
  const coords = getCellCoordinates(50, 1, 2);
  assertEqual(coords.y, 50, 'Y coordinate should be 50');
  assertEqual(coords.x, 100, 'X coordinate should be 100');
  console.log('✓ getCellCoordinates tests passed\n');

  // Test getCurrentPlayer
  console.log('Testing getCurrentPlayer...');
  const currentPlayer = getCurrentPlayer(1, players);
  assertEqual(currentPlayer?.id, 'p1', 'Current player should be p1');

  const noPlayer = getCurrentPlayer(null, players);
  assertEqual(noPlayer, null, 'Should return null when currentTurn is null');
  console.log('✓ getCurrentPlayer tests passed\n');

  // Test isPlayerTurn
  console.log('Testing isPlayerTurn...');
  assert(isPlayerTurn('p1', 1, players), "Should be p1's turn");
  assert(!isPlayerTurn('p2', 1, players), "Should not be p2's turn");
  assert(!isPlayerTurn('p1', null, players), "No player's turn when currentTurn is null");
  console.log('✓ isPlayerTurn tests passed\n');

  console.log('✅ All tests passed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  try {
    runTests();
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

export { runTests };
