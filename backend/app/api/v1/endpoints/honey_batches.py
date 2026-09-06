from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.hive import Hive
from app.models.honey_batch import HoneyBatch
from app.models.user import User
from app.schemas.honey_batch import HoneyBatchResponse
from app.api.v1.endpoints.auth import get_current_user


router = APIRouter()


# ============================================================================
# BEEKEEPER ROLE CHECK
# ============================================================================

def verify_beekeeper(current_user: User):
    if current_user.role != "beekeeper":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires the 'beekeeper' role.",
        )

    return current_user


# ============================================================================
# CREATE HONEY BATCH
# ============================================================================
# Beekeeper only
# ============================================================================

@router.post(
    "/",
    response_model=HoneyBatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_honey_batch(
    batch_code: str,
    hive_id: int,
    harvest_date: datetime,
    quantity_kg: float,
    extraction_method: str,
    processing_status: str = "Harvested",
    packaging_status: str = "Pending",
    storage_location: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    hive = (
        db.query(Hive)
        .filter(Hive.id == hive_id)
        .first()
    )

    if not hive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hive #{hive_id} not found.",
        )

    if quantity_kg <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0 kg.",
        )

    existing_batch = (
        db.query(HoneyBatch)
        .filter(HoneyBatch.batch_code == batch_code)
        .first()
    )

    if existing_batch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch code '{batch_code}' already exists.",
        )

    batch = HoneyBatch(
        batch_code=batch_code,
        hive_id=hive_id,
        harvest_date=harvest_date,
        quantity_kg=quantity_kg,
        extraction_method=extraction_method,
        processing_status=processing_status,
        packaging_status=packaging_status,
        storage_location=storage_location,
    )

    db.add(batch)
    db.commit()
    db.refresh(batch)

    return batch


# ============================================================================
# GET ALL HONEY BATCHES
# ============================================================================
# Beekeeper + Customer
#
# Customers need this endpoint because the customer Traceability page
# displays registered honey batches.
# ============================================================================

@router.get(
    "/",
    response_model=list[HoneyBatchResponse],
)
def get_honey_batches(
    hive_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Any authenticated user can READ batch traceability information.
    # Creation/modification remains beekeeper-only.

    if current_user.role not in ["beekeeper", "customer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action is not available for this account.",
        )

    query = db.query(HoneyBatch)

    if hive_id is not None:
        query = query.filter(
            HoneyBatch.hive_id == hive_id
        )

    return (
        query
        .order_by(HoneyBatch.created_at.desc())
        .all()
    )


# ============================================================================
# GET SINGLE HONEY BATCH
# ============================================================================
# Beekeeper + Customer
# ============================================================================

@router.get(
    "/{batch_id}",
    response_model=HoneyBatchResponse,
)
def get_honey_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["beekeeper", "customer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action is not available for this account.",
        )

    batch = (
        db.query(HoneyBatch)
        .filter(HoneyBatch.id == batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Honey batch #{batch_id} not found.",
        )

    return batch