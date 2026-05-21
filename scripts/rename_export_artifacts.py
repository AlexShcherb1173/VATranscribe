from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from apps.api.app.database import SessionLocal
from apps.api.app.models import ExportArtifact, MediaAsset, Transcript
from packages.core.vatranscribe_core.storage import (
    resolve_storage_path,
    to_storage_relative_path,
)


EXPORT_FORMATS = ("txt", "srt", "vtt", "json")


def safe_export_stem(value: str | None, fallback: str) -> str:
    raw = (value or fallback or "transcript").strip()
    stem = Path(raw).stem.strip()

    stem = re.sub(r"[^\w\s.\-]+", "_", stem, flags=re.UNICODE)
    stem = re.sub(r"\s+", "_", stem, flags=re.UNICODE)
    stem = re.sub(r"_+", "_", stem, flags=re.UNICODE)
    stem = stem.strip("._- ")

    if not stem:
        stem = fallback or "transcript"

    return stem[:140]


def source_stem_for_transcript(transcript: Transcript) -> str:
    media_asset = transcript.media_asset

    source_name = (
        media_asset.original_name
        or media_asset.stored_name
        or media_asset.path
        or transcript.id
    )

    return safe_export_stem(source_name, transcript.id)


def unique_group_stem(
    directories: list[Path],
    preferred_stem: str,
    extensions: list[str],
    own_paths: set[Path],
) -> str:
    normalized_extensions = [extension.lower().lstrip(".") for extension in extensions]
    index = 0

    while True:
        suffix = "" if index == 0 else f"_{index}"
        candidate_stem = f"{preferred_stem}{suffix}"

        has_external_collision = False

        for directory in directories:
            for extension in normalized_extensions:
                candidate = (directory / f"{candidate_stem}.{extension}").resolve()

                if candidate.exists() and candidate not in own_paths:
                    has_external_collision = True
                    break

            if has_external_collision:
                break

        if not has_external_collision:
            return candidate_stem

        index += 1


def main() -> None:
    db = SessionLocal()

    try:
        stmt = (
            select(Transcript)
            .join(MediaAsset, Transcript.media_asset_id == MediaAsset.id)
            .options(
                selectinload(Transcript.media_asset),
                selectinload(Transcript.export_artifacts),
            )
            .order_by(Transcript.created_at.asc())
        )

        transcripts = db.scalars(stmt).all()

        changed = 0
        skipped = 0
        missing = 0

        for transcript in transcripts:
            artifacts = list(transcript.export_artifacts or [])

            if not artifacts:
                skipped += 1
                continue

            existing_artifacts: list[tuple[ExportArtifact, Path]] = []

            for artifact in artifacts:
                old_path = resolve_storage_path(artifact.path)

                if not old_path.exists() or not old_path.is_file():
                    print(f"SKIP missing file: transcript={transcript.id} artifact={artifact.id} path={artifact.path}")
                    missing += 1
                    continue

                existing_artifacts.append((artifact, old_path))

            if not existing_artifacts:
                skipped += 1
                continue

            directories: list[Path] = []
            extensions: list[str] = []
            own_paths: set[Path] = set()

            for artifact, old_path in existing_artifacts:
                directories.append(old_path.parent)
                own_paths.add(old_path.resolve())

                artifact_extension = (artifact.format or "").lower().lstrip(".")
                path_extension = old_path.suffix.lower().lstrip(".")
                extensions.append(artifact_extension or path_extension or "txt")

            preferred_stem = source_stem_for_transcript(transcript)
            group_stem = unique_group_stem(
                directories=sorted(set(directories)),
                preferred_stem=preferred_stem,
                extensions=sorted(set(extensions or EXPORT_FORMATS)),
                own_paths=own_paths,
            )

            for artifact, old_path in existing_artifacts:
                extension = (
                    (artifact.format or "").lower().lstrip(".")
                    or old_path.suffix.lower().lstrip(".")
                    or "txt"
                )
                new_path = old_path.parent / f"{group_stem}.{extension}"

                if old_path.resolve() == new_path.resolve():
                    skipped += 1
                    continue

                print(f"RENAME: {old_path} -> {new_path}")

                new_path.parent.mkdir(parents=True, exist_ok=True)
                old_path.rename(new_path)

                artifact.path = to_storage_relative_path(new_path)
                artifact.size_bytes = new_path.stat().st_size
                db.add(artifact)

                changed += 1

        db.commit()

        print(f"DONE. Changed: {changed}, skipped: {skipped}, missing: {missing}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
