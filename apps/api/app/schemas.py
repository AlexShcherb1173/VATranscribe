from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class HealthLiveResponse(BaseModel):
    status: str
    app: str
    env: str


class HealthReadyDependency(BaseModel):
    ok: bool
    detail: str | None = None


class HealthReadyResponse(BaseModel):
    status: str
    app: str
    env: str
    checks: dict[str, HealthReadyDependency]


class ErrorResponse(BaseModel):
    detail: str


class DownloadAnalyzeRequest(BaseModel):
    url: str


class DownloadFormatInfo(BaseModel):
    format_id: str | None = None
    ext: str | None = None
    format_note: str | None = None
    resolution: str | None = None
    height: int | None = None
    width: int | None = None
    fps: float | None = None
    vcodec: str | None = None
    acodec: str | None = None
    filesize: int | None = None
    tbr: float | None = None
    audio_only: bool
    video_only: bool


class DownloadAnalyzeResponse(BaseModel):
    title: str | None = None
    duration: int | None = None
    webpage_url: str
    extractor: str | None = None
    formats: list[DownloadFormatInfo]


class DownloadJobCreateRequest(BaseModel):
    url: str
    requested_format: str = Field(..., examples=["mp3"])
    requested_file_name: str = Field(..., examples=["lesson_01"])
    mp4_mode: str = Field(default="compatible", examples=["compatible"])
    selected_video_format_id: str | None = None
    selected_audio_format_id: str | None = None


class TranscriptionJobCreateRequest(BaseModel):
    media_asset_id: str
    model_name: str = "small"
    language: str | None = None
    export_formats: list[str] = Field(default_factory=lambda: ["txt", "srt", "vtt", "json"])


class JobCreateRequest(BaseModel):
    type: str = Field(..., examples=["download"])
    source_type: str | None = Field(default=None, examples=["url"])
    title: str | None = Field(default=None, max_length=255)
    input_url: str | None = None
    requested_format: str | None = None
    requested_file_name: str | None = None
    mp4_mode: str | None = "compatible"
    selected_video_format_id: str | None = None
    selected_audio_format_id: str | None = None
    transcription_media_asset_id: str | None = None
    download_audio: bool = False
    download_video: bool = False
    transcription_model: str | None = None
    transcription_language: str | None = None


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    status: str
    source_type: str | None = None
    title: str | None = None
    input_url: str | None = None
    requested_format: str | None = None
    requested_file_name: str | None = None
    mp4_mode: str | None = None
    output_media_asset_id: str | None = None
    selected_video_format_id: str | None = None
    selected_audio_format_id: str | None = None
    transcription_media_asset_id: str | None = None
    download_audio: bool
    download_video: bool
    transcription_model: str | None = None
    transcription_language: str | None = None
    error_message: str | None = None
    created_at: datetime
    started_at: datetime | None = None
    finished_at: datetime | None = None


class JobLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    level: str
    message: str
    created_at: datetime


class JobActionResponse(BaseModel):
    ok: bool
    job_id: str
    status: str
    detail: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    is_active: bool
    is_superuser: bool
    created_at: datetime


class MediaAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str
    original_name: str
    stored_name: str
    mime_type: str | None = None
    extension: str | None = None
    size_bytes: int
    duration_sec: int | None = None
    path: str
    checksum_sha256: str | None = None
    created_at: datetime


class TranscriptSegmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transcript_id: str
    start_sec: int
    end_sec: int
    text: str
    speaker_label: str | None = None
    confidence: str | None = None
    order_index: int


class ExportArtifactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transcript_id: str
    format: str
    path: str
    size_bytes: int
    created_at: datetime


class TranscriptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    media_asset_id: str
    language: str
    model_name: str
    engine: str
    full_text: str
    created_at: datetime
    segments: list[TranscriptSegmentResponse] = []
    exports: list[ExportArtifactResponse] = []


class ApiInfoResponse(BaseModel):
    app: str
    env: str
    version: str
    docs_url: str
    api_prefix: str
    endpoints: dict[str, Any]