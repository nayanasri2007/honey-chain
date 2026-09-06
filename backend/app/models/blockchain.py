from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"

    id = Column(Integer, primary_key=True, index=True)

    batch_id = Column(
        Integer,
        ForeignKey("honey_batches.id", ondelete="CASCADE"),
        nullable=False
    )

    event_type = Column(String(100), nullable=False)
    event_data = Column(Text, nullable=False)

    previous_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False, unique=True, index=True)

    recorded_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    batch = relationship(
        "HoneyBatch",
        backref="blockchain_records"
    )