export async function GET(request: Request) {
  try {
    console.log('[API CHAT LIST] Function called');

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');
    const since = searchParams.get('since');

    console.log('[API CHAT LIST] Params:', { gameId, since });

    // Validate game_id
    if (!gameId) {
      console.log('[API CHAT LIST] Missing game_id');
      return Response.json({ error: 'game_id is required' }, { status: 400 });
    }

    // Return empty messages array (mock implementation)
    const messages: any[] = [];

    console.log('[API CHAT LIST] Success, returning messages');

    return Response.json(
      { messages },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[API CHAT LIST] Unexpected error:', error);
    console.error('[API CHAT LIST] Stack:', error instanceof Error ? error.stack : 'No stack');

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
