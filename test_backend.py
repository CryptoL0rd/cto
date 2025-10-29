"""
Tests for backend schema, database initialization, and API endpoints.
"""
import pytest
import sqlite3
import tempfile
import os
from pathlib import Path
from datetime import datetime
import uuid

from api._shared.init_db import init_database, seed_data
from api._shared.db import get_db, set_db_path, get_db_path
from api._shared.models import (
    CreateGameRequest,
    GameResponse,
    JoinGameRequest,
    PlayerResponse,
    MoveRequest,
    MoveResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    GameStateResponse,
)
from fastapi.testclient import TestClient
from api.index import app


@pytest.fixture
def test_db():
    """Create a temporary test database."""
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".db") as f:
        db_path = f.name
    
    # Set the test database path
    set_db_path(db_path)
    
    # Initialize the database
    init_database(db_path=db_path)
    
    yield db_path
    
    # Cleanup
    if os.path.exists(db_path):
        os.unlink(db_path)


@pytest.fixture
def seeded_db():
    """Create a temporary test database with seed data."""
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".db") as f:
        db_path = f.name
    
    set_db_path(db_path)
    init_database(db_path=db_path, seed=True)
    
    yield db_path
    
    if os.path.exists(db_path):
        os.unlink(db_path)


class TestDatabaseSchema:
    """Test database schema creation and constraints."""
    
    def test_database_initialization(self, test_db):
        """Test that init_db creates all required tables."""
        conn = sqlite3.connect(test_db)
        cursor = conn.cursor()
        
        # Check all tables exist
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        )
        tables = [row[0] for row in cursor.fetchall()]
        
        assert "games" in tables
        assert "players" in tables
        assert "moves" in tables
        assert "messages" in tables
        
        conn.close()
    
    def test_games_table_structure(self, test_db):
        """Test games table has correct columns and constraints."""
        conn = sqlite3.connect(test_db)
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(games)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}
        
        assert "id" in columns
        assert "status" in columns
        assert "created_at" in columns
        assert "started_at" in columns
        assert "finished_at" in columns
        assert "current_turn" in columns
        assert "winner_id" in columns
        
        conn.close()
    
    def test_players_table_structure(self, test_db):
        """Test players table has correct columns and constraints."""
        conn = sqlite3.connect(test_db)
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(players)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}
        
        assert "id" in columns
        assert "game_id" in columns
        assert "player_number" in columns
        assert "player_name" in columns
        assert "joined_at" in columns
        assert "is_ai" in columns
        
        conn.close()
    
    def test_moves_table_structure(self, test_db):
        """Test moves table has correct columns and constraints."""
        conn = sqlite3.connect(test_db)
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(moves)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}
        
        assert "id" in columns
        assert "game_id" in columns
        assert "player_id" in columns
        assert "move_number" in columns
        assert "column_index" in columns
        assert "row_index" in columns
        assert "created_at" in columns
        
        conn.close()
    
    def test_messages_table_structure(self, test_db):
        """Test messages table has correct columns and constraints."""
        conn = sqlite3.connect(test_db)
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(messages)")
        columns = {row[1]: row[2] for row in cursor.fetchall()}
        
        assert "id" in columns
        assert "game_id" in columns
        assert "player_id" in columns
        assert "message_type" in columns
        assert "content" in columns
        assert "created_at" in columns
        
        conn.close()
    
    def test_foreign_key_constraints(self, test_db):
        """Test that foreign key constraints are enabled."""
        conn = sqlite3.connect(test_db)
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()
        
        # Try to insert a player with non-existent game_id
        with pytest.raises(sqlite3.IntegrityError):
            cursor.execute(
                "INSERT INTO players (id, game_id, player_number, player_name, joined_at, is_ai) VALUES (?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), "nonexistent", 1, "Test", datetime.now().isoformat(), 0)
            )
        
        conn.close()
    
    def test_indices_created(self, test_db):
        """Test that all required indices are created."""
        conn = sqlite3.connect(test_db)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        )
        indices = [row[0] for row in cursor.fetchall()]
        
        assert "idx_players_game_id" in indices
        assert "idx_moves_game_id" in indices
        assert "idx_moves_player_id" in indices
        assert "idx_messages_game_id" in indices
        assert "idx_games_status" in indices
        assert "idx_moves_game_move_number" in indices
        
        conn.close()


class TestDatabaseConnection:
    """Test database connection handling."""
    
    def test_get_db_context_manager(self, test_db):
        """Test that get_db() works as a context manager."""
        with get_db() as conn:
            assert conn is not None
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            assert result[0] == 1
    
    def test_get_db_commits_on_success(self, test_db):
        """Test that get_db() commits changes on success."""
        game_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        with get_db() as conn:
            conn.execute(
                "INSERT INTO games (id, status, created_at) VALUES (?, ?, ?)",
                (game_id, "waiting", now)
            )
        
        # Verify the data was committed
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM games WHERE id = ?", (game_id,))
            result = cursor.fetchone()
            assert result is not None
            assert result[0] == game_id
    
    def test_get_db_rolls_back_on_exception(self, test_db):
        """Test that get_db() rolls back on exception."""
        game_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        try:
            with get_db() as conn:
                conn.execute(
                    "INSERT INTO games (id, status, created_at) VALUES (?, ?, ?)",
                    (game_id, "waiting", now)
                )
                raise ValueError("Test exception")
        except ValueError:
            pass
        
        # Verify the data was rolled back
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM games WHERE id = ?", (game_id,))
            result = cursor.fetchone()
            assert result is None
    
    def test_get_db_closes_connection(self, test_db):
        """Test that get_db() closes the connection after use."""
        with get_db() as conn:
            pass
        
        # Connection should be closed
        with pytest.raises(sqlite3.ProgrammingError):
            conn.execute("SELECT 1")
    
    def test_foreign_keys_enabled(self, test_db):
        """Test that foreign keys are enabled in connections."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA foreign_keys")
            result = cursor.fetchone()
            assert result[0] == 1


class TestDatabaseSeeding:
    """Test database seeding functionality."""
    
    def test_seed_data_creates_game(self, test_db):
        """Test that seed_data creates a game."""
        conn = sqlite3.connect(test_db)
        conn.execute("PRAGMA foreign_keys = ON")
        seed_data(conn)
        conn.commit()
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM games")
        count = cursor.fetchone()[0]
        assert count == 1
        
        conn.close()
    
    def test_seed_data_creates_player(self, test_db):
        """Test that seed_data creates a player."""
        conn = sqlite3.connect(test_db)
        conn.execute("PRAGMA foreign_keys = ON")
        seed_data(conn)
        conn.commit()
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM players")
        count = cursor.fetchone()[0]
        assert count == 1
        
        conn.close()
    
    def test_seed_data_creates_message(self, test_db):
        """Test that seed_data creates a message."""
        conn = sqlite3.connect(test_db)
        conn.execute("PRAGMA foreign_keys = ON")
        seed_data(conn)
        conn.commit()
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM messages")
        count = cursor.fetchone()[0]
        assert count == 1
        
        conn.close()
    
    def test_seeded_db_fixture(self, seeded_db):
        """Test that seeded_db fixture creates a populated database."""
        conn = sqlite3.connect(seeded_db)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM games")
        assert cursor.fetchone()[0] > 0
        
        cursor.execute("SELECT COUNT(*) FROM players")
        assert cursor.fetchone()[0] > 0
        
        cursor.execute("SELECT COUNT(*) FROM messages")
        assert cursor.fetchone()[0] > 0
        
        conn.close()


class TestPydanticModels:
    """Test Pydantic models validation."""
    
    def test_create_game_request_valid(self):
        """Test CreateGameRequest with valid data."""
        request = CreateGameRequest(player_name="Alice", is_ai_opponent=False)
        assert request.player_name == "Alice"
        assert request.is_ai_opponent is False
    
    def test_create_game_request_default(self):
        """Test CreateGameRequest default values."""
        request = CreateGameRequest(player_name="Bob")
        assert request.is_ai_opponent is False
    
    def test_create_game_request_validation(self):
        """Test CreateGameRequest validation."""
        with pytest.raises(ValueError):
            CreateGameRequest(player_name="")
    
    def test_game_response_valid(self):
        """Test GameResponse with valid data."""
        response = GameResponse(
            id="game-123",
            status="waiting",
            created_at="2024-01-01T00:00:00",
            started_at=None,
            finished_at=None,
            current_turn=None,
            winner_id=None,
        )
        assert response.id == "game-123"
        assert response.status == "waiting"
    
    def test_join_game_request_valid(self):
        """Test JoinGameRequest with valid data."""
        request = JoinGameRequest(player_name="Charlie")
        assert request.player_name == "Charlie"
    
    def test_player_response_valid(self):
        """Test PlayerResponse with valid data."""
        response = PlayerResponse(
            id="player-123",
            game_id="game-123",
            player_number=1,
            player_name="Alice",
            joined_at="2024-01-01T00:00:00",
            is_ai=False,
        )
        assert response.player_number == 1
        assert response.is_ai is False
    
    def test_move_request_valid(self):
        """Test MoveRequest with valid data."""
        request = MoveRequest(player_id="player-123", column_index=3)
        assert request.column_index == 3
    
    def test_move_request_validation(self):
        """Test MoveRequest validation."""
        with pytest.raises(ValueError):
            MoveRequest(player_id="player-123", column_index=7)
        
        with pytest.raises(ValueError):
            MoveRequest(player_id="player-123", column_index=-1)
    
    def test_move_response_valid(self):
        """Test MoveResponse with valid data."""
        response = MoveResponse(
            id=1,
            game_id="game-123",
            player_id="player-123",
            move_number=1,
            column_index=3,
            row_index=0,
            created_at="2024-01-01T00:00:00",
        )
        assert response.move_number == 1
        assert response.row_index == 0
    
    def test_chat_message_request_valid(self):
        """Test ChatMessageRequest with valid data."""
        request = ChatMessageRequest(player_id="player-123", content="Hello!")
        assert request.content == "Hello!"
    
    def test_chat_message_request_validation(self):
        """Test ChatMessageRequest validation."""
        with pytest.raises(ValueError):
            ChatMessageRequest(player_id="player-123", content="")
    
    def test_chat_message_response_valid(self):
        """Test ChatMessageResponse with valid data."""
        response = ChatMessageResponse(
            id=1,
            game_id="game-123",
            player_id="player-123",
            message_type="chat",
            content="Hello!",
            created_at="2024-01-01T00:00:00",
        )
        assert response.message_type == "chat"
        assert response.content == "Hello!"
    
    def test_game_state_response_valid(self):
        """Test GameStateResponse with valid data."""
        game = GameResponse(
            id="game-123",
            status="active",
            created_at="2024-01-01T00:00:00",
        )
        player = PlayerResponse(
            id="player-123",
            game_id="game-123",
            player_number=1,
            player_name="Alice",
            joined_at="2024-01-01T00:00:00",
            is_ai=False,
        )
        move = MoveResponse(
            id=1,
            game_id="game-123",
            player_id="player-123",
            move_number=1,
            column_index=3,
            row_index=0,
            created_at="2024-01-01T00:00:00",
        )
        message = ChatMessageResponse(
            id=1,
            game_id="game-123",
            player_id=None,
            message_type="system",
            content="Game started",
            created_at="2024-01-01T00:00:00",
        )
        
        response = GameStateResponse(
            game=game,
            players=[player],
            moves=[move],
            messages=[message],
        )
        assert len(response.players) == 1
        assert len(response.moves) == 1
        assert len(response.messages) == 1


class TestAPIEndpoints:
    """Test API endpoints."""
    
    def test_api_root_endpoint(self):
        """Test GET /api endpoint."""
        client = TestClient(app)
        response = client.get("/api")
        
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        assert data["version"] == "1.0.0"
    
    def test_cors_headers(self):
        """Test that CORS middleware is configured."""
        client = TestClient(app)
        response = client.options(
            "/api",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        
        assert "access-control-allow-origin" in response.headers
