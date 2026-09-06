import io
import secrets

import qrcode
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.honey_batch import HoneyBatch
from app.models.qr import QRCode
from app.models.hive import Hive
from app.models.beekeeper import Beekeeper
from app.models.user import User
from app.schemas.qr import QRCodeResponse
from app.api.v1.endpoints.auth import get_current_user


router = APIRouter()


# ============================================================
# BEEKEEPER ROLE CHECK
# ============================================================

def verify_beekeeper(current_user: User):
    if current_user.role != "beekeeper":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires the 'beekeeper' role.",
        )

    return current_user


# ============================================================
# FRONTEND URL
# ============================================================

def get_frontend_url() -> str:
    """
    Return the configured frontend URL.

    Production uses the Vercel frontend URL from FRONTEND_URL.
    Local development uses the value configured in .env.
    """
    return settings.FRONTEND_URL.rstrip("/")


# ============================================================
# GENERATE QR CODE
# BEEKEEPER ONLY
# ============================================================

@router.post(
    "/batches/{batch_id}/generate",
    response_model=QRCodeResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_qr_code(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    # --------------------------------------------------------
    # Find honey batch
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Determine frontend URL
    # --------------------------------------------------------

    frontend_url = get_frontend_url()

    # --------------------------------------------------------
    # Check whether QR already exists
    # --------------------------------------------------------

    existing_qr = (
        db.query(QRCode)
        .filter(QRCode.batch_id == batch_id)
        .first()
    )

    # --------------------------------------------------------
    # Update existing QR
    # --------------------------------------------------------

    if existing_qr:

        existing_qr.verification_url = (
            f"{frontend_url}/verify/{existing_qr.qr_token}"
        )

        db.commit()
        db.refresh(existing_qr)

        return existing_qr

    # --------------------------------------------------------
    # Create new QR token
    # --------------------------------------------------------

    qr_token = secrets.token_urlsafe(32)

    verification_url = (
        f"{frontend_url}/verify/{qr_token}"
    )

    # --------------------------------------------------------
    # Create database QR record
    # --------------------------------------------------------

    qr_code = QRCode(
        batch_id=batch_id,
        qr_token=qr_token,
        verification_url=verification_url,
    )

    db.add(qr_code)
    db.commit()
    db.refresh(qr_code)

    return qr_code


# ============================================================
# GET EXISTING QR FOR A BATCH
# BEEKEEPER + CUSTOMER
# ============================================================

@router.get(
    "/batches/{batch_id}",
    response_model=QRCodeResponse,
)
def get_batch_qr_code(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return the existing consumer QR associated with a honey batch.

    Both beekeepers and customers can READ an existing QR.

    Customers cannot create or regenerate QR codes.
    """

    # --------------------------------------------------------
    # Make sure the user is authenticated
    # --------------------------------------------------------

    if current_user.role not in ["beekeeper", "customer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account does not have access to QR records.",
        )

    # --------------------------------------------------------
    # Check honey batch
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Find existing QR
    # --------------------------------------------------------

    qr_code = (
        db.query(QRCode)
        .filter(QRCode.batch_id == batch_id)
        .first()
    )

    # --------------------------------------------------------
    # QR has not been generated yet
    # --------------------------------------------------------

    if not qr_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR verification has not been generated for this batch yet.",
        )

    return qr_code


# ============================================================
# VERIFY QR CODE
# PUBLIC
# ============================================================

@router.get(
    "/verify/{qr_token}",
)
def verify_qr_code(
    qr_token: str,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Find QR code
    # --------------------------------------------------------

    qr_code = (
        db.query(QRCode)
        .filter(QRCode.qr_token == qr_token)
        .first()
    )

    if not qr_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or unknown QR code.",
        )

    # --------------------------------------------------------
    # Find Honey Batch
    # --------------------------------------------------------

    batch = (
        db.query(HoneyBatch)
        .filter(HoneyBatch.id == qr_code.batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated honey batch not found.",
        )

    # --------------------------------------------------------
    # Find Hive
    # --------------------------------------------------------

    hive = (
        db.query(Hive)
        .filter(Hive.id == batch.hive_id)
        .first()
    )

    if not hive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated hive not found.",
        )

    # --------------------------------------------------------
    # Find Beekeeper
    # --------------------------------------------------------

    beekeeper = (
        db.query(Beekeeper)
        .filter(Beekeeper.id == hive.beekeeper_id)
        .first()
    )

    if not beekeeper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated beekeeper not found.",
        )

    # --------------------------------------------------------
    # Return verification data
    # --------------------------------------------------------

    return {
        "verified": True,

        "qr_token": qr_code.qr_token,

        "beekeeper": {
            "id": beekeeper.id,
            "beekeeper_code": beekeeper.beekeeper_code,
            "name": beekeeper.name,
            "phone": beekeeper.phone,
            "location": beekeeper.location,
            "registration_date": beekeeper.registration_date,
            "status": beekeeper.status,
        },

        "hive": {
            "id": hive.id,
            "hive_code": hive.hive_code,
            "beekeeper_id": hive.beekeeper_id,
            "location": hive.location,
            "bee_species": hive.bee_species,
            "installation_date": hive.installation_date,
            "status": hive.status,
        },

        "batch": {
            "id": batch.id,
            "batch_code": batch.batch_code,
            "hive_id": batch.hive_id,
            "harvest_date": batch.harvest_date,
            "quantity_kg": batch.quantity_kg,
            "extraction_method": batch.extraction_method,
            "processing_status": batch.processing_status,
            "packaging_status": batch.packaging_status,
            "storage_location": batch.storage_location,
        },

        "message": (
            "Honey batch traceability record verified successfully."
        ),
    }


# ============================================================
# GET QR IMAGE
# PUBLIC
# ============================================================

@router.get(
    "/image/{qr_token}",
)
def get_qr_image(
    qr_token: str,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Find QR code
    # --------------------------------------------------------

    qr_code = (
        db.query(QRCode)
        .filter(QRCode.qr_token == qr_token)
        .first()
    )

    if not qr_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or unknown QR code.",
        )

    # --------------------------------------------------------
    # Create QR image
    # --------------------------------------------------------

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )

    qr.add_data(qr_code.verification_url)
    qr.make(fit=True)

    image = qr.make_image(
        fill_color="black",
        back_color="white",
    )

    # --------------------------------------------------------
    # Convert image to PNG bytes
    # --------------------------------------------------------

    image_bytes = io.BytesIO()

    image.save(
        image_bytes,
        format="PNG",
    )

    image_bytes.seek(0)

    # --------------------------------------------------------
    # Return QR image
    # --------------------------------------------------------

    return StreamingResponse(
        image_bytes,
        media_type="image/png",
    )