import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.models import init_db
from backend.app.api.v1.router import api_router

# Initialize tables
logger.info("Initializing VerifAI database tables...")
init_db()
logger.info(f"VerifAI platform backend online. Storage mounted at {settings.UPLOAD_DIR}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multimodal Deepfake Detection & Media Verification Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for previewing face crops and frames
os.makedirs(settings.FRAME_DIR, exist_ok=True)
app.mount("/storage/frames", StaticFiles(directory=settings.FRAME_DIR), name="frames")

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "operational",
        "api_docs": "/docs",
        "version": "1.0.0"
    }
