import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');
    const since = searchParams.get('since');

    console.log('[API] List messages:', { gameId, since });

    if (!gameId) {
      return NextResponse.json(
        { error: 'game_id is required' },
        { status: 400 }
      );
    }

    const messages: any[] = [];

    return NextResponse.json({
      messages,
    });
  } catch (error) {
    console.error('[API] Error fetching messages:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
