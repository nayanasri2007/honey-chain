from datetime import datetime
from pydantic import BaseModel


class HiveProductivityPredictionResponse(BaseModel):
    id: int
    hive_id: int
    predicted_honey_kg: float
    productivity_level: str
    confidence_score: float
    weight_trend: float
    average_temperature: float
    average_humidity: float
    average_bee_activity: float
    influencing_factors: str
    predicted_at: datetime

    class Config:
        from_attributes = True