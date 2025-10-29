from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Literal

from api._shared.db import get_db
from api._shared.game_service import create_game
from api._shared.models import GameResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateGameRequest(BaseModel):
    player_name: str = Field(..., min_length=1, max_length=50)
    mode: Literal["classic3", "gomoku"] = Field(default="classic3")
    is_ai_opponent: bool = Field(default=False)


@app.post("/api/game/create")
async def create_game_endpoint(request: CreateGameRequest):
    try:
        with get_db() as db:
            result = create_game(
                db=db,
                mode=request.mode,
                player_name=request.player_name,
                is_ai_opponent=request.is_ai_opponent
            )
            
            cursor = db.cursor()
            cursor.execute("SELECT * FROM games WHERE id = ?", (result["game_id"],))
            game_row = cursor.fetchone()
            
            if not game_row:
                raise HTTPException(status_code=500, detail="Failed to create game")
            
            game_dict = dict(game_row)
            
            response = GameResponse(
                id=game_dict["id"],
                mode=game_dict["mode"],
                status=game_dict["status"],
                created_at=game_dict["created_at"],
                started_at=game_dict.get("started_at"),
                finished_at=game_dict.get("finished_at"),
                current_turn=game_dict.get("current_turn"),
                winner_id=game_dict.get("winner_id")
            )
            
            return JSONResponse(
                status_code=201,
                content={
                    "game": response.model_dump(),
                    "player_id": result["player_id"],
                    "invite_code": result["invite_code"]
                }
            )
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


handler = app
