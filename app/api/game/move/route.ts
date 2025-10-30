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
      return Response.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { game_id, player_id, column_index, row_index } = body;
    console.log('[API MOVE] Params:', { game_id, player_id, column_index, row_index });

    // Validate required fields
    if (!game_id || !player_id) {
      console.log('[API MOVE] Missing required fields');
      return Response.json(
        { error: 'game_id and player_id are required' },
        { status: 400 }
      );
    }

    // Validate move coordinates
    if (typeof column_index !== 'number' || typeof row_index !== 'number') {
      console.log('[API MOVE] Invalid move coordinates');
      return Response.json(
        { error: 'column_index and row_index must be numbers' },
        { status: 400 }
      );
    }

    // Generate move data
    const now = new Date().toISOString();
    const moveId = Math.floor(Math.random() * 1000000);

    console.log('[API MOVE] Generated move ID:', moveId);

    const move = {
      id: moveId,
      game_id,
      player_id,
      move_number: 1,
      column_index,
      row_index,
      created_at: now,
    };

    const responseData = {
      move,
      is_winner: false,
      is_draw: false,
      game_status: 'active',
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
