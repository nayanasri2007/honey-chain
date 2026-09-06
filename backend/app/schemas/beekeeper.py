from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.hive import HiveResponse

class BeekeeperBase(BaseModel):
    beekeeper_code: str = Field(..., example="BK-2026-001")
    name: str = Field(..., example="Ramesh Kumar")
    phone: str = Field(..., example="+91 9876543210")
    location: str = Field(..., example="Shimla, Himachal Pradesh")
    status: Optional[str] = Field(default="active", example="active")

class BeekeeperCreate(BeekeeperBase):
    pass

class BeekeeperResponse(BeekeeperBase):
    id: int
    registration_date: datetime
    hives_count: Optional[int] = 0

    class Config:
        from_attributes = True

class BeekeeperDetailResponse(BeekeeperResponse):
    hives: List[HiveResponse] = []

    class Config:
        from_attributes = True
