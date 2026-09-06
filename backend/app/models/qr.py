from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True, index=True)

    batch_id = Column(
        Integer,
        ForeignKey("honey_batches.id", ondelete="CASCADE"),
        nullable=False
    )

    qr_token = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    verification_url = Column(
        String(500),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    batch = relationship(
        "HoneyBatch",
        backref="qr_codes"
    )