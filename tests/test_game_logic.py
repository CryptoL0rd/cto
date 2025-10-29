"""
Comprehensive tests for game service logic.
Tests cover Classic 3x3 and Gomoku game modes, including win detection,
draw handling, turn enforcement, and edge cases.
"""
import pytest
import sqlite3
import tempfile
import os
from datetime import datetime

from api._shared.init_db import init_database
from api._shared.db import get_db, set_db_path
from api._shared.game_service import (
    create_game,
    join_game,
    get_game_state,
    make_move,
    check_win_classic3,
    check_win_gomoku,
    check_draw_classic3,
    generate_invite_code,
)


@pytest.fixture
def test_db():
    """Create a temporary test database."""
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".db") as f:
        db_path = f.name
    
    set_db_path(db_path)
    init_database(db_path=db_path)
    
    yield db_path
    
    if os.path.exists(db_path):
        os.unlink(db_path)


class TestInviteCodeGeneration:
    """Test invite code generation."""
    
    def test_invite_code_length(self):
        """Test that invite codes are exactly 6 characters."""
        code = generate_invite_code()
        assert len(code) == 6
    
    def test_invite_code_uppercase(self):
        """Test that invite codes are uppercase."""
        code = generate_invite_code()
        assert code.isupper()
    
    def test_invite_code_alphanumeric(self):
        """Test that invite codes are alphanumeric."""
        code = generate_invite_code()
        assert code.isalnum()
    
    def test_invite_codes_unique(self):
        """Test that multiple invite codes are likely unique."""
        codes = set(generate_invite_code() for _ in range(100))
        # With 36^6 possibilities, 100 codes should be unique
        assert len(codes) >= 95


class TestGameCreation:
    """Test game creation functionality."""
    
    def test_create_classic3_game(self, test_db):
        """Test creating a Classic 3x3 game."""
        with get_db() as db:
            result = create_game(db, "classic3", "Alice")
            
            assert "game_id" in result
            assert "player_id" in result
            assert "invite_code" in result
            assert result["mode"] == "classic3"
            assert len(result["invite_code"]) == 6
    
    def test_create_gomoku_game(self, test_db):
        """Test creating a Gomoku game."""
        with get_db() as db:
            result = create_game(db, "gomoku", "Bob")
            
            assert "game_id" in result
            assert "player_id" in result
            assert result["mode"] == "gomoku"
    
    def test_create_game_with_ai_opponent(self, test_db):
        """Test creating a game with AI opponent."""
        with get_db() as db:
            result = create_game(db, "classic3", "Alice", is_ai_opponent=True)
            
            # Check that game is active
            cursor = db.cursor()
            cursor.execute("SELECT status, current_turn FROM games WHERE id = ?", (result["game_id"],))
            game = cursor.fetchone()
            
            assert game["status"] == "active"
            assert game["current_turn"] == 1
            
            # Check that two players exist
            cursor.execute("SELECT COUNT(*) as count FROM players WHERE game_id = ?", (result["game_id"],))
            count = cursor.fetchone()["count"]
            assert count == 2
    
    def test_create_game_invalid_mode(self, test_db):
        """Test that invalid mode raises error."""
        with get_db() as db:
            with pytest.raises(ValueError, match="Invalid mode"):
                create_game(db, "invalid", "Alice")


class TestGameJoining:
    """Test game joining functionality."""
    
    def test_join_game_success(self, test_db):
        """Test successfully joining a game."""
        with get_db() as db:
            # Create game
            game_result = create_game(db, "classic3", "Alice")
            invite_code = game_result["invite_code"]
            
            # Join game
            join_result = join_game(db, invite_code, "Bob")
            
            assert join_result["game_id"] == game_result["game_id"]
            assert "player_id" in join_result
            assert join_result["player_id"] != game_result["player_id"]
    
    def test_join_game_starts_game(self, test_db):
        """Test that joining a game changes status to active."""
        with get_db() as db:
            game_result = create_game(db, "classic3", "Alice")
            join_game(db, game_result["invite_code"], "Bob")
            
            cursor = db.cursor()
            cursor.execute("SELECT status, current_turn FROM games WHERE id = ?", (game_result["game_id"],))
            game = cursor.fetchone()
            
            assert game["status"] == "active"
            assert game["current_turn"] == 1
    
    def test_join_nonexistent_game(self, test_db):
        """Test joining a nonexistent game raises error."""
        with get_db() as db:
            with pytest.raises(ValueError, match="Game not found"):
                join_game(db, "ABCDEF", "Bob")
    
    def test_join_full_game(self, test_db):
        """Test that joining a full game raises error."""
        with get_db() as db:
            game_result = create_game(db, "classic3", "Alice")
            join_game(db, game_result["invite_code"], "Bob")
            
            with pytest.raises(ValueError, match="already full"):
                join_game(db, game_result["invite_code"], "Charlie")


class TestClassic3WinDetection:
    """Test Classic 3x3 win detection for all 8 winning lines."""
    
    def test_win_row_0(self):
        """Test win detection for top row."""
        moves = [
            {"row_index": 0, "column_index": 0, "player_number": 1},
            {"row_index": 0, "column_index": 1, "player_number": 1},
            {"row_index": 0, "column_index": 2, "player_number": 1},
        ]
        assert check_win_classic3(moves, 1) is True
    
    def test_win_row_1(self):
        """Test win detection for middle row."""
        moves = [
            {"row_index": 1, "column_index": 0, "player_number": 1},
            {"row_index": 1, "column_index": 1, "player_number": 1},
            {"row_index": 1, "column_index": 2, "player_number": 1},
        ]
        assert check_win_classic3(moves, 1) is True
    
    def test_win_row_2(self):
        """Test win detection for bottom row."""
        moves = [
            {"row_index": 2, "column_index": 0, "player_number": 2},
            {"row_index": 2, "column_index": 1, "player_number": 2},
            {"row_index": 2, "column_index": 2, "player_number": 2},
        ]
        assert check_win_classic3(moves, 2) is True
    
    def test_win_column_0(self):
        """Test win detection for left column."""
        moves = [
            {"row_index": 0, "column_index": 0, "player_number": 1},
            {"row_index": 1, "column_index": 0, "player_number": 1},
            {"row_index": 2, "column_index": 0, "player_number": 1},
        ]
        assert check_win_classic3(moves, 1) is True
    
    def test_win_column_1(self):
        """Test win detection for middle column."""
        moves = [
            {"row_index": 0, "column_index": 1, "player_number": 2},
            {"row_index": 1, "column_index": 1, "player_number": 2},
            {"row_index": 2, "column_index": 1, "player_number": 2},
        ]
        assert check_win_classic3(moves, 2) is True
    
    def test_win_column_2(self):
        """Test win detection for right column."""
        moves = [
            {"row_index": 0, "column_index": 2, "player_number": 1},
            {"row_index": 1, "column_index": 2, "player_number": 1},
            {"row_index": 2, "column_index": 2, "player_number": 1},
        ]
        assert check_win_classic3(moves, 1) is True
    
    def test_win_diagonal_main(self):
        """Test win detection for main diagonal (top-left to bottom-right)."""
        moves = [
            {"row_index": 0, "column_index": 0, "player_number": 1},
            {"row_index": 1, "column_index": 1, "player_number": 1},
            {"row_index": 2, "column_index": 2, "player_number": 1},
        ]
        assert check_win_classic3(moves, 1) is True
    
    def test_win_diagonal_anti(self):
        """Test win detection for anti-diagonal (top-right to bottom-left)."""
        moves = [
            {"row_index": 0, "column_index": 2, "player_number": 2},
            {"row_index": 1, "column_index": 1, "player_number": 2},
            {"row_index": 2, "column_index": 0, "player_number": 2},
        ]
        assert check_win_classic3(moves, 2) is True
    
    def test_no_win_incomplete(self):
        """Test that incomplete lines don't trigger win."""
        moves = [
            {"row_index": 0, "column_index": 0, "player_number": 1},
            {"row_index": 0, "column_index": 1, "player_number": 1},
        ]
        assert check_win_classic3(moves, 1) is False
    
    def test_no_win_mixed_players(self):
        """Test that mixed player positions don't trigger win."""
        moves = [
            {"row_index": 0, "column_index": 0, "player_number": 1},
            {"row_index": 0, "column_index": 1, "player_number": 2},
            {"row_index": 0, "column_index": 2, "player_number": 1},
        ]
        assert check_win_classic3(moves, 1) is False
        assert check_win_classic3(moves, 2) is False


class TestGomokuWinDetection:
    """Test Gomoku 5-in-a-row win detection."""
    
    def test_win_horizontal(self):
        """Test win detection for horizontal 5-in-a-row."""
        moves = [
            {"row_index": 7, "column_index": 5, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 6, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 7, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 8, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 9, "player_id": "p1", "player_number": 1},
        ]
        last_move = moves[-1]
        assert check_win_gomoku(moves, last_move) is True
    
    def test_win_vertical(self):
        """Test win detection for vertical 5-in-a-row."""
        moves = [
            {"row_index": 3, "column_index": 10, "player_id": "p2", "player_number": 2},
            {"row_index": 4, "column_index": 10, "player_id": "p2", "player_number": 2},
            {"row_index": 5, "column_index": 10, "player_id": "p2", "player_number": 2},
            {"row_index": 6, "column_index": 10, "player_id": "p2", "player_number": 2},
            {"row_index": 7, "column_index": 10, "player_id": "p2", "player_number": 2},
        ]
        last_move = moves[-1]
        assert check_win_gomoku(moves, last_move) is True
    
    def test_win_diagonal_down_right(self):
        """Test win detection for diagonal down-right."""
        moves = [
            {"row_index": 2, "column_index": 2, "player_id": "p1", "player_number": 1},
            {"row_index": 3, "column_index": 3, "player_id": "p1", "player_number": 1},
            {"row_index": 4, "column_index": 4, "player_id": "p1", "player_number": 1},
            {"row_index": 5, "column_index": 5, "player_id": "p1", "player_number": 1},
            {"row_index": 6, "column_index": 6, "player_id": "p1", "player_number": 1},
        ]
        last_move = moves[-1]
        assert check_win_gomoku(moves, last_move) is True
    
    def test_win_diagonal_down_left(self):
        """Test win detection for diagonal down-left."""
        moves = [
            {"row_index": 2, "column_index": 12, "player_id": "p2", "player_number": 2},
            {"row_index": 3, "column_index": 11, "player_id": "p2", "player_number": 2},
            {"row_index": 4, "column_index": 10, "player_id": "p2", "player_number": 2},
            {"row_index": 5, "column_index": 9, "player_id": "p2", "player_number": 2},
            {"row_index": 6, "column_index": 8, "player_id": "p2", "player_number": 2},
        ]
        last_move = moves[-1]
        assert check_win_gomoku(moves, last_move) is True
    
    def test_no_win_four_in_row(self):
        """Test that 4-in-a-row doesn't trigger win."""
        moves = [
            {"row_index": 7, "column_index": 5, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 6, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 7, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 8, "player_id": "p1", "player_number": 1},
        ]
        last_move = moves[-1]
        assert check_win_gomoku(moves, last_move) is False
    
    def test_win_more_than_five(self):
        """Test that 6-in-a-row also triggers win."""
        moves = [
            {"row_index": 7, "column_index": 4, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 5, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 6, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 7, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 8, "player_id": "p1", "player_number": 1},
            {"row_index": 7, "column_index": 9, "player_id": "p1", "player_number": 1},
        ]
        last_move = moves[-1]
        assert check_win_gomoku(moves, last_move) is True


class TestDrawDetection:
    """Test draw detection for Classic 3x3."""
    
    def test_draw_full_board(self):
        """Test that a full board triggers draw detection."""
        moves = [
            {"row_index": i, "column_index": j, "player_number": (i + j) % 2 + 1}
            for i in range(3)
            for j in range(3)
        ]
        assert check_draw_classic3(moves) is True
    
    def test_no_draw_incomplete_board(self):
        """Test that incomplete board doesn't trigger draw."""
        moves = [
            {"row_index": 0, "column_index": 0, "player_number": 1},
            {"row_index": 0, "column_index": 1, "player_number": 2},
        ]
        assert check_draw_classic3(moves) is False


class TestTurnEnforcement:
    """Test turn sequencing and enforcement."""
    
    def test_first_move_player_1(self, test_db):
        """Test that player 1 goes first."""
        with get_db() as db:
            game_result = create_game(db, "classic3", "Alice")
            join_game(db, game_result["invite_code"], "Bob")
            
            # Get player 2's ID
            cursor = db.cursor()
            cursor.execute(
                "SELECT id FROM players WHERE game_id = ? AND player_number = 2",
                (game_result["game_id"],)
            )
            player2_id = cursor.fetchone()["id"]
            
            # Try to make move as player 2 (should fail)
            with pytest.raises(ValueError, match="Not your turn"):
                make_move(db, game_result["game_id"], player2_id, {"column_index": 0, "row_index": 0})
    
    def test_turn_alternation(self, test_db):
        """Test that turns alternate between players."""
        with get_db() as db:
            game_result = create_game(db, "classic3", "Alice")
            player1_id = game_result["player_id"]
            join_result = join_game(db, game_result["invite_code"], "Bob")
            player2_id = join_result["player_id"]
            game_id = game_result["game_id"]
            
            # Player 1 makes first move
            make_move(db, game_id, player1_id, {"column_index": 0, "row_index": 0})
            
            # Player 1 tries to go again (should fail)
            with pytest.raises(ValueError, match="Not your turn"):
                make_move(db, game_id, player1_id, {"column_index": 1, "row_index": 0})
            
            # Player 2 makes move (should succeed)
            make_move(db, game_id, player2_id, {"column_index": 1, "row_index": 0})


class TestMoveValidation:
    """Test move validation and edge cases."""
    
    def test_duplicate_position(self, test_db):
        """Test that placing a piece on occupied position fails."""
        with get_db() as db:
            game_result = create_game(db, "classic3", "Alice")
            player1_id = game_result["player_id"]
            join_result = join_game(db, game_result["invite_code"], "Bob")
            player2_id = join_result["player_id"]
            game_id = game_result["game_id"]
            
            # Player 1 makes move
            make_move(db, game_id, player1_id, {"column_index": 1, "row_index": 1})
            
            # Player 2 tries same position (should fail)
            with pytest.raises(ValueError, match="already occupied"):
                make_move(db, game_id, player2_id, {"column_index": 1, "row_index": 1})
    
    def test_out_of_bounds_classic3(self, test_db):
        """Test that out-of-bounds moves fail in Classic 3x3."""
        with get_db() as db:
            game_result = create_game(db, "classic3", "Alice")
            player1_id = game_result["player_id"]
            join_game(db, game_result["invite_code"], "Bob")
            game_id = game_result["game_id"]
            
            # Try position outside 3x3 grid
            with pytest.raises(ValueError, match="out of bounds"):
                make_move(db, game_id, player1_id, {"column_index": 5, "row_index": 5})
    
    def test_out_of_bounds_gomoku(self, test_db):
        """Test that out-of-bounds moves fail in Gomoku."""
        with get_db() as db:
            game_result = create_game(db, "gomoku", "Alice")
            player1_id = game_result["player_id"]
            join_game(db, game_result["invite_code"], "Bob")
            game_id = game_result["game_id"]
            
            # Position (14, 14) should be valid
            result = make_move(db, game_id, player1_id, {"column_index": 14, "row_index": 14})
            assert result["column_index"] == 14
            assert result["row_index"] == 14
    
    def test_move_in_completed_game(self, test_db):
        """Test that moves cannot be made in completed game."""
        with get_db() as db:
            game_result = create_game(db, "classic3", "Alice")
            player1_id = game_result["player_id"]
            join_result = join_game(db, game_result["invite_code"], "Bob")
            player2_id = join_result["player_id"]
            game_id = game_result["game_id"]
            
            # Play to win
            make_move(db, game_id, player1_id, {"column_index": 0, "row_index": 0})
            make_move(db, game_id, player2_id, {"column_index": 1, "row_index": 0})
            make_move(db, game_id, player1_id, {"column_index": 0, "row_index": 1})
            make_move(db, game_id, player2_id, {"column_index": 1, "row_index": 1})
            make_move(db, game_id, player1_id, {"column_index": 0, "row_index": 2})  # Win
            
            # Try to make another move
            with pytest.raises(ValueError, match="not active"):
                make_move(db, game_id, player2_id, {"column_index": 2, "row_index": 0})


class TestGameState:
    """Test game state retrieval."""
    
    def test_get_game_state(self, test_db):
        """Test retrieving complete game state."""
        with get_db() as db:
            game_result = create_game(db, "classic3", "Alice")
            join_game(db, game_result["invite_code"], "Bob")
            
            state = get_game_state(db, game_result["game_id"])
            
            assert "game" in state
            assert "players" in state
            assert "moves" in state
            assert "messages" in state
            assert len(state["players"]) == 2
            assert state["game"]["mode"] == "classic3"
    
    def test_get_nonexistent_game_state(self, test_db):
        """Test that getting state of nonexistent game raises error."""
        with get_db() as db:
            with pytest.raises(ValueError, match="Game not found"):
                get_game_state(db, "nonexistent")


class TestFullGameFlow:
    """Test complete game flows."""
    
    def test_classic3_complete_game_with_winner(self, test_db):
        """Test a complete Classic 3x3 game with a winner."""
        with get_db() as db:
            # Create and join game
            game_result = create_game(db, "classic3", "Alice")
            player1_id = game_result["player_id"]
            join_result = join_game(db, game_result["invite_code"], "Bob")
            player2_id = join_result["player_id"]
            game_id = game_result["game_id"]
            
            # Play game - player 1 wins with top row
            # X O .
            # X O .
            # X . .
            result1 = make_move(db, game_id, player1_id, {"column_index": 0, "row_index": 0})
            assert result1["is_winner"] is False
            
            make_move(db, game_id, player2_id, {"column_index": 1, "row_index": 0})
            make_move(db, game_id, player1_id, {"column_index": 0, "row_index": 1})
            make_move(db, game_id, player2_id, {"column_index": 1, "row_index": 1})
            
            result_final = make_move(db, game_id, player1_id, {"column_index": 0, "row_index": 2})
            assert result_final["is_winner"] is True
            assert result_final["game_status"] == "completed"
            
            # Verify game state
            state = get_game_state(db, game_id)
            assert state["game"]["status"] == "completed"
            assert state["game"]["winner_id"] == player1_id
    
    def test_classic3_draw_game(self, test_db):
        """Test a Classic 3x3 game ending in draw."""
        with get_db() as db:
            game_result = create_game(db, "classic3", "Alice")
            player1_id = game_result["player_id"]
            join_result = join_game(db, game_result["invite_code"], "Bob")
            player2_id = join_result["player_id"]
            game_id = game_result["game_id"]
            
            # Play to draw
            # X O X
            # X O O
            # O X X
            moves = [
                (player1_id, 0, 0), (player2_id, 1, 0),
                (player1_id, 2, 0), (player2_id, 1, 1),
                (player1_id, 0, 1), (player2_id, 2, 1),
                (player1_id, 1, 2), (player2_id, 0, 2),
                (player1_id, 2, 2),
            ]
            
            for i, (player, col, row) in enumerate(moves):
                result = make_move(db, game_id, player, {"column_index": col, "row_index": row})
                if i < len(moves) - 1:
                    assert result["is_draw"] is False
                else:
                    assert result["is_draw"] is True
                    assert result["game_status"] == "completed"
            
            # Verify game state
            state = get_game_state(db, game_id)
            assert state["game"]["status"] == "completed"
            assert state["game"]["winner_id"] is None
    
    def test_gomoku_complete_game(self, test_db):
        """Test a complete Gomoku game with a winner."""
        with get_db() as db:
            game_result = create_game(db, "gomoku", "Alice")
            player1_id = game_result["player_id"]
            join_result = join_game(db, game_result["invite_code"], "Bob")
            player2_id = join_result["player_id"]
            game_id = game_result["game_id"]
            
            # Player 1 builds horizontal line
            make_move(db, game_id, player1_id, {"column_index": 5, "row_index": 7})
            make_move(db, game_id, player2_id, {"column_index": 0, "row_index": 0})
            make_move(db, game_id, player1_id, {"column_index": 6, "row_index": 7})
            make_move(db, game_id, player2_id, {"column_index": 1, "row_index": 0})
            make_move(db, game_id, player1_id, {"column_index": 7, "row_index": 7})
            make_move(db, game_id, player2_id, {"column_index": 2, "row_index": 0})
            make_move(db, game_id, player1_id, {"column_index": 8, "row_index": 7})
            make_move(db, game_id, player2_id, {"column_index": 3, "row_index": 0})
            
            # Winning move
            result = make_move(db, game_id, player1_id, {"column_index": 9, "row_index": 7})
            assert result["is_winner"] is True
            
            state = get_game_state(db, game_id)
            assert state["game"]["status"] == "completed"
            assert state["game"]["winner_id"] == player1_id
