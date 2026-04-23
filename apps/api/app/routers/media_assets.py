from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from apps.api.app.database import get_db
from apps.api.app.dependencies import get_current_user
from apps.api.app.models import MediaAsset, User
from apps.api.app.schemas import MediaAssetResponse
from apps.api.app.services.quota_service import sync_storage_usage_from_media_assets

router = APIRouter(prefix="/media-assets")


def _build_media_asset_response(item: MediaAsset) -> MediaAssetResponse:
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


def _get_media_asset_or_404(
    media_asset_id: str,
    db: Session,
    current_user: User,
) -> MediaAsset:
    stmt = select(MediaAsset).where(
        MediaAsset.id == media_asset_id,
        MediaAsset.user_id == current_user.id,
    )
    item = db.scalar(stmt)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media asset '{media_asset_id}' not found",
        )
    return item


@router.get(
    "",
    response_model=list[MediaAssetResponse],
    summary="List media assets",
)
def list_media_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MediaAssetResponse]:
    stmt = (
        select(MediaAsset)
        .where(MediaAsset.user_id == current_user.id)
        .order_by(MediaAsset.created_at.desc())
    )
    items = db.scalars(stmt).all()
    return [_build_media_asset_response(item) for item in items]


@router.get(
    "/{media_asset_id}",
    response_model=MediaAssetResponse,
    summary="Get media asset by id",
)
def get_media_asset(
    media_asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MediaAssetResponse:
    item = _get_media_asset_or_404(media_asset_id, db, current_user)
    return _build_media_asset_response(item)


@router.get(
    "/{media_asset_id}/download",
    summary="Download media asset file",
)
def download_media_asset(
    media_asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = _get_media_asset_or_404(media_asset_id, db, current_user)

    file_path = Path(item.path)
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media asset file for '{media_asset_id}' not found on disk",
        )

    return FileResponse(
        path=file_path,
        media_type=item.mime_type or "application/octet-stream",
        filename=item.stored_name,
    )


@router.delete(
    "/{media_asset_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete media asset",
)
def delete_media_asset(
    media_asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    item = _get_media_asset_or_404(media_asset_id, db, current_user)

    file_path = Path(item.path)
    if file_path.exists() and file_path.is_file():
        file_path.unlink(missing_ok=True)

    db.delete(item)
    db.commit()

    db.refresh(current_user)
    sync_storage_usage_from_media_assets(db, current_user)

    return {
        "status": "ok",
        "message": f"Media asset '{media_asset_id}' deleted",
    }