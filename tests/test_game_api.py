"""
Tests for game API endpoints.
Tests the full game lifecycle: create → join → move → state.
"""
import pytest
import tempfile
import os
from fastapi.testclient import TestClient

from api._shared.init_db import init_database
from api._shared.db import set_db_path


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


class TestCreateGameEndpoint:
    """Test /api/game/create endpoint."""
    
    def test_create_classic3_game(self, test_db):
        """Test creating a Classic 3x3 game."""
        from api.game.create import app
        client = TestClient(app)
        
        response = client.post(
            "/api/game/create",
            json={
                "player_name": "Alice",
                "mode": "classic3",
                "is_ai_opponent": False
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "game" in data
        assert "player_id" in data
        assert "invite_code" in data
        assert data["game"]["mode"] == "classic3"
        assert data["game"]["status"] == "waiting"
        assert len(data["invite_code"]) == 6
    
    def test_create_gomoku_game(self, test_db):
        """Test creating a Gomoku game."""
        from api.game.create import app
        client = TestClient(app)
        
        response = client.post(
            "/api/game/create",
            json={
                "player_name": "Bob",
                "mode": "gomoku",
                "is_ai_opponent": False
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["game"]["mode"] == "gomoku"
        assert data["game"]["status"] == "waiting"
    
    def test_create_game_with_ai_opponent(self, test_db):
        """Test creating a game with AI opponent."""
        from api.game.create import app
        client = TestClient(app)
        
        response = client.post(
            "/api/game/create",
            json={
                "player_name": "Charlie",
                "mode": "classic3",
                "is_ai_opponent": True
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["game"]["status"] == "active"
        assert data["game"]["current_turn"] == 1
    
    def test_create_game_invalid_mode(self, test_db):
        """Test creating a game with invalid mode."""
        from api.game.create import app
        client = TestClient(app)
        
        response = client.post(
            "/api/game/create",
            json={
                "player_name": "Alice",
                "mode": "invalid_mode",
                "is_ai_opponent": False
            }
        )
        
        assert response.status_code == 422
    
    def test_create_game_empty_name(self, test_db):
        """Test creating a game with empty player name."""
        from api.game.create import app
        client = TestClient(app)
        
        response = client.post(
            "/api/game/create",
            json={
                "player_name": "",
                "mode": "classic3",
                "is_ai_opponent": False
            }
        )
        
        assert response.status_code == 422


class TestJoinGameEndpoint:
    """Test /api/game/join endpoint."""
    
    def test_join_game_success(self, test_db):
        """Test successfully joining a game."""
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        create_data = create_response.json()
        invite_code = create_data["invite_code"]
        
        join_response = join_client.post(
            "/api/game/join",
            json={"invite_code": invite_code, "player_name": "Bob"}
        )
        
        assert join_response.status_code == 200
        join_data = join_response.json()
        assert "player" in join_data
        assert join_data["player"]["player_number"] == 2
        assert join_data["player"]["player_name"] == "Bob"
        assert join_data["game_id"] == invite_code
    
    def test_join_game_not_found(self, test_db):
        """Test joining a non-existent game."""
        from api.game.join import app
        client = TestClient(app)
        
        response = client.post(
            "/api/game/join",
            json={"invite_code": "NOTFOUND", "player_name": "Bob"}
        )
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_join_game_already_full(self, test_db):
        """Test joining a game that is already full."""
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        invite_code = create_response.json()["invite_code"]
        
        join_client.post(
            "/api/game/join",
            json={"invite_code": invite_code, "player_name": "Bob"}
        )
        
        response = join_client.post(
            "/api/game/join",
            json={"invite_code": invite_code, "player_name": "Charlie"}
        )
        
        assert response.status_code == 409
        assert "full" in response.json()["detail"].lower()


class TestGameStateEndpoint:
    """Test /api/game/state endpoint."""
    
    def test_get_game_state(self, test_db):
        """Test getting game state."""
        from api.game.create import app as create_app
        from api.game.state import app as state_app
        
        create_client = TestClient(create_app)
        state_client = TestClient(state_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        game_id = create_response.json()["game"]["id"]
        
        state_response = state_client.get(
            "/api/game/state",
            params={"game_id": game_id}
        )
        
        assert state_response.status_code == 200
        state_data = state_response.json()
        assert "game" in state_data
        assert "players" in state_data
        assert "moves" in state_data
        assert "messages" in state_data
        assert state_data["game"]["id"] == game_id
        assert len(state_data["players"]) == 1
    
    def test_get_game_state_not_found(self, test_db):
        """Test getting state for non-existent game."""
        from api.game.state import app
        client = TestClient(app)
        
        response = client.get(
            "/api/game/state",
            params={"game_id": "NOTFOUND"}
        )
        
        assert response.status_code == 404


class TestMakeMoveEndpoint:
    """Test /api/game/move endpoint."""
    
    def test_make_move_success(self, test_db):
        """Test making a valid move."""
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        from api.game.move import app as move_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        move_client = TestClient(move_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        create_data = create_response.json()
        game_id = create_data["game"]["id"]
        player1_id = create_data["player_id"]
        
        join_response = join_client.post(
            "/api/game/join",
            json={"invite_code": game_id, "player_name": "Bob"}
        )
        
        move_response = move_client.post(
            "/api/game/move",
            json={
                "game_id": game_id,
                "player_id": player1_id,
                "column_index": 0,
                "row_index": 0
            }
        )
        
        assert move_response.status_code == 200
        move_data = move_response.json()
        assert "move" in move_data
        assert move_data["move"]["column_index"] == 0
        assert move_data["move"]["row_index"] == 0
        assert move_data["is_winner"] is False
    
    def test_make_move_not_your_turn(self, test_db):
        """Test making a move when it's not your turn."""
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        from api.game.move import app as move_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        move_client = TestClient(move_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        game_id = create_response.json()["game"]["id"]
        
        join_response = join_client.post(
            "/api/game/join",
            json={"invite_code": game_id, "player_name": "Bob"}
        )
        player2_id = join_response.json()["player"]["id"]
        
        move_response = move_client.post(
            "/api/game/move",
            json={
                "game_id": game_id,
                "player_id": player2_id,
                "column_index": 0,
                "row_index": 0
            }
        )
        
        assert move_response.status_code == 409
        assert "turn" in move_response.json()["detail"].lower()
    
    def test_make_move_position_occupied(self, test_db):
        """Test making a move on an occupied position."""
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        from api.game.move import app as move_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        move_client = TestClient(move_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        create_data = create_response.json()
        game_id = create_data["game"]["id"]
        player1_id = create_data["player_id"]
        
        join_response = join_client.post(
            "/api/game/join",
            json={"invite_code": game_id, "player_name": "Bob"}
        )
        player2_id = join_response.json()["player"]["id"]
        
        move_client.post(
            "/api/game/move",
            json={
                "game_id": game_id,
                "player_id": player1_id,
                "column_index": 1,
                "row_index": 1
            }
        )
        
        move_response = move_client.post(
            "/api/game/move",
            json={
                "game_id": game_id,
                "player_id": player2_id,
                "column_index": 1,
                "row_index": 1
            }
        )
        
        assert move_response.status_code == 409
        assert "occupied" in move_response.json()["detail"].lower()
    
    def test_make_move_out_of_bounds_classic3(self, test_db):
        """Test making a move out of bounds in Classic 3x3."""
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        from api.game.move import app as move_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        move_client = TestClient(move_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        create_data = create_response.json()
        game_id = create_data["game"]["id"]
        player1_id = create_data["player_id"]
        
        join_client.post(
            "/api/game/join",
            json={"invite_code": game_id, "player_name": "Bob"}
        )
        
        move_response = move_client.post(
            "/api/game/move",
            json={
                "game_id": game_id,
                "player_id": player1_id,
                "column_index": 5,
                "row_index": 5
            }
        )
        
        assert move_response.status_code == 409
        assert "bounds" in move_response.json()["detail"].lower()


class TestFullGameLifecycle:
    """Test complete game lifecycle from create to completion."""
    
    def test_classic3_full_game_with_winner(self, test_db):
        """Test a full Classic 3x3 game ending with a winner."""
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        from api.game.move import app as move_app
        from api.game.state import app as state_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        move_client = TestClient(move_app)
        state_client = TestClient(state_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        create_data = create_response.json()
        game_id = create_data["game"]["id"]
        player1_id = create_data["player_id"]
        
        join_response = join_client.post(
            "/api/game/join",
            json={"invite_code": game_id, "player_name": "Bob"}
        )
        player2_id = join_response.json()["player"]["id"]
        
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 0}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player2_id, "column_index": 1, "row_index": 0}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 1}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player2_id, "column_index": 1, "row_index": 1}
        )
        
        final_move = move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 2}
        )
        
        assert final_move.status_code == 200
        final_data = final_move.json()
        assert final_data["is_winner"] is True
        assert final_data["game_status"] == "completed"
        
        state_response = state_client.get("/api/game/state", params={"game_id": game_id})
        state_data = state_response.json()
        assert state_data["game"]["status"] == "completed"
        assert state_data["game"]["winner_id"] == player1_id
        assert len(state_data["moves"]) == 5
    
    def test_classic3_full_game_with_draw(self, test_db):
        """Test a full Classic 3x3 game ending with a draw."""
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        from api.game.move import app as move_app
        from api.game.state import app as state_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        move_client = TestClient(move_app)
        state_client = TestClient(state_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        create_data = create_response.json()
        game_id = create_data["game"]["id"]
        player1_id = create_data["player_id"]
        
        join_response = join_client.post(
            "/api/game/join",
            json={"invite_code": game_id, "player_name": "Bob"}
        )
        player2_id = join_response.json()["player"]["id"]
        
        moves = [
            (player1_id, 0, 0),
            (player2_id, 1, 0),
            (player1_id, 2, 0),
            (player2_id, 0, 1),
            (player1_id, 2, 1),
            (player2_id, 1, 1),
            (player1_id, 0, 2),
            (player2_id, 2, 2),
            (player1_id, 1, 2),
        ]
        
        for player_id, col, row in moves:
            move_client.post(
                "/api/game/move",
                json={"game_id": game_id, "player_id": player_id, "column_index": col, "row_index": row}
            )
        
        state_response = state_client.get("/api/game/state", params={"game_id": game_id})
        state_data = state_response.json()
        assert state_data["game"]["status"] == "completed"
        assert state_data["game"]["winner_id"] is None
        assert len(state_data["moves"]) == 9
    
    def test_gomoku_game_with_winner(self, test_db):
        """Test a Gomoku game ending with a winner."""
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        from api.game.move import app as move_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        move_client = TestClient(move_app)
        
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "gomoku"}
        )
        create_data = create_response.json()
        game_id = create_data["game"]["id"]
        player1_id = create_data["player_id"]
        
        join_response = join_client.post(
            "/api/game/join",
            json={"invite_code": game_id, "player_name": "Bob"}
        )
        player2_id = join_response.json()["player"]["id"]
        
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 0}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player2_id, "column_index": 1, "row_index": 0}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 1}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player2_id, "column_index": 1, "row_index": 1}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 2}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player2_id, "column_index": 1, "row_index": 2}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 3}
        )
        move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player2_id, "column_index": 1, "row_index": 3}
        )
        
        final_move = move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 4}
        )
        
        assert final_move.status_code == 200
        final_data = final_move.json()
        assert final_data["is_winner"] is True
        assert final_data["game_status"] == "completed"
    
    def test_cors_headers_present(self, test_db):
        """Test that CORS headers are present in responses."""
        from api.game.create import app
        client = TestClient(app)
        
        response = client.options(
            "/api/game/create",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            }
        )
        
        assert "access-control-allow-origin" in response.headers
