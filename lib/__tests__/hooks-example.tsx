// Example usage of React hooks for game and chat functionality
// This demonstrates how to use the hooks in a React component

"use client";

import { useGameState, useChat, useLocalPlayer } from "../hooks";
import { createGame, joinGame, makeMove, sendMessage } from "../api";
import { buildBoard, validateMove, isPlayerTurn } from "../game-logic";

// Example: Game component using useGameState hook
export function GameComponent({ gameId }: { gameId: string }) {
  const { gameState, isLoading, error, refetch } = useGameState(gameId, 2000);
  const { playerId } = useLocalPlayer();

  if (isLoading && !gameState) {
    return <div>Loading game...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!gameState) {
    return <div>No game data</div>;
  }

  const { game, players, moves } = gameState;
  const board = buildBoard(game.mode, moves, players);
  const isMyTurn = playerId
    ? isPlayerTurn(playerId, game.current_turn, players)
    : false;

  const handleCellClick = async (row: number, column: number) => {
    if (!playerId || !isMyTurn) return;

    const validation = validateMove(board, row, column);
    if (!validation.valid) {
      console.error(validation.error);
      return;
    }

    try {
      await makeMove({
        game_id: gameId,
        player_id: playerId,
        row_index: row,
        column_index: column,
      });
      refetch(); // Refresh game state immediately
    } catch (error) {
      console.error("Failed to make move:", error);
    }
  };

  return (
    <div>
      <h1>Game {game.id}</h1>
      <p>Status: {game.status}</p>
      <p>Mode: {game.mode}</p>
      {isMyTurn && <p>It&apos;s your turn!</p>}

      {/* Board would be rendered here */}
      <div className="board">
        {board.cells.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!isMyTurn || cell.symbol !== null}
              >
                {cell.symbol || "·"}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Example: Chat component using useChat hook
export function ChatComponent({ gameId }: { gameId: string }) {
  const { messages, isLoading, error } = useChat(gameId, 2000);
  const { playerId } = useLocalPlayer();

  const handleSendMessage = async (text: string) => {
    if (!playerId || !text.trim()) return;

    try {
      await sendMessage({
        game_id: gameId,
        player_id: playerId,
        text: text.trim(),
      });
      // Messages will be updated automatically by the polling hook
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      {error && <div>Error loading messages: {error.message}</div>}

      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <span className="timestamp">{message.created_at}</span>
            <span className="content">{message.content}</span>
          </div>
        ))}
        {isLoading && messages.length === 0 && <div>Loading messages...</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem(
            "message"
          ) as HTMLInputElement;
          handleSendMessage(input.value);
          input.value = "";
        }}
      >
        <input name="message" type="text" placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// Example: Create game flow
export function CreateGameComponent() {
  const { savePlayerId } = useLocalPlayer();

  const handleCreateGame = async () => {
    try {
      const response = await createGame({
        player_name: "Player 1",
        mode: "classic3",
        is_ai_opponent: false,
      });

      // Save player ID to localStorage
      savePlayerId(response.player_id);

      // Navigate to game (example - would use Next.js router in real app)
      console.log("Game created:", response.invite_code);
      console.log("Player ID:", response.player_id);
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  return (
    <div>
      <h1>Create a Game</h1>
      <button onClick={handleCreateGame}>Create Game</button>
    </div>
  );
}

// Example: Join game flow
export function JoinGameComponent({ inviteCode }: { inviteCode: string }) {
  const { savePlayerId } = useLocalPlayer();

  const handleJoinGame = async () => {
    try {
      const response = await joinGame({
        invite_code: inviteCode,
        player_name: "Player 2",
      });

      // Save player ID to localStorage
      savePlayerId(response.player.id);

      // Navigate to game
      console.log("Joined game:", response.game_id);
      console.log("Player ID:", response.player.id);
    } catch (error) {
      console.error("Failed to join game:", error);
    }
  };

  return (
    <div>
      <h1>Join Game</h1>
      <p>Invite Code: {inviteCode}</p>
      <button onClick={handleJoinGame}>Join Game</button>
    </div>
  );
}

// Example: Using useLocalPlayer hook
export function PlayerInfo() {
  const { playerId, savePlayerId, isLoading } = useLocalPlayer();

  if (isLoading) {
    return <div>Loading player info...</div>;
  }

  if (!playerId) {
    return (
      <div>
        <p>No player ID found</p>
        <button onClick={() => savePlayerId("test-player-id")}>
          Set Test Player ID
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>Player ID: {playerId}</p>
      <button onClick={() => savePlayerId(null)}>Clear Player ID</button>
    </div>
  );
}
