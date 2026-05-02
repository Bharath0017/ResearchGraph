**ResearchGraph — Local Dev README**

This README explains the full development flow for ResearchGraph: how to install, configure, run the backend and frontend, use Docker, run tests, and troubleshoot common issues.

**Repository Layout**
- **backend/**: FastAPI backend, Python code, data folders and scripts.
- **frontend/**: React + Vite frontend.
- **data/**: Local data (documents, images, audio, vector_store, graph).
- **docker-compose.yml**: Orchestration for services (if used).

Quick file references
- Backend entrypoint: [backend/app/main.py](backend/app/main.py)
- API routes: [backend/app/api/routes.py](backend/app/api/routes.py)
- Backend start scripts: [backend/start_server.sh](backend/start_server.sh) and [start_backend.bat](start_backend.bat)
- Frontend entrypoint: [frontend/src/main.jsx](frontend/src/main.jsx)

**Prerequisites**
- Git
- Python 3.10+ (recommended)
- Node.js 18+ and npm
- (Optional) WSL2 on Windows if you prefer the included Linux venv and helper scripts
- (Optional) Docker & docker-compose if you want containerized runs

---

**Backend — Setup & Run**

1) Create and activate a Python virtual environment (Windows example):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # PowerShell
```

2) Install dependencies:

```powershell
pip install -r requirements.txt
```

3) Configure environment variables (optional):
- The project reads settings from `app/config.py` and environment variables. If you need to customize directories or API keys, create a `.env` file in `backend/` with the required keys (example keys: PINECONE_API_KEY, OLLAMA_MODEL, etc.).

4) Run the backend (Windows venv):

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

OR use WSL (project includes `venv` created for WSL):

```bash
# from Windows PowerShell you can drive WSL:
wsl bash -ic "cd /mnt/c/Users/HP/Downloads/researchgraph/researchgraph/backend && source venv/bin/activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
```

Notes:
- If you see rapid restarts when using `start_backend.bat` or `start_server.sh`, run uvicorn manually in a WSL shell to capture the exact Python traceback — see Troubleshooting below.
- The backend exposes endpoints used by the frontend (root `/`, `/stats`, `/query`, `/upload`, `/build-index`, `/graph`).

---

**Frontend — Setup & Run**

1) Install dependencies:

```bash
cd frontend
npm install
```

2) Start dev server:

```bash
npm run dev
# By default Vite serves on http://localhost:5173
```

3) API URL configuration
- The frontend is configured to call `http://127.0.0.1:8000` (see `frontend/src/App.jsx`): change `API_URL` if your backend binds to a different host/port.

---

**Docker (optional)**

- The repo contains `docker-compose.yml` for orchestrating services. Use Docker if you prefer containers rather than local venvs.
- Example:

```bash
docker compose up --build
```

Adjust Dockerfiles and compose services as needed (environment variables, volumes for `data/`).

---

**Testing**

- Backend tests: run pytest inside the `backend/` environment:

```bash
cd backend
pytest -q
```

- Frontend tests: run `npm test` (project uses Vitest/React Testing Library) or `npm run lint`.

---

**Troubleshooting**

- Backend repeatedly starts and stops
  - Run uvicorn directly in the same environment (avoid wrapper scripts) and inspect stdout/stderr for tracebacks:

```bash
# WSL example (runs the Linux venv that's already in the repo):
wsl bash -ic "cd /mnt/c/Users/HP/Downloads/researchgraph/researchgraph/backend && source venv/bin/activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level debug"
```

- Backend import errors
  - Run a small import test to show errors quickly:

```bash
python -c "import importlib; importlib.import_module('app.main'); print('IMPORT_OK')"
```

- Frontend cannot reach backend
  - Confirm backend is listening on 127.0.0.1:8000; if running in WSL bind to 0.0.0.0 and use Windows localhost to reach it.
  - Ensure `API_URL` in [frontend/src/App.jsx](frontend/src/App.jsx) matches the backend address.

- Docker issues
  - Ensure ports are mapped and any services the backend depends on (Pinecone, Ollama, etc.) are reachable or mocked.

---

**Common Commands Summary**

- Backend install:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or .\.venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
```

- Run backend (dev):

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Run frontend (dev):

```bash
cd frontend
npm install
npm run dev
```

---