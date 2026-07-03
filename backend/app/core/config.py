"""
Configuration module for FastAPI application.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://tecc_user:tecc_password@db:5432/tecc_db"
    DB_ECHO: bool = False

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",              # Local frontend dev
        "http://localhost:3000",              # Local frontend prod
        "http://frontend:5173",               # Docker compose frontend container
        "https://tecc.onrender.com",     # Render frontend
    ]

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "tecc"

    # Auth / JWT
    JWT_SECRET_KEY: str = "jwt-secret-change-in-production-please"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # Default admin credentials (created on first startup)
    DEFAULT_ADMIN_USERNAME: str = "admin"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.ENVIRONMENT == "production"


settings = Settings()
