"""
Tests for chat API endpoints.
Tests message sending and retrieval with filtering.
"""
import pytest
import tempfile
import os
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

from api._shared.init_db import init_database
from api._shared.db import set_db_path, get_db


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


@pytest.fixture
def game_with_players(test_db):
    """Create a game with two players for testing."""
    from api.game.create import app as create_app
    from api.game.join import app as join_app
    
    create_client = TestClient(create_app)
    join_client = TestClient(join_app)
    
    create_response = create_client.post(
        "/api/game/create",
        json={"player_name": "Alice", "mode": "classic3", "is_ai_opponent": False}
    )
    create_data = create_response.json()
    game_id = create_data["game"]["id"]
    player1_id = create_data["player_id"]
    invite_code = create_data["invite_code"]
    
    join_response = join_client.post(
        "/api/game/join",
        json={"invite_code": invite_code, "player_name": "Bob"}
    )
    join_data = join_response.json()
    player2_id = join_data["player"]["id"]
    
    return {
        "game_id": game_id,
        "player1_id": player1_id,
        "player2_id": player2_id,
        "invite_code": invite_code
    }


class TestSendChatMessage:
    """Test /api/chat/send endpoint."""
    
    def test_send_message_success(self, test_db, game_with_players):
        """Test successfully sending a chat message."""
        from api.chat.send import app
        client = TestClient(app)
        
        response = client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Hello, World!"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["game_id"] == game_with_players["game_id"]
        assert data["player_id"] == game_with_players["player1_id"]
        assert data["message_type"] == "chat"
        assert data["content"] == "Hello, World!"
        assert "created_at" in data
        assert "id" in data
    
    def test_send_message_invalid_game(self, test_db, game_with_players):
        """Test sending a message with invalid game_id."""
        from api.chat.send import app
        client = TestClient(app)
        
        response = client.post(
            "/api/chat/send",
            json={
                "game_id": "invalid-game-id",
                "player_id": game_with_players["player1_id"],
                "text": "Hello!"
            }
        )
        
        assert response.status_code == 400
        assert "not found" in response.json()["detail"].lower()
    
    def test_send_message_invalid_player(self, test_db, game_with_players):
        """Test sending a message with invalid player_id."""
        from api.chat.send import app
        client = TestClient(app)
        
        response = client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": "invalid-player-id",
                "text": "Hello!"
            }
        )
        
        assert response.status_code == 400
        assert "not found" in response.json()["detail"].lower()
    
    def test_send_message_player_not_in_game(self, test_db, game_with_players):
        """Test sending a message from a player not in the specified game."""
        from api.game.create import app as create_app
        from api.chat.send import app as send_app
        
        create_client = TestClient(create_app)
        send_client = TestClient(send_app)
        
        other_game_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Charlie", "mode": "classic3"}
        )
        other_player_id = other_game_response.json()["player_id"]
        
        response = send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": other_player_id,
                "text": "Hello!"
            }
        )
        
        assert response.status_code == 400
        assert "not found" in response.json()["detail"].lower()
    
    def test_send_message_empty_text(self, test_db, game_with_players):
        """Test sending a message with empty text."""
        from api.chat.send import app
        client = TestClient(app)
        
        response = client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": ""
            }
        )
        
        assert response.status_code == 422
    
    def test_send_message_too_long(self, test_db, game_with_players):
        """Test sending a message that exceeds maximum length."""
        from api.chat.send import app
        client = TestClient(app)
        
        long_text = "a" * 501
        
        response = client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": long_text
            }
        )
        
        assert response.status_code == 422
    
    def test_send_message_max_length(self, test_db, game_with_players):
        """Test sending a message at maximum allowed length."""
        from api.chat.send import app
        client = TestClient(app)
        
        max_text = "a" * 500
        
        response = client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": max_text
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert len(data["content"]) == 500
    
    def test_send_multiple_messages(self, test_db, game_with_players):
        """Test sending multiple messages."""
        from api.chat.send import app
        client = TestClient(app)
        
        messages = ["First message", "Second message", "Third message"]
        message_ids = []
        
        for msg in messages:
            response = client.post(
                "/api/chat/send",
                json={
                    "game_id": game_with_players["game_id"],
                    "player_id": game_with_players["player1_id"],
                    "text": msg
                }
            )
            assert response.status_code == 201
            message_ids.append(response.json()["id"])
        
        assert len(set(message_ids)) == 3
        assert message_ids == sorted(message_ids)
    
    def test_send_messages_from_different_players(self, test_db, game_with_players):
        """Test sending messages from different players."""
        from api.chat.send import app
        client = TestClient(app)
        
        response1 = client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Message from player 1"
            }
        )
        
        response2 = client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player2_id"],
                "text": "Message from player 2"
            }
        )
        
        assert response1.status_code == 201
        assert response2.status_code == 201
        assert response1.json()["player_id"] == game_with_players["player1_id"]
        assert response2.json()["player_id"] == game_with_players["player2_id"]


class TestListChatMessages:
    """Test /api/chat/list endpoint."""
    
    def test_list_messages_empty_game(self, test_db, game_with_players):
        """Test listing messages from a game with no messages."""
        from api.chat.list import app
        client = TestClient(app)
        
        response = client.get(
            "/api/chat/list",
            params={"game_id": game_with_players["game_id"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert len(data["messages"]) == 0
    
    def test_list_messages_single_message(self, test_db, game_with_players):
        """Test listing messages with a single message."""
        from api.chat.send import app as send_app
        from api.chat.list import app as list_app
        
        send_client = TestClient(send_app)
        list_client = TestClient(list_app)
        
        send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Test message"
            }
        )
        
        response = list_client.get(
            "/api/chat/list",
            params={"game_id": game_with_players["game_id"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["messages"]) == 1
        assert data["messages"][0]["content"] == "Test message"
    
    def test_list_messages_multiple_messages(self, test_db, game_with_players):
        """Test listing multiple messages in chronological order."""
        from api.chat.send import app as send_app
        from api.chat.list import app as list_app
        
        send_client = TestClient(send_app)
        list_client = TestClient(list_app)
        
        messages = ["First", "Second", "Third", "Fourth", "Fifth"]
        
        for msg in messages:
            send_client.post(
                "/api/chat/send",
                json={
                    "game_id": game_with_players["game_id"],
                    "player_id": game_with_players["player1_id"],
                    "text": msg
                }
            )
        
        response = list_client.get(
            "/api/chat/list",
            params={"game_id": game_with_players["game_id"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["messages"]) == 5
        
        retrieved_messages = [msg["content"] for msg in data["messages"]]
        assert retrieved_messages == messages
        
        timestamps = [msg["created_at"] for msg in data["messages"]]
        assert timestamps == sorted(timestamps)
    
    def test_list_messages_with_since_filter(self, test_db, game_with_players):
        """Test listing messages with since timestamp filter."""
        from api.chat.send import app as send_app
        from api.chat.list import app as list_app
        
        send_client = TestClient(send_app)
        list_client = TestClient(list_app)
        
        response1 = send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Old message"
            }
        )
        
        since_timestamp = response1.json()["created_at"]
        
        response2 = send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "New message"
            }
        )
        
        list_response = list_client.get(
            "/api/chat/list",
            params={"game_id": game_with_players["game_id"], "since": since_timestamp}
        )
        
        assert list_response.status_code == 200
        data = list_response.json()
        assert len(data["messages"]) == 1
        assert data["messages"][0]["content"] == "New message"
    
    def test_list_messages_since_returns_empty_if_no_new_messages(self, test_db, game_with_players):
        """Test that since filter returns empty list if no newer messages."""
        from api.chat.send import app as send_app
        from api.chat.list import app as list_app
        
        send_client = TestClient(send_app)
        list_client = TestClient(list_app)
        
        response = send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Message"
            }
        )
        
        since_timestamp = response.json()["created_at"]
        
        list_response = list_client.get(
            "/api/chat/list",
            params={"game_id": game_with_players["game_id"], "since": since_timestamp}
        )
        
        assert list_response.status_code == 200
        data = list_response.json()
        assert len(data["messages"]) == 0
    
    def test_list_messages_limit_100(self, test_db, game_with_players):
        """Test that list endpoint limits results to 100 messages."""
        from api.chat.send import app as send_app
        from api.chat.list import app as list_app
        
        send_client = TestClient(send_app)
        list_client = TestClient(list_app)
        
        for i in range(150):
            send_client.post(
                "/api/chat/send",
                json={
                    "game_id": game_with_players["game_id"],
                    "player_id": game_with_players["player1_id"],
                    "text": f"Message {i}"
                }
            )
        
        response = list_client.get(
            "/api/chat/list",
            params={"game_id": game_with_players["game_id"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["messages"]) == 100
    
    def test_list_messages_invalid_game(self, test_db):
        """Test listing messages with invalid game_id."""
        from api.chat.list import app
        client = TestClient(app)
        
        response = client.get(
            "/api/chat/list",
            params={"game_id": "invalid-game-id"}
        )
        
        assert response.status_code == 400
        assert "not found" in response.json()["detail"].lower()
    
    def test_list_messages_from_multiple_players(self, test_db, game_with_players):
        """Test that list returns messages from all players in correct order."""
        from api.chat.send import app as send_app
        from api.chat.list import app as list_app
        
        send_client = TestClient(send_app)
        list_client = TestClient(list_app)
        
        send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Hello from player 1"
            }
        )
        
        send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player2_id"],
                "text": "Hello from player 2"
            }
        )
        
        send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Second message from player 1"
            }
        )
        
        response = list_client.get(
            "/api/chat/list",
            params={"game_id": game_with_players["game_id"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["messages"]) == 3
        assert data["messages"][0]["content"] == "Hello from player 1"
        assert data["messages"][1]["content"] == "Hello from player 2"
        assert data["messages"][2]["content"] == "Second message from player 1"
    
    def test_list_messages_isolated_by_game(self, test_db, game_with_players):
        """Test that messages are isolated by game."""
        from api.game.create import app as create_app
        from api.chat.send import app as send_app
        from api.chat.list import app as list_app
        
        create_client = TestClient(create_app)
        send_client = TestClient(send_app)
        list_client = TestClient(list_app)
        
        other_game_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Charlie", "mode": "classic3"}
        )
        other_game_id = other_game_response.json()["game"]["id"]
        other_player_id = other_game_response.json()["player_id"]
        
        send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Message in game 1"
            }
        )
        
        send_client.post(
            "/api/chat/send",
            json={
                "game_id": other_game_id,
                "player_id": other_player_id,
                "text": "Message in game 2"
            }
        )
        
        response1 = list_client.get(
            "/api/chat/list",
            params={"game_id": game_with_players["game_id"]}
        )
        
        response2 = list_client.get(
            "/api/chat/list",
            params={"game_id": other_game_id}
        )
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        data1 = response1.json()
        data2 = response2.json()
        
        assert len(data1["messages"]) == 1
        assert len(data2["messages"]) == 1
        assert data1["messages"][0]["content"] == "Message in game 1"
        assert data2["messages"][0]["content"] == "Message in game 2"


class TestChatMessagePersistence:
    """Test that chat messages persist correctly."""
    
    def test_messages_persist_in_database(self, test_db, game_with_players):
        """Test that messages are correctly stored in database."""
        from api.chat.send import app
        client = TestClient(app)
        
        response = client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Persistent message"
            }
        )
        
        message_id = response.json()["id"]
        
        with get_db() as db:
            cursor = db.cursor()
            cursor.execute("SELECT * FROM messages WHERE id = ?", (message_id,))
            msg = cursor.fetchone()
            
            assert msg is not None
            assert msg["game_id"] == game_with_players["game_id"]
            assert msg["player_id"] == game_with_players["player1_id"]
            assert msg["message_type"] == "chat"
            assert msg["content"] == "Persistent message"
            assert msg["created_at"] is not None
    
    def test_message_association_with_game_and_player(self, test_db, game_with_players):
        """Test that messages are correctly associated with game and player."""
        from api.chat.send import app as send_app
        from api.chat.list import app as list_app
        
        send_client = TestClient(send_app)
        list_client = TestClient(list_app)
        
        send_response = send_client.post(
            "/api/chat/send",
            json={
                "game_id": game_with_players["game_id"],
                "player_id": game_with_players["player1_id"],
                "text": "Test association"
            }
        )
        
        list_response = list_client.get(
            "/api/chat/list",
            params={"game_id": game_with_players["game_id"]}
        )
        
        assert list_response.status_code == 200
        messages = list_response.json()["messages"]
        assert len(messages) == 1
        assert messages[0]["game_id"] == game_with_players["game_id"]
        assert messages[0]["player_id"] == game_with_players["player1_id"]
        assert messages[0]["id"] == send_response.json()["id"]
