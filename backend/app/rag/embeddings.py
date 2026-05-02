import json
import urllib.request
from app.config import settings

class EmbeddingModel:
    """
    Text embedding model using native urllib.
    """

    def __init__(self):
        print(" Loading text embedding model...")
        self.model_name = settings.EMBEDDING_MODEL
        self.target_dimension = 512
        print(" Text embedding model ready")

    def embed_query(self, text):
        return self.embed_documents([text])[0]

    def embed_documents(self, documents):

        texts = []

        for doc in documents:

            if isinstance(doc, dict):

                texts.append(
                    doc.get("content", "")
                )

            else:

                texts.append(str(doc))


        raw_embeddings = []
        for text in texts:
            try:
                url = "http://localhost:11434/api/embeddings"
                data = json.dumps({"model": self.model_name, "prompt": text}).encode("utf-8")
                req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req) as response:
                    res = json.loads(response.read().decode("utf-8"))
                    raw_embeddings.append(res.get("embedding", []))
            except Exception as e:
                print(f"Error embedding: {e}")
                raw_embeddings.append([0.0]*self.target_dimension)


        # =========================
        # TRUNCATE TO 512
        # =========================

        fixed_embeddings = []

        for emb in raw_embeddings:

            if len(emb) > self.target_dimension:

                emb = emb[:self.target_dimension]

            fixed_embeddings.append(emb)


        return fixed_embeddings