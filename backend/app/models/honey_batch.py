from datetime import datetime

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class HoneyBatch(Base):
    __tablename__ = "honey_batches"

    id = Column(Integer, primary_key=True, index=True)

    batch_code = Column(String(50), unique=True, nullable=False, index=True)

    hive_id = Column(
        Integer,
        ForeignKey("hives.id", ondelete="CASCADE"),
        nullable=False
    )

    harvest_date = Column(DateTime, nullable=False)
    quantity_kg = Column(Float, nullable=False)

    extraction_method = Column(String(100), nullable=False)
    processing_status = Column(String(50), nullable=False, default="Harvested")
    packaging_status = Column(String(50), nullable=False, default="Pending")
    storage_location = Column(String(200), nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    hive = relationship(
        "Hive",
        backref="honey_batches"
    )