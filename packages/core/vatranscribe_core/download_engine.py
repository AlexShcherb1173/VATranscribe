from __future__ import annotations

from pathlib import Path
from typing import Any

from yt_dlp import YoutubeDL

from apps.api.app.config import get_settings


def _ffmpeg_path() -> str:
    settings = get_settings()
    return str(getattr(settings, "ffmpeg_path", "ffmpeg"))


def _cleanup_old_outputs(output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    for candidate in output_path.parent.glob(f"{output_path.stem}.*"):
        if candidate.is_file():
            try:
                candidate.unlink()
            except OSError:
                pass

    part_file = output_path.with_suffix(output_path.suffix + ".part")
    if part_file.exists():
        try:
            part_file.unlink()
        except OSError:
            pass


def _base_ydl_options() -> dict[str, Any]:
    return {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "ffmpeg_location": _ffmpeg_path(),
        "retries": 10,
        "fragment_retries": 10,
        "file_access_retries": 3,
        "extractor_retries": 3,
        "skip_unavailable_fragments": True,
        "continuedl": False,
        "socket_timeout": 30,
        "http_chunk_size": 10 * 1024 * 1024,
        "concurrent_fragment_downloads": 1,
        "overwrites": True,
    }


def analyze_url(url: str) -> dict[str, Any]:
    clean_url = url.strip()
    with YoutubeDL(_base_ydl_options()) as ydl:
        info = ydl.extract_info(clean_url, download=False)

    formats = info.get("formats", []) or []
    analyzed_formats: list[dict[str, Any]] = []
    for item in formats:
        analyzed_formats.append(
            {
                "format_id": item.get("format_id"),
                "ext": item.get("ext"),
                "format_note": item.get("format_note"),
                "resolution": item.get("resolution"),
                "height": item.get("height"),
                "width": item.get("width"),
                "fps": item.get("fps"),
                "vcodec": item.get("vcodec"),
                "acodec": item.get("acodec"),
                "filesize": item.get("filesize") or item.get("filesize_approx"),
                "tbr": item.get("tbr"),
                "audio_only": item.get("vcodec") == "none",
                "video_only": item.get("acodec") == "none",
            }
        )

    duration = info.get("duration")
    webpage_url = info.get("webpage_url") or clean_url
    extractor = info.get("extractor")

    return {
        "url": webpage_url,
        "platform": extractor,
        "title": info.get("title"),
        "duration_seconds": duration,
        "thumbnail_url": info.get("thumbnail"),
        "available_formats": analyzed_formats,
        "extract_audio": False,
        # legacy aliases for older frontend/tests
        "duration": duration,
        "webpage_url": webpage_url,
        "extractor": extractor,
        "formats": analyzed_formats,
    }


def _resolve_final_file(output_path: Path, requested_format: str) -> Path:
    expected_path = output_path.with_suffix(f".{requested_format}")
    if expected_path.exists():
        return expected_path
    if output_path.exists():
        return output_path

    candidates = sorted(
        candidate for candidate in output_path.parent.glob(f"{output_path.stem}.*") if candidate.is_file()
    )
    candidates = [candidate for candidate in candidates if not candidate.name.endswith(".part")]
    if not candidates:
        raise FileNotFoundError(f"Downloaded file not found for base path: {output_path}")
    return candidates[0]


def _download_single_file(*, url: str, fmt: str, output_path: Path, requested_format: str) -> dict[str, Any]:
    options = {
        **_base_ydl_options(),
        "format": fmt,
        "outtmpl": str(output_path.with_suffix(".%(ext)s")),
    }
    with YoutubeDL(options) as ydl:
        info = ydl.extract_info(url.strip(), download=True)

    final_path = _resolve_final_file(output_path, requested_format)
    return {
        "title": info.get("title"),
        "extractor": info.get("extractor"),
        "webpage_url": info.get("webpage_url") or url.strip(),
        "final_path": final_path,
    }


def download_media(
    *,
    url: str,
    requested_format: str,
    output_path: Path,
    mp4_mode: str = "compatible",
    video_format_id: str | None = None,
    audio_format_id: str | None = None,
) -> dict[str, Any]:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    requested_format = requested_format.lower().strip()
    mp4_mode = (mp4_mode or "compatible").lower().strip()
    clean_url = url.strip()

    if requested_format not in {"mp3", "mp4"}:
        raise ValueError("requested_format must be 'mp3' or 'mp4'")
    if mp4_mode not in {"fast", "compatible"}:
        raise ValueError("mp4_mode must be 'fast' or 'compatible'")

    _cleanup_old_outputs(output_path)

    if requested_format == "mp3":
        options = {
            **_base_ydl_options(),
            "format": audio_format_id or "bestaudio[ext=m4a]/bestaudio/best",
            "outtmpl": str(output_path.with_suffix(".%(ext)s")),
            "postprocessors": [
                {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}
            ],
        }
        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(clean_url, download=True)
        final_path = _resolve_final_file(output_path, requested_format)
        return {
            "title": info.get("title"),
            "extractor": info.get("extractor"),
            "webpage_url": info.get("webpage_url") or clean_url,
            "final_path": final_path,
            "requested_format": requested_format,
            "mp4_mode": mp4_mode,
        }

    if mp4_mode == "fast":
        if video_format_id and audio_format_id:
            ydl_format = f"{video_format_id}+{audio_format_id}"
        elif video_format_id:
            ydl_format = f"{video_format_id}+ba/b"
        else:
            ydl_format = "bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b"

        options = {
            **_base_ydl_options(),
            "format": ydl_format,
            "outtmpl": str(output_path.with_suffix(".%(ext)s")),
            "merge_output_format": "mp4",
        }
        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(clean_url, download=True)
        final_path = _resolve_final_file(output_path, requested_format)
        return {
            "title": info.get("title"),
            "extractor": info.get("extractor"),
            "webpage_url": info.get("webpage_url") or clean_url,
            "final_path": final_path,
            "requested_format": requested_format,
            "mp4_mode": mp4_mode,
        }

    video_base = output_path.with_name(f"{output_path.stem}__video.mp4")
    audio_base = output_path.with_name(f"{output_path.stem}__audio.m4a")
    _cleanup_old_outputs(video_base)
    _cleanup_old_outputs(audio_base)

    video_result = _download_single_file(
        url=clean_url,
        fmt=video_format_id or "bestvideo[ext=mp4]/bestvideo/best",
        output_path=video_base,
        requested_format="mp4",
    )
    audio_result = _download_single_file(
        url=clean_url,
        fmt=audio_format_id or "bestaudio[ext=m4a]/bestaudio/best",
        output_path=audio_base,
        requested_format="m4a",
    )

    return {
        "title": video_result.get("title"),
        "extractor": video_result.get("extractor"),
        "webpage_url": video_result.get("webpage_url") or clean_url,
        "requested_format": requested_format,
        "mp4_mode": mp4_mode,
        "video_path": Path(video_result["final_path"]),
        "audio_path": Path(audio_result["final_path"]),
        "final_path": output_path.with_suffix(".mp4"),
    }
