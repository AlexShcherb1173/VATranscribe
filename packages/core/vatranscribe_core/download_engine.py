from __future__ import annotations

import html
import re
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse

from yt_dlp import YoutubeDL

from apps.api.app.config import get_settings


MEDIA_URL_RE = re.compile(
    r"""(?P<url>https?://[^"'<>\\\s]+?\.(?:mp4|m3u8|webm|mov|m4v|mp3|m4a|aac)(?:\?[^"'<>\\\s]*)?)""",
    re.IGNORECASE,
)

SRC_RE = re.compile(
    r"""(?:src|href|content)=["'](?P<url>[^"']+\.(?:mp4|m3u8|webm|mov|m4v|mp3|m4a|aac)(?:\?[^"']*)?)["']""",
    re.IGNORECASE,
)

OG_VIDEO_RE = re.compile(
    r"""<meta[^>]+(?:property|name)=["'](?:og:video|og:video:url|og:video:secure_url|twitter:player:stream)["'][^>]+content=["'](?P<url>[^"']+)["'][^>]*>""",
    re.IGNORECASE,
)


def _ffmpeg_path() -> str:
    """
    Возвращает путь для yt-dlp ffmpeg_location.

    yt-dlp нормально принимает либо директорию с ffmpeg/ffprobe,
    либо полный путь. Для Docker предпочтительнее /usr/bin.
    """
    settings = get_settings()
    raw_path = str(getattr(settings, "ffmpeg_path", "") or "").strip()

    if not raw_path:
        return "/usr/bin"

    path = Path(raw_path)

    if path.name in {"ffmpeg", "ffmpeg.exe"}:
        return str(path.parent)

    return raw_path


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


def _is_probably_direct_media_url(url: str) -> bool:
    path = urlparse(url).path.lower()
    return path.endswith((".mp4", ".m3u8", ".webm", ".mov", ".m4v", ".mp3", ".m4a", ".aac"))


def _fetch_html_page(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            content_type = response.headers.get("content-type", "")
            raw = response.read(3 * 1024 * 1024)

        if "text/html" not in content_type and "application/xhtml" not in content_type:
            return raw.decode("utf-8", errors="ignore")

        return raw.decode("utf-8", errors="ignore")
    except urllib.error.URLError as exc:
        raise ValueError(f"Failed to fetch page HTML: {exc}") from exc


def _normalize_found_url(page_url: str, found_url: str) -> str:
    normalized = html.unescape(found_url.strip())

    if normalized.startswith("//"):
        parsed = urlparse(page_url)
        return f"{parsed.scheme}:{normalized}"

    return urljoin(page_url, normalized)


def _extract_media_candidates_from_html(page_url: str, page_html: str) -> list[str]:
    candidates: list[str] = []

    for match in OG_VIDEO_RE.finditer(page_html):
        candidates.append(_normalize_found_url(page_url, match.group("url")))

    for match in SRC_RE.finditer(page_html):
        candidates.append(_normalize_found_url(page_url, match.group("url")))

    for match in MEDIA_URL_RE.finditer(page_html):
        candidates.append(_normalize_found_url(page_url, match.group("url")))

    unique: list[str] = []
    seen: set[str] = set()

    for candidate in candidates:
        clean = candidate.strip()

        if not clean:
            continue

        if clean in seen:
            continue

        seen.add(clean)
        unique.append(clean)

    return unique


def _choose_best_media_candidate(candidates: list[str]) -> str | None:
    if not candidates:
        return None

    priority = [".m3u8", ".mp4", ".webm", ".mov", ".m4v", ".mp3", ".m4a", ".aac"]

    for ext in priority:
        for candidate in candidates:
            if ext in urlparse(candidate).path.lower():
                return candidate

    return candidates[0]


def resolve_media_url_from_http_page(url: str) -> str:
    """
    Пытается извлечь реальную media-ссылку из произвольной HTTP/HTML-страницы.

    Работает для публичных страниц, где media URL присутствует в HTML:
    - <video src="...">
    - <source src="...">
    - og:video
    - twitter:player:stream
    - прямые ссылки .mp4/.m3u8/.webm/.mov/.mp3/.m4a

    Не решает DRM, авторизацию, signed cookies и закрытые личные кабинеты.
    """
    clean_url = url.strip()

    if _is_probably_direct_media_url(clean_url):
        return clean_url

    page_html = _fetch_html_page(clean_url)
    candidates = _extract_media_candidates_from_html(clean_url, page_html)
    media_url = _choose_best_media_candidate(candidates)

    if not media_url:
        raise ValueError(
            "На странице не найдена открытая ссылка на видео или аудио. "
            "Если это личный кабинет, нужна прямая .mp4/.m3u8 ссылка или загрузка файла вручную."
        )

    return media_url


def _extract_info_with_fallback(url: str, *, download: bool = False, options: dict[str, Any] | None = None) -> tuple[dict[str, Any], str]:
    """
    Сначала пробует yt-dlp на исходной ссылке.
    Если ссылка не поддерживается — пробует извлечь media URL из HTML-страницы.
    """
    clean_url = url.strip()
    ydl_options = {**_base_ydl_options(), **(options or {})}

    try:
        with YoutubeDL(ydl_options) as ydl:
            return ydl.extract_info(clean_url, download=download), clean_url
    except Exception as exc:
        message = str(exc)

        if "Unsupported URL" not in message:
            raise

        resolved_url = resolve_media_url_from_http_page(clean_url)

        with YoutubeDL(ydl_options) as ydl:
            return ydl.extract_info(resolved_url, download=download), resolved_url


def analyze_url(url: str) -> dict[str, Any]:
    clean_url = url.strip()
    info, resolved_url = _extract_info_with_fallback(clean_url, download=False)

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
    webpage_url = info.get("webpage_url") or resolved_url
    extractor = info.get("extractor")

    return {
        "url": webpage_url,
        "input_url": clean_url,
        "resolved_media_url": resolved_url if resolved_url != clean_url else None,
        "platform": extractor,
        "title": info.get("title") or Path(urlparse(resolved_url).path).name,
        "duration_seconds": duration,
        "thumbnail_url": info.get("thumbnail"),
        "available_formats": analyzed_formats,
        "extract_audio": False,
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
        candidate
        for candidate in output_path.parent.glob(f"{output_path.stem}.*")
        if candidate.is_file()
    )
    candidates = [candidate for candidate in candidates if not candidate.name.endswith(".part")]

    if not candidates:
        raise FileNotFoundError(f"Downloaded file not found for base path: {output_path}")

    return candidates[0]


def _download_single_file(*, url: str, fmt: str, output_path: Path, requested_format: str) -> dict[str, Any]:
    options = {
        "format": fmt,
        "outtmpl": str(output_path.with_suffix(".%(ext)s")),
    }

    info, final_url = _extract_info_with_fallback(url.strip(), download=True, options=options)
    final_path = _resolve_final_file(output_path, requested_format)

    return {
        "title": info.get("title"),
        "extractor": info.get("extractor"),
        "webpage_url": info.get("webpage_url") or final_url,
        "final_path": final_path,
        "resolved_media_url": final_url if final_url != url.strip() else None,
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
            "format": audio_format_id or "bestaudio[ext=m4a]/bestaudio/best",
            "outtmpl": str(output_path.with_suffix(".%(ext)s")),
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
        }

        info, final_url = _extract_info_with_fallback(clean_url, download=True, options=options)
        final_path = _resolve_final_file(output_path, requested_format)

        return {
            "title": info.get("title"),
            "extractor": info.get("extractor"),
            "webpage_url": info.get("webpage_url") or final_url,
            "resolved_media_url": final_url if final_url != clean_url else None,
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
            "format": ydl_format,
            "outtmpl": str(output_path.with_suffix(".%(ext)s")),
            "merge_output_format": "mp4",
        }

        info, final_url = _extract_info_with_fallback(clean_url, download=True, options=options)
        final_path = _resolve_final_file(output_path, requested_format)

        return {
            "title": info.get("title"),
            "extractor": info.get("extractor"),
            "webpage_url": info.get("webpage_url") or final_url,
            "resolved_media_url": final_url if final_url != clean_url else None,
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
        "resolved_media_url": video_result.get("resolved_media_url"),
        "requested_format": requested_format,
        "mp4_mode": mp4_mode,
        "video_path": Path(video_result["final_path"]),
        "audio_path": Path(audio_result["final_path"]),
        "final_path": output_path.with_suffix(".mp4"),
    }