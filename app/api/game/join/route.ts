function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: Request) {
  try {
    console.log('[API JOIN] Function called');
    
    // Parse body
    let body;
    try {
      body = await request.json();
      console.log('[API JOIN] Body parsed:', body);
    } catch (e) {
      console.error('[API JOIN] Failed to parse body:', e);
      return Response.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { invite_code, player_name } = body;
    console.log('[API JOIN] Params:', { invite_code, player_name });

    // Validate invite code
    if (!invite_code || typeof invite_code !== 'string') {
      console.log('[API JOIN] Missing invite code');
      return Response.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    if (invite_code.length !== 6) {
      console.log('[API JOIN] Invalid invite code length:', invite_code.length);
      return Response.json(
        { error: 'Invalid invite code format. Must be 6 characters' },
        { status: 400 }
      );
    }

    // Validate player name
    if (!player_name || typeof player_name !== 'string') {
      console.log('[API JOIN] Invalid player name');
      return Response.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    // Generate IDs
    const gameId = invite_code.toUpperCase();
    const playerId = generateId();
    const now = new Date().toISOString();

    console.log('[API JOIN] Generated:', { gameId, playerId });

    const player = {
      id: playerId,
      game_id: gameId,
      player_number: 2,
      player_name,
      joined_at: now,
      is_ai: false,
    };

    const responseData = {
      player,
      game_id: gameId,
      mode: 'classic3',
    };

    console.log('[API JOIN] Success, returning:', responseData);

    return Response.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[API JOIN] Unexpected error:', error);
    console.error('[API JOIN] Stack:', error instanceof Error ? error.stack : 'No stack');
    
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
