FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    C_FORCE_ROOT=true

WORKDIR /app

RUN apt-get update -o Acquire::Retries=5 \
    && apt-get install -y --no-install-recommends ffmpeg build-essential curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY apps ./apps
COPY packages ./packages
COPY alembic.ini ./
COPY alembic ./alembic

RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install --default-timeout=300 --retries 10 -e . \
    && pip install --default-timeout=300 --retries 10 faster-whisper ctranslate2 onnxruntime

COPY . .

CMD ["celery", "-A", "apps.worker.app.worker:celery", "worker", "--loglevel=info", "--pool=solo", "--concurrency=1"]
