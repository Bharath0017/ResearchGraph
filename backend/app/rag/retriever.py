from app.rag.embeddings import EmbeddingModel
from app.database.pinecone_store import PineconeStore


class Retriever:
    """
    Pinecone-based retriever
    """

    def __init__(self):

        # Embedding model
        self.embedder = EmbeddingModel()

        # Pinecone vector store
        self.vector_store = PineconeStore()

        # Must match Pinecone index dimension
        self.target_dimension = 512


    def retrieve(
        self,
        query,
        k=5
    ):
        """
        Retrieve top-k relevant chunks
        from Pinecone.
        """

        # =========================
        # Convert query to embedding
        # =========================

        query_embedding = self.embedder.embed_query(query)

        # =========================
        #  CRITICAL FIX
        # Match Pinecone dimension
        # =========================

        if len(query_embedding) > self.target_dimension:

            query_embedding = query_embedding[
                :self.target_dimension
            ]

        # =========================
        # Query Pinecone
        # =========================

        results = self.vector_store.query(
            query_embedding,
            k=k
        )

        return results