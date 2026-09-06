from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, index=True, nullable=False)

    password_hash = Column(String(255), nullable=False)

    role = Column(String(20), nullable=False)

    beekeeper_id = Column(
        Integer,
        ForeignKey("beekeepers.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.now,
        nullable=False,
    )

    status = Column(
        String(20),
        default="active",
        nullable=False,
    )

    beekeeper = relationship("Beekeeper", backref="user_accounts")