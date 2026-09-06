import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.honey_batch import HoneyBatch
from app.models.blockchain import BlockchainRecord
from app.models.user import User
from app.schemas.blockchain import BlockchainRecordResponse
from app.modules.blockchain.ledger import calculate_hash, verify_hash
from app.api.v1.endpoints.auth import get_current_user


router = APIRouter()


# ============================================================================
# BEEKEEPER ROLE CHECK
# ============================================================================
# Used only for blockchain WRITE operations.
# ============================================================================

def verify_beekeeper(current_user: User):
    if current_user.role != "beekeeper":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires the 'beekeeper' role.",
        )

    return current_user


# ============================================================================
# TRACEABILITY READ ACCESS
# ============================================================================
# Both beekeepers and customers can inspect and verify blockchain records.
# ============================================================================

def verify_traceability_access(current_user: User):
    if current_user.role not in ["beekeeper", "customer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account cannot access honey traceability.",
        )

    return current_user


# ============================================================================
# RECORD BATCH BLOCKCHAIN EVENT
# ============================================================================
# Beekeeper only
# ============================================================================

@router.post(
    "/batches/{batch_id}/record",
    response_model=BlockchainRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_batch_event(
    batch_id: int,
    event_type: str,
    event_data: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

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

    previous_record = (
        db.query(BlockchainRecord)
        .filter(BlockchainRecord.batch_id == batch_id)
        .order_by(BlockchainRecord.id.desc())
        .first()
    )

    previous_hash = (
        previous_record.current_hash
        if previous_record
        else "0" * 64
    )

    recorded_at = datetime.now()

    try:
        parsed_event_data = json.loads(event_data)
    except json.JSONDecodeError:
        parsed_event_data = {
            "description": event_data
        }

    current_hash = calculate_hash(
        batch_id=batch_id,
        event_type=event_type,
        event_data=parsed_event_data,
        previous_hash=previous_hash,
        recorded_at=recorded_at,
    )

    record = BlockchainRecord(
        batch_id=batch_id,
        event_type=event_type,
        event_data=json.dumps(parsed_event_data),
        previous_hash=previous_hash,
        current_hash=current_hash,
        recorded_at=recorded_at,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# ============================================================================
# GET BATCH BLOCKCHAIN CHAIN
# ============================================================================
# Beekeeper + Customer
# ============================================================================

@router.get(
    "/batches/{batch_id}/chain",
    response_model=list[BlockchainRecordResponse],
)
def get_batch_blockchain(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_traceability_access(current_user)

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

    return (
        db.query(BlockchainRecord)
        .filter(BlockchainRecord.batch_id == batch_id)
        .order_by(BlockchainRecord.id.asc())
        .all()
    )


# ============================================================================
# VERIFY BATCH BLOCKCHAIN
# ============================================================================
# Beekeeper + Customer
# ============================================================================

@router.get(
    "/batches/{batch_id}/verify",
)
def verify_batch_blockchain(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_traceability_access(current_user)

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

    records = (
        db.query(BlockchainRecord)
        .filter(BlockchainRecord.batch_id == batch_id)
        .order_by(BlockchainRecord.id.asc())
        .all()
    )

    if not records:
        return {
            "batch_id": batch_id,
            "verified": False,
            "message": "No blockchain records found for this batch.",
        }

    errors = []

    for index, record in enumerate(records):

        expected_previous_hash = (
            "0" * 64
            if index == 0
            else records[index - 1].current_hash
        )

        if record.previous_hash != expected_previous_hash:
            errors.append(
                f"Record #{record.id}: previous hash mismatch."
            )

        try:
            event_data = json.loads(
                record.event_data
            )
        except json.JSONDecodeError:
            event_data = {
                "description": record.event_data
            }

        if not verify_hash(
            batch_id=record.batch_id,
            event_type=record.event_type,
            event_data=event_data,
            previous_hash=record.previous_hash,
            recorded_at=record.recorded_at,
            current_hash=record.current_hash,
        ):
            errors.append(
                f"Record #{record.id}: current hash mismatch."
            )

    return {
        "batch_id": batch_id,
        "verified": len(errors) == 0,
        "records_checked": len(records),
        "errors": errors,
    }