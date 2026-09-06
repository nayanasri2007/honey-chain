from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.beekeeper import Beekeeper
from app.models.hive import Hive
from app.models.iot import HiveSensorReading
from app.models.ai import HiveHealthAnalysis
from app.models.productivity import HiveProductivityPrediction
from app.models.honey_quality import HoneyQualityAnalysis
from app.models.honey_batch import HoneyBatch
from app.models.blockchain import BlockchainRecord
from app.models.qr import QRCode


router = APIRouter()


@router.get(
    "/overview",
    summary="Get Honey Chain Dashboard Overview",
)
def dashboard_overview(
    db: Session = Depends(get_db),
):
    return {
        "beekeepers": db.query(Beekeeper).count(),
        "hives": db.query(Hive).count(),
        "sensor_readings": db.query(HiveSensorReading).count(),
        "health_analyses": db.query(HiveHealthAnalysis).count(),
        "productivity_predictions": db.query(
            HiveProductivityPrediction
        ).count(),
        "honey_quality_analyses": db.query(
            HoneyQualityAnalysis
        ).count(),
        "honey_batches": db.query(HoneyBatch).count(),
        "blockchain_records": db.query(
            BlockchainRecord
        ).count(),
        "qr_codes": db.query(QRCode).count(),
    }