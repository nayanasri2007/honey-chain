from datetime import datetime

from pydantic import BaseModel


class BlockchainRecordResponse(BaseModel):
    id: int
    batch_id: int
    event_type: str
    event_data: str
    previous_hash: str
    current_hash: str
    recorded_at: datetime

    class Config:
        from_attributes = True