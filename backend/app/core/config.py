from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "VerifAI"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./storage/verifai.db"

    # Storage paths
    UPLOAD_DIR: str = "./storage/uploads"
    REPORT_DIR: str = "./storage/reports"
    FRAME_DIR: str = "./storage/frames"

    # Upload constraints
    MAX_UPLOAD_SIZE_MB: int = 250
    ALLOWED_EXTENSIONS: str = "mp4,mov,avi,mkv,wav,mp3,m4a"

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # AI/ML
    DEVICE: str = "cpu"
    ENABLE_GPU: bool = False
    WHISPER_MODEL: str = "base"
    MODEL_CHECKPOINTS_DIR: str = "./models/checkpoints"

    # Multimodal Weights
    WEIGHT_FACIAL: float = 0.35
    WEIGHT_LIP_SYNC: float = 0.25
    WEIGHT_ACTIVE_SPEAKER: float = 0.20
    WEIGHT_AUDIO: float = 0.20

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            import json
            return json.loads(v)
        return v

    @property
    def allowed_extensions_set(self) -> set:
        return {ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(",")}

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORT_DIR, exist_ok=True)
os.makedirs(settings.FRAME_DIR, exist_ok=True)
os.makedirs(settings.MODEL_CHECKPOINTS_DIR, exist_ok=True)

