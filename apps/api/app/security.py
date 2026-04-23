from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from apps.api.app.config import settings


ALGORITHM = "HS256"


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )

    payload: dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
    }

    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def get_subject_from_token(token: str) -> str | None:
    """
    Извлекает subject (sub) из JWT токена.
    Возвращает None, если токен невалиден.
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError:
        return None

    subject = payload.get("sub")
    if subject is None:
        return None

    return str(subject)