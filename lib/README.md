# Frontend API Library

This directory contains TypeScript types, API client functions, React hooks, and game logic utilities for the Tic-Tac-Toe/Gomoku game application.

## Files

### `types.ts`

Defines all TypeScript interfaces and types that align with the backend Pydantic models:

- **Game Types**: `GameMode`, `GameStatus`, `Symbol`, `Game`
- **Player Types**: `Player`
- **Move Types**: `Move`
- **Message Types**: `Message`, `MessageType`
- **Request/Response DTOs**: `CreateGameRequest`, `CreateGameResponse`, `JoinGameRequest`, `JoinGameResponse`, `MakeMoveRequest`, `MakeMoveResponse`, `SendMessageRequest`, `GameStateResponse`, `ChatMessagesResponse`
- **UI Types**: `BoardCell`, `GameBoard`

### `api.ts`

API client functions using fetch with error handling:

#### Game API Functions

- `createGame(request: CreateGameRequest): Promise<CreateGameResponse>`
- `joinGame(request: JoinGameRequest): Promise<JoinGameResponse>`
- `getGameState(gameId: string): Promise<GameStateResponse>`
- `makeMove(request: MakeMoveRequest): Promise<MakeMoveResponse>`

#### Chat API Functions

- `sendMessage(request: SendMessageRequest): Promise<Message>`
- `getMessages(gameId: string, since?: string): Promise<ChatMessagesResponse>`

#### Features

- ✅ Relative path base URL for Vercel compatibility
- ✅ JSON parsing and HTTP error handling
- ✅ Tree-shakeable exports
- ✅ TypeScript error types (`ApiError`)

### `hooks.ts`

React hooks for state management and polling:

#### `useLocalPlayer()`

Manages player ID in localStorage with SSR guards.

```typescript
const { playerId, savePlayerId, isLoading } = useLocalPlayer();
```

**Returns:**

- `playerId: string | null` - Current player ID from localStorage
- `savePlayerId: (id: string | null) => void` - Save or clear player ID
- `isLoading: boolean` - Loading state during hydration

#### `useGameState(gameId, pollingInterval?)`

Polls game state at regular intervals with automatic cleanup.

```typescript
const { gameState, isLoading, error, refetch } = useGameState(gameId, 2000);
```

**Parameters:**

- `gameId: string | null` - Game ID to poll (null disables polling)
- `pollingInterval?: number` - Polling interval in ms (default: 2000)

**Returns:**

- `gameState: GameStateResponse | null` - Current game state
- `isLoading: boolean` - Loading indicator
- `error: Error | null` - Error if fetch failed
- `refetch: () => void` - Manually trigger a refresh

#### `useChat(gameId, pollingInterval?)`

Polls chat messages with automatic deduplication.

```typescript
const { messages, isLoading, error } = useChat(gameId, 2000);
```

**Parameters:**

- `gameId: string | null` - Game ID to poll (null disables polling)
- `pollingInterval?: number` - Polling interval in ms (default: 2000)

**Returns:**

- `messages: Message[]` - Deduplicated list of messages
- `isLoading: boolean` - Loading indicator
- `error: Error | null` - Error if fetch failed

**Features:**

- ✅ Automatic message deduplication by ID
- ✅ Uses `since` parameter to fetch only new messages
- ✅ Proper cleanup on unmount
- ✅ SSR-safe

### `game-logic.ts`

Client-side game logic utilities:

#### Board Management

- `getBoardSize(mode: GameMode): number` - Get board size for mode
- `buildBoard(mode: GameMode, moves: Move[], players: Player[]): GameBoard` - Build 2D board from moves
- `isValidPosition(mode: GameMode, row: number, column: number): boolean` - Check if position is valid
- `isPositionOccupied(board: GameBoard, row: number, column: number): boolean` - Check if position is occupied
- `validateMove(board: GameBoard, row: number, column: number)` - Validate move before submission

#### Win Detection

- `checkWinner(mode: GameMode, board: GameBoard): Symbol` - Check for winner
- `isBoardFull(board: GameBoard): boolean` - Check if board is full (for draw detection)

#### Coordinate Conversion

- `getCellFromCoordinates(cellSize: number, x: number, y: number)` - Convert pixel coordinates to cell
- `getCellCoordinates(cellSize: number, row: number, column: number)` - Get pixel coordinates for cell

#### Turn Management

- `getCurrentPlayer(currentTurn: number | null, players: Player[]): Player | null` - Get current player
- `isPlayerTurn(playerId: string, currentTurn: number | null, players: Player[]): boolean` - Check if it's player's turn

## Usage Examples

### Creating a Game

```typescript
import { createGame } from "@/lib/api";
import { useLocalPlayer } from "@/lib/hooks";

const { savePlayerId } = useLocalPlayer();

const response = await createGame({
  player_name: "Alice",
  mode: "classic3",
  is_ai_opponent: false,
});

savePlayerId(response.player_id);
console.log("Invite code:", response.invite_code);
```

### Joining a Game

```typescript
import { joinGame } from "@/lib/api";
import { useLocalPlayer } from "@/lib/hooks";

const { savePlayerId } = useLocalPlayer();

const response = await joinGame({
  invite_code: "ABC123",
  player_name: "Bob",
});

savePlayerId(response.player.id);
```

### Displaying Game State

```typescript
import { useGameState } from "@/lib/hooks";
import { buildBoard } from "@/lib/game-logic";

function GameBoard({ gameId }: { gameId: string }) {
  const { gameState, isLoading, error } = useGameState(gameId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!gameState) return null;

  const { game, players, moves } = gameState;
  const board = buildBoard(game.mode, moves, players);

  return (
    <div>
      <h1>Game {game.id}</h1>
      <p>Status: {game.status}</p>
      {/* Render board.cells here */}
    </div>
  );
}
```

### Making a Move

```typescript
import { makeMove } from "@/lib/api";
import { validateMove } from "@/lib/game-logic";

const handleMove = async (row: number, column: number) => {
  const validation = validateMove(board, row, column);
  if (!validation.valid) {
    console.error(validation.error);
    return;
  }

  await makeMove({
    game_id: gameId,
    player_id: playerId,
    row_index: row,
    column_index: column,
  });
};
```

### Chat Integration

```typescript
import { useChat } from "@/lib/hooks";
import { sendMessage } from "@/lib/api";

function Chat({ gameId, playerId }: { gameId: string; playerId: string }) {
  const { messages, isLoading, error } = useChat(gameId);

  const handleSend = async (text: string) => {
    await sendMessage({
      game_id: gameId,
      player_id: playerId,
      text,
    });
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## Testing

### Running Game Logic Tests

```bash
npx tsx lib/__tests__/game-logic.test.ts
```

### Example Components

See `lib/__tests__/hooks-example.tsx` for complete component examples demonstrating:

- Game state management
- Chat functionality
- Create/join game flows
- Local player persistence

## Architecture Notes

### Polling Strategy

- Hooks use `setInterval` for polling at configurable intervals (default: 2s)
- Proper cleanup on unmount prevents memory leaks
- `useRef` tracks mounted state to prevent state updates after unmount

### SSR Compatibility

- `useLocalPlayer` includes SSR guards for localStorage access
- All hooks use `"use client"` directive for Next.js compatibility
- API client works on both client and server with appropriate base URL detection

### Error Handling

- API functions throw `ApiError` with status codes and details
- Hooks expose `error` state for UI error handling
- Network errors are caught and converted to `ApiError` instances

### Type Safety

- All types align with backend Pydantic models
- Request/response types ensure contract compliance
- Strict TypeScript mode enabled in tsconfig.json

## Dependencies

These utilities depend on:

- React 18+ (for hooks)
- Next.js 14+ (for SSR support)
- TypeScript 5+

No additional dependencies required - uses native `fetch` API.
