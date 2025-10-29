"""
Game service module providing core game domain logic.
Handles game creation, joining, state management, move validation, and win detection.
"""
import sqlite3
import uuid
import random
import string
from datetime import datetime, timezone
from typing import Optional, Literal, Dict, List, Tuple


def generate_invite_code() -> str:
    """
    Generate a unique 6-character uppercase invite code.
    
    Returns:
        str: A 6-character uppercase alphanumeric code
    """
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def create_game(db: sqlite3.Connection, mode: Literal["classic3", "gomoku"], player_name: str, is_ai_opponent: bool = False) -> Dict:
    """
    Create a new game with the specified mode.
    
    Args:
        db: SQLite database connection
        mode: Game mode ('classic3' for 3x3 tic-tac-toe or 'gomoku' for 15x15)
        player_name: Name of the player creating the game
        is_ai_opponent: Whether to add an AI opponent immediately
    
    Returns:
        Dict containing game_id, player_id, and invite_code
    
    Raises:
        ValueError: If mode is invalid
    """
    if mode not in ["classic3", "gomoku"]:
        raise ValueError(f"Invalid mode: {mode}")
    
    cursor = db.cursor()
    game_id = str(uuid.uuid4())
    player_id = str(uuid.uuid4())
    invite_code = generate_invite_code()
    created_at = datetime.now(timezone.utc).isoformat()
    
    # Ensure invite code is unique
    max_attempts = 10
    for _ in range(max_attempts):
        cursor.execute("SELECT id FROM games WHERE id = ?", (invite_code,))
        if cursor.fetchone() is None:
            break
        invite_code = generate_invite_code()
    
    # Use invite code as game ID for easy joining
    game_id = invite_code
    
    # Create game with 'waiting' status
    cursor.execute(
        """
        INSERT INTO games (id, mode, status, created_at, current_turn)
        VALUES (?, ?, 'waiting', ?, NULL)
        """,
        (game_id, mode, created_at)
    )
    
    # Add first player
    cursor.execute(
        """
        INSERT INTO players (id, game_id, player_number, player_name, joined_at, is_ai)
        VALUES (?, ?, 1, ?, ?, 0)
        """,
        (player_id, game_id, player_name, created_at)
    )
    
    # Add AI opponent if requested
    if is_ai_opponent:
        ai_player_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO players (id, game_id, player_number, player_name, joined_at, is_ai)
            VALUES (?, ?, 2, 'AI Opponent', ?, 1)
            """,
            (ai_player_id, game_id, created_at)
        )
        
        # Update game status to 'active' and set current_turn to 1
        cursor.execute(
            """
            UPDATE games
            SET status = 'active', started_at = ?, current_turn = 1
            WHERE id = ?
            """,
            (created_at, game_id)
        )
    
    return {
        "game_id": game_id,
        "player_id": player_id,
        "invite_code": game_id,
        "mode": mode
    }


def join_game(db: sqlite3.Connection, invite_code: str, player_name: str) -> Dict:
    """
    Join an existing game using an invite code.
    
    Args:
        db: SQLite database connection
        invite_code: 6-character invite code
        player_name: Name of the joining player
    
    Returns:
        Dict containing game_id and player_id
    
    Raises:
        ValueError: If game not found, already full, or not in waiting status
    """
    cursor = db.cursor()
    
    # Find game by invite code
    cursor.execute(
        """
        SELECT id, mode, status FROM games WHERE id = ?
        """,
        (invite_code,)
    )
    game_row = cursor.fetchone()
    
    if not game_row:
        raise ValueError("Game not found")
    
    game_id = game_row["id"]
    mode = game_row["mode"]
    status = game_row["status"]
    
    # Check if game already has 2 players
    cursor.execute(
        "SELECT COUNT(*) as count FROM players WHERE game_id = ?",
        (game_id,)
    )
    player_count = cursor.fetchone()["count"]
    
    if player_count >= 2:
        raise ValueError("Game is already full")
    
    if status != "waiting":
        raise ValueError("Game is not available for joining")
    
    # Add second player
    player_id = str(uuid.uuid4())
    joined_at = datetime.now(timezone.utc).isoformat()
    
    cursor.execute(
        """
        INSERT INTO players (id, game_id, player_number, player_name, joined_at, is_ai)
        VALUES (?, ?, 2, ?, ?, 0)
        """,
        (player_id, game_id, player_name, joined_at)
    )
    
    # Update game status to 'active' and set current_turn to 1
    cursor.execute(
        """
        UPDATE games
        SET status = 'active', started_at = ?, current_turn = 1
        WHERE id = ?
        """,
        (joined_at, game_id)
    )
    
    return {
        "game_id": game_id,
        "player_id": player_id,
        "mode": mode
    }


def get_game_state(db: sqlite3.Connection, game_id: str) -> Dict:
    """
    Retrieve the complete game state.
    
    Args:
        db: SQLite database connection
        game_id: ID of the game
    
    Returns:
        Dict containing game, players, moves, and messages
    
    Raises:
        ValueError: If game not found
    """
    cursor = db.cursor()
    
    # Get game
    cursor.execute("SELECT * FROM games WHERE id = ?", (game_id,))
    game_row = cursor.fetchone()
    
    if not game_row:
        raise ValueError("Game not found")
    
    game = dict(game_row)
    
    # Get players
    cursor.execute(
        "SELECT * FROM players WHERE game_id = ? ORDER BY player_number",
        (game_id,)
    )
    players = [dict(row) for row in cursor.fetchall()]
    
    # Get moves
    cursor.execute(
        "SELECT * FROM moves WHERE game_id = ? ORDER BY move_number",
        (game_id,)
    )
    moves = [dict(row) for row in cursor.fetchall()]
    
    # Get messages
    cursor.execute(
        "SELECT * FROM messages WHERE game_id = ? ORDER BY created_at",
        (game_id,)
    )
    messages = [dict(row) for row in cursor.fetchall()]
    
    return {
        "game": game,
        "players": players,
        "moves": moves,
        "messages": messages
    }


def check_win_classic3(moves: List[Dict], symbol: int) -> bool:
    """
    Check if a player has won in Classic 3x3 mode.
    
    Args:
        moves: List of move dictionaries with column_index and row_index
        symbol: Player number (1 or 2) to check for win
    
    Returns:
        bool: True if player has won, False otherwise
    """
    # Filter moves for the specified player
    player_moves = [(m["row_index"], m["column_index"]) for m in moves if m.get("player_number") == symbol or m.get("symbol") == symbol]
    
    if len(player_moves) < 3:
        return False
    
    # Convert to set for faster lookup
    positions = set(player_moves)
    
    # All 8 possible winning lines in 3x3
    winning_lines = [
        # Rows
        [(0, 0), (0, 1), (0, 2)],
        [(1, 0), (1, 1), (1, 2)],
        [(2, 0), (2, 1), (2, 2)],
        # Columns
        [(0, 0), (1, 0), (2, 0)],
        [(0, 1), (1, 1), (2, 1)],
        [(0, 2), (1, 2), (2, 2)],
        # Diagonals
        [(0, 0), (1, 1), (2, 2)],
        [(0, 2), (1, 1), (2, 0)],
    ]
    
    # Check if any winning line is completely filled by the player
    for line in winning_lines:
        if all(pos in positions for pos in line):
            return True
    
    return False


def check_win_gomoku(moves: List[Dict], last_move: Dict) -> bool:
    """
    Check if a player has won in Gomoku mode (5-in-a-row).
    
    Args:
        moves: List of move dictionaries with column_index, row_index, and player info
        last_move: The most recent move dictionary
    
    Returns:
        bool: True if the player who made last_move has won, False otherwise
    """
    if not last_move:
        return False
    
    # Get the player who made the last move
    player_id = last_move.get("player_id")
    player_number = last_move.get("player_number")
    row = last_move["row_index"]
    col = last_move["column_index"]
    
    # Filter moves for the player who made the last move
    if player_id:
        player_moves = [(m["row_index"], m["column_index"]) for m in moves if m.get("player_id") == player_id]
    else:
        player_moves = [(m["row_index"], m["column_index"]) for m in moves if m.get("player_number") == player_number]
    
    positions = set(player_moves)
    
    # Check all 4 directions: horizontal, vertical, diagonal-down, diagonal-up
    directions = [
        (0, 1),   # Horizontal
        (1, 0),   # Vertical
        (1, 1),   # Diagonal down-right
        (1, -1),  # Diagonal down-left
    ]
    
    for dr, dc in directions:
        count = 1  # Count the last move itself
        
        # Check positive direction
        r, c = row + dr, col + dc
        while (r, c) in positions and 0 <= r < 15 and 0 <= c < 15:
            count += 1
            r += dr
            c += dc
        
        # Check negative direction
        r, c = row - dr, col - dc
        while (r, c) in positions and 0 <= r < 15 and 0 <= c < 15:
            count += 1
            r -= dr
            c -= dc
        
        if count >= 5:
            return True
    
    return False


def check_draw_classic3(moves: List[Dict]) -> bool:
    """
    Check if the Classic 3x3 game is a draw (board full with no winner).
    
    Args:
        moves: List of all moves in the game
    
    Returns:
        bool: True if the game is a draw, False otherwise
    """
    # In Classic 3x3, a draw occurs when all 9 positions are filled
    return len(moves) >= 9


def make_move(db: sqlite3.Connection, game_id: str, player_id: str, move_data: Dict) -> Dict:
    """
    Make a move in a game.
    
    Args:
        db: SQLite database connection
        game_id: ID of the game
        player_id: ID of the player making the move
        move_data: Dictionary containing column_index and row_index
    
    Returns:
        Dict containing move information and game status
    
    Raises:
        ValueError: If game not found, game not active, not player's turn,
                   position already occupied, or position out of bounds
    """
    cursor = db.cursor()
    
    # Get game info
    cursor.execute(
        "SELECT mode, status, current_turn, winner_id FROM games WHERE id = ?",
        (game_id,)
    )
    game_row = cursor.fetchone()
    
    if not game_row:
        raise ValueError("Game not found")
    
    mode = game_row["mode"]
    status = game_row["status"]
    current_turn = game_row["current_turn"]
    winner_id = game_row["winner_id"]
    
    if status != "active":
        raise ValueError(f"Game is not active (status: {status})")
    
    if winner_id:
        raise ValueError("Game already has a winner")
    
    # Get player info
    cursor.execute(
        "SELECT player_number FROM players WHERE id = ? AND game_id = ?",
        (player_id, game_id)
    )
    player_row = cursor.fetchone()
    
    if not player_row:
        raise ValueError("Player not found in this game")
    
    player_number = player_row["player_number"]
    
    # Check if it's the player's turn
    if current_turn != player_number:
        raise ValueError(f"Not your turn (current turn: {current_turn})")
    
    # Validate move position based on mode
    column_index = move_data["column_index"]
    row_index = move_data["row_index"]
    
    if mode == "classic3":
        if not (0 <= column_index < 3 and 0 <= row_index < 3):
            raise ValueError("Position out of bounds for Classic 3x3 mode")
    elif mode == "gomoku":
        if not (0 <= column_index < 15 and 0 <= row_index < 15):
            raise ValueError("Position out of bounds for Gomoku mode")
    
    # Check if position is already occupied
    cursor.execute(
        """
        SELECT id FROM moves
        WHERE game_id = ? AND column_index = ? AND row_index = ?
        """,
        (game_id, column_index, row_index)
    )
    if cursor.fetchone():
        raise ValueError("Position already occupied")
    
    # Get current move number
    cursor.execute(
        "SELECT MAX(move_number) as max_move FROM moves WHERE game_id = ?",
        (game_id,)
    )
    max_move = cursor.fetchone()["max_move"]
    move_number = (max_move or 0) + 1
    
    # Insert the move
    created_at = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        """
        INSERT INTO moves (game_id, player_id, move_number, column_index, row_index, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (game_id, player_id, move_number, column_index, row_index, created_at)
    )
    move_id = cursor.lastrowid
    
    # Get all moves for win checking
    cursor.execute(
        """
        SELECT m.*, p.player_number
        FROM moves m
        JOIN players p ON m.player_id = p.id
        WHERE m.game_id = ?
        ORDER BY m.move_number
        """,
        (game_id,)
    )
    all_moves = [dict(row) for row in cursor.fetchall()]
    
    # Check for win
    is_winner = False
    is_draw = False
    
    if mode == "classic3":
        is_winner = check_win_classic3(all_moves, player_number)
        if not is_winner:
            is_draw = check_draw_classic3(all_moves)
    elif mode == "gomoku":
        # Find the last move with full info
        last_move = None
        for m in all_moves:
            if m["id"] == move_id:
                last_move = m
                break
        is_winner = check_win_gomoku(all_moves, last_move)
    
    # Update game state
    if is_winner:
        cursor.execute(
            """
            UPDATE games
            SET status = 'completed', finished_at = ?, winner_id = ?
            WHERE id = ?
            """,
            (created_at, player_id, game_id)
        )
    elif is_draw:
        cursor.execute(
            """
            UPDATE games
            SET status = 'completed', finished_at = ?
            WHERE id = ?
            """,
            (created_at, game_id)
        )
    else:
        # Switch turn
        next_turn = 1 if current_turn == 2 else 2
        cursor.execute(
            """
            UPDATE games
            SET current_turn = ?
            WHERE id = ?
            """,
            (next_turn, game_id)
        )
    
    return {
        "move_id": move_id,
        "move_number": move_number,
        "column_index": column_index,
        "row_index": row_index,
        "player_id": player_id,
        "player_number": player_number,
        "is_winner": is_winner,
        "is_draw": is_draw,
        "game_status": "completed" if (is_winner or is_draw) else "active"
    }
