from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from apps.api.app.database import get_db
from apps.api.app.dependencies import get_current_user
from apps.api.app.models import MediaAsset, User
from apps.api.app.schemas import MediaAssetResponse
from apps.api.app.services.quota_service import (
    assert_can_store_bytes,
    increment_storage_used,
)
from apps.api.app.services.upload_helpers import (
    build_upload_dir,
    detect_kind,
    guess_mime_type,
    safe_file_name,
    save_upload_file,
)

router = APIRouter(prefix="/uploads")


def build_media_asset_response(item: MediaAsset) -> MediaAssetResponse:
    return MediaAssetResponse(
        id=item.id,
        kind=item.kind,
        original_name=item.original_name,
        stored_name=item.stored_name,
        mime_type=item.mime_type,
        extension=item.extension,
        size_bytes=item.size_bytes,
        duration_sec=item.duration_sec,
        path=item.path,
        checksum_sha256=item.checksum_sha256,
        created_at=item.created_at,
        download_url=f"/api/v1/media-assets/{item.id}/download",
    )


def build_unique_stored_name(upload_dir: Path, original_name: str) -> str:
    safe_name = safe_file_name(original_name)
    stem = Path(safe_name).stem
    suffix = Path(safe_name).suffix

    candidate = safe_name
    counter = 1

    while (upload_dir / candidate).exists():
        candidate = f"{stem} ({counter}){suffix}"
        counter += 1

    return candidate


@router.post(
    "",
    response_model=MediaAssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload local media file",
)
async def upload_media_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MediaAssetResponse:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is required",
        )

    original_name = safe_file_name(file.filename)
    extension = Path(original_name).suffix.lower()

    if not extension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File extension is required",
        )

    try:
        kind = detect_kind(extension)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    if file.size is not None:
        assert_can_store_bytes(db, current_user, int(file.size))

    upload_dir = build_upload_dir(kind)
    upload_dir.mkdir(parents=True, exist_ok=True)

    stored_name = build_unique_stored_name(upload_dir, original_name)
    target_path = upload_dir / stored_name

    size_bytes, checksum = await save_upload_file(file, target_path)

    try:
        assert_can_store_bytes(db, current_user, size_bytes)
    except HTTPException:
        if target_path.exists():
            target_path.unlink(missing_ok=True)
        raise

    mime_type = guess_mime_type(target_path)

    media_asset = MediaAsset(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        kind=kind,
        original_name=original_name,
        stored_name=stored_name,
        mime_type=mime_type,
        extension=extension.lstrip("."),
        size_bytes=size_bytes,
        duration_sec=None,
        path=str(target_path).replace("\\", "/"),
        checksum_sha256=checksum,
    )

    db.add(media_asset)
    db.commit()
    db.refresh(media_asset)

    increment_storage_used(db, current_user, size_bytes)

    return build_media_asset_response(media_asset)