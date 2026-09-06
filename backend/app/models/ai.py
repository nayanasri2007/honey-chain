from datetime import datetime

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Text, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class HiveHealthAnalysis(Base):
    __tablename__ = "hive_health_analyses"

    id = Column(Integer, primary_key=True, index=True)

    hive_id = Column(
        Integer,
        ForeignKey("hives.id", ondelete="CASCADE"),
        nullable=False
    )

    health_score = Column(Float, nullable=False)

    risk_level = Column(String(20), nullable=False)

    temperature_status = Column(String(30), nullable=False)

    humidity_status = Column(String(30), nullable=False)

    activity_status = Column(String(30), nullable=False)

    weight_status = Column(String(30), nullable=False)

    warning_factors = Column(JSON, nullable=False, default=list)

    recommendation = Column(Text, nullable=False)

    analyzed_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    hive = relationship(
        "Hive",
        backref="health_analyses"
    )