import os
from pinecone import Pinecone

from app.config import settings


class PineconeStore:

    def __init__(self):

        self.pc = Pinecone(
            api_key=os.getenv(
                "PINECONE_API_KEY"
            )
        )

        self.index_name = os.getenv(
            "PINECONE_INDEX_NAME"
        )

        self.index = self.pc.Index(
            self.index_name
        )


    def upsert_embeddings(
        self,
        embeddings,
        chunks
    ):

        vectors = []

        for i, emb in enumerate(
            embeddings
        ):

            vectors.append({

                "id": str(i),

                "values": emb,

                "metadata": {

                    "text":
                    chunks[i]["content"]

                }

            })

        batch_size = 100
        for i in range(0, len(vectors), batch_size):
            self.index.upsert(
                vectors=vectors[i:i + batch_size]
            )


    def query(
        self,
        query_embedding,
        k=5
    ):

        results = self.index.query(

            vector=query_embedding,

            top_k=k,

            include_metadata=True

        )

        retrieved = []

        for match in results["matches"]:

            retrieved.append({

                "content":
                match["metadata"]["text"]

            })

        return retrieved