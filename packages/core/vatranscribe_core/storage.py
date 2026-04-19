from pathlib import Path

from apps.api.app.config import get_settings
from packages.core.vatranscribe_core.utils import sanitize_file_name


def build_download_target_path(requested_format: str, requested_file_name: str) -> Path:
    settings = get_settings()
    safe_name = sanitize_file_name(requested_file_name)

    if requested_format == "mp3":
        return settings.downloads_audio_dir / f"{safe_name}.mp3"

    return settings.downloads_video_dir / f"{safe_name}.mp4"