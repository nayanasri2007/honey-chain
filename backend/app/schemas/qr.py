from datetime import datetime

from pydantic import BaseModel


class QRCodeResponse(BaseModel):
    id: int
    batch_id: int
    qr_token: str
    verification_url: str
    created_at: datetime

    class Config:
        from_attributes = True