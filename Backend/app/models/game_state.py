from pydantic import BaseModel
from typing import List

class Piece(BaseModel):
    id: int
    position: int           # Posición actual en el tablero (0–67)
    can_move: bool          # Si puede moverse según la tirada
    is_safe: bool           # Si está en casilla segura
    is_home: bool           # Si ya llegó a casa

class GameState(BaseModel):
    dice: int               # Valor del dado
    pieces: List[Piece]     # Tus fichas
    opponent_positions: List[int]  # Posiciones de oponentes
