import numpy as np


class AudioEmbedding:
    """
    Generate embeddings from audio using Whisper transcription.
    Output dimension = 512 to match Pinecone index.
    Uses lazy loading to avoid startup crashes.
    """

    def __init__(self):
        print("AudioEmbedding ready (lazy Whisper load)")
        self._model = None
        self.dimension = 512

    def _load_model(self):
        if self._model is None:
            try:
                import whisper
                self._model = whisper.load_model("base")
                print("Whisper model loaded")
            except Exception as e:
                print(f"Whisper unavailable: {e}")
                self._model = False

    def embed_audio(self, audio_path):
        """Convert audio -> text -> embedding vector"""
        self._load_model()

        try:
            if not self._model:
                return np.zeros(self.dimension).tolist()

            result = self._model.transcribe(audio_path)
            text = result["text"]
            return self.text_to_vector(text)

        except Exception as e:
            print(f"Audio embedding error: {e}")
            return np.zeros(self.dimension).tolist()

    def text_to_vector(self, text):
        """Convert text -> fixed 512-dim vector"""
        vector = np.zeros(self.dimension)
        words = text.split()
        for i, word in enumerate(words):
            if i >= self.dimension:
                break
            vector[i] = len(word)
        return vector.tolist()