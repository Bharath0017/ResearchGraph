import json
import urllib.request
from app.config import settings

class LLMModel:
    """
    Handles response generation
    using local LLM (Ollama) via native urllib.
    """

    def __init__(self):
        self.model_name = settings.LLM_MODEL

    def generate_answer(
            self,
            query,
            retrieved_chunks
        ):

            """
            Generate multi-modal answer.
            """

            context = "\n\n".join(

                chunk["content"]

                for chunk in retrieved_chunks

            )

            prompt = f"""
        You are an intelligent research assistant.

        Use the provided context to answer the question.

        The context may contain:

        - Text explanations
        - Image descriptions
        - Table data

        If the question relates to:

        - Figures  use image descriptions
        - Tables  analyze table values
        - Concepts  use text

        Always give clear and accurate answers.

        Context:
        {context}

        Question:
        {query}

        Answer:
        """

            try:
                url = "http://localhost:11434/api/generate"
                data = json.dumps({"model": self.model_name, "prompt": prompt, "stream": False}).encode("utf-8")
                req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req) as res:
                    response_data = json.loads(res.read().decode("utf-8"))
                    return response_data.get("response", "")
            except Exception as e:
                print(f"Error calling LLM: {e}")
                return "Error generating response."