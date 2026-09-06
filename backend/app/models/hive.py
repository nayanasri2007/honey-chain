from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Hive(Base):
    __tablename__ = "hives"

    id = Column(Integer, primary_key=True, index=True)
    hive_code = Column(String(50), unique=True, index=True, nullable=False)
    beekeeper_id = Column(Integer, ForeignKey("beekeepers.id", ondelete="CASCADE"), nullable=False)
    location = Column(String(200), nullable=False)
    bee_species = Column(String(100), default="Apis mellifera", nullable=False)
    installation_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(20), default="active", nullable=False)

    beekeeper = relationship("Beekeeper", back_populates="hives")
