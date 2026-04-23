from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Глобальные настройки приложения, читаемые из .env.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "VATranscribe API"
    app_env: str = "development"
    debug: bool = True

    database_url: str = Field(..., alias="DATABASE_URL")
    secret_key: str = Field(..., alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(1440, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    cors_origins: str = Field("*", alias="CORS_ORIGINS")


@lru_cache
def get_settings() -> Settings:
    """
    Возвращает кэшированный объект настроек приложения.
    """
    return Settings()


settings = get_settings()