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


def validate_file_signature(file_path: str, ext: str) -> bool:
    """
    Validate binary magic bytes against declared extension to prevent MIME-type spoofing
    and malicious payload execution under false forensic extensions.
    """
    ext = ext.lower().lstrip(".")
    if not os.path.exists(file_path) or os.path.getsize(file_path) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty or corrupted."
        )

    with open(file_path, "rb") as f:
        header = f.read(32)

    # Magic byte signatures
    is_valid = False
    if ext in ("mp4", "mov"):
        # MP4/MOV ISO Base Media File Format: 'ftyp', 'moov', 'mdat'
        is_valid = (
            len(header) >= 8 and (
                header[4:8] in (b"ftyp", b"moov", b"mdat", b"wide", b"free")
                or header[0:4] in (b"moov", b"mdat")
            )
        )
    elif ext in ("mkv", "webm"):
        # Matroska / WebM EBML header
        is_valid = header.startswith(b"\x1a\x45\xdf\xa3")
    elif ext == "avi":
        # RIFF ... AVI
        is_valid = len(header) >= 12 and header.startswith(b"RIFF") and header[8:12] == b"AVI "
    elif ext == "wav":
        # RIFF ... WAVE
        is_valid = len(header) >= 12 and header.startswith(b"RIFF") and header[8:12] == b"WAVE"
    elif ext == "mp3":
        # ID3 header or MPEG sync word
        is_valid = header.startswith(b"ID3") or (len(header) >= 2 and header[0] == 0xFF and (header[1] & 0xE0) == 0xE0)
    elif ext == "flac":
        is_valid = header.startswith(b"fLaC")
    elif ext == "aac":
        is_valid = len(header) >= 2 and header[0] == 0xFF and (header[1] & 0xF0) == 0xF0
    elif ext == "ogg":
        is_valid = header.startswith(b"OggS")
    elif ext == "png":
        is_valid = header.startswith(b"\x89PNG\r\n\x1a\n")
    elif ext in ("jpg", "jpeg"):
        is_valid = header.startswith(b"\xff\xd8\xff")
    elif ext == "webp":
        is_valid = len(header) >= 12 and header.startswith(b"RIFF") and header[8:12] == b"WEBP"
    else:
        # Fallback for unrecognized extension
        is_valid = False

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security violation: File header does not match expected binary signature for extension '.{ext}'."
        )

    return True


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

