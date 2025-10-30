import { broadcastChatUpdate } from '@/server/websocket';

export async function POST(request: Request) {
  try {
    console.log('[API CHAT SEND] Function called');
    
    // Parse body
    let body;
    try {
      body = await request.json();
      console.log('[API CHAT SEND] Body parsed:', body);
    } catch (e) {
      console.error('[API CHAT SEND] Failed to parse body:', e);
      return Response.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { game_id, player_id, text } = body;
    console.log('[API CHAT SEND] Params:', { game_id, player_id, text });

    // Validate required fields
    if (!game_id || !player_id) {
      console.log('[API CHAT SEND] Missing required fields');
      return Response.json(
        { error: 'game_id and player_id are required' },
        { status: 400 }
      );
    }

    // Validate message text
    if (!text || typeof text !== 'string') {
      console.log('[API CHAT SEND] Invalid text');
      return Response.json(
        { error: 'text is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate message
    const now = new Date().toISOString();
    const messageId = Math.floor(Math.random() * 1000000);

    console.log('[API CHAT SEND] Generated message ID:', messageId);

    const message = {
      id: messageId,
      game_id,
      player_id,
      message_type: 'chat' as const,
      content: text,
      created_at: now,
    };

    // Broadcast chat update via WebSocket
    try {
      broadcastChatUpdate(game_id, [message]);
    } catch (error) {
      console.error('[API CHAT SEND] Failed to broadcast WebSocket update:', error);
      // Don't fail the request if WebSocket broadcast fails
    }

    console.log('[API CHAT SEND] Success, returning message');

    return Response.json(message, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[API CHAT SEND] Unexpected error:', error);
    console.error('[API CHAT SEND] Stack:', error instanceof Error ? error.stack : 'No stack');
    
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
