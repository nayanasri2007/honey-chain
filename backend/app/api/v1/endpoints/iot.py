from datetime import datetime
import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.hive import Hive
from app.models.iot import HiveSensorReading
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from app.schemas.iot import (
    HiveSensorReadingCreate,
    HiveSensorReadingResponse,
)

router = APIRouter()


# ============================================================
# AUTHENTICATION / ROLE CHECK
# ============================================================

def verify_beekeeper(current_user: User):
    if current_user.role != "beekeeper":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires the 'beekeeper' role.",
        )

    return current_user


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_hive_or_404(
    hive_id: int,
    db: Session,
):
    hive = (
        db.query(Hive)
        .filter(Hive.id == hive_id)
        .first()
    )

    if not hive:
        raise HTTPException(
            status_code=404,
            detail="Hive not found.",
        )

    return hive


def calculate_temperature_status(
    temperature: float,
):
    if 32 <= temperature <= 36:
        return "Normal"

    if 30 <= temperature < 32 or 36 < temperature <= 38:
        return "Warning"

    return "Critical"


def calculate_humidity_status(
    humidity: float,
):
    if 55 <= humidity <= 75:
        return "Normal"

    if 50 <= humidity < 55 or 75 < humidity <= 80:
        return "Warning"

    return "Critical"


def calculate_activity_status(
    activity: float,
):
    if activity >= 70:
        return "Healthy"

    if activity >= 40:
        return "Reduced"

    return "Very Low"


# ============================================================
# IO T OVERVIEW
# ============================================================

@router.get("/overview")
def get_iot_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    hives = (
        db.query(Hive)
        .order_by(Hive.id)
        .all()
    )

    overview = []

    for hive in hives:

        latest_reading = (
            db.query(HiveSensorReading)
            .filter(
                HiveSensorReading.hive_id == hive.id
            )
            .order_by(
                HiveSensorReading.timestamp.desc()
            )
            .first()
        )

        if latest_reading:

            overview.append(
                {
                    "hive_id": hive.id,
                    "hive_code": hive.hive_code,
                    "temperature": latest_reading.temperature,
                    "humidity": latest_reading.humidity,
                    "weight": latest_reading.weight,
                    "bee_activity": latest_reading.bee_activity,
                    "timestamp": latest_reading.timestamp,
                    "temperature_status": calculate_temperature_status(
                        latest_reading.temperature
                    ),
                    "humidity_status": calculate_humidity_status(
                        latest_reading.humidity
                    ),
                    "activity_status": calculate_activity_status(
                        latest_reading.bee_activity
                    ),
                }
            )

    return {
        "total_hives": len(hives),
        "hives_with_sensor_data": len(overview),
        "data": overview,
    }


# ============================================================
# LATEST READING
# ============================================================

@router.get(
    "/hives/{hive_id}/latest",
    response_model=HiveSensorReadingResponse,
)
def get_latest_reading(
    hive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    get_hive_or_404(
        hive_id,
        db,
    )

    reading = (
        db.query(HiveSensorReading)
        .filter(
            HiveSensorReading.hive_id == hive_id
        )
        .order_by(
            HiveSensorReading.timestamp.desc()
        )
        .first()
    )

    if not reading:
        raise HTTPException(
            status_code=404,
            detail="No sensor readings found for this hive.",
        )

    return reading


# ============================================================
# READING HISTORY
# ============================================================

@router.get(
    "/hives/{hive_id}/history",
    response_model=list[HiveSensorReadingResponse],
)
def get_reading_history(
    hive_id: int,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    get_hive_or_404(
        hive_id,
        db,
    )

    if limit < 1:
        limit = 1

    if limit > 200:
        limit = 200

    readings = (
        db.query(HiveSensorReading)
        .filter(
            HiveSensorReading.hive_id == hive_id
        )
        .order_by(
            HiveSensorReading.timestamp.desc()
        )
        .limit(limit)
        .all()
    )

    return readings


# ============================================================
# SIMULATE SENSOR READING
# ============================================================

@router.post(
    "/hives/{hive_id}/simulate",
    response_model=HiveSensorReadingResponse,
    status_code=201,
)
def simulate_sensor_reading(
    hive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    get_hive_or_404(
        hive_id,
        db,
    )

    previous_reading = (
        db.query(HiveSensorReading)
        .filter(
            HiveSensorReading.hive_id == hive_id
        )
        .order_by(
            HiveSensorReading.timestamp.desc()
        )
        .first()
    )

    # --------------------------------------------------------
    # If previous data exists, generate values around it.
    # Otherwise use healthy default values.
    # --------------------------------------------------------

    if previous_reading:

        temperature = round(
            previous_reading.temperature
            + random.uniform(-1.0, 1.0),
            2,
        )

        humidity = round(
            previous_reading.humidity
            + random.uniform(-2.0, 2.0),
            2,
        )

        weight = round(
            previous_reading.weight
            + random.uniform(-0.3, 0.5),
            2,
        )

        bee_activity = round(
            previous_reading.bee_activity
            + random.uniform(-5.0, 5.0),
            2,
        )

    else:

        temperature = round(
            random.uniform(32.0, 35.5),
            2,
        )

        humidity = round(
            random.uniform(55.0, 72.0),
            2,
        )

        weight = round(
            random.uniform(20.0, 30.0),
            2,
        )

        bee_activity = round(
            random.uniform(70.0, 95.0),
            2,
        )

    # Keep generated values within sensible ranges.

    temperature = max(
        20.0,
        min(45.0, temperature),
    )

    humidity = max(
        20.0,
        min(95.0, humidity),
    )

    weight = max(
        1.0,
        weight,
    )

    bee_activity = max(
        0.0,
        min(100.0, bee_activity),
    )

    reading = HiveSensorReading(
        hive_id=hive_id,
        temperature=temperature,
        humidity=humidity,
        weight=weight,
        bee_activity=bee_activity,
        timestamp=datetime.utcnow(),
    )

    db.add(reading)
    db.commit()
    db.refresh(reading)

    return reading


# ============================================================
# CUSTOM SENSOR READING
# ============================================================

@router.post(
    "/hives/{hive_id}/simulate/custom",
    response_model=HiveSensorReadingResponse,
    status_code=201,
)
def create_custom_sensor_reading(
    hive_id: int,
    reading_data: HiveSensorReadingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_beekeeper(current_user)

    get_hive_or_404(
        hive_id,
        db,
    )

    reading = HiveSensorReading(
        hive_id=hive_id,
        temperature=reading_data.temperature,
        humidity=reading_data.humidity,
        weight=reading_data.weight,
        bee_activity=reading_data.bee_activity,
        timestamp=reading_data.timestamp
        if reading_data.timestamp
        else datetime.utcnow(),
    )

    db.add(reading)
    db.commit()
    db.refresh(reading)

    return reading