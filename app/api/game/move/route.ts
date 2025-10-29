import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { game_id, player_id, column_index, row_index } = body;

    console.log('[API] Make move:', { game_id, player_id, column_index, row_index });

    if (!game_id || !player_id) {
      return NextResponse.json(
        { error: 'game_id and player_id are required' },
        { status: 400 }
      );
    }

    if (typeof column_index !== 'number' || typeof row_index !== 'number') {
      return NextResponse.json(
        { error: 'column_index and row_index must be numbers' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const moveId = Math.floor(Math.random() * 1000000);

    const move = {
      id: moveId,
      game_id,
      player_id,
      move_number: 1,
      column_index,
      row_index,
      created_at: now,
    };

    return NextResponse.json(
      {
        move,
        is_winner: false,
        is_draw: false,
        game_status: 'active',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error making move:', error);
    return NextResponse.json(
      { 
        error: 'Failed to make move',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
