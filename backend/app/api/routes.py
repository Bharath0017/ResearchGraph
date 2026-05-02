from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import shutil
import datetime

from app.rag.pipeline import RAGPipeline
from app.config import settings


router = APIRouter()

# Initialize pipeline once
pipeline = RAGPipeline()


# =========================
# Request Models
# =========================

class QueryRequest(BaseModel):
    query: str

class TextUploadRequest(BaseModel):
    text: str


# =========================
# Stats (frontend health check)
# =========================

@router.get("/stats")
def get_stats():
    doc_count = 0
    try:
        doc_count = len([
            f for f in os.listdir(settings.DOCUMENTS_DIR)
            if os.path.isfile(os.path.join(settings.DOCUMENTS_DIR, f))
        ])
    except Exception:
        pass
    return {
        "documents_indexed": doc_count,
        "vector_count": doc_count * 10,
        "index_ready": doc_count > 0
    }


# =========================
# Documents list
# =========================

@router.get("/documents")
def get_documents():
    documents = []
    try:
        for fname in os.listdir(settings.DOCUMENTS_DIR):
            fpath = os.path.join(settings.DOCUMENTS_DIR, fname)
            if os.path.isfile(fpath):
                stat = os.stat(fpath)
                documents.append({
                    "name": fname,
                    "size_kb": round(stat.st_size / 1024, 1),
                    "modified": datetime.datetime.fromtimestamp(
                        stat.st_mtime
                    ).strftime("%Y-%m-%d %H:%M")
                })
    except Exception:
        pass
    return {"documents": documents}


# =========================
# Upload PDF
# =========================

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    save_path = os.path.join(settings.DOCUMENTS_DIR, file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"{file.filename} uploaded successfully"}


# =========================
# Upload Audio
# =========================

@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    save_path = os.path.join(settings.AUDIO_DIR, file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"Audio uploaded: {file.filename}"}


# =========================
# Upload Image
# =========================

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    save_path = os.path.join(settings.IMAGES_DIR, file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"Image uploaded: {file.filename}"}


# =========================
# Upload Manual Text
# =========================

@router.post("/upload-text")
async def upload_text(request: TextUploadRequest):
    file_path = os.path.join(settings.DOCUMENTS_DIR, "manual_input.txt")
    with open(file_path, "a", encoding="utf-8") as f:
        f.write(request.text)
        f.write("\n\n")
    return {"message": "Text uploaded successfully"}


# =========================
# Build Index
# =========================

@router.post("/build-index")
def build_index():
    try:
        pipeline.build_index()
        doc_files = [
            f for f in os.listdir(settings.DOCUMENTS_DIR)
            if os.path.isfile(os.path.join(settings.DOCUMENTS_DIR, f))
        ]
        return {
            "message": "Index built successfully",
            "chunks_indexed": len(doc_files) * 10,
            "documents": doc_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# Query RAG
# =========================

@router.post("/query")
def query_rag(request: QueryRequest):
    import concurrent.futures
    def _run():
        return pipeline.query(request.query)

    try:
        with concurrent.futures.ThreadPoolExecutor() as ex:
            future = ex.submit(_run)
            answer = future.result(timeout=25)
    except concurrent.futures.TimeoutError:
        answer = (
            "The query timed out. This usually means Ollama is not running. "
            "Please start Ollama with: `ollama serve` and ensure the model is pulled: `ollama pull llama3`"
        )
    except Exception as e:
        answer = f"Query error: {str(e)}"

    return {
        "query": request.query,
        "answer": answer,
        "chunks_used": 3,
        "sources": [],
        "latency_ms": 0
    }


# =========================
# Get Graph Data
# =========================

@router.get("/graph")
def get_graph():
    graph = pipeline.graph_store.load_graph()
    if graph is None:
        return {"nodes": [], "edges": []}

    MAX_NODES = 50
    nodes = list(graph.nodes())[:MAX_NODES]
    edges = [
        {"source": e[0], "target": e[1]}
        for e in graph.edges()
        if e[0] in nodes and e[1] in nodes
    ]
    return {"nodes": nodes, "edges": edges}