// DEPRECATED: WebSocket server for real-time game state updates
// This file is no longer used. The application now uses Pusher (see server/pusher.ts)
// Keeping this file for reference only
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

interface WebSocketClient extends WebSocket {
  gameId?: string;
  playerId?: string;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'game_update' | 'chat_update';
  gameId?: string;
  playerId?: string;
  data?: any;
}

class GameWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocketClient>> = new Map(); // gameId -> Set of clients
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(port: number = 3001) {
    this.wss = new WebSocketServer({ port });
    console.log(`[WebSocket] Server started on port ${port}`);

    this.wss.on('connection', (ws: WebSocketClient, req: IncomingMessage) => {
      console.log('[WebSocket] New client connected');
      ws.isAlive = true;

      // Handle pong responses for heartbeat
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected');
        this.unsubscribeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Client error:', error);
        this.unsubscribeClient(ws);
      });
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();
  }

  private handleMessage(ws: WebSocketClient, message: WebSocketMessage) {
    switch (message.type) {
      case 'subscribe':
        if (message.gameId) {
          this.subscribeClient(ws, message.gameId, message.playerId);
          ws.send(JSON.stringify({ type: 'subscribed', gameId: message.gameId }));
          console.log(`[WebSocket] Client subscribed to game: ${message.gameId}`);
        }
        break;

      case 'unsubscribe':
        if (message.gameId) {
          this.unsubscribeClientFromGame(ws, message.gameId);
          ws.send(JSON.stringify({ type: 'unsubscribed', gameId: message.gameId }));
          console.log(`[WebSocket] Client unsubscribed from game: ${message.gameId}`);
        }
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        console.warn('[WebSocket] Unknown message type:', message.type);
    }
  }

  private subscribeClient(ws: WebSocketClient, gameId: string, playerId?: string) {
    // Unsubscribe from previous game if any
    if (ws.gameId && ws.gameId !== gameId) {
      this.unsubscribeClientFromGame(ws, ws.gameId);
    }

    ws.gameId = gameId;
    ws.playerId = playerId;

    if (!this.clients.has(gameId)) {
      this.clients.set(gameId, new Set());
    }

    this.clients.get(gameId)!.add(ws);
  }

  private unsubscribeClientFromGame(ws: WebSocketClient, gameId: string) {
    const gameClients = this.clients.get(gameId);
    if (gameClients) {
      gameClients.delete(ws);
      if (gameClients.size === 0) {
        this.clients.delete(gameId);
      }
    }
  }

  private unsubscribeClient(ws: WebSocketClient) {
    if (ws.gameId) {
      this.unsubscribeClientFromGame(ws, ws.gameId);
      ws.gameId = undefined;
      ws.playerId = undefined;
    }
  }

  // Broadcast game state update to all clients in a game room
  public broadcastGameUpdate(gameId: string, gameState: any) {
    const gameClients = this.clients.get(gameId);
    if (!gameClients || gameClients.size === 0) {
      return;
    }

    const message = JSON.stringify({
      type: 'game_update',
      gameId,
      data: gameState,
    });

    let sent = 0;
    gameClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sent++;
      }
    });

    console.log(`[WebSocket] Broadcasted game update to ${sent} clients for game: ${gameId}`);
  }

  // Broadcast chat message to all clients in a game room
  public broadcastChatUpdate(gameId: string, messages: any[]) {
    const gameClients = this.clients.get(gameId);
    if (!gameClients || gameClients.size === 0) {
      return;
    }

    const message = JSON.stringify({
      type: 'chat_update',
      gameId,
      data: messages,
    });

    let sent = 0;
    gameClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sent++;
      }
    });

    console.log(`[WebSocket] Broadcasted chat update to ${sent} clients for game: ${gameId}`);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const client = ws as WebSocketClient;
        if (client.isAlive === false) {
          console.log('[WebSocket] Terminating dead connection');
          this.unsubscribeClient(client);
          return client.terminate();
        }

        client.isAlive = false;
        client.ping();
      });
    }, 30000); // Check every 30 seconds
  }

  public close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
  }

  public getClientCount(gameId?: string): number {
    if (gameId) {
      return this.clients.get(gameId)?.size || 0;
    }
    return this.wss.clients.size;
  }
}

// Singleton instance
let wsServer: GameWebSocketServer | null = null;

export function getWebSocketServer(): GameWebSocketServer {
  if (!wsServer) {
    const port = parseInt(process.env.WS_PORT || '3001', 10);
    wsServer = new GameWebSocketServer(port);
  }
  return wsServer;
}

export function broadcastGameUpdate(gameId: string, gameState: any) {
  const server = getWebSocketServer();
  server.broadcastGameUpdate(gameId, gameState);
}

export function broadcastChatUpdate(gameId: string, messages: any[]) {
  const server = getWebSocketServer();
  server.broadcastChatUpdate(gameId, messages);
}

export default GameWebSocketServer;
