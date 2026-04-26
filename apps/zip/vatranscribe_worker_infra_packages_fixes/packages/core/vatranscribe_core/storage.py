from __future__ import annotations

from pathlib import Path

from apps.api.app.config import get_settings
from packages.core.vatranscribe_core.utils import sanitize_file_name


def _download_base_dir(requested_format: str) -> Path:
    settings = get_settings()
    if requested_format == "mp3":
        return getattr(settings, "downloads_audio_dir", settings.downloads_dir / "audio")
    return getattr(settings, "downloads_video_dir", settings.downloads_dir / "video")


def build_download_target_path(requested_format: str, requested_file_name: str) -> Path:
    normalized_format = requested_format.lower().strip()
    if normalized_format not in {"mp3", "mp4"}:
        raise ValueError("requested_format must be 'mp3' or 'mp4'")

    safe_name = sanitize_file_name(requested_file_name)
    target_dir = _download_base_dir(normalized_format)
    target_dir.mkdir(parents=True, exist_ok=True)

    return target_dir / f"{safe_name}.{normalized_format}"
