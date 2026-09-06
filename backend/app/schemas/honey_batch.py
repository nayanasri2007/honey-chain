from datetime import datetime

from pydantic import BaseModel


class HoneyBatchResponse(BaseModel):
    id: int
    batch_code: str
    hive_id: int

    harvest_date: datetime
    quantity_kg: float

    extraction_method: str
    processing_status: str
    packaging_status: str
    storage_location: str | None

    created_at: datetime

    class Config:
        from_attributes = True