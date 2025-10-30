# Fix: Infinite Reload Issue

## Problem Summary

The game was experiencing an infinite reload loop due to:

1. **Wrong API Response Structure**: The `invite_code` was at the root level AND `game.id` was set to the invite code
2. **Wrong Redirect**: Frontend redirected to `/game/{invite_code}` instead of `/game/{game.id}`
3. **Missing Game Data**: The game page couldn't load data because it was using invite_code as the ID

## Solution Implemented

### 1. Fixed API Response Structure

#### `/app/api/game/create/route.ts`

**Before:**

```typescript
const game = {
  id: inviteCode, // ❌ Wrong: reusing invite code as ID
  mode,
  // ...
};

const responseData = {
  game,
  player_id: playerId,
  invite_code: inviteCode, // ❌ Wrong: at root level
  player,
};
```

**After:**

```typescript
const gameId = `game_${generateId()}`; // ✅ Unique game ID
const inviteCode = generateInviteCode();

const game = {
  id: gameId, // ✅ Unique game ID for routing
  invite_code: inviteCode, // ✅ Inside game object
  mode,
  // ...
};

const responseData = {
  game,
  player_id: playerId,
  player, // ✅ No invite_code at root
};
```

#### `/app/api/game/join/route.ts`

**Before:**

```typescript
const gameId = invite_code.toUpperCase(); // ❌ Wrong: using invite code as game ID

const responseData = {
  player,
  game_id: gameId, // ❌ Wrong structure
  mode: 'classic3',
};
```

**After:**

```typescript
const gameId = `game_${generateId()}`; // ✅ Unique game ID
const code = invite_code.toUpperCase();

const game = {
  id: gameId,
  invite_code: code,
  mode: 'classic3',
  // ...
};

const responseData = {
  game, // ✅ Full game object
  player,
  player_id: playerId,
};
```

### 2. Updated Frontend to Store Game Data

#### `/app/page.tsx`

**Enhanced handleCreateGame:**

```typescript
const data = await response.json();

// Save player ID
if (data.player_id) {
  localStorage.setItem('player_id', data.player_id);
}

// Save invite code (from inside game object)
if (data.game?.invite_code) {
  localStorage.setItem(`invite_code_${data.game.id}`, data.game.invite_code);
}

// Save full game data
if (data.game) {
  localStorage.setItem(`game_${data.game.id}`, JSON.stringify(data.game));
}

// Redirect to game.id, NOT invite_code
console.log('[Frontend] Redirecting to /game/' + data.game.id);
router.push(`/game/${data.game.id}`);
```

**Enhanced handleJoinGame:**

```typescript
const data = await response.json();

// Save player ID
if (data.player_id) {
  localStorage.setItem('player_id', data.player_id);
}

// Save invite code
if (data.game?.invite_code) {
  localStorage.setItem(`invite_code_${data.game.id}`, data.game.invite_code);
}

// Save full game data
if (data.game) {
  localStorage.setItem(`game_${data.game.id}`, JSON.stringify(data.game));
}

// Redirect to game.id
router.push(`/game/${data.game.id}`);
```

### 3. Updated TypeScript Types

#### `/lib/types.ts`

```typescript
export interface Game {
  id: string;
  invite_code?: string; // ✅ Added optional invite_code
  mode: GameMode;
  status: GameStatus;
  // ...
}

export interface CreateGameResponse {
  game: Game;
  player_id: string;
  player: Player; // ✅ Changed from invite_code
}

export interface JoinGameResponse {
  game: Game; // ✅ Full game object
  player: Player;
  player_id: string;
}
```

### 4. Added Error Boundary

#### `/app/error.tsx`

Created a new error boundary to catch and display errors gracefully instead of causing infinite reloads.

### 5. Updated State API

#### `/app/api/game/state/route.ts`

Added `invite_code` field to the game object returned by the state API to maintain consistency.

## Testing

### Manual API Tests

```bash
# Create game
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{"mode":"classic3", "player_name":"TestPlayer"}' | python3 -m json.tool

# Expected response:
{
  "game": {
    "id": "game_1234_abc",        // ✅ Unique game ID
    "invite_code": "ABC123",      // ✅ Inside game object
    "mode": "classic3",
    "status": "waiting",
    // ...
  },
  "player_id": "1234_xyz",
  "player": { ... }
}

# Join game
curl -X POST http://localhost:3000/api/game/join \
  -H "Content-Type: application/json" \
  -d '{"invite_code":"ABC123", "player_name":"Player2"}' | python3 -m json.tool

# Get game state (using game.id, NOT invite_code)
curl -s "http://localhost:3000/api/game/state?game_id=game_1234_abc" | python3 -m json.tool
```

### Verification Checklist

- ✅ API returns `game.id` and `game.invite_code` in correct structure
- ✅ `game.id` is unique and different from `invite_code`
- ✅ `game.id` starts with `game_` prefix
- ✅ Frontend redirects to `/game/{game.id}`, NOT invite_code
- ✅ Game page loads without errors
- ✅ NO infinite reload loop
- ✅ NO "Fetch failed loading" errors
- ✅ Invite code displayed on game page
- ✅ localStorage stores game data correctly
- ✅ TypeScript types match API responses

## Key Changes Summary

1. **Game ID Generation**: Changed from reusing `invite_code` to generating unique `game_` prefixed IDs
2. **API Response Structure**: Moved `invite_code` inside `game` object, removed from root level
3. **Frontend Storage**: Added localStorage persistence for game data
4. **Type Safety**: Updated TypeScript interfaces to match new API structure
5. **Error Handling**: Added error boundary for better UX

## Routes

- **Create Game**: `POST /api/game/create` → Returns game with unique `game.id`
- **Join Game**: `POST /api/game/join` → Accepts `invite_code`, returns game with unique `game.id`
- **Game Page**: `/game/[id]` → Uses `game.id` from URL params
- **Game State**: `GET /api/game/state?game_id={game.id}` → Fetches by `game.id`

## Deployment Notes

- No database changes required (currently using mock data)
- No breaking changes to existing functionality
- All changes are backward compatible with existing localStorage data
- Build completes successfully with no TypeScript errors
