from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime


class CreateGameRequest(BaseModel):
    """Request to create a new game."""
    player_name: str = Field(..., min_length=1, max_length=50)
    mode: Literal["classic3", "gomoku"] = Field(default="classic3")
    is_ai_opponent: bool = Field(default=False)


class GameResponse(BaseModel):
    """Response containing game information."""
    id: str
    mode: Literal["classic3", "gomoku"]
    status: Literal["waiting", "active", "completed", "abandoned"]
    created_at: str
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    current_turn: Optional[int] = None
    winner_id: Optional[str] = None


class JoinGameRequest(BaseModel):
    """Request to join an existing game."""
    player_name: str = Field(..., min_length=1, max_length=50)


class PlayerResponse(BaseModel):
    """Response containing player information."""
    id: str
    game_id: str
    player_number: Literal[1, 2]
    player_name: str
    joined_at: str
    is_ai: bool


class MoveRequest(BaseModel):
    """Request to make a move in a game."""
    player_id: str
    column_index: int = Field(..., ge=0, lt=15)
    row_index: int = Field(..., ge=0, lt=15)
    
    @field_validator("column_index")
    @classmethod
    def validate_column_index(cls, v: int) -> int:
        if v < 0 or v >= 15:
            raise ValueError("column_index must be between 0 and 14")
        return v
    
    @field_validator("row_index")
    @classmethod
    def validate_row_index(cls, v: int) -> int:
        if v < 0 or v >= 15:
            raise ValueError("row_index must be between 0 and 14")
        return v


class MoveResponse(BaseModel):
    """Response containing move information."""
    id: int
    game_id: str
    player_id: str
    move_number: int
    column_index: int
    row_index: int
    created_at: str


class ChatMessageRequest(BaseModel):
    """Request to send a chat message."""
    player_id: str
    content: str = Field(..., min_length=1, max_length=500)


class SendChatMessageRequest(BaseModel):
    """Request to send a chat message via API."""
    game_id: str
    player_id: str
    text: str = Field(..., min_length=1, max_length=500)


class ChatMessageResponse(BaseModel):
    """Response containing chat message information."""
    id: int
    game_id: str
    player_id: Optional[str] = None
    message_type: Literal["chat", "system"]
    content: str
    created_at: str


class GameStateResponse(BaseModel):
    """Response containing complete game state."""
    game: GameResponse
    players: list[PlayerResponse]
    moves: list[MoveResponse]
    messages: list[ChatMessageResponse]
