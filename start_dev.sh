#!/usr/bin/env bash
# VerifAI - Local Development Launcher for Linux / macOS

set -e

echo "========================================================"
echo "   VerifAI - Multimodal Deepfake Detection Platform"
echo "========================================================"
echo ""

if [ ! -d ".venv" ]; then
    echo "[ERROR] Virtual environment .venv not found!"
    echo "Please run: python3 -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt"
    exit 1
fi

echo "[1/2] Starting Backend API Server..."
source .venv/bin/activate
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "[2/2] Starting Frontend Vite Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo " VerifAI is running!"
echo " - Frontend UI:  http://localhost:5173"
echo " - API Swagger:  http://127.0.0.1:8000/docs"
echo "========================================================"
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait

