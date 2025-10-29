from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from mangum import Mangum

from api._shared.db import get_db
from api._shared.game_service import join_game
from api._shared.models import PlayerResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class JoinGameRequest(BaseModel):
    invite_code: str = Field(..., min_length=1)
    player_name: str = Field(..., min_length=1, max_length=50)


@app.post("/api/game/join")
async def join_game_endpoint(request: JoinGameRequest):
    try:
        with get_db() as db:
            result = join_game(
                db=db,
                invite_code=request.invite_code,
                player_name=request.player_name
            )
            
            cursor = db.cursor()
            cursor.execute(
                "SELECT * FROM players WHERE id = ?",
                (result["player_id"],)
            )
            player_row = cursor.fetchone()
            
            if not player_row:
                raise HTTPException(status_code=500, detail="Failed to join game")
            
            player_dict = dict(player_row)
            
            response = PlayerResponse(
                id=player_dict["id"],
                game_id=player_dict["game_id"],
                player_number=player_dict["player_number"],
                player_name=player_dict["player_name"],
                joined_at=player_dict["joined_at"],
                is_ai=bool(player_dict["is_ai"])
            )
            
            return JSONResponse(
                status_code=200,
                content={
                    "player": response.model_dump(),
                    "game_id": result["game_id"],
                    "mode": result["mode"]
                }
            )
            
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        elif "full" in error_msg.lower() or "not available" in error_msg.lower():
            raise HTTPException(status_code=409, detail=error_msg)
        else:
            raise HTTPException(status_code=400, detail=error_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


handler = Mangum(app, lifespan="off")
