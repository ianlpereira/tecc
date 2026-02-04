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
        "http://localhost:5173",           # Local frontend dev
        "http://localhost:3000",           # Local frontend prod
        "http://frontend:5173",            # Docker compose frontend container
        "https://tecc-3dyu.onrender.com/",  # Render frontend
    ]

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "TECC"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.ENVIRONMENT == "production"


settings = Settings()
