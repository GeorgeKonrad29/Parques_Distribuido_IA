"""
Modelos de base de datos para juegos
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base


class GameStatus(str, Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
    ABANDONED = "abandoned"


class MoveType(str, Enum):
    NORMAL = "normal"
    CAPTURE = "capture"
    EXIT_JAIL = "exit_jail"
    ENTER_GOAL = "enter_goal"
    SAFE = "safe"


class Game(Base):
    __tablename__ = "games"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    game_code = Column(String(10), unique=True, nullable=False, index=True)
    status = Column(String(20), default=GameStatus.WAITING.value, nullable=False, index=True)
    max_players = Column(Integer, default=4, nullable=False)
    current_players = Column(Integer, default=0, nullable=False)
    winner_id = Column(UUID(as_uuid=True), nullable=True)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    game_settings = Column(JSON, nullable=True)  # Configuraciones personalizadas
    
    # Relaciones
    players = relationship("GamePlayer", back_populates="game")
    states = relationship("GameState", back_populates="game")
    moves = relationship("Move", back_populates="game")
    ai_training_data = relationship("AITrainingData", back_populates="game")
    recommendation_logs = relationship("RecommendationLog", back_populates="game")


class GamePlayer(Base):
    __tablename__ = "game_players"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    player_color = Column(String(20), nullable=False)
    player_position = Column(Integer, nullable=False)  # 1-4
    join_order = Column(Integer, nullable=False)
    turn_order = Column(Integer, nullable=False)
    is_bot = Column(Boolean, default=False, nullable=False)
    final_position = Column(Integer, nullable=True)  # 1-4 al terminar
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    game = relationship("Game", back_populates="players")
    user = relationship("User", back_populates="game_players")


class GameState(Base):
    __tablename__ = "game_states"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False, index=True)
    turn_number = Column(Integer, nullable=False, index=True)
    current_player_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    board_state = Column(JSON, nullable=False)  # Posiciones de todas las fichas
    dice_values = Column(JSON, nullable=True)
    last_action = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relación
    game = relationship("Game", back_populates="states")


class Move(Base):
    __tablename__ = "moves"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False, index=True)
    player_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    turn_number = Column(Integer, nullable=False, index=True)
    move_sequence = Column(Integer, nullable=False)  # 1-N por turno
    piece_id = Column(Integer, nullable=False)  # 0-3
    from_position = Column(Integer, nullable=False)
    to_position = Column(Integer, nullable=False)
    move_type = Column(String(20), nullable=False)
    dice_used = Column(JSON, nullable=False)
    captured_pieces = Column(JSON, nullable=True)
    was_recommended = Column(Boolean, default=False, nullable=False)
    move_time_ms = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    game = relationship("Game", back_populates="moves")
    player = relationship("User", back_populates="moves")