import hashlib
import os
import re
import uuid
from pathlib import Path
from fastapi import HTTPException, status
from backend.app.core.config import settings


def sanitize_filename(filename: str) -> str:
    """Sanitize the original filename to prevent path traversal and shell injection."""
    clean_name = os.path.basename(filename)
    clean_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', clean_name)
    return clean_name


def generate_secure_filename(original_filename: str) -> str:
    """Generate a collision-proof randomized filename preserving valid extension."""
    ext = os.path.splitext(original_filename)[1].lower()
    return f"{uuid.uuid4().hex}{ext}"


def validate_file_extension(filename: str) -> str:
    """Validate extension against permitted media types."""
    ext = os.path.splitext(filename)[1].lower().lstrip(".")
    if not ext or ext not in settings.allowed_extensions_set:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '.{ext}'. Allowed formats: {settings.ALLOWED_EXTENSIONS}"
        )
    return ext


def calculate_sha256(file_path: str) -> str:
    """Compute SHA-256 cryptographic digest of a file for forensic verification."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def ensure_safe_path(base_dir: str, target_filename: str) -> Path:
    """Ensure target path resolves strictly inside base_dir without traversal."""
    base_path = Path(base_dir).resolve()
    target_path = (base_path / target_filename).resolve()
    if not str(target_path).startswith(str(base_path)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Potential path traversal attempt detected."
        )
    return target_path

