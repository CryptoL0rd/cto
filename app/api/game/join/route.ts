import { NextResponse } from 'next/server';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invite_code, player_name } = body;

    console.log('[API] Join game request:', { invite_code, player_name });

    if (!invite_code || typeof invite_code !== 'string') {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    if (invite_code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid invite code format. Must be 6 characters' },
        { status: 400 }
      );
    }

    if (!player_name || typeof player_name !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const gameId = invite_code;
    const playerId = generateId();
    const now = new Date().toISOString();

    const player = {
      id: playerId,
      game_id: gameId,
      player_number: 2,
      player_name,
      joined_at: now,
      is_ai: false,
    };

    console.log('[API] Player joined game:', { gameId, playerId, invite_code });

    return NextResponse.json(
      {
        player,
        game_id: gameId,
        mode: 'classic3',
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error joining game:', error);
    return NextResponse.json(
      { 
        error: 'Failed to join game',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
