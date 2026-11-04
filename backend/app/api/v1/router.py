from fastapi import APIRouter
from backend.app.api.v1.endpoints import media, analysis, health, settings

api_router = APIRouter()

api_router.include_router(media.router, prefix="/media", tags=["Media"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
