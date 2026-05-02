import os

from app.graph.entities import EntityExtractor
from app.graph.relationships import RelationshipExtractor
from app.graph.builder import GraphBuilder
from app.database.graph_store import GraphStore
from app.document.loader import DocumentLoader
from app.document.chunker import DocumentChunker
from app.rag.embeddings import EmbeddingModel
from app.database.pinecone_store import PineconeStore
from app.rag.retriever import Retriever
from app.models.llm import LLMModel
from app.document.parser import DocumentParser
from app.multimodal.image_processor import ImageProcessor
from app.document.table_parser import TableParser
from app.multimodal.clip_embeddings import CLIPEmbedding
from app.multimodal.audio_processor import AudioProcessor
from app.multimodal.audio_embeddings import AudioEmbedding


class RAGPipeline:
    """
    Full Multimodal Graph RAG Pipeline.
    All heavy components are initialized lazily on first use
    to prevent server crashes at startup.
    """

    def __init__(self):
        print("RAGPipeline ready (lazy mode)")
        # Lightweight components only — no heavy models loaded here
        self._loader = None
        self._chunker = None
        self._embedder = None
        self._vector_store = None
        self._retriever = None
        self._llm = None
        self._parser = None
        self._image_processor = None
        self._table_parser = None
        self._clip_embedder = None
        self._audio_processor = None
        self._audio_embedder = None
        self._entity_extractor = None
        self._relationship_extractor = None
        self._graph_builder = None
        self._graph_store = None

    # ── Lazy accessors ──────────────────────────────────────────────

    @property
    def loader(self):
        if self._loader is None:
            self._loader = DocumentLoader()
        return self._loader

    @property
    def chunker(self):
        if self._chunker is None:
            self._chunker = DocumentChunker()
        return self._chunker

    @property
    def embedder(self):
        if self._embedder is None:
            self._embedder = EmbeddingModel()
        return self._embedder

    @property
    def vector_store(self):
        if self._vector_store is None:
            self._vector_store = PineconeStore()
        return self._vector_store

    @property
    def retriever(self):
        if self._retriever is None:
            self._retriever = Retriever()
        return self._retriever

    @property
    def llm(self):
        if self._llm is None:
            self._llm = LLMModel()
        return self._llm

    @property
    def parser(self):
        if self._parser is None:
            self._parser = DocumentParser()
        return self._parser

    @property
    def image_processor(self):
        if self._image_processor is None:
            self._image_processor = ImageProcessor()
        return self._image_processor

    @property
    def table_parser(self):
        if self._table_parser is None:
            self._table_parser = TableParser()
        return self._table_parser

    @property
    def clip_embedder(self):
        if self._clip_embedder is None:
            self._clip_embedder = CLIPEmbedding()
        return self._clip_embedder

    @property
    def audio_processor(self):
        if self._audio_processor is None:
            self._audio_processor = AudioProcessor()
        return self._audio_processor

    @property
    def audio_embedder(self):
        if self._audio_embedder is None:
            self._audio_embedder = AudioEmbedding()
        return self._audio_embedder

    @property
    def entity_extractor(self):
        if self._entity_extractor is None:
            self._entity_extractor = EntityExtractor()
        return self._entity_extractor

    @property
    def relationship_extractor(self):
        if self._relationship_extractor is None:
            self._relationship_extractor = RelationshipExtractor()
        return self._relationship_extractor

    @property
    def graph_builder(self):
        if self._graph_builder is None:
            self._graph_builder = GraphBuilder()
        return self._graph_builder

    @property
    def graph_store(self):
        if self._graph_store is None:
            self._graph_store = GraphStore()
        return self._graph_store

    # ── Build Index ──────────────────────────────────────────────────

    def build_index(self):
        """Build multimodal index + knowledge graph."""

        print("Starting multimodal index build...")

        # STEP 1 - Load documents
        print("Loading documents...")
        documents = self.loader.load_all_documents()
        print(f"Loaded {len(documents)} documents")

        # STEP 2 - Chunk text
        print("Chunking text...")
        all_chunks = self.chunker.chunk_documents(documents)
        print(f"Created {len(all_chunks)} text chunks")

        # STEP 3 - Image processing
        print("Processing images...")
        image_explanations = self.image_processor.explain_all_images()
        print(f"Processed {len(image_explanations)} images")

        # STEP 4 - Audio processing
        print("Processing audio files...")
        extracted_audio = self.audio_processor.process_audio_files()
        audio_chunks = [
            {
                "content": f"Audio content from {a['source']}",
                "metadata": {"source": a["source"], "type": "audio"}
            }
            for a in extracted_audio
        ]
        print(f"Processed {len(audio_chunks)} audio files")

        # STEP 5 - Text embeddings
        print("Generating text embeddings...")
        text_embeddings = self.embedder.embed_documents(all_chunks)
        print(f"Generated {len(text_embeddings)} text embeddings")

        # STEP 6 - CLIP image embeddings
        print("Generating CLIP embeddings...")
        clip_data = self.clip_embedder.embed_all_images()
        clip_chunks = [
            {"content": f"Image content from {i['source']}",
             "metadata": {"source": i["source"], "type": "image"}}
            for i in clip_data
        ]
        clip_vectors = [i["embedding"] for i in clip_data]
        print(f"Added {len(clip_chunks)} CLIP embeddings")

        # STEP 7 - Audio embeddings
        print("Generating audio embeddings...")
        audio_vectors = [
            self.audio_embedder.embed_audio(a["path"])
            for a in extracted_audio
        ]
        print(f"Generated {len(audio_vectors)} audio embeddings")

        # STEP 8 - Combine all
        combined_embeddings = text_embeddings + clip_vectors + audio_vectors
        combined_chunks = all_chunks + clip_chunks + audio_chunks
        print(f"Total vectors: {len(combined_embeddings)}")

        # STEP 9 - Store in Pinecone
        print("Uploading to Pinecone...")
        self.vector_store.upsert_embeddings(combined_embeddings, combined_chunks)
        print("Pinecone upload complete")

        # STEP 10 - Build Knowledge Graph
        print("Building Knowledge Graph...")
        entities = self.entity_extractor.extract_from_chunks(combined_chunks)
        print(f"Extracted {len(entities)} entities")

        relationships = self.relationship_extractor.create_relationships(entities)
        print(f"Created {len(relationships)} relationships")

        self.graph_builder.add_entities(entities)
        self.graph_builder.add_relationships(relationships)
        graph = self.graph_builder.get_graph()
        self.graph_store.save_graph(graph)
        print("Knowledge graph saved successfully")

        print("FULL INDEX BUILD COMPLETE")

    # ── Query ────────────────────────────────────────────────────────

    def query(self, user_query):
        """Graph-aware Query Pipeline."""

        print("Running Graph-aware Query...")

        # STEP 1 - Load Graph
        graph = self.graph_store.load_graph()
        graph_context = ""

        if graph is not None:
            print("Graph loaded")
            query_entities = self.entity_extractor.extract_entities(user_query)
            print(f"Query entities: {query_entities}")

            related_nodes = set()
            for entity in query_entities:
                if entity in graph:
                    for n in graph.neighbors(entity):
                        related_nodes.add(n)

            if related_nodes:
                graph_context = "Related concepts: " + ", ".join(list(related_nodes)[:20])
                print(f"Graph context added: {graph_context}")

        # STEP 2 - Retrieve
        retrieved_chunks = self.retriever.retrieve(user_query)

        # STEP 3 - Combine context
        final_context = []
        if graph_context:
            final_context.append({"content": graph_context})
        final_context.extend(retrieved_chunks)

        # STEP 4 - Generate answer
        answer = self.llm.generate_answer(user_query, final_context)
        return answer