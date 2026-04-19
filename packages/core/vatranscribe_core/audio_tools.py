import subprocess
from pathlib import Path

from apps.api.app.config import get_settings


def extract_audio_for_transcription(input_path: Path, output_path: Path) -> Path:
    """
    Extract mono 16 kHz WAV audio for transcription from any input media.
    """
    settings = get_settings()

    output_path.parent.mkdir(parents=True, exist_ok=True)

    command = [
        settings.ffmpeg_path,
        "-y",
        "-i",
        str(input_path),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        str(output_path),
    ]

    subprocess.run(
        command,
        check=True,
        capture_output=True,
        text=True,
    )

    return output_path