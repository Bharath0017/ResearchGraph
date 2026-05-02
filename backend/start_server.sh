#!/bin/bash
# start_server.sh - Reliable server start script
cd /mnt/c/Users/HP/Downloads/researchgraph/researchgraph/backend
source venv/bin/activate

echo "Killing any existing server on port 8000..."
fuser -k 8000/tcp 2>/dev/null
sleep 1

echo "Starting ResearchGraph backend..."
while true; do
    python3 -m uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --workers 1 \
        --timeout-keep-alive 30
    echo "Server stopped. Restarting in 2s..."
    sleep 2
done
