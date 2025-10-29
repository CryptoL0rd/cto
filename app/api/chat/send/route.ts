import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { game_id, player_id, text } = body;

    console.log('[API] Send message:', { game_id, player_id, text });

    if (!game_id || !player_id) {
      return NextResponse.json(
        { error: 'game_id and player_id are required' },
        { status: 400 }
      );
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text is required and must be a string' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const messageId = Math.floor(Math.random() * 1000000);

    const message = {
      id: messageId,
      game_id,
      player_id,
      message_type: 'chat' as const,
      content: text,
      created_at: now,
    };

    return NextResponse.json(message, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[API] Error sending message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
