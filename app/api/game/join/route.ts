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

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invite_code, player_name } = body;

    if (!invite_code || typeof invite_code !== 'string' || invite_code.length !== 6) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
    }

    if (!player_name || typeof player_name !== 'string') {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    const inviteCodeUpper = invite_code.toUpperCase();

    // 1. Find game_id by invite_code
    const gameId = await kv.get<string>(`invite:${inviteCodeUpper}`);

    if (!gameId) {
      console.log('[JOIN] Game not found for code:', inviteCodeUpper);
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // 2. Load game from KV
    const game = await kv.get<any>(`game:${gameId}`);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // 3. Check that game is in waiting status
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game already started or finished' },
        { status: 409 }
      );
    }

    // 4. Check that game is not full
    if (game.players.length >= 2) {
      return NextResponse.json({ error: 'Game is full' }, { status: 409 });
    }

    // 5. Add second player
    const playerId = generateId();
    const now = new Date().toISOString();

    const newPlayer = {
      id: playerId,
      game_id: gameId,
      player_number: 2,
      player_name,
      is_ai: false,
      joined_at: now,
    };

    game.players.push(newPlayer);
    game.status = 'active';
    game.current_turn = 1; // First player goes first
    game.started_at = now;

    // 6. Update in KV
    await kv.set(`game:${gameId}`, game, { ex: 86400 });

    console.log('[JOIN] Player joined:', { gameId, playerId, inviteCode: inviteCodeUpper });

    // 7. Send notification to first player through Pusher
    try {
      await pusher.trigger(`game-${gameId}`, 'player-joined', {
        game,
        player: newPlayer,
        message: 'Opponent connected! Game starting...',
      });

      console.log('[JOIN] Pusher notification sent to game:', gameId);
    } catch (pusherError) {
      console.error('[JOIN] Pusher error:', pusherError);
      // Continue even if Pusher fails
    }

    return NextResponse.json(
      {
        game,
        player: newPlayer,
        player_id: playerId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[JOIN] Error:', error);
    return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
