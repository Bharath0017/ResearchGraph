import json
import urllib.request
from app.config import settings


class LLMModel:
    """
    Handles response generation using local LLM (Ollama).
    Falls back gracefully if Ollama is not running.
    """

    def __init__(self):
        self.model_name = settings.LLM_MODEL
        self.ollama_url = "http://localhost:11434/api/generate"
        self.timeout = 20  # seconds

    def _check_ollama(self):
        """Quick check if Ollama is reachable."""
        try:
            with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=2) as r:
                return r.status == 200
        except Exception:
            return False

    def generate_answer(self, query, retrieved_chunks):
        """Generate answer from context. Graceful fallback if Ollama unavailable."""

        if not retrieved_chunks:
            return (
                "No relevant documents found in the knowledge base. "
                "Please upload documents and click **Build Knowledge Index** first."
            )

        context = "\n\n".join(
            chunk["content"][:500]  # limit each chunk to prevent huge prompts
            for chunk in retrieved_chunks[:5]
        )

        prompt = (
            "You are an intelligent research assistant.\n\n"
            f"Context from research documents:\n{context}\n\n"
            f"Question: {query}\n\n"
            "Answer clearly and concisely based on the context above:\n"
        )

        try:
            data = json.dumps({
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": 300}
            }).encode("utf-8")

            req = urllib.request.Request(
                self.ollama_url, data=data,
                headers={"Content-Type": "application/json"}
            )

            with urllib.request.urlopen(req, timeout=self.timeout) as res:
                response_data = json.loads(res.read().decode("utf-8"))
                answer = response_data.get("response", "").strip()
                if answer:
                    return answer

        except urllib.error.URLError:
            pass  # Ollama not running
        except Exception as e:
            print(f"LLM error: {e}")

        # Fallback: return context directly
        return (
            f"**Ollama is not running** — starting it would enable AI-generated answers.\n\n"
            f"Run: `ollama serve` then `ollama pull {self.model_name}`\n\n"
            f"**Relevant content found in your documents:**\n\n"
            + "\n\n---\n\n".join(
                f"> {chunk['content'][:300]}..."
                for chunk in retrieved_chunks[:3]
            )
        )