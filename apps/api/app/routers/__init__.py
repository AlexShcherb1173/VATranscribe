from fastapi import APIRouter

from apps.api.app.routers.auth import router as auth_router
from apps.api.app.routers.billing import router as billing_router
from apps.api.app.routers.downloads import router as downloads_router
from apps.api.app.routers.export_artifacts import router as export_artifacts_router
from apps.api.app.routers.health import router as health_router
from apps.api.app.routers.jobs import router as jobs_router
from apps.api.app.routers.media_assets import router as media_assets_router
from apps.api.app.routers.profile import router as profile_router
from apps.api.app.routers.quota import router as quota_router
from apps.api.app.routers.transcriptions import router as transcriptions_router
from apps.api.app.routers.transcripts import router as transcripts_router
from apps.api.app.routers.uploads import router as uploads_router

router = APIRouter()

router.include_router(health_router, tags=["health"])
router.include_router(auth_router, tags=["auth"])
router.include_router(profile_router, tags=["profile"])
router.include_router(quota_router, tags=["quota"])
router.include_router(billing_router, tags=["billing"])
router.include_router(jobs_router, tags=["jobs"])
router.include_router(downloads_router, tags=["downloads"])
router.include_router(uploads_router, tags=["uploads"])
router.include_router(media_assets_router, tags=["media-assets"])
router.include_router(transcriptions_router, tags=["transcriptions"])
router.include_router(transcripts_router, tags=["transcripts"])
router.include_router(export_artifacts_router, tags=["export-artifacts"])