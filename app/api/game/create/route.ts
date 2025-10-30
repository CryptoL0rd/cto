function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: Request) {
  try {
    console.log('[API CREATE] Function called');
    
    // Parse body
    let body;
    try {
      body = await request.json();
      console.log('[API CREATE] Body parsed:', body);
    } catch (e) {
      console.error('[API CREATE] Failed to parse body:', e);
      return Response.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { mode, player_name, is_ai_opponent } = body;
    console.log('[API CREATE] Params:', { mode, player_name, is_ai_opponent });

    // Validate mode
    if (!mode || !['classic3', 'gomoku', 'gomoku5'].includes(mode)) {
      console.log('[API CREATE] Invalid mode:', mode);
      return Response.json(
        { error: 'Invalid game mode. Must be classic3, gomoku, or gomoku5' },
        { status: 400 }
      );
    }

    // Validate player name
    if (!player_name || typeof player_name !== 'string') {
      console.log('[API CREATE] Invalid player name');
      return Response.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    // Generate IDs
    const gameId = `game_${generateId()}`;
    const inviteCode = generateInviteCode();
    const playerId = generateId();
    const now = new Date().toISOString();

    console.log('[API CREATE] Generated:', { gameId, inviteCode, playerId });

    const game = {
      id: gameId,
      invite_code: inviteCode,
      mode,
      status: is_ai_opponent ? 'active' : 'waiting',
      created_at: now,
      started_at: is_ai_opponent ? now : null,
      finished_at: null,
      current_turn: is_ai_opponent ? 1 : null,
      winner_id: null,
    };

    const player = {
      id: playerId,
      game_id: gameId,
      player_number: 1,
      player_name,
      joined_at: now,
      is_ai: false,
    };

    const responseData = {
      game,
      player_id: playerId,
      player,
    };

    console.log('[API CREATE] Success, returning:', responseData);

    return Response.json(responseData, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[API CREATE] Unexpected error:', error);
    console.error('[API CREATE] Stack:', error instanceof Error ? error.stack : 'No stack');
    
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
