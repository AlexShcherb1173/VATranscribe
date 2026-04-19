from fastapi import APIRouter

from apps.api.app.routers.downloads import router as downloads_router
from apps.api.app.routers.health import router as health_router
from apps.api.app.routers.jobs import router as jobs_router
from apps.api.app.routers.transcriptions import router as transcriptions_router

router = APIRouter()
router.include_router(health_router, tags=["health"])
router.include_router(jobs_router, tags=["jobs"])
router.include_router(downloads_router, tags=["downloads"])
router.include_router(transcriptions_router, tags=["transcriptions"])