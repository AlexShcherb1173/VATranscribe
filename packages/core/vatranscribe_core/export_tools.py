import json
from pathlib import Path


def _format_timestamp_srt(seconds: int) -> str:
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    return f"{hours:02}:{minutes:02}:{secs:02},000"


def _format_timestamp_vtt(seconds: int) -> str:
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    return f"{hours:02}:{minutes:02}:{secs:02}.000"


def write_txt(full_text: str, output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(full_text, encoding="utf-8")
    return output_path


def write_json(payload: dict, output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return output_path


def write_srt(segments: list[dict], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []
    for idx, segment in enumerate(segments, start=1):
        lines.append(str(idx))
        lines.append(
            f"{_format_timestamp_srt(segment['start_sec'])} --> {_format_timestamp_srt(segment['end_sec'])}"
        )
        lines.append(segment["text"])
        lines.append("")

    output_path.write_text("\n".join(lines), encoding="utf-8")
    return output_path


def write_vtt(segments: list[dict], output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = ["WEBVTT", ""]
    for segment in segments:
        lines.append(
            f"{_format_timestamp_vtt(segment['start_sec'])} --> {_format_timestamp_vtt(segment['end_sec'])}"
        )
        lines.append(segment["text"])
        lines.append("")

    output_path.write_text("\n".join(lines), encoding="utf-8")
    return output_path