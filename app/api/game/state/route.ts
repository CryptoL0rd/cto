import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json({ error: 'game_id is required' }, { status: 400 });
    }

    const game = await kv.get<any>(`game:${gameId}`);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    console.log('[STATE] Game loaded:', {
      gameId,
      status: game.status,
      players: game.players.length,
    });

    // Return in the format expected by the frontend
    return NextResponse.json(
      {
        game: {
          id: game.id,
          invite_code: game.invite_code,
          mode: game.mode,
          status: game.status,
          created_at: game.created_at,
          started_at: game.started_at,
          finished_at: game.finished_at,
          current_turn: game.current_turn,
          winner_id: game.winner_id,
        },
        players: game.players,
        moves: [], // TODO: Implement moves from KV if needed
        messages: [], // TODO: Implement messages from KV if needed
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[STATE] Error:', error);
    return NextResponse.json({ error: 'Failed to get game state' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
