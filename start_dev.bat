@echo off
title VerifAI - Multimodal Media Forensics Platform
echo ========================================================
echo    VerifAI - Multimodal Deepfake Detection Platform
echo ========================================================
echo.

if not exist .venv (
    echo [ERROR] Virtual environment .venv not found!
    echo Please run: python -m venv .venv ^&^& .\.venv\Scripts\pip install -r backend\requirements.txt
    pause
    exit /b 1
)

echo [1/2] Starting Backend API Server (http://127.0.0.1:8000)...
start "VerifAI Backend" cmd /k ".\.venv\Scripts\activate.bat && uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000"

echo [2/2] Starting Frontend Vite Server (http://localhost:5173)...
start "VerifAI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  VerifAI is running!
echo  - Frontend UI:  http://localhost:5173
echo  - API Swagger:  http://127.0.0.1:8000/docs
echo ========================================================
echo.
