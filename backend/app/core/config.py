import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Honey Chain Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "honey-chain-secret-key-development-only"
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # ---------------------------------------------------------
    # DATABASE
    # ---------------------------------------------------------
    # Local development:
    #   SQLite is used automatically.
    #
    # Production:
    #   Render PostgreSQL DATABASE_URL will override this.
    # ---------------------------------------------------------
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./honeychain_dev.db"
    )

    # ---------------------------------------------------------
    # FRONTEND
    # ---------------------------------------------------------
    # Used for QR verification URLs in production.
    FRONTEND_URL: str = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    # ---------------------------------------------------------
    # CORS
    # ---------------------------------------------------------
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()