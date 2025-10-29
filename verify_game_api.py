#!/usr/bin/env python3
"""
Manual verification script for game API endpoints.
Tests the full game lifecycle: create → join → move → state.
"""
import tempfile
import os
from fastapi.testclient import TestClient

from api._shared.init_db import init_database
from api._shared.db import set_db_path


def test_full_game_lifecycle():
    """Test complete game lifecycle."""
    print("🎮 Game API Verification\n")
    print("=" * 50)
    
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".db") as f:
        db_path = f.name
    
    try:
        set_db_path(db_path)
        init_database(db_path=db_path)
        print("✅ Database initialized")
        
        from api.game.create import app as create_app
        from api.game.join import app as join_app
        from api.game.move import app as move_app
        from api.game.state import app as state_app
        
        create_client = TestClient(create_app)
        join_client = TestClient(join_app)
        move_client = TestClient(move_app)
        state_client = TestClient(state_app)
        
        print("\n1️⃣  Testing CREATE endpoint...")
        create_response = create_client.post(
            "/api/game/create",
            json={"player_name": "Alice", "mode": "classic3"}
        )
        assert create_response.status_code == 201, f"Expected 201, got {create_response.status_code}"
        create_data = create_response.json()
        game_id = create_data["game"]["id"]
        player1_id = create_data["player_id"]
        invite_code = create_data["invite_code"]
        print(f"   ✅ Game created: {game_id}")
        print(f"   ✅ Invite code: {invite_code}")
        print(f"   ✅ Player 1 ID: {player1_id}")
        
        print("\n2️⃣  Testing JOIN endpoint...")
        join_response = join_client.post(
            "/api/game/join",
            json={"invite_code": invite_code, "player_name": "Bob"}
        )
        assert join_response.status_code == 200, f"Expected 200, got {join_response.status_code}"
        join_data = join_response.json()
        player2_id = join_data["player"]["id"]
        print(f"   ✅ Player 2 joined: {player2_id}")
        print(f"   ✅ Player 2 name: {join_data['player']['player_name']}")
        print(f"   ✅ Player 2 number: {join_data['player']['player_number']}")
        
        print("\n3️⃣  Testing STATE endpoint (before moves)...")
        state_response = state_client.get(
            "/api/game/state",
            params={"game_id": game_id}
        )
        assert state_response.status_code == 200, f"Expected 200, got {state_response.status_code}"
        state_data = state_response.json()
        print(f"   ✅ Game status: {state_data['game']['status']}")
        print(f"   ✅ Current turn: {state_data['game']['current_turn']}")
        print(f"   ✅ Players: {len(state_data['players'])}")
        print(f"   ✅ Moves: {len(state_data['moves'])}")
        
        print("\n4️⃣  Testing MOVE endpoint (making moves)...")
        
        print("   Move 1: Player 1 at (0,0)")
        move1 = move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 0}
        )
        assert move1.status_code == 200
        print(f"   ✅ Move 1 recorded, winner: {move1.json()['is_winner']}")
        
        print("   Move 2: Player 2 at (1,0)")
        move2 = move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player2_id, "column_index": 1, "row_index": 0}
        )
        assert move2.status_code == 200
        print(f"   ✅ Move 2 recorded, winner: {move2.json()['is_winner']}")
        
        print("   Move 3: Player 1 at (0,1)")
        move3 = move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 1}
        )
        assert move3.status_code == 200
        print(f"   ✅ Move 3 recorded, winner: {move3.json()['is_winner']}")
        
        print("   Move 4: Player 2 at (1,1)")
        move4 = move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player2_id, "column_index": 1, "row_index": 1}
        )
        assert move4.status_code == 200
        print(f"   ✅ Move 4 recorded, winner: {move4.json()['is_winner']}")
        
        print("   Move 5: Player 1 at (0,2) - WINNING MOVE!")
        move5 = move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 0, "row_index": 2}
        )
        assert move5.status_code == 200
        move5_data = move5.json()
        print(f"   ✅ Move 5 recorded, winner: {move5_data['is_winner']}")
        print(f"   ✅ Game status: {move5_data['game_status']}")
        
        print("\n5️⃣  Testing STATE endpoint (after game completion)...")
        final_state = state_client.get(
            "/api/game/state",
            params={"game_id": game_id}
        )
        assert final_state.status_code == 200
        final_data = final_state.json()
        print(f"   ✅ Game status: {final_data['game']['status']}")
        print(f"   ✅ Winner ID: {final_data['game']['winner_id']}")
        print(f"   ✅ Total moves: {len(final_data['moves'])}")
        
        print("\n6️⃣  Testing error handling...")
        
        print("   Testing invalid mode...")
        invalid_mode = create_client.post(
            "/api/game/create",
            json={"player_name": "Charlie", "mode": "invalid"}
        )
        assert invalid_mode.status_code == 422
        print("   ✅ Invalid mode rejected (422)")
        
        print("   Testing join non-existent game...")
        not_found = join_client.post(
            "/api/game/join",
            json={"invite_code": "XXXXXX", "player_name": "Charlie"}
        )
        assert not_found.status_code == 404
        print("   ✅ Non-existent game rejected (404)")
        
        print("   Testing out-of-turn move...")
        wrong_turn = move_client.post(
            "/api/game/move",
            json={"game_id": game_id, "player_id": player1_id, "column_index": 2, "row_index": 2}
        )
        assert wrong_turn.status_code == 409
        print("   ✅ Game already completed (409)")
        
        print("\n" + "=" * 50)
        print("✅ ALL TESTS PASSED!")
        print("=" * 50)
        print("\n📊 Summary:")
        print("   • Create endpoint: ✅")
        print("   • Join endpoint: ✅")
        print("   • State endpoint: ✅")
        print("   • Move endpoint: ✅")
        print("   • Error handling: ✅")
        print("   • Full game lifecycle: ✅")
        print("\n🎉 Game API is fully functional!")
        
    finally:
        if os.path.exists(db_path):
            os.unlink(db_path)


if __name__ == "__main__":
    test_full_game_lifecycle()
