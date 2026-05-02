import os
from dotenv import load_dotenv

CURRENT_FILE = os.path.abspath(__file__)
APP_DIR = os.path.dirname(CURRENT_FILE)
BACKEND_DIR = os.path.dirname(APP_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

# Load .env from project root
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))


class Settings:

    """
    Central configuration.
    Handles all paths and settings.
    """

    CURRENT_FILE = CURRENT_FILE
    APP_DIR = APP_DIR
    BACKEND_DIR = BACKEND_DIR
    PROJECT_ROOT = PROJECT_ROOT

    # =========================
    # DATA PATHS
    # =========================

    DATA_DIR = os.path.join(PROJECT_ROOT, "data")

    DOCUMENTS_DIR = os.path.join(
        DATA_DIR,
        "documents"
    )

    IMAGES_DIR = os.path.join(
        DATA_DIR,
        "images"
    )

    TABLES_DIR = os.path.join(
        DATA_DIR,
        "tables"
    )

    AUDIO_DIR = os.path.join(
        DATA_DIR,
        "audio"
    )

    VECTOR_STORE_DIR = os.path.join(
        DATA_DIR,
        "vector_store"
    )

    GRAPH_STORE_DIR = os.path.join(
        DATA_DIR,
        "graph"
    )

    # =========================
    # MODEL SETTINGS
    # =========================

    EMBEDDING_MODEL = "nomic-embed-text"

    LLM_MODEL = "llama3"

    MODEL_PROVIDER = "ollama"

    # =========================
    # CHUNK SETTINGS
    # =========================

    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200


settings = Settings()