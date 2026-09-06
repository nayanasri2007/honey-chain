from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db

router = APIRouter()

@router.get("/health", summary="Basic API Health Check")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "message": "Honey Chain Smart Beekeeping & Traceability API Foundation Ready"
    }
