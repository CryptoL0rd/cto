# Game Service Implementation Summary

## Overview

This document summarizes the implementation of the game service module that provides core game domain logic for Classic 3x3 (tic-tac-toe) and Gomoku (15x15, 5-in-a-row) game modes.

## Implemented Files

### 1. `/api/_shared/game_service.py`

Core game service module with the following functions:

#### Core Functions

- **`generate_invite_code()`**: Generates unique 6-character uppercase alphanumeric invite codes
- **`create_game(db, mode, player_name, is_ai_opponent)`**: Creates a new game
  - Supports 'classic3' and 'gomoku' modes
  - Uses invite code as game ID for easy joining
  - Optionally adds AI opponent and starts game immediately
  - Returns game_id, player_id, invite_code, and mode
- **`join_game(db, invite_code, player_name)`**: Joins an existing game
  - Validates game exists and is available (waiting status)
  - Checks game is not full (max 2 players)
  - Changes game status to 'active' and sets current_turn to 1
  - Returns game_id, player_id, and mode
- **`get_game_state(db, game_id)`**: Retrieves complete game state
  - Returns dictionary with game, players, moves, and messages
  - Used for fetching current state for clients
- **`make_move(db, game_id, player_id, move_data)`**: Processes a move
  - Validates game is active
  - Enforces turn sequencing
  - Validates position bounds based on game mode
  - Checks for duplicate positions
  - Detects wins and draws
  - Updates game status and turn
  - Returns move details with win/draw flags

#### Win Detection

- **`check_win_classic3(moves, symbol)`**: Detects Classic 3x3 wins
  - Checks all 8 winning lines:
    - 3 rows (0, 1, 2)
    - 3 columns (0, 1, 2)
    - 2 diagonals (main and anti)
  - Returns True if player has won
- **`check_win_gomoku(moves, last_move)`**: Detects Gomoku wins
  - Checks 5-in-a-row in all 4 directions:
    - Horizontal (columns)
    - Vertical (rows)
    - Diagonal down-right
    - Diagonal down-left
  - Counts both directions from last move position
  - Returns True if 5 or more in a row

#### Draw Detection

- **`check_draw_classic3(moves)`**: Detects Classic 3x3 draws
  - Returns True when all 9 positions are filled

### 2. `/tests/test_game_logic.py`

Comprehensive test suite with 41 test cases covering:

#### Test Categories

1. **Invite Code Generation** (4 tests)
   - Length verification (6 characters)
   - Uppercase verification
   - Alphanumeric verification
   - Uniqueness verification

2. **Game Creation** (4 tests)
   - Classic3 game creation
   - Gomoku game creation
   - AI opponent creation
   - Invalid mode rejection

3. **Game Joining** (4 tests)
   - Successful join
   - Game status change to active
   - Nonexistent game error
   - Full game error

4. **Classic 3x3 Win Detection** (10 tests)
   - All 3 rows (row 0, 1, 2)
   - All 3 columns (column 0, 1, 2)
   - Main diagonal
   - Anti-diagonal
   - No win on incomplete lines
   - No win on mixed players

5. **Gomoku Win Detection** (6 tests)
   - Horizontal 5-in-a-row
   - Vertical 5-in-a-row
   - Diagonal down-right
   - Diagonal down-left
   - No win with only 4-in-a-row
   - Win with more than 5-in-a-row

6. **Draw Detection** (2 tests)
   - Full board draw
   - No draw on incomplete board

7. **Turn Enforcement** (2 tests)
   - First move by player 1
   - Turn alternation

8. **Move Validation** (4 tests)
   - Duplicate position rejection
   - Out of bounds Classic3
   - Out of bounds Gomoku
   - Moves in completed game

9. **Game State** (2 tests)
   - Get game state
   - Nonexistent game error

10. **Full Game Flow** (3 tests)
    - Classic3 complete game with winner
    - Classic3 draw game
    - Gomoku complete game with winner

### 3. Schema Updates

Updated `/api/_shared/schema.sql`:

- Added `mode` column to `games` table (classic3/gomoku)
- Expanded `moves` table constraints to support 15x15 board (0-14)

### 4. Model Updates

Updated `/api/_shared/models.py`:

- Added `mode` field to `CreateGameRequest` (default: "classic3")
- Added `mode` field to `GameResponse`
- Updated `MoveRequest` to include `row_index` field
- Updated field validators to support 0-14 range

### 5. Database Initialization Updates

Updated `/api/_shared/init_db.py`:

- Modified `seed_data()` to include mode in game creation

### 6. Test Updates

Updated `/test_backend.py`:

- Fixed all tests to include mode field
- Updated move validation tests for new constraints

## Acceptance Criteria Status

✅ **Service functions handle normal and error flows**

- All functions properly validate inputs and raise ValueError for errors
- Normal flows tested with 41 test cases
- Error cases include: invalid mode, game not found, full game, not your turn, position occupied, out of bounds

✅ **check_win_classic3 correctly detects all winning combinations**

- All 8 winning lines tested individually (3 rows + 3 columns + 2 diagonals)
- No false positives on incomplete or mixed lines

✅ **check_win_gomoku validates 5-in-a-row in every direction**

- Horizontal, vertical, and both diagonal directions tested
- Correctly rejects 4-in-a-row
- Correctly accepts 6+ in-a-row

✅ **Invite codes are unique per create_game and uppercase length 6**

- Generate 6-character uppercase alphanumeric codes
- Uniqueness check with retry logic (max 10 attempts)
- Tested for length, uppercase, and uniqueness

✅ **Test suite (≥15 cases) passes**

- 41 test cases implemented and passing
- Covers all 8 Classic lines, Gomoku directions, turn enforcement, and edge cases
- Additional 31 backend tests also passing (72 total)

## Game Flow Examples

### Classic 3x3 Game Flow

1. Player 1 creates game: `create_game(db, "classic3", "Alice")`
2. Player 2 joins: `join_game(db, invite_code, "Bob")`
3. Players alternate moves until:
   - One player gets 3-in-a-row (wins)
   - All 9 positions filled with no winner (draw)
4. Game status changes to 'completed'

### Gomoku Game Flow

1. Player 1 creates game: `create_game(db, "gomoku", "Alice")`
2. Player 2 joins: `join_game(db, invite_code, "Bob")`
3. Players alternate moves until:
   - One player gets 5-in-a-row (wins)
   - Board fills (extremely unlikely, no draw logic for Gomoku)
4. Game status changes to 'completed'

## Key Design Decisions

1. **Invite Code as Game ID**: Using the invite code directly as the game ID simplifies joining and eliminates the need for a separate mapping table.

2. **Mode-Specific Validation**: Position validation happens at move time based on game mode (0-2 for classic3, 0-14 for gomoku).

3. **Turn Sequencing**: Current turn is stored in the database and enforced in `make_move()`. Player 1 always starts.

4. **Win Detection Strategy**:
   - Classic3: Checks all 8 possible lines
   - Gomoku: Optimized to check only around the last move in 4 directions

5. **Timezone-Aware Timestamps**: Using `datetime.now(timezone.utc).isoformat()` instead of deprecated `utcnow()`.

6. **Error Handling**: All business logic errors raise ValueError with descriptive messages for proper error handling in API endpoints.

## Integration with API Endpoints

The game service is designed to be used by API endpoints:

```python
from api._shared.db import get_db
from api._shared.game_service import create_game, join_game, make_move

# In an API endpoint
with get_db() as db:
    result = create_game(db, mode="classic3", player_name="Alice")
    return {"game_id": result["game_id"], "invite_code": result["invite_code"]}
```

## Testing

Run tests with:

```bash
# All game logic tests
python -m pytest tests/test_game_logic.py -v

# All tests
python -m pytest tests/ test_backend.py -v
```

All 72 tests pass (41 game logic + 31 backend).
