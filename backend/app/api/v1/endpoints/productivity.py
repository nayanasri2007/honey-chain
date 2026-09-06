import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.hive import Hive
from app.models.iot import HiveSensorReading
from app.models.productivity import HiveProductivityPrediction
from app.models.user import User
from app.schemas.productivity import HiveProductivityPredictionResponse
from app.modules.productivity.productivity_predictor import (
    predict_honey_productivity,
)
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
# HONEY PRODUCTIVITY PREDICTION
# ============================================================================

@router.post(
    "/hives/{hive_id}/productivity/predict",
    response_model=HiveProductivityPredictionResponse,
    status_code=status.HTTP_201_CREATED,
)
def predict_hive_productivity(
    hive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    # Check hive exists
    hive = db.query(Hive).filter(Hive.id == hive_id).first()

    if not hive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hive #{hive_id} not found.",
        )

    # Get recent IoT readings
    readings = (
        db.query(HiveSensorReading)
        .filter(HiveSensorReading.hive_id == hive_id)
        .order_by(HiveSensorReading.timestamp.desc())
        .limit(20)
        .all()
    )

    if len(readings) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 IoT readings are required for productivity prediction.",
        )

    # Reverse so readings are oldest -> newest
    readings = list(reversed(readings))

    oldest_weight = readings[0].weight
    latest_weight = readings[-1].weight

    weight_trend = round(latest_weight - oldest_weight, 3)

    average_temperature = round(
        sum(r.temperature for r in readings) / len(readings),
        2,
    )

    average_humidity = round(
        sum(r.humidity for r in readings) / len(readings),
        2,
    )

    average_bee_activity = round(
        sum(r.bee_activity for r in readings) / len(readings),
        2,
    )

    # Run productivity prediction
    prediction = predict_honey_productivity(
        weight_trend=weight_trend,
        average_temperature=average_temperature,
        average_humidity=average_humidity,
        average_bee_activity=average_bee_activity,
    )

    # Store prediction
    record = HiveProductivityPrediction(
        hive_id=hive_id,
        predicted_honey_kg=prediction["predicted_honey_kg"],
        productivity_level=prediction["productivity_level"],
        confidence_score=prediction["confidence_score"],
        weight_trend=weight_trend,
        average_temperature=average_temperature,
        average_humidity=average_humidity,
        average_bee_activity=average_bee_activity,
        influencing_factors=json.dumps(
            prediction["influencing_factors"]
        ),
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# ============================================================================
# GET LATEST PRODUCTIVITY PREDICTION
# ============================================================================

@router.get(
    "/hives/{hive_id}/productivity/latest",
    response_model=HiveProductivityPredictionResponse,
)
def get_latest_productivity_prediction(
    hive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    prediction = (
        db.query(HiveProductivityPrediction)
        .filter(
            HiveProductivityPrediction.hive_id == hive_id
        )
        .order_by(
            HiveProductivityPrediction.predicted_at.desc()
        )
        .first()
    )

    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No productivity prediction found for Hive #{hive_id}.",
        )

    return prediction


# ============================================================================
# GET PRODUCTIVITY PREDICTION HISTORY
# ============================================================================

@router.get(
    "/hives/{hive_id}/productivity/history",
    response_model=list[HiveProductivityPredictionResponse],
)
def get_productivity_history(
    hive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    predictions = (
        db.query(HiveProductivityPrediction)
        .filter(
            HiveProductivityPrediction.hive_id == hive_id
        )
        .order_by(
            HiveProductivityPrediction.predicted_at.desc()
        )
        .limit(20)
        .all()
    )

    return predictions