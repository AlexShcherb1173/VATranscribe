import subprocess
from pathlib import Path

from apps.api.app.config import get_settings


def merge_video_and_audio_to_compatible_mp4(
    video_path: Path,
    audio_path: Path,
    output_path: Path,
) -> Path:
    """
    Merge separate video and audio files into one compatible MP4:
    - copy video stream as-is
    - transcode audio to AAC

    Parameters
    ----------
    video_path : Path
        Downloaded video-only file.
    audio_path : Path
        Downloaded audio-only file.
    output_path : Path
        Final compatible MP4 path.

    Returns
    -------
    Path
        Output file path.
    """
    settings = get_settings()

    output_path.parent.mkdir(parents=True, exist_ok=True)

    command = [
        settings.ffmpeg_path,
        "-y",
        "-i",
        str(video_path),
        "-i",
        str(audio_path),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        str(output_path),
    ]

    subprocess.run(
        command,
        check=True,
        capture_output=True,
        text=True,
    )

    return output_path


def convert_mp4_audio_to_aac(input_path: Path, output_path: Path) -> Path:
    """
    Convert MP4 audio track to AAC while copying video stream unchanged.

    Parameters
    ----------
    input_path : Path
        Source MP4 file path.
    output_path : Path
        Destination MP4 file path.

    Returns
    -------
    Path
        Final converted file path.
    """
    settings = get_settings()

    output_path.parent.mkdir(parents=True, exist_ok=True)

    command = [
        settings.ffmpeg_path,
        "-y",
        "-i",
        str(input_path),
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        str(output_path),
    ]

    subprocess.run(
        command,
        check=True,
        capture_output=True,
        text=True,
    )

    return output_path