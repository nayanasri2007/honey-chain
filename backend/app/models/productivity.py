from datetime import datetime

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class HiveProductivityPrediction(Base):
    __tablename__ = "hive_productivity_predictions"

    id = Column(Integer, primary_key=True, index=True)

    hive_id = Column(
        Integer,
        ForeignKey("hives.id", ondelete="CASCADE"),
        nullable=False
    )

    predicted_honey_kg = Column(Float, nullable=False)
    productivity_level = Column(String(20), nullable=False)
    confidence_score = Column(Float, nullable=False)

    weight_trend = Column(Float, nullable=False)
    average_temperature = Column(Float, nullable=False)
    average_humidity = Column(Float, nullable=False)
    average_bee_activity = Column(Float, nullable=False)

    influencing_factors = Column(Text, nullable=False)

    predicted_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    hive = relationship(
        "Hive",
        backref="productivity_predictions"
    )