from fastapi import APIRouter
from app.models.game_state import GameState
from app.services.ai_engine import generate_suggestions

router = APIRouter()

@router.post("/suggest")
def suggest_moves(game_state: GameState):
    suggestions = generate_suggestions(game_state)
    return {"suggestions": suggestions}

from fastapi import APIRouter
from app.models.game_state import GameState
from app.services.suggestion_engine import generate_suggestions

router = APIRouter()

@router.post("/suggest")
async def suggest(game_state: GameState):
    return generate_suggestions(game_state)
