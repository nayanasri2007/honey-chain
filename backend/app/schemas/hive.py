from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class HiveBase(BaseModel):
    hive_code: str = Field(..., example="HV-2026-001")
    location: str = Field(..., example="North Apiary Field, Sector 4")
    bee_species: Optional[str] = Field(default="Apis mellifera", example="Apis mellifera")
    status: Optional[str] = Field(default="active", example="active")

class HiveCreate(HiveBase):
    beekeeper_id: int = Field(..., example=1)

class HiveUpdate(BaseModel):
    location: Optional[str] = None
    bee_species: Optional[str] = None
    status: Optional[str] = None

class HiveResponse(HiveBase):
    id: int
    beekeeper_id: int
    installation_date: datetime

    class Config:
        from_attributes = True
