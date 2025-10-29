import { NextResponse } from 'next/server';

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
    const body = await request.json();
    const { mode, player_name, is_ai_opponent } = body;

    console.log('[API] Create game request:', { mode, player_name, is_ai_opponent });

    if (!mode || !['classic3', 'gomoku'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid game mode. Must be classic3 or gomoku' },
        { status: 400 }
      );
    }

    if (!player_name || typeof player_name !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const inviteCode = generateInviteCode();
    const playerId = generateId();
    const now = new Date().toISOString();

    const game = {
      id: inviteCode,
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
      game_id: inviteCode,
      player_number: 1,
      player_name,
      joined_at: now,
      is_ai: false,
    };

    console.log('[API] Game created:', { gameId: inviteCode, playerId, mode });

    return NextResponse.json(
      {
        game,
        player_id: playerId,
        invite_code: inviteCode,
        player,
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error creating game:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create game',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
