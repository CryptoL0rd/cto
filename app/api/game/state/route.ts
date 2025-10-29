import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    console.log('[API] Get game state:', { gameId });

    if (!gameId) {
      return NextResponse.json(
        { error: 'game_id parameter is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const createdAt = new Date(Date.now() - 120000).toISOString();
    const startedAt = new Date(Date.now() - 60000).toISOString();

    const game = {
      id: gameId,
      mode: 'classic3',
      status: 'active',
      created_at: createdAt,
      started_at: startedAt,
      finished_at: null,
      current_turn: 1,
      winner_id: null,
    };

    const players = [
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
    ];

    const moves: any[] = [];
    const messages: any[] = [];

    return NextResponse.json({
      game,
      players,
      moves,
      messages,
    });
  } catch (error) {
    console.error('[API] Error getting game state:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get game state',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
