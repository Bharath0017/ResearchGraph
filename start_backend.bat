@echo off
title ResearchGraph Full Stack
color 0B
echo =============================================
echo   ResearchGraph Ecosystem - Launching
echo =============================================
echo.

:: 1. Launch Backend in a new window with Auto-Restart
echo [*] Starting Backend (WSL/FastAPI) in a separate window...
start "ResearchGraph Backend" cmd /c "echo Backend Server starting... && :LOOP && wsl bash -c \"cd /mnt/c/Users/HP/Downloads/researchgraph/researchgraph/backend && source venv/bin/activate && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000\" && echo Backend crashed. Restarting in 3s... && timeout /t 3 && goto LOOP"

:: 2. Launch Frontend in the current window
echo [*] Starting Frontend (Vite/React)...
cd frontend
npm run dev

pause
