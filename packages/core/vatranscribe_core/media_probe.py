import json
import subprocess
from pathlib import Path

from apps.api.app.config import get_settings


def probe_media(path: Path) -> dict:
    """
    Read media metadata using ffprobe.

    Parameters
    ----------
    path : Path
        Path to media file.

    Returns
    -------
    dict
        Parsed ffprobe JSON output.
    """
    settings = get_settings()

    command = [
        settings.ffprobe_path,
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        str(path),
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(result.stdout)


def extract_basic_media_metadata(path: Path) -> dict:
    """
    Extract basic metadata from media file.

    Parameters
    ----------
    path : Path
        Media file path.

    Returns
    -------
    dict
        Basic metadata including duration, size and streams.
    """
    data = probe_media(path)

    fmt = data.get("format", {}) or {}
    duration_raw = fmt.get("duration")
    size_raw = fmt.get("size")

    duration_sec = None
    size_bytes = path.stat().st_size if path.exists() else 0

    if duration_raw is not None:
        try:
            duration_sec = int(float(duration_raw))
        except (TypeError, ValueError):
            duration_sec = None

    if size_raw is not None:
        try:
            size_bytes = int(size_raw)
        except (TypeError, ValueError):
            size_bytes = path.stat().st_size if path.exists() else 0

    audio_codec = None
    video_codec = None

    for stream in data.get("streams", []):
        codec_type = stream.get("codec_type")
        codec_name = stream.get("codec_name")

        if codec_type == "video" and video_codec is None:
            video_codec = codec_name
        elif codec_type == "audio" and audio_codec is None:
            audio_codec = codec_name

    return {
        "duration_sec": duration_sec,
        "size_bytes": size_bytes,
        "streams": data.get("streams", []),
        "format": fmt,
        "audio_codec": audio_codec,
        "video_codec": video_codec,
    }