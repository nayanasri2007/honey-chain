from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Beekeeper(Base):
    __tablename__ = "beekeepers"

    id = Column(Integer, primary_key=True, index=True)
    beekeeper_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    location = Column(String(200), nullable=False)
    registration_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(20), default="active", nullable=False)

    hives = relationship("Hive", back_populates="beekeeper", cascade="all, delete-orphan")
