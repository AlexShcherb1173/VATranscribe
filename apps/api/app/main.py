from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.app.config import get_settings
from apps.api.app.routers import router as api_router
from apps.api.app.schemas import ApiInfoResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    for path in settings.storage_dirs:
        path.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/", response_model=ApiInfoResponse, tags=["meta"])
def root() -> ApiInfoResponse:
    return ApiInfoResponse(
        app=settings.app_name,
        env=settings.app_env,
        version="0.1.0",
        docs_url="/docs",
        api_prefix=settings.api_prefix,
        endpoints={
            "health_live": f"{settings.api_prefix}/health/live",
            "health_ready": f"{settings.api_prefix}/health/ready",
            "jobs_list": f"{settings.api_prefix}/jobs",
            "jobs_get": f"{settings.api_prefix}/jobs/{{job_id}}",
            "jobs_create": f"{settings.api_prefix}/jobs",
            "downloads_analyze": f"{settings.api_prefix}/downloads/analyze",
            "downloads_jobs": f"{settings.api_prefix}/downloads/jobs",
            "transcriptions_jobs": f"{settings.api_prefix}/transcriptions/jobs",
            "transcript_get": f"{settings.api_prefix}/transcriptions/{{transcript_id}}",
        },
    )