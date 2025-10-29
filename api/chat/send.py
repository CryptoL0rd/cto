from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from mangum import Mangum

from api._shared.db import get_db
from api._shared.models import SendChatMessageRequest, ChatMessageResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/chat/send")
async def send_chat_message(request: SendChatMessageRequest):
    try:
        with get_db() as db:
            cursor = db.cursor()
            
            cursor.execute("SELECT id FROM games WHERE id = ?", (request.game_id,))
            game = cursor.fetchone()
            if not game:
                raise ValueError(f"Game with id {request.game_id} not found")
            
            cursor.execute("SELECT id FROM players WHERE id = ? AND game_id = ?", (request.player_id, request.game_id))
            player = cursor.fetchone()
            if not player:
                raise ValueError(f"Player with id {request.player_id} not found in game {request.game_id}")
            
            created_at = datetime.now().isoformat()
            
            cursor.execute(
                "INSERT INTO messages (game_id, player_id, message_type, content, created_at) VALUES (?, ?, ?, ?, ?)",
                (request.game_id, request.player_id, "chat", request.text, created_at)
            )
            
            message_id = cursor.lastrowid
            
            cursor.execute("SELECT * FROM messages WHERE id = ?", (message_id,))
            message_row = cursor.fetchone()
            
            if not message_row:
                raise HTTPException(status_code=500, detail="Failed to create message")
            
            message_dict = dict(message_row)
            
            response = ChatMessageResponse(
                id=message_dict["id"],
                game_id=message_dict["game_id"],
                player_id=message_dict.get("player_id"),
                message_type=message_dict["message_type"],
                content=message_dict["content"],
                created_at=message_dict["created_at"]
            )
            
            return JSONResponse(
                status_code=201,
                content=response.model_dump()
            )
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


handler = Mangum(app, lifespan="off")
