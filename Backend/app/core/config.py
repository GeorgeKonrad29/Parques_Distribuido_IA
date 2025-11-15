"""
Configuración principal de la aplicación
"""
import os
from typing import Optional, List
from pydantic import validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Configuración de la aplicación
    APP_NAME: str = "Parqués Distribuido IA"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    
    # Configuración del servidor
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Configuración de base de datos
    DATABASE_URL: str = "postgresql+asyncpg://neondb_owner:npg_BjwQ2ZtsCnR5@ep-young-salad-a8nr0kos-pooler.eastus2.azure.neon.tech/neondb?ssl=require"
    POSTGRES_SERVER: str = "ep-young-salad-a8nr0kos-pooler.eastus2.azure.neon.tech"
    POSTGRES_USER: str = "neondb_owner"
    POSTGRES_PASSWORD: str = "npg_BjwQ2ZtsCnR5"
    POSTGRES_DB: str = "neondb"
    POSTGRES_PORT: int = 5432
    
    # Configuración de Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # Configuración de autenticación JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Configuración de CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://localhost:3000",
        "https://localhost:8000",
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Configuración de email (para recuperación de contraseña)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Configuración de juego
    MAX_PLAYERS_PER_GAME: int = 4
    TURN_TIMEOUT_SECONDS: int = 60
    GAME_INACTIVITY_TIMEOUT_MINUTES: int = 30
    
    # Configuración de IA
    AI_MINIMAX_DEPTH: int = 4
    AI_MCTS_ITERATIONS: int = 1000
    AI_RESPONSE_TIME_MS: int = 2000
    
    # Configuración de sincronización distribuida
    BERKELEY_SYNC_INTERVAL_SECONDS: int = 30
    NTP_SERVERS: List[str] = [
        "pool.ntp.org",
        "time.google.com",
        "time.cloudflare.com"
    ]
    
    # Configuración de monitoreo
    SENTRY_DSN: Optional[str] = None
    ENABLE_METRICS: bool = True
    
    # Configuración de rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    AUTH_RATE_LIMIT_PER_MINUTE: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instancia global de configuración
settings = Settings()