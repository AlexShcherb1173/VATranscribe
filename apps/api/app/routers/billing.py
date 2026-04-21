from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from apps.api.app.db import get_db
from apps.api.app.dependencies import get_current_user
from apps.api.app.models import User
from apps.api.app.schemas import BillingOverviewResponse
from apps.api.app.services.billing_service import get_billing_overview

router = APIRouter(prefix="/billing")


@router.get(
    "/overview",
    response_model=BillingOverviewResponse,
    summary="Get billing overview for current user",
)
def billing_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BillingOverviewResponse:
    overview = get_billing_overview(db, current_user)
    return BillingOverviewResponse(**overview)