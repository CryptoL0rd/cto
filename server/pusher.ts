// Pusher integration for real-time game state updates
import Pusher from 'pusher';

// Singleton instance
let pusherInstance: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherInstance) {
    // Check if Pusher credentials are configured
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.PUSHER_CLUSTER || 'mt1';

    if (!appId || !key || !secret) {
      console.warn('[Pusher] Credentials not configured. Real-time updates will be disabled.');
      console.warn(
        '[Pusher] Set PUSHER_APP_ID, PUSHER_KEY, and PUSHER_SECRET in environment variables.'
      );

      // Return a mock Pusher instance that doesn't throw errors
      return {
        trigger: async () => {
          console.log('[Pusher] Mock trigger called (credentials not configured)');
        },
      } as any;
    }

    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });

    console.log(`[Pusher] Server initialized with cluster: ${cluster}`);
  }

  return pusherInstance;
}

export async function broadcastGameUpdate(gameId: string, gameState: any) {
  try {
    const pusher = getPusherServer();

    await pusher.trigger(`game-${gameId}`, 'game-update', gameState);

    console.log(`[Pusher] Broadcasted game update for game: ${gameId}`);
  } catch (error) {
    console.error('[Pusher] Failed to broadcast game update:', error);
    throw error;
  }
}

export async function broadcastChatUpdate(gameId: string, messages: any[]) {
  try {
    const pusher = getPusherServer();

    await pusher.trigger(`game-${gameId}`, 'chat-update', messages);

    console.log(`[Pusher] Broadcasted chat update for game: ${gameId}`);
  } catch (error) {
    console.error('[Pusher] Failed to broadcast chat update:', error);
    throw error;
  }
}

export default getPusherServer;
