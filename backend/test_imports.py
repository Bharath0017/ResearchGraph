import sys

print("Testing imports...")
try:
    print("Importing EntityExtractor...")
    from app.graph.entities import EntityExtractor
    print("Importing RelationshipExtractor...")
    from app.graph.relationships import RelationshipExtractor
    print("Importing GraphBuilder...")
    from app.graph.builder import GraphBuilder
    print("Importing GraphStore...")
    from app.database.graph_store import GraphStore
    print("Importing DocumentLoader...")
    from app.document.loader import DocumentLoader
    print("Importing DocumentChunker...")
    from app.document.chunker import DocumentChunker
    print("Importing EmbeddingModel...")
    from app.rag.embeddings import EmbeddingModel
    print("Importing PineconeStore...")
    from app.database.pinecone_store import PineconeStore
    print("Importing Retriever...")
    from app.rag.retriever import Retriever
    print("Importing LLMModel...")
    from app.models.llm import LLMModel
    print("Importing DocumentParser...")
    from app.document.parser import DocumentParser
    print("Importing ImageProcessor...")
    from app.multimodal.image_processor import ImageProcessor
    print("Importing TableParser...")
    from app.document.table_parser import TableParser
    print("Importing CLIPEmbedding...")
    from app.multimodal.clip_embeddings import CLIPEmbedding
    print("Importing AudioProcessor...")
    from app.multimodal.audio_processor import AudioProcessor
    print("Importing AudioEmbedding...")
    from app.multimodal.audio_embeddings import AudioEmbedding
    print("ALL IMPORTS SUCCESSFUL")
except Exception as e:
    print(f"Exception: {e}")
