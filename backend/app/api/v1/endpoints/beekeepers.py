from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.beekeeper import Beekeeper
from app.schemas.beekeeper import (
    BeekeeperCreate,
    BeekeeperResponse,
    BeekeeperDetailResponse,
)
from app.api.v1.endpoints.auth import get_current_user, require_role
from app.models.user import User


router = APIRouter()


@router.post(
    "/",
    response_model=BeekeeperResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a New Beekeeper",
)
def create_beekeeper(
    payload: BeekeeperCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("beekeeper")),
):
    # Check if beekeeper_code already exists
    existing = (
        db.query(Beekeeper)
        .filter(Beekeeper.beekeeper_code == payload.beekeeper_code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Beekeeper with code '{payload.beekeeper_code}' already exists.",
        )

    beekeeper = Beekeeper(
        beekeeper_code=payload.beekeeper_code,
        name=payload.name,
        phone=payload.phone,
        location=payload.location,
        status=payload.status or "active",
    )

    db.add(beekeeper)
    db.commit()
    db.refresh(beekeeper)

    return BeekeeperResponse(
        id=beekeeper.id,
        beekeeper_code=beekeeper.beekeeper_code,
        name=beekeeper.name,
        phone=beekeeper.phone,
        location=beekeeper.location,
        registration_date=beekeeper.registration_date,
        status=beekeeper.status,
        hives_count=0,
    )


@router.get(
    "/",
    response_model=List[BeekeeperResponse],
    summary="List All Beekeepers",
)
def list_beekeepers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("beekeeper")),
):
    beekeepers = db.query(Beekeeper).all()

    results = []

    for bk in beekeepers:
        results.append(
            BeekeeperResponse(
                id=bk.id,
                beekeeper_code=bk.beekeeper_code,
                name=bk.name,
                phone=bk.phone,
                location=bk.location,
                registration_date=bk.registration_date,
                status=bk.status,
                hives_count=len(bk.hives),
            )
        )

    return results


@router.get(
    "/{id}",
    response_model=BeekeeperDetailResponse,
    summary="Get Beekeeper Details with Hives",
)
def get_beekeeper(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("beekeeper")),
):
    beekeeper = (
        db.query(Beekeeper)
        .filter(Beekeeper.id == id)
        .first()
    )

    if not beekeeper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Beekeeper with ID {id} not found.",
        )

    return beekeeper