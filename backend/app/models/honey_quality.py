from datetime import datetime

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class HoneyQualityAnalysis(Base):
    __tablename__ = "honey_quality_analyses"

    id = Column(Integer, primary_key=True, index=True)

    hive_id = Column(
        Integer,
        ForeignKey("hives.id", ondelete="CASCADE"),
        nullable=False
    )

    average_temperature = Column(Float, nullable=False)
    moisture_percent = Column(Float, nullable=False)
    exposure_hours = Column(Float, nullable=False)

    quality_score = Column(Float, nullable=False)
    quality_level = Column(String(20), nullable=False)
    risk_level = Column(String(20), nullable=False)

    risk_factors = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)

    analyzed_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    hive = relationship(
        "Hive",
        backref="honey_quality_analyses"
    )