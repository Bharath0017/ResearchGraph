import os

# =========================
# Graph Imports
# =========================

from app.graph.entities import EntityExtractor
from app.graph.relationships import RelationshipExtractor
from app.graph.builder import GraphBuilder
from app.database.graph_store import GraphStore

# =========================
# Core Modules
# =========================

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

# =========================
# Audio Modules
# =========================

from app.multimodal.audio_processor import AudioProcessor
from app.multimodal.audio_embeddings import AudioEmbedding


class RAGPipeline:

    """
    Full Multimodal Graph RAG Pipeline
    """

    def __init__(self):

        print(" Initializing RAG Pipeline...")

        # Core components

        self.loader = DocumentLoader()

        self.chunker = DocumentChunker()

        self.embedder = EmbeddingModel()

        self.vector_store = PineconeStore()

        self.retriever = Retriever()

        self.llm = LLMModel()

        self.parser = DocumentParser()

        self.image_processor = ImageProcessor()

        self.table_parser = TableParser()

        self.clip_embedder = CLIPEmbedding()

        # Audio modules

        self.audio_processor = AudioProcessor()

        self.audio_embedder = AudioEmbedding()

        # Graph components

        self.entity_extractor = EntityExtractor()

        self.relationship_extractor = (
            RelationshipExtractor()
        )

        self.graph_builder = GraphBuilder()

        self.graph_store = GraphStore()

        print(" Pipeline initialized successfully")



    def build_index(self):

        """
        Build multimodal index
        + build knowledge graph
        """

        print("\n Starting multimodal index build...")


        # STEP 1  LOAD DOCUMENTS

        print("\n Loading documents...")

        documents = (
            self.loader.load_all_documents()
        )

        print(
            f" Loaded {len(documents)} documents"
        )


        # STEP 2  CHUNK TEXT

        print("\n Chunking text...")

        all_chunks = (
            self.chunker.chunk_documents(
                documents
            )
        )

        print(
            f" Created {len(all_chunks)} text chunks"
        )


        # STEP 3  IMAGE PROCESSING

        print("\n Processing images...")

        image_explanations = (
            self.image_processor
            .explain_all_images()
        )

        print(
            f" Processed {len(image_explanations)} images"
        )


        # STEP 4  AUDIO PROCESSING

        print("\n Processing audio files...")

        extracted_audio = (
            self.audio_processor
            .process_audio_files()
        )

        audio_chunks = []

        for audio in extracted_audio:

            audio_chunks.append({

                "content":
                f"Audio content from {audio['source']}",

                "metadata": {
                    "source": audio["source"],
                    "type": "audio"
                }

            })

        print(
            f" Processed {len(audio_chunks)} audio files"
        )


        # STEP 5  TEXT EMBEDDINGS

        print("\n Generating text embeddings...")

        text_embeddings = (
            self.embedder.embed_documents(
                all_chunks
            )
        )

        print(
            f" Generated {len(text_embeddings)} text embeddings"
        )


        # STEP 6  IMAGE EMBEDDINGS

        print("\n Generating CLIP embeddings...")

        clip_data = (
            self.clip_embedder
            .embed_all_images()
        )

        clip_chunks = []

        clip_vectors = []

        for item in clip_data:

            clip_chunks.append({

                "content":
                f"Image content from {item['source']}",

                "metadata": {
                    "source": item["source"],
                    "type": "image"
                }

            })

            clip_vectors.append(
                item["embedding"]
            )

        print(
            f" Added {len(clip_chunks)} CLIP embeddings"
        )


        # STEP 7  AUDIO EMBEDDINGS

        print("\n Generating audio embeddings...")

        audio_vectors = []

        for audio in extracted_audio:

            emb = (
                self.audio_embedder
                .embed_audio(
                    audio["path"]
                )
            )

            audio_vectors.append(emb)

        print(
            f" Generated {len(audio_vectors)} audio embeddings"
        )


        # STEP 8  COMBINE ALL

        print("\n Combining embeddings...")

        combined_embeddings = []

        combined_chunks = []

        combined_embeddings.extend(
            text_embeddings
        )

        combined_chunks.extend(
            all_chunks
        )

        combined_embeddings.extend(
            clip_vectors
        )

        combined_chunks.extend(
            clip_chunks
        )

        combined_embeddings.extend(
            audio_vectors
        )

        combined_chunks.extend(
            audio_chunks
        )

        print(
            f" Total vectors: {len(combined_embeddings)}"
        )


        # STEP 9  STORE IN PINECONE

        print("\n Uploading to Pinecone...")

        self.vector_store.upsert_embeddings(
            combined_embeddings,
            combined_chunks
        )

        print(" Pinecone upload complete")


        # STEP 10  GRAPH BUILDING

        print("\n Building Knowledge Graph...")

        entities = (
            self.entity_extractor
            .extract_from_chunks(
                combined_chunks
            )
        )

        print(
            f" Extracted {len(entities)} entities"
        )

        relationships = (
            self.relationship_extractor
            .create_relationships(
                entities
            )
        )

        print(
            f" Created {len(relationships)} relationships"
        )

        self.graph_builder.add_entities(
            entities
        )

        self.graph_builder.add_relationships(
            relationships
        )

        graph = (
            self.graph_builder.get_graph()
        )

        self.graph_store.save_graph(
            graph
        )

        print(
            " Knowledge graph saved successfully"
        )

        print("\n FULL INDEX BUILD COMPLETE")



    def query(self, user_query):

        """
        Graph-aware Query Pipeline
        """

        print("\n Running Graph-aware Query...")


        # STEP 1  Load Graph

        graph = self.graph_store.load_graph()

        graph_context = ""

        if graph is not None:

            print(" Graph loaded")

            query_entities = (
                self.entity_extractor
                .extract_entities(user_query)
            )

            print(
                f" Query entities: {query_entities}"
            )

            related_nodes = set()

            for entity in query_entities:

                if entity in graph:

                    neighbors = graph.neighbors(
                        entity
                    )

                    for n in neighbors:

                        related_nodes.add(n)

            if related_nodes:

                graph_context = (
                    "Related concepts: "
                    + ", ".join(
                        list(related_nodes)[:20]
                    )
                )

                print(
                    f" Graph context added: {graph_context}"
                )


        # STEP 2  Retrieve

        retrieved_chunks = (
            self.retriever.retrieve(
                user_query
            )
        )


        # STEP 3  Combine Context

        final_context = []

        if graph_context:

            final_context.append({

                "content": graph_context

            })

        final_context.extend(
            retrieved_chunks
        )


        # STEP 4  Generate Answer

        answer = (
            self.llm.generate_answer(
                user_query,
                final_context
            )
        )

        return answer