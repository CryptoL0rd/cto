import { getGameState, createGameState } from '../gameState';

export async function GET(request: Request) {
  try {
    console.log('[API STATE] Function called');

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    console.log('[API STATE] Params:', { gameId });

    // Validate game_id
    if (!gameId) {
      console.log('[API STATE] Missing game_id');
      return Response.json({ error: 'game_id parameter is required' }, { status: 400 });
    }

    // Get or create game state
    let gameState = getGameState(gameId);

    if (!gameState) {
      console.log('[API STATE] Creating new game state for:', gameId);
      gameState = createGameState(gameId);
    }

    console.log('[API STATE] Returning game state with', gameState.moves.length, 'moves');

    return Response.json(gameState, {
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
