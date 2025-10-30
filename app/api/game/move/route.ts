import { getGameState, setGameState, createGameState } from '../gameState';
import { broadcastGameUpdate } from '@/server/pusher';

// Check for winner in Classic 3x3
function checkWinner(board: (string | null)[][]): 'X' | 'O' | null {
  // Check rows
  for (let row = 0; row < 3; row++) {
    if (board[row][0] && board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
      return board[row][0] as 'X' | 'O';
    }
  }

  // Check columns
  for (let col = 0; col < 3; col++) {
    if (board[0][col] && board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
      return board[0][col] as 'X' | 'O';
    }
  }

  // Check diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return board[0][0] as 'X' | 'O';
  }

  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return board[0][2] as 'X' | 'O';
  }

  return null;
}

// Build board from moves
function buildBoardFromMoves(moves: any[], players: any[]): (string | null)[][] {
  const board: (string | null)[][] = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => null)
  );

  const playerMap = new Map(players.map((p: any) => [p.id, p]));

  for (const move of moves) {
    const player = playerMap.get(move.player_id);
    if (player) {
      const symbol = player.player_number === 1 ? 'X' : 'O';
      board[move.row_index][move.column_index] = symbol;
    }
  }

  return board;
}

// Check if board is full
function isBoardFull(board: (string | null)[][]): boolean {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

export async function POST(request: Request) {
  try {
    console.log('[API MOVE] Function called');

    // Parse body
    let body;
    try {
      body = await request.json();
      console.log('[API MOVE] Body parsed:', body);
    } catch (e) {
      console.error('[API MOVE] Failed to parse body:', e);
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { game_id, player_id, column_index, row_index } = body;
    console.log('[API MOVE] Params:', { game_id, player_id, column_index, row_index });

    // Validate required fields
    if (!game_id || !player_id) {
      console.log('[API MOVE] Missing required fields');
      return Response.json({ error: 'game_id and player_id are required' }, { status: 400 });
    }

    // Validate move coordinates
    if (typeof column_index !== 'number' || typeof row_index !== 'number') {
      console.log('[API MOVE] Invalid move coordinates');
      return Response.json(
        { error: 'column_index and row_index must be numbers' },
        { status: 400 }
      );
    }

    // Get or create game state
    let gameState = getGameState(game_id);

    if (!gameState) {
      // Initialize new game state if it doesn't exist
      gameState = createGameState(game_id);
    }

    // Check if game is already finished
    if (gameState.game.status === 'completed') {
      return Response.json({ error: 'Game is already finished' }, { status: 400 });
    }

    // Validate it's the player's turn
    const player = gameState.players.find((p: any) => p.id === player_id);
    if (!player) {
      return Response.json({ error: 'Player not found in game' }, { status: 400 });
    }

    if (player.player_number !== gameState.game.current_turn) {
      return Response.json({ error: 'Not your turn' }, { status: 400 });
    }

    // Build current board and check if position is occupied
    const board = buildBoardFromMoves(gameState.moves, gameState.players);
    if (board[row_index][column_index] !== null) {
      return Response.json({ error: 'Position already occupied' }, { status: 400 });
    }

    // Create move
    const now = new Date().toISOString();
    const moveId = gameState.moves.length + 1;

    const move = {
      id: moveId,
      game_id,
      player_id,
      move_number: moveId,
      column_index,
      row_index,
      created_at: now,
    };

    // Add move to game state
    gameState.moves.push(move);

    // Rebuild board with new move
    const newBoard = buildBoardFromMoves(gameState.moves, gameState.players);

    // Check for winner
    const winner = checkWinner(newBoard);
    const isDraw = !winner && isBoardFull(newBoard);

    let isWinner = false;
    let gameStatus = 'active';

    if (winner) {
      isWinner = true;
      gameStatus = 'completed';
      gameState.game.status = 'completed';
      gameState.game.winner_id = player_id;
      gameState.game.finished_at = now;
      gameState.game.current_turn = null;
      console.log('[API MOVE] Winner found:', winner);
    } else if (isDraw) {
      gameStatus = 'completed';
      gameState.game.status = 'completed';
      gameState.game.finished_at = now;
      gameState.game.current_turn = null;
      console.log('[API MOVE] Game is a draw');
    } else {
      // Switch turn
      gameState.game.current_turn = gameState.game.current_turn === 1 ? 2 : 1;
    }

    // Save updated state
    setGameState(game_id, gameState);

    // Broadcast game state update via WebSocket
    try {
      broadcastGameUpdate(game_id, gameState);
    } catch (error) {
      console.error('[API MOVE] Failed to broadcast WebSocket update:', error);
      // Don't fail the request if WebSocket broadcast fails
    }

    const responseData = {
      move,
      is_winner: isWinner,
      is_draw: isDraw,
      game_status: gameStatus,
    };

    console.log('[API MOVE] Success, returning:', responseData);

    return Response.json(responseData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[API MOVE] Unexpected error:', error);
    console.error('[API MOVE] Stack:', error instanceof Error ? error.stack : 'No stack');

    return Response.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
