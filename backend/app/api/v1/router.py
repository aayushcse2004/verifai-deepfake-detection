from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    media,
    analysis,
    health,
    settings,
    system,
    models_registry,
    evaluation,
    audit,
    comparison
)

api_router = APIRouter()

api_router.include_router(media.router, prefix="/media", tags=["Media"])
api_router.include_router(comparison.router, prefix="/media", tags=["Media Comparison"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(system.router, prefix="/system", tags=["System & GPU Monitoring"])
api_router.include_router(models_registry.router, prefix="/models", tags=["Model Registry"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["Model Evaluation"])
api_router.include_router(audit.router, prefix="/audit", tags=["Chain of Custody & Audit Trail"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
