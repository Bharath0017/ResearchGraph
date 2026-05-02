import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router


# =========================
# Create FastAPI App
# =========================

app = FastAPI(
    title="ResearchGraph API",
    version="1.0"
)


# =========================
# Enable CORS (React needs this)
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Register Routes
# =========================

app.include_router(router)


# =========================
# Root Endpoint
# =========================

@app.get("/")
def root():

    return {
        "message": "ResearchGraph API running"
    }