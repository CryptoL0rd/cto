import { NextResponse } from 'next/server';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invite_code, player_name } = body;

    if (!invite_code || typeof invite_code !== 'string') {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    if (invite_code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid invite code format' },
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

    return NextResponse.json(
      {
        player,
        game_id: gameId,
        mode: 'classic3',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}
