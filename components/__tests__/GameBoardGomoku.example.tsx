// Example usage of GameBoardGomoku component
// This demonstrates integration with game state and hooks

'use client';

import GameBoardGomoku from '../GameBoardGomoku';
import type { GameStateResponse } from '@/lib/types';

// Example 1: Basic usage with a Gomoku game in progress
export function GomokuGameExample({ gameId }: { gameId: string }) {
  // Mock game state for demonstration
  const mockGameState: GameStateResponse = {
    game: {
      id: gameId,
      mode: 'gomoku',
      status: 'active',
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      finished_at: null,
      current_turn: 1,
      winner_id: null,
    },
    players: [
      {
        id: 'player-1',
        game_id: gameId,
        player_number: 1,
        player_name: 'Player One',
        joined_at: new Date().toISOString(),
        is_ai: false,
      },
      {
        id: 'player-2',
        game_id: gameId,
        player_number: 2,
        player_name: 'Player Two',
        joined_at: new Date().toISOString(),
        is_ai: false,
      },
    ],
    moves: [
      {
        id: 1,
        game_id: gameId,
        player_id: 'player-1',
        move_number: 1,
        column_index: 0,
        row_index: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        game_id: gameId,
        player_id: 'player-2',
        move_number: 2,
        column_index: 1,
        row_index: 0,
        created_at: new Date().toISOString(),
      },
    ],
    messages: [],
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center gradient-text">Gomoku Game</h1>
      <GameBoardGomoku
        gameState={mockGameState}
        playerId="player-1"
        onMoveComplete={() => {
          console.log('Move completed!');
        }}
      />
    </div>
  );
}

// Example 2: Game with many moves (performance test scenario)
export function GomokuPerformanceExample() {
  const mockGameState: GameStateResponse = {
    game: {
      id: 'perf-test',
      mode: 'gomoku',
      status: 'active',
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      finished_at: null,
      current_turn: 1,
      winner_id: null,
    },
    players: [
      {
        id: 'player-1',
        game_id: 'perf-test',
        player_number: 1,
        player_name: 'Player One',
        joined_at: new Date().toISOString(),
        is_ai: false,
      },
      {
        id: 'player-2',
        game_id: 'perf-test',
        player_number: 2,
        player_name: 'Player Two',
        joined_at: new Date().toISOString(),
        is_ai: false,
      },
    ],
    moves: Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      game_id: 'perf-test',
      player_id: i % 2 === 0 ? 'player-1' : 'player-2',
      move_number: i + 1,
      column_index: (i % 20) - 10,
      row_index: Math.floor(i / 20) - 2,
      created_at: new Date().toISOString(),
    })),
    messages: [],
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center gradient-text">
        Performance Test - 100 Moves
      </h1>
      <GameBoardGomoku
        gameState={mockGameState}
        playerId="player-1"
        onMoveComplete={() => {
          console.log('Move completed!');
        }}
      />
    </div>
  );
}

// Example 3: Completed game (winner state)
export function GomokuCompletedExample() {
  const mockGameState: GameStateResponse = {
    game: {
      id: 'completed-game',
      mode: 'gomoku',
      status: 'completed',
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      current_turn: null,
      winner_id: 'player-1',
    },
    players: [
      {
        id: 'player-1',
        game_id: 'completed-game',
        player_number: 1,
        player_name: 'Winner',
        joined_at: new Date().toISOString(),
        is_ai: false,
      },
      {
        id: 'player-2',
        game_id: 'completed-game',
        player_number: 2,
        player_name: 'Loser',
        joined_at: new Date().toISOString(),
        is_ai: false,
      },
    ],
    moves: [
      {
        id: 1,
        game_id: 'completed-game',
        player_id: 'player-1',
        move_number: 1,
        column_index: 0,
        row_index: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        game_id: 'completed-game',
        player_id: 'player-2',
        move_number: 2,
        column_index: 1,
        row_index: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        game_id: 'completed-game',
        player_id: 'player-1',
        move_number: 3,
        column_index: 0,
        row_index: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        game_id: 'completed-game',
        player_id: 'player-2',
        move_number: 4,
        column_index: 1,
        row_index: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 5,
        game_id: 'completed-game',
        player_id: 'player-1',
        move_number: 5,
        column_index: 0,
        row_index: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 6,
        game_id: 'completed-game',
        player_id: 'player-2',
        move_number: 6,
        column_index: 1,
        row_index: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 7,
        game_id: 'completed-game',
        player_id: 'player-1',
        move_number: 7,
        column_index: 0,
        row_index: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: 8,
        game_id: 'completed-game',
        player_id: 'player-2',
        move_number: 8,
        column_index: 1,
        row_index: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: 9,
        game_id: 'completed-game',
        player_id: 'player-1',
        move_number: 9,
        column_index: 0,
        row_index: 4,
        created_at: new Date().toISOString(),
      },
    ],
    messages: [],
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center gradient-text">Completed Game</h1>
      <GameBoardGomoku
        gameState={mockGameState}
        playerId="player-1"
        onMoveComplete={() => {
          console.log('Move completed!');
        }}
      />
    </div>
  );
}

// Example 4: Integration with hooks (real usage pattern)
export function GomokuWithHooksExample({ gameId }: { gameId: string }) {
  // In a real implementation, you would use:
  // const { gameState, isLoading, error, refetch } = useGameState(gameId);
  // const { playerId } = useLocalPlayer();

  // For this example, we use mock data
  const mockGameState: GameStateResponse = {
    game: {
      id: gameId,
      mode: 'gomoku',
      status: 'active',
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      finished_at: null,
      current_turn: 1,
      winner_id: null,
    },
    players: [
      {
        id: 'player-1',
        game_id: gameId,
        player_number: 1,
        player_name: 'You',
        joined_at: new Date().toISOString(),
        is_ai: false,
      },
      {
        id: 'player-2',
        game_id: gameId,
        player_number: 2,
        player_name: 'Opponent',
        joined_at: new Date().toISOString(),
        is_ai: false,
      },
    ],
    moves: [],
    messages: [],
  };

  const handleMoveComplete = () => {
    // In real usage, you would call refetch() here
    console.log('Move completed, refreshing game state...');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Gomoku - Five in a Row</h1>
          <p className="text-slate-400">
            Click anywhere on the board to place your move. Drag to pan around the infinite grid.
          </p>
        </div>

        <GameBoardGomoku
          gameState={mockGameState}
          playerId="player-1"
          onMoveComplete={handleMoveComplete}
        />

        <div className="mt-8 text-center text-sm text-slate-400">
          <p>💡 Pro tip: Use mouse drag or touch gestures to pan around the board</p>
          <p>📊 The board can handle thousands of moves while maintaining 60fps</p>
        </div>
      </div>
    </div>
  );
}
