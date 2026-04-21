import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from apps.api.app.db import get_db
from apps.api.app.dependencies import get_current_user
from apps.api.app.models import User
from apps.api.app.schemas import (
    AuthLoginRequest,
    AuthRegisterRequest,
    TokenResponse,
    UserResponse,
)
from apps.api.app.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from apps.api.app.services.account_bootstrap import ensure_user_profile, ensure_user_quota

router = APIRouter(prefix="/auth")


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register_user(
    payload: AuthRegisterRequest,
    db: Session = Depends(get_db),
) -> UserResponse:
    normalized_email = payload.email.strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == normalized_email)
    )
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    user = User(
        id=str(uuid.uuid4()),
        email=normalized_email,
        password_hash=get_password_hash(payload.password),
        is_active=True,
        is_superuser=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    ensure_user_profile(db, user)
    ensure_user_quota(db, user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive access token",
)
def login_user(
    payload: AuthLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    normalized_email = payload.email.strip().lower()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    access_token = create_access_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return current_user