FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY apps ./apps
COPY packages ./packages
COPY alembic.ini ./
COPY alembic ./alembic

RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir --default-timeout=300 --retries 10 -e .

COPY . .

CMD ["uvicorn", "apps.api.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]