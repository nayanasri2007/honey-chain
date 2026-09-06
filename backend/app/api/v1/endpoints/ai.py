from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.hive import Hive
from app.models.iot import HiveSensorReading
from app.models.ai import HiveHealthAnalysis
from app.models.user import User
from app.schemas.ai import HiveHealthAnalysisResponse
from app.modules.ai.health_analyzer import analyze_hive_health
from app.api.v1.endpoints.auth import get_current_user


router = APIRouter()


# ============================================================================
# AUTHENTICATION / ROLE CHECK
# ============================================================================

def verify_beekeeper(current_user: User):
    if current_user.role != "beekeeper":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires the 'beekeeper' role.",
        )

    return current_user


# ============================================================================
# RUN AND SAVE AI HEALTH ANALYSIS
# ============================================================================

@router.post(
    "/hives/{hive_id}/health/analyze",
    response_model=HiveHealthAnalysisResponse
)
def analyze_health(
    hive_id: int,
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
            status_code=404,
            detail="Hive not found"
        )

    # ------------------------------------------------------------------------
    # Get latest IoT reading
    # ------------------------------------------------------------------------

    latest = (
        db.query(HiveSensorReading)
        .filter(
            HiveSensorReading.hive_id == hive_id
        )
        .order_by(
            HiveSensorReading.timestamp.desc()
        )
        .first()
    )

    if not latest:
        raise HTTPException(
            status_code=400,
            detail=(
                "No IoT sensor readings available for this hive. "
                "Simulate a sensor reading first."
            )
        )

    # ------------------------------------------------------------------------
    # Get previous IoT reading for weight trend
    # ------------------------------------------------------------------------

    previous = (
        db.query(HiveSensorReading)
        .filter(
            HiveSensorReading.hive_id == hive_id,
            HiveSensorReading.id != latest.id
        )
        .order_by(
            HiveSensorReading.timestamp.desc()
        )
        .first()
    )

    previous_weight = (
        previous.weight
        if previous
        else None
    )

    # ------------------------------------------------------------------------
    # Run AI health analyzer
    # ------------------------------------------------------------------------

    result = analyze_hive_health(
        temperature=latest.temperature,
        humidity=latest.humidity,
        weight=latest.weight,
        bee_activity=latest.bee_activity,
        previous_weight=previous_weight
    )

    # ------------------------------------------------------------------------
    # Save AI analysis to database
    # ------------------------------------------------------------------------

    analysis = HiveHealthAnalysis(
        hive_id=hive_id,
        health_score=result["health_score"],
        risk_level=result["risk_level"],
        temperature_status=result["temperature_status"],
        humidity_status=result["humidity_status"],
        activity_status=result["activity_status"],
        weight_status=result["weight_status"],
        warning_factors=result["warning_factors"],
        recommendation=result["recommendation"]
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis


# ============================================================================
# REAL-TIME HEALTH EVALUATION
# ============================================================================

@router.get(
    "/hives/{hive_id}/health/evaluate"
)
def evaluate_hive_health(
    hive_id: int,
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
            status_code=404,
            detail="Hive not found"
        )

    # ------------------------------------------------------------------------
    # Get latest IoT reading
    # ------------------------------------------------------------------------

    latest = (
        db.query(HiveSensorReading)
        .filter(
            HiveSensorReading.hive_id == hive_id
        )
        .order_by(
            HiveSensorReading.timestamp.desc()
        )
        .first()
    )

    if not latest:
        raise HTTPException(
            status_code=400,
            detail="No IoT sensor readings available for this hive."
        )

    # ------------------------------------------------------------------------
    # Get previous reading for weight trend
    # ------------------------------------------------------------------------

    previous = (
        db.query(HiveSensorReading)
        .filter(
            HiveSensorReading.hive_id == hive_id,
            HiveSensorReading.id != latest.id
        )
        .order_by(
            HiveSensorReading.timestamp.desc()
        )
        .first()
    )

    previous_weight = (
        previous.weight
        if previous
        else None
    )

    # ------------------------------------------------------------------------
    # Run the same AI health analyzer
    # ------------------------------------------------------------------------

    result = analyze_hive_health(
        temperature=latest.temperature,
        humidity=latest.humidity,
        weight=latest.weight,
        bee_activity=latest.bee_activity,
        previous_weight=previous_weight
    )

    # ------------------------------------------------------------------------
    # Early warning decision
    # ------------------------------------------------------------------------

    early_warning = result["risk_level"] != "Low"

    return {
        "hive_id": hive_id,
        "health_score": result["health_score"],
        "risk_level": result["risk_level"],
        "temperature_status": result["temperature_status"],
        "humidity_status": result["humidity_status"],
        "activity_status": result["activity_status"],
        "weight_status": result["weight_status"],
        "warning_factors": result["warning_factors"],
        "recommendation": result["recommendation"],
        "early_warning": early_warning
    }


# ============================================================================
# GET LATEST SAVED AI ANALYSIS
# ============================================================================

@router.get(
    "/hives/{hive_id}/health/latest",
    response_model=HiveHealthAnalysisResponse
)
def get_latest_health(
    hive_id: int,
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
            status_code=404,
            detail="Hive not found"
        )

    analysis = (
        db.query(HiveHealthAnalysis)
        .filter(
            HiveHealthAnalysis.hive_id == hive_id
        )
        .order_by(
            HiveHealthAnalysis.analyzed_at.desc()
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="No health analysis found for this hive"
        )

    return analysis


# ============================================================================
# GET AI ANALYSIS HISTORY
# ============================================================================

@router.get(
    "/hives/{hive_id}/health/history",
    response_model=list[HiveHealthAnalysisResponse]
)
def get_health_history(
    hive_id: int,
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
            status_code=404,
            detail="Hive not found"
        )

    analyses = (
        db.query(HiveHealthAnalysis)
        .filter(
            HiveHealthAnalysis.hive_id == hive_id
        )
        .order_by(
            HiveHealthAnalysis.analyzed_at.desc()
        )
        .all()
    )

    return analyses