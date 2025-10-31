import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    ''
  );
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, player_name } = body;

    if (!mode || !['classic3', 'gomoku5'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid game mode' }, { status: 400 });
    }

    if (!player_name || typeof player_name !== 'string') {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    const gameId = `game_${generateId()}`;
    const playerId = generateId();
    const inviteCode = generateInviteCode();
    const now = new Date().toISOString();

    const game = {
      id: gameId,
      invite_code: inviteCode,
      mode,
      status: 'waiting',
      current_turn: null,
      winner_id: null,
      board: mode === 'classic3' ? Array(9).fill(null) : [],
      players: [
        {
          id: playerId,
          game_id: gameId,
          player_number: 1,
          player_name,
          is_ai: false,
          joined_at: now,
        },
      ],
      created_at: now,
      started_at: null,
      finished_at: null,
    };

    // Save to KV
    await kv.set(`game:${gameId}`, game, { ex: 86400 }); // 24 hours
    await kv.set(`invite:${inviteCode}`, gameId, { ex: 86400 });

    console.log('[CREATE] Game created:', { gameId, inviteCode });

    return NextResponse.json(
      {
        game,
        player_id: playerId,
        player: game.players[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE] Error:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
