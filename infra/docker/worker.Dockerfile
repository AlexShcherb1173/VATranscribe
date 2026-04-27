FROM python:3.12-slim-bookworm

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    C_FORCE_ROOT=true

WORKDIR /app

RUN printf '%s\n' \
    'Types: deb' \
    'URIs: https://deb.debian.org/debian' \
    'Suites: bookworm bookworm-updates' \
    'Components: main' \
    'Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg' \
    '' \
    'Types: deb' \
    'URIs: https://security.debian.org/debian-security' \
    'Suites: bookworm-security' \
    'Components: main' \
    'Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg' \
    > /etc/apt/sources.list.d/debian.sources \
    && apt-get update -o Acquire::Retries=10 \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        curl \
        ca-certificates \
    && apt-get clean \
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