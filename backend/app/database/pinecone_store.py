import os
from pinecone import Pinecone
from app.config import settings


class PineconeStore:

    def __init__(self):
        try:
            self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            self.index_name = os.getenv("PINECONE_INDEX_NAME")
            self.index = self.pc.Index(self.index_name)
            self._available = True
        except Exception as e:
            print(f"Pinecone init failed: {e}")
            self._available = False

    def upsert_embeddings(self, embeddings, chunks):
        if not self._available:
            print("Pinecone unavailable, skipping upsert")
            return

        vectors = []
        for i, emb in enumerate(embeddings):
            if not emb or len(emb) == 0:
                continue
            vectors.append({
                "id": str(i),
                "values": emb,
                "metadata": {"text": chunks[i]["content"][:1000]}
            })

        batch_size = 100
        for i in range(0, len(vectors), batch_size):
            try:
                self.index.upsert(vectors=vectors[i:i + batch_size])
            except Exception as e:
                print(f"Upsert batch {i} error: {e}")

    def query(self, query_embedding, k=5):
        if not self._available:
            return []

        try:
            results = self.index.query(
                vector=query_embedding,
                top_k=k,
                include_metadata=True
            )
            retrieved = []
            for match in results.get("matches", []):
                text = match.get("metadata", {}).get("text", "")
                if text:
                    retrieved.append({"content": text})
            return retrieved
        except Exception as e:
            print(f"Pinecone query error: {e}")
            return []