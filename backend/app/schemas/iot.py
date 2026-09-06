from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class HiveSensorReadingBase(BaseModel):
    temperature: float = Field(
        ...,
        example=34.5,
        description="Temperature in °C",
    )

    humidity: float = Field(
        ...,
        example=62.0,
        description="Humidity in %",
    )

    weight: float = Field(
        ...,
        example=45.2,
        description="Hive weight in kg",
    )

    bee_activity: float = Field(
        ...,
        example=85.0,
        description="Bee activity level in %",
    )


class HiveSensorReadingCreate(HiveSensorReadingBase):
    timestamp: Optional[datetime] = Field(
        default=None,
        description="Optional sensor reading timestamp",
    )


class HiveSensorReadingResponse(HiveSensorReadingBase):
    id: int
    hive_id: int
    timestamp: datetime

    temperature_status: Optional[str] = "Normal"
    humidity_status: Optional[str] = "Normal"
    bee_activity_status: Optional[str] = "Healthy"
    weight_status: Optional[str] = "Stable"

    class Config:
        from_attributes = True


class IoTOverviewResponse(BaseModel):
    total_hives: int
    monitored_hives: int
    hives_with_warnings: int
    average_temperature: float
    average_humidity: float