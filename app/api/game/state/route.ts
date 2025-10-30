export async function GET(request: Request) {
  try {
    console.log('[API STATE] Function called');
    
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    console.log('[API STATE] Params:', { gameId });

    // Validate game_id
    if (!gameId) {
      console.log('[API STATE] Missing game_id');
      return Response.json(
        { error: 'game_id parameter is required' },
        { status: 400 }
      );
    }

    // Generate mock game state
    const now = new Date().toISOString();
    const createdAt = new Date(Date.now() - 120000).toISOString();
    const startedAt = new Date(Date.now() - 60000).toISOString();

    console.log('[API STATE] Generating game state for:', gameId);

    const game = {
      id: gameId,
      invite_code: 'MOCK01',
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

    const responseData = {
      game,
      players,
      moves,
      messages,
    };

    console.log('[API STATE] Success, returning game state');

    return Response.json(responseData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[API STATE] Unexpected error:', error);
    console.error('[API STATE] Stack:', error instanceof Error ? error.stack : 'No stack');
    
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
