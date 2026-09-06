from datetime import datetime
from typing import List

from pydantic import BaseModel


class HiveHealthAnalysisResponse(BaseModel):
    id: int
    hive_id: int
    health_score: float
    risk_level: str
    temperature_status: str
    humidity_status: str
    activity_status: str
    weight_status: str
    warning_factors: List[str]
    recommendation: str
    analyzed_at: datetime

    class Config:
        from_attributes = True