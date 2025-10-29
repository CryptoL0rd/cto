from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
from mangum import Mangum

from api._shared.db import get_db
from api._shared.models import ChatMessageResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/chat/list")
async def list_chat_messages(
    game_id: str = Query(..., description="Game ID"),
    since: Optional[str] = Query(None, description="Optional timestamp to filter messages newer than this")
):
    try:
        with get_db() as db:
            cursor = db.cursor()
            
            cursor.execute("SELECT id FROM games WHERE id = ?", (game_id,))
            game = cursor.fetchone()
            if not game:
                raise ValueError(f"Game with id {game_id} not found")
            
            if since:
                cursor.execute(
                    """
                    SELECT * FROM messages 
                    WHERE game_id = ? AND created_at > ? 
                    ORDER BY created_at ASC 
                    LIMIT 100
                    """,
                    (game_id, since)
                )
            else:
                cursor.execute(
                    """
                    SELECT * FROM messages 
                    WHERE game_id = ? 
                    ORDER BY created_at ASC 
                    LIMIT 100
                    """,
                    (game_id,)
                )
            
            message_rows = cursor.fetchall()
            
            messages = [
                ChatMessageResponse(
                    id=dict(msg)["id"],
                    game_id=dict(msg)["game_id"],
                    player_id=dict(msg).get("player_id"),
                    message_type=dict(msg)["message_type"],
                    content=dict(msg)["content"],
                    created_at=dict(msg)["created_at"]
                )
                for msg in message_rows
            ]
            
            return JSONResponse(
                status_code=200,
                content={"messages": [msg.model_dump() for msg in messages]}
            )
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


handler = Mangum(app, lifespan="off")
