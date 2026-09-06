from datetime import datetime

from pydantic import BaseModel


class HoneyQualityAnalysisResponse(BaseModel):
    id: int
    hive_id: int

    average_temperature: float
    moisture_percent: float
    exposure_hours: float

    quality_score: float
    quality_level: str
    risk_level: str

    risk_factors: str
    recommendation: str

    analyzed_at: datetime

    class Config:
        from_attributes = True