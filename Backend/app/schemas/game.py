"""
Esquemas Pydantic para juegos
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, validator
from app.db.models.game import GameStatus, MoveType


class PiecePosition(BaseModel):
    piece_id: int
    position: int  # -1 = jail, 0-67 = board, 68-71 = goal
    is_safe: bool = False
    
    @validator('piece_id')
    def validate_piece_id(cls, v):
        if v < 0 or v > 3:
            raise ValueError('Piece ID must be between 0 and 3')
        return v


class PlayerState(BaseModel):
    user_id: UUID
    color: str
    position: int  # 1-4
    pieces: List[PiecePosition]
    has_turn: bool = False
    is_bot: bool = False


class BoardState(BaseModel):
    players: List[PlayerState]
    current_player_id: UUID
    turn_number: int
    dice_values: Optional[List[int]] = None
    last_move: Optional[Dict[str, Any]] = None


class GameCreate(BaseModel):
    max_players: int = 4
    game_settings: Optional[Dict[str, Any]] = None
    
    @validator('max_players')
    def validate_max_players(cls, v):
        if v < 2 or v > 4:
            raise ValueError('Max players must be between 2 and 4')
        return v


class GameJoin(BaseModel):
    game_code: str
    preferred_color: Optional[str] = None


class GameBase(BaseModel):
    game_code: str
    status: GameStatus
    max_players: int
    current_players: int


class Game(GameBase):
    id: UUID
    winner_id: Optional[UUID] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    created_at: datetime
    game_settings: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class GameWithPlayers(Game):
    players: List['GamePlayerInfo']


class GamePlayerInfo(BaseModel):
    id: UUID
    user_id: UUID
    username: str
    display_name: Optional[str] = None
    player_color: str
    player_position: int
    turn_order: int
    is_bot: bool = False
    final_position: Optional[int] = None
    joined_at: datetime
    
    class Config:
        from_attributes = True


class GameState(BaseModel):
    id: UUID
    game_id: UUID
    turn_number: int
    current_player_id: UUID
    board_state: BoardState
    dice_values: Optional[List[int]] = None
    last_action: Dict[str, Any]
    timestamp: datetime
    
    class Config:
        from_attributes = True


class MoveRequest(BaseModel):
    piece_id: int
    dice_index: int  # Cuál dado usar (0 o 1)
    
    @validator('piece_id')
    def validate_piece_id(cls, v):
        if v < 0 or v > 3:
            raise ValueError('Piece ID must be between 0 and 3')
        return v
    
    @validator('dice_index')
    def validate_dice_index(cls, v):
        if v < 0 or v > 1:
            raise ValueError('Dice index must be 0 or 1')
        return v


class MoveResponse(BaseModel):
    success: bool
    message: str
    new_state: Optional[BoardState] = None
    captured_pieces: Optional[List[Dict[str, Any]]] = None
    game_finished: bool = False
    winner_id: Optional[UUID] = None


class Move(BaseModel):
    id: UUID
    game_id: UUID
    player_id: UUID
    turn_number: int
    move_sequence: int
    piece_id: int
    from_position: int
    to_position: int
    move_type: MoveType
    dice_used: List[int]
    captured_pieces: Optional[List[Dict[str, Any]]] = None
    was_recommended: bool = False
    move_time_ms: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class GameList(BaseModel):
    games: List[GameWithPlayers]
    total: int
    page: int
    per_page: int


class GameHistory(BaseModel):
    game: Game
    player_info: GamePlayerInfo
    moves: List[Move]
    final_position: Optional[int] = None
    game_duration_seconds: Optional[int] = None


class DiceRoll(BaseModel):
    values: List[int]
    timestamp: datetime
    can_move: bool
    available_moves: List[Dict[str, Any]]


# Esquemas para WebSocket
class WebSocketMessage(BaseModel):
    type: str
    data: Dict[str, Any]
    timestamp: datetime = datetime.utcnow()


class GameUpdateMessage(WebSocketMessage):
    type: str = "game_update"
    game_state: BoardState


class PlayerJoinedMessage(WebSocketMessage):
    type: str = "player_joined"
    player: GamePlayerInfo


class PlayerLeftMessage(WebSocketMessage):
    type: str = "player_left"
    player_id: UUID


class MoveMessage(WebSocketMessage):
    type: str = "move_made"
    move: Move
    new_state: BoardState


class GameStartedMessage(WebSocketMessage):
    type: str = "game_started"
    game_state: BoardState


class GameFinishedMessage(WebSocketMessage):
    type: str = "game_finished"
    winner_id: UUID
    final_positions: Dict[str, int]


class DiceRolledMessage(WebSocketMessage):
    type: str = "dice_rolled"
    player_id: UUID
    dice_values: List[int]
    available_moves: List[Dict[str, Any]]


class TurnTimeoutMessage(WebSocketMessage):
    type: str = "turn_timeout"
    player_id: UUID
    next_player_id: UUID


class ErrorMessage(WebSocketMessage):
    type: str = "error"
    error_code: str
    message: str