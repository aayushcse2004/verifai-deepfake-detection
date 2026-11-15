import os
import shutil
import subprocess
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import psutil

from backend.app.database.session import get_db
from backend.app.models.analysis import AnalysisJob
from backend.app.core.config import settings
from backend.app.core.logging import logger

router = APIRouter()


def get_nvidia_gpu_metrics() -> Optional[Dict[str, Any]]:
    """Query live NVIDIA GPU metrics using nvidia-smi CLI."""
    try:
        cmd = [
            "nvidia-smi",
            "--query-gpu=name,driver_version,utilization.gpu,memory.used,memory.total,temperature.gpu",
            "--format=csv,noheader,nounits"
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=3)
        if result.returncode == 0 and result.stdout.strip():
            line = result.stdout.strip().split("\n")[0]
            parts = [p.strip() for p in line.split(",")]
            if len(parts) >= 6:
                name, driver, util_gpu, mem_used, mem_total, temp = parts[:6]
                mem_used_f = float(mem_used)
                mem_total_f = float(mem_total)
                mem_pct = round((mem_used_f / mem_total_f) * 100, 1) if mem_total_f > 0 else 0.0

                return {
                    "available": True,
                    "name": name,
                    "driver_version": driver,
                    "utilization_pct": float(util_gpu),
                    "memory_used_mb": mem_used_f,
                    "memory_total_mb": mem_total_f,
                    "memory_usage_pct": mem_pct,
                    "temperature_c": float(temp),
                    "cuda_compatible": True
                }
    except Exception as e:
        logger.debug(f"nvidia-smi probe: {e}")

    # Check via PyTorch if torch is available
    try:
        import torch
        if torch.cuda.is_available():
            dev_idx = 0
            dev_name = torch.cuda.get_device_name(dev_idx)
            mem_alloc = torch.cuda.memory_allocated(dev_idx) / (1024 * 1024)
            mem_res = torch.cuda.memory_reserved(dev_idx) / (1024 * 1024)
            return {
                "available": True,
                "name": dev_name,
                "driver_version": "CUDA Driver",
                "utilization_pct": 0.0,
                "memory_used_mb": round(mem_alloc, 1),
                "memory_total_mb": round(mem_res, 1),
                "memory_usage_pct": round((mem_alloc / max(1.0, mem_res)) * 100, 1),
                "temperature_c": 0.0,
                "cuda_compatible": True
            }
    except Exception:
        pass

    return None


@router.get("/monitor")
def get_system_monitor(db: Session = Depends(get_db)):
    """
    Real-time system telemetry endpoint returning live CPU, RAM, Disk,
    NVIDIA GPU metrics, and active investigation queue depth.
    """
    # 1. CPU Telemetry
    cpu_percent = psutil.cpu_percent(interval=None)
    cpu_count_logical = psutil.cpu_count(logical=True)
    cpu_count_physical = psutil.cpu_count(logical=False) or cpu_count_logical

    # 2. RAM Telemetry
    vm = psutil.virtual_memory()
    ram_total_gb = round(vm.total / (1024 ** 3), 2)
    ram_used_gb = round(vm.used / (1024 ** 3), 2)
    ram_percent = vm.percent

    # 3. Disk Telemetry
    disk = psutil.disk_usage(os.path.abspath(settings.UPLOAD_DIR))
    disk_total_gb = round(disk.total / (1024 ** 3), 2)
    disk_used_gb = round(disk.used / (1024 ** 3), 2)
    disk_free_gb = round(disk.free / (1024 ** 3), 2)
    disk_percent = disk.percent

    # 4. GPU Telemetry
    gpu_metrics = get_nvidia_gpu_metrics()

    # 5. Workload / Queue Metrics
    active_jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "PROCESSING").count()
    queued_jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "PENDING").count()
    completed_jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "COMPLETED").count()
    failed_jobs = db.query(AnalysisJob).filter(AnalysisJob.status == "FAILED").count()

    return {
        "status": "healthy",
        "cpu": {
            "utilization_pct": cpu_percent,
            "cores_logical": cpu_count_logical,
            "cores_physical": cpu_count_physical
        },
        "memory": {
            "total_gb": ram_total_gb,
            "used_gb": ram_used_gb,
            "utilization_pct": ram_percent
        },
        "disk": {
            "total_gb": disk_total_gb,
            "used_gb": disk_used_gb,
            "free_gb": disk_free_gb,
            "utilization_pct": disk_percent,
            "storage_path": os.path.abspath(settings.UPLOAD_DIR)
        },
        "gpu": gpu_metrics if gpu_metrics else {
            "available": False,
            "name": "N/A (CPU Mode)",
            "driver_version": "N/A",
            "utilization_pct": 0.0,
            "memory_used_mb": 0.0,
            "memory_total_mb": 0.0,
            "memory_usage_pct": 0.0,
            "temperature_c": 0.0,
            "cuda_compatible": False
        },
        "workload": {
            "active_investigations": active_jobs,
            "queued_investigations": queued_jobs,
            "completed_investigations": completed_jobs,
            "failed_investigations": failed_jobs,
            "total_processed": completed_jobs + failed_jobs
        }
    }

