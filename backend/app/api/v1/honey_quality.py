import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.hive import Hive
from app.models.honey_quality import HoneyQualityAnalysis
from app.schemas.honey_quality import HoneyQualityAnalysisResponse
from app.modules.honey_quality.quality_analyzer import analyze_honey_quality

from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User


router = APIRouter()


# ============================================================
# BEEKEEPER AUTHORIZATION
# ============================================================

def verify_beekeeper(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "beekeeper":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires the 'beekeeper' role.",
        )

    return current_user


# ============================================================
# ANALYZE HONEY QUALITY
# ============================================================

@router.post(
    "/hives/{hive_id}/quality/analyze",
    response_model=HoneyQualityAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
def analyze_hive_honey_quality(
    hive_id: int,
    average_temperature: float,
    moisture_percent: float,
    exposure_hours: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_beekeeper),
):
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

    # --------------------------------------------------------
    # Validate moisture
    # --------------------------------------------------------

    if moisture_percent < 0 or moisture_percent > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Moisture percentage must be between 0 and 100.",
        )

    # --------------------------------------------------------
    # Validate exposure
    # --------------------------------------------------------

    if exposure_hours < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exposure hours cannot be negative.",
        )

    # --------------------------------------------------------
    # Run honey quality analyzer
    # --------------------------------------------------------

    analysis = analyze_honey_quality(
        average_temperature=average_temperature,
        moisture_percent=moisture_percent,
        exposure_hours=exposure_hours,
    )

    # --------------------------------------------------------
    # Store result
    # --------------------------------------------------------

    record = HoneyQualityAnalysis(
        hive_id=hive_id,
        average_temperature=average_temperature,
        moisture_percent=moisture_percent,
        exposure_hours=exposure_hours,
        quality_score=analysis["quality_score"],
        quality_level=analysis["quality_level"],
        risk_level=analysis["risk_level"],
        risk_factors=json.dumps(
            analysis["risk_factors"]
        ),
        recommendation=analysis["recommendation"],
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# ============================================================
# LATEST HONEY QUALITY ANALYSIS
# ============================================================

@router.get(
    "/hives/{hive_id}/quality/latest",
    response_model=HoneyQualityAnalysisResponse,
)
def get_latest_honey_quality(
    hive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_beekeeper),
):
    analysis = (
        db.query(HoneyQualityAnalysis)
        .filter(
            HoneyQualityAnalysis.hive_id == hive_id
        )
        .order_by(
            HoneyQualityAnalysis.analyzed_at.desc()
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No honey quality analysis found "
                f"for Hive #{hive_id}."
            ),
        )

    return analysis


# ============================================================
# HONEY QUALITY HISTORY
# ============================================================

@router.get(
    "/hives/{hive_id}/quality/history",
    response_model=list[HoneyQualityAnalysisResponse],
)
def get_honey_quality_history(
    hive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_beekeeper),
):
    analyses = (
        db.query(HoneyQualityAnalysis)
        .filter(
            HoneyQualityAnalysis.hive_id == hive_id
        )
        .order_by(
            HoneyQualityAnalysis.analyzed_at.desc()
        )
        .limit(20)
        .all()
    )

    return analyses