from __future__ import annotations

from functools import lru_cache
from pathlib import Path

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

    api_prefix: str = Field("/api/v1", alias="API_PREFIX")

    database_url: str = Field(..., alias="DATABASE_URL")
    redis_url: str = Field("redis://redis:6379/0", alias="REDIS_URL")

    secret_key: str = Field(..., alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(1440, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    cors_origins: str = Field("*", alias="CORS_ORIGINS")

    storage_root: Path = Field(Path("storage"), alias="STORAGE_ROOT")
    uploads_dir: Path = Field(Path("storage/uploads"), alias="UPLOADS_DIR")
    downloads_dir: Path = Field(Path("storage/downloads"), alias="DOWNLOADS_DIR")
    temp_dir: Path = Field(Path("storage/tmp"), alias="TEMP_DIR")

    transcripts_txt_dir: Path = Field(Path("storage/transcripts/txt"), alias="TRANSCRIPTS_TXT_DIR")
    transcripts_srt_dir: Path = Field(Path("storage/transcripts/srt"), alias="TRANSCRIPTS_SRT_DIR")
    transcripts_vtt_dir: Path = Field(Path("storage/transcripts/vtt"), alias="TRANSCRIPTS_VTT_DIR")
    transcripts_json_dir: Path = Field(Path("storage/transcripts/json"), alias="TRANSCRIPTS_JSON_DIR")

    default_transcription_model: str = Field("medium", alias="DEFAULT_TRANSCRIPTION_MODEL")
    default_language: str | None = Field(None, alias="DEFAULT_LANGUAGE")

    @property
    def cors_origins_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]

        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def storage_dirs(self) -> list[Path]:
        return [
            self.storage_root,
            self.uploads_dir,
            self.downloads_dir,
            self.temp_dir,
            self.transcripts_txt_dir,
            self.transcripts_srt_dir,
            self.transcripts_vtt_dir,
            self.transcripts_json_dir,
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()