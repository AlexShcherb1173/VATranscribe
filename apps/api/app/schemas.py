from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

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
    download_url: str | None = None

class ExportArtifactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transcript_id: str
    format: str
    path: str
    size_bytes: int
    created_at: datetime
    download_url: str | None = None


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

class AuthRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value.strip()) != len(value):
            raise ValueError("Password must not start or end with spaces")

        if " " in value:
            raise ValueError("Password must not contain spaces")

        has_lower = any(ch.islower() for ch in value)
        has_upper = any(ch.isupper() for ch in value)
        has_digit = any(ch.isdigit() for ch in value)

        if not has_lower:
            raise ValueError("Password must contain at least one lowercase letter")

        if not has_upper:
            raise ValueError("Password must contain at least one uppercase letter")

        if not has_digit:
            raise ValueError("Password must contain at least one digit")

        return value


class AuthLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    full_name: str | None = None
    company_name: str | None = None
    timezone: str | None = None
    locale: str | None = None
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime


class UserProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, max_length=255)
    company_name: str | None = Field(default=None, max_length=255)
    timezone: str | None = Field(default=None, max_length=64)
    locale: str | None = Field(default=None, max_length=32)
    avatar_url: str | None = Field(default=None, max_length=1024)


class UserQuotaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str

    storage_bytes_used: int
    transcription_seconds_used: int
    jobs_count_used: int

    storage_bytes_limit: int
    transcription_seconds_limit: int
    jobs_count_limit: int

    created_at: datetime
    updated_at: datetime

class BillingPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    price_monthly: int
    currency: str
    storage_bytes_limit: int
    transcription_seconds_limit: int
    jobs_count_limit: int
    is_active: bool


class BillingSubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    plan_id: str
    status: str
    started_at: datetime
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool


class UsageHistoryPointResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    label: str
    storage_bytes_used: int
    transcription_seconds_used: int
    jobs_count_used: int


class BillingOverviewResponse(BaseModel):
    current_plan: BillingPlanResponse
    available_plans: list[BillingPlanResponse]
    subscription: BillingSubscriptionResponse
    usage_history: list[UsageHistoryPointResponse]

