from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from api._shared.db import get_db
from api._shared.game_service import make_move
from api._shared.models import MoveResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MakeMoveRequest(BaseModel):
    game_id: str
    player_id: str
    column_index: int = Field(..., ge=0, lt=15)
    row_index: int = Field(..., ge=0, lt=15)


@app.post("/api/game/move")
async def make_move_endpoint(request: MakeMoveRequest):
    try:
        with get_db() as db:
            move_data = {
                "column_index": request.column_index,
                "row_index": request.row_index
            }
            
            result = make_move(
                db=db,
                game_id=request.game_id,
                player_id=request.player_id,
                move_data=move_data
            )
            
            cursor = db.cursor()
            cursor.execute(
                "SELECT * FROM moves WHERE id = ?",
                (result["move_id"],)
            )
            move_row = cursor.fetchone()
            
            if not move_row:
                raise HTTPException(status_code=500, detail="Failed to record move")
            
            move_dict = dict(move_row)
            
            response = MoveResponse(
                id=move_dict["id"],
                game_id=move_dict["game_id"],
                player_id=move_dict["player_id"],
                move_number=move_dict["move_number"],
                column_index=move_dict["column_index"],
                row_index=move_dict["row_index"],
                created_at=move_dict["created_at"]
            )
            
            return JSONResponse(
                status_code=200,
                content={
                    "move": response.model_dump(),
                    "is_winner": result.get("is_winner", False),
                    "is_draw": result.get("is_draw", False),
                    "game_status": result.get("game_status", "active")
                }
            )
            
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        elif any(keyword in error_msg.lower() for keyword in ["turn", "occupied", "bounds", "active", "winner"]):
            raise HTTPException(status_code=409, detail=error_msg)
        else:
            raise HTTPException(status_code=400, detail=error_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


handler = app
