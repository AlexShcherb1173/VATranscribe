from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="VATranscribe", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    debug: bool = Field(default=True, alias="DEBUG")

    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    api_prefix: str = Field(default="/api/v1", alias="API_PREFIX")

    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@db:5432/vatranscribe",
        alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")

    storage_root: Path = Field(default=Path("./storage"), alias="STORAGE_ROOT")
    uploads_dir: Path = Field(default=Path("./storage/uploads"), alias="UPLOADS_DIR")
    downloads_audio_dir: Path = Field(
        default=Path("./storage/downloads/audio"),
        alias="DOWNLOADS_AUDIO_DIR",
    )
    downloads_video_dir: Path = Field(
        default=Path("./storage/downloads/video"),
        alias="DOWNLOADS_VIDEO_DIR",
    )
    transcripts_txt_dir: Path = Field(
        default=Path("./storage/transcripts/txt"),
        alias="TRANSCRIPTS_TXT_DIR",
    )
    transcripts_srt_dir: Path = Field(
        default=Path("./storage/transcripts/srt"),
        alias="TRANSCRIPTS_SRT_DIR",
    )
    transcripts_vtt_dir: Path = Field(
        default=Path("./storage/transcripts/vtt"),
        alias="TRANSCRIPTS_VTT_DIR",
    )
    transcripts_json_dir: Path = Field(
        default=Path("./storage/transcripts/json"),
        alias="TRANSCRIPTS_JSON_DIR",
    )
    temp_dir: Path = Field(default=Path("./storage/temp"), alias="TEMP_DIR")
    logs_dir: Path = Field(default=Path("./storage/logs"), alias="LOGS_DIR")

    ffmpeg_path: str = Field(default="ffmpeg", alias="FFMPEG_PATH")
    ffprobe_path: str = Field(default="ffprobe", alias="FFPROBE_PATH")
    yt_dlp_path: str = Field(default="yt-dlp", alias="YT_DLP_PATH")

    default_language: str = Field(default="ru", alias="DEFAULT_LANGUAGE")
    default_transcription_model: str = Field(
        default="small",
        alias="DEFAULT_TRANSCRIPTION_MODEL",
    )

    secret_key: str = Field(default="change_me", alias="JWT_SECRET_KEY")
    jwt_access_expire_minutes: int = Field(
        default=30,
        alias="JWT_ACCESS_EXPIRE_MINUTES",
    )

    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000",
        alias="CORS_ORIGINS",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def storage_dirs(self) -> list[Path]:
        return [
            self.storage_root,
            self.uploads_dir,
            self.downloads_audio_dir,
            self.downloads_video_dir,
            self.transcripts_txt_dir,
            self.transcripts_srt_dir,
            self.transcripts_vtt_dir,
            self.transcripts_json_dir,
            self.temp_dir,
            self.logs_dir,
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()