from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from api._shared.db import get_db
from api._shared.game_service import get_game_state
from api._shared.models import (
    GameResponse,
    PlayerResponse,
    MoveResponse,
    ChatMessageResponse,
    GameStateResponse
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/game/state")
async def get_game_state_endpoint(game_id: str = Query(..., description="Game ID")):
    try:
        with get_db() as db:
            state = get_game_state(db=db, game_id=game_id)
            
            game_data = state["game"]
            game = GameResponse(
                id=game_data["id"],
                mode=game_data["mode"],
                status=game_data["status"],
                created_at=game_data["created_at"],
                started_at=game_data.get("started_at"),
                finished_at=game_data.get("finished_at"),
                current_turn=game_data.get("current_turn"),
                winner_id=game_data.get("winner_id")
            )
            
            players = [
                PlayerResponse(
                    id=p["id"],
                    game_id=p["game_id"],
                    player_number=p["player_number"],
                    player_name=p["player_name"],
                    joined_at=p["joined_at"],
                    is_ai=bool(p["is_ai"])
                )
                for p in state["players"]
            ]
            
            moves = [
                MoveResponse(
                    id=m["id"],
                    game_id=m["game_id"],
                    player_id=m["player_id"],
                    move_number=m["move_number"],
                    column_index=m["column_index"],
                    row_index=m["row_index"],
                    created_at=m["created_at"]
                )
                for m in state["moves"]
            ]
            
            messages = [
                ChatMessageResponse(
                    id=msg["id"],
                    game_id=msg["game_id"],
                    player_id=msg.get("player_id"),
                    message_type=msg["message_type"],
                    content=msg["content"],
                    created_at=msg["created_at"]
                )
                for msg in state["messages"]
            ]
            
            response = GameStateResponse(
                game=game,
                players=players,
                moves=moves,
                messages=messages
            )
            
            return JSONResponse(
                status_code=200,
                content=response.model_dump()
            )
            
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        else:
            raise HTTPException(status_code=400, detail=error_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


handler = Mangum(app, lifespan="off")
