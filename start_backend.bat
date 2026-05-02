@echo off
title ResearchGraph Backend Server
color 0A
echo =============================================
echo   ResearchGraph Backend - Auto-Restart Mode
echo =============================================
echo.

:START
echo [%time%] Starting server...
wsl bash -c "cd /mnt/c/Users/HP/Downloads/researchgraph/researchgraph/backend && source venv/bin/activate && pkill -9 -f uvicorn 2>/dev/null; sleep 1 && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo.
echo [%time%] Server stopped. Restarting in 3 seconds...
echo   (Press Ctrl+C to stop)
timeout /t 3 /nobreak >nul
goto START
