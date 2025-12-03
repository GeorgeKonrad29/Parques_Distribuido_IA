from pydantic import BaseModel
from typing import List, Dict

class Piece(BaseModel):
    id: int
    position: int   # -1: en casa, 0-67: tablero, 68+: meta
    is_safe: bool

class GameState(BaseModel):
    player: str
    dice: int
    pieces: List[Piece]
    enemies: List[Piece]
