import json
import urllib.request
from app.config import settings


class EmbeddingModel:
    """
    Text embedding model using Ollama via urllib.
    Falls back to zero vectors if Ollama is unavailable.
    """

    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self.target_dimension = 512
        self.timeout = 10  # seconds per embedding call

    def embed_query(self, text):
        result = self.embed_documents([{"content": text}])
        return result[0]

    def embed_documents(self, documents):
        texts = []
        for doc in documents:
            if isinstance(doc, dict):
                texts.append(doc.get("content", "")[:1000])  # limit text length
            else:
                texts.append(str(doc)[:1000])

        embeddings = []
        for text in texts:
            emb = self._embed_single(text)
            embeddings.append(emb)

        return embeddings

    def _embed_single(self, text):
        """Embed one text, return zero vector on failure."""
        try:
            url = "http://localhost:11434/api/embeddings"
            data = json.dumps({
                "model": self.model_name,
                "prompt": text
            }).encode("utf-8")
            req = urllib.request.Request(
                url, data=data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                res = json.loads(response.read().decode("utf-8"))
                emb = res.get("embedding", [])
                if len(emb) > self.target_dimension:
                    emb = emb[:self.target_dimension]
                return emb
        except Exception as e:
            print(f"Embedding error (returning zeros): {e}")
            return [0.0] * self.target_dimension