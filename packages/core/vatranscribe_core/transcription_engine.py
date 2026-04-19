from pathlib import Path
from typing import Any


def transcribe_media(
    *,
    audio_path: Path,
    model_name: str,
    language: str | None = None,
) -> dict[str, Any]:
    """
    Transcribe audio using faster-whisper.
    """
    from faster_whisper import WhisperModel

    device = "cpu"
    compute_type = "int8"

    model = WhisperModel(model_name, device=device, compute_type=compute_type)

    segments_iter, info = model.transcribe(
        str(audio_path),
        language=language,
        vad_filter=True,
    )

    full_text_parts: list[str] = []
    segments: list[dict[str, Any]] = []

    for index, segment in enumerate(segments_iter):
        text = (segment.text or "").strip()
        full_text_parts.append(text)

        segments.append(
            {
                "start_sec": int(segment.start),
                "end_sec": int(segment.end),
                "text": text,
                "speaker_label": None,
                "confidence": None,
                "order_index": index,
            }
        )

    return {
        "engine": "faster_whisper",
        "language": getattr(info, "language", language or "ru"),
        "model_name": model_name,
        "full_text": "\n".join(part for part in full_text_parts if part).strip(),
        "segments": segments,
    }