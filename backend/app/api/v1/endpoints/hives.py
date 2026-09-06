from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.beekeeper import Beekeeper
from app.models.hive import Hive
from app.models.user import User
from app.schemas.hive import HiveCreate, HiveUpdate, HiveResponse
from app.api.v1.endpoints.auth import get_current_user


router = APIRouter()


# ============================================================
# BEEKEEPER AUTHORIZATION
# ============================================================

def verify_beekeeper(
    current_user: User = Depends(get_current_user),
):
    """
    Allow only authenticated beekeeper users.
    """

    if current_user.role != "beekeeper":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires the 'beekeeper' role.",
        )

    return current_user


# ============================================================
# CREATE HIVE
# ============================================================

@router.post(
    "/",
    response_model=HiveResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a New Hive",
)
def create_hive(
    payload: HiveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_beekeeper),
):
    """
    Register a new hive for a beekeeper.
    """

    beekeeper = (
        db.query(Beekeeper)
        .filter(Beekeeper.id == payload.beekeeper_id)
        .first()
    )

    if not beekeeper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Beekeeper with ID {payload.beekeeper_id} does not exist.",
        )

    existing_hive = (
        db.query(Hive)
        .filter(Hive.hive_code == payload.hive_code)
        .first()
    )

    if existing_hive:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Hive with code '{payload.hive_code}' already exists.",
        )

    hive = Hive(
        hive_code=payload.hive_code,
        beekeeper_id=payload.beekeeper_id,
        location=payload.location,
        bee_species=payload.bee_species or "Apis mellifera",
        status=payload.status or "active",
    )

    db.add(hive)
    db.commit()
    db.refresh(hive)

    return hive


# ============================================================
# LIST HIVES
# ============================================================

@router.get(
    "/",
    response_model=List[HiveResponse],
    summary="List Hives (Optionally filter by Beekeeper)",
)
def list_hives(
    beekeeper_id: Optional[int] = Query(
        None,
        description="Filter hives by Beekeeper ID",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_beekeeper),
):
    """
    Return all hives.

    Optional:
        ?beekeeper_id=ID
    """

    query = db.query(Hive)

    if beekeeper_id is not None:
        query = query.filter(
            Hive.beekeeper_id == beekeeper_id
        )

    return query.all()


# ============================================================
# GET SINGLE HIVE
# ============================================================

@router.get(
    "/{id}",
    response_model=HiveResponse,
    summary="Get Hive Details",
)
def get_hive(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_beekeeper),
):
    """
    Get details of one hive.
    """

    hive = (
        db.query(Hive)
        .filter(Hive.id == id)
        .first()
    )

    if not hive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hive with ID {id} not found.",
        )

    return hive


# ============================================================
# UPDATE HIVE
# ============================================================

@router.put(
    "/{id}",
    response_model=HiveResponse,
    summary="Update Hive Information",
)
def update_hive(
    id: int,
    payload: HiveUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_beekeeper),
):
    """
    Update hive information.
    """

    hive = (
        db.query(Hive)
        .filter(Hive.id == id)
        .first()
    )

    if not hive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hive with ID {id} not found.",
        )

    if payload.location is not None:
        hive.location = payload.location

    if payload.bee_species is not None:
        hive.bee_species = payload.bee_species

    if payload.status is not None:
        hive.status = payload.status

    db.commit()
    db.refresh(hive)

    return hive


# ============================================================
# DELETE HIVE
# ============================================================

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a Hive",
)
def delete_hive(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_beekeeper),
):
    """
    Delete a hive and its dependent sensor/AI records.
    """

    hive = (
        db.query(Hive)
        .filter(Hive.id == id)
        .first()
    )

    if not hive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hive with ID {id} not found.",
        )

    try:

        # ----------------------------------------------------
        # Delete IoT sensor readings
        # ----------------------------------------------------

        db.execute(
            text(
                """
                DELETE FROM hive_sensor_readings
                WHERE hive_id = :hive_id
                """
            ),
            {
                "hive_id": id
            },
        )

        # ----------------------------------------------------
        # Delete AI health analyses
        # ----------------------------------------------------

        db.execute(
            text(
                """
                DELETE FROM hive_health_analyses
                WHERE hive_id = :hive_id
                """
            ),
            {
                "hive_id": id
            },
        )

        # ----------------------------------------------------
        # Delete hive
        # ----------------------------------------------------

        db.delete(hive)

        db.commit()

        return None

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete hive and its related records.",
        )