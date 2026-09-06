from fastapi import APIRouter
from app.api.v1.endpoints import(
    health,
    auth,
    beekeepers,
    hives,
    iot,
    ai,
    productivity,
    honey_quality,
    honey_batches,
    blockchain,
    qr,
    dashboards
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(beekeepers.router, prefix="/beekeepers", tags=["Beekeepers"])
api_router.include_router(hives.router, prefix="/hives", tags=["Hives"])
api_router.include_router(iot.router, prefix="/iot", tags=["IoT Monitoring"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Analytics"])
api_router.include_router(
    productivity.router,
    prefix="/productivity",
    tags=["Productivity AI"]
)
api_router.include_router(
    honey_quality.router,
    prefix="/honey-quality",
    tags=["Honey Quality AI"]
)
api_router.include_router(honey_batches.router, prefix="/honey-batches", tags=["Honey Batches"])
api_router.include_router(blockchain.router, prefix="/blockchain", tags=["Blockchain Ledger"])
api_router.include_router(qr.router, prefix="/qr", tags=["QR Codes"])
api_router.include_router(dashboards.router, prefix="/dashboards", tags=["Dashboards"])
