import os
import fitz  # PyMuPDF

from app.config import settings


class DocumentLoader:
    """
    Handles loading PDF documents
    and extracting text.
    """

    def __init__(self):
        self.documents_path = settings.DOCUMENTS_DIR
        print("Documents path:", self.documents_path)

    def load_pdf(self, file_path: str) -> str:
        """
        Load a single PDF file
        and extract text.
        """

        text = ""

        try:
            doc = fitz.open(file_path)

            for page in doc:
                text += page.get_text()

            doc.close()

        except Exception as e:
            print(f"Error loading {file_path}: {e}")

        return text

    def load_all_documents(self):
        """
        Load all PDFs from documents folder.
        """

        all_docs = []

        if not os.path.exists(self.documents_path):
            print("Documents directory not found.")
            return []

        for file_name in os.listdir(self.documents_path):

            if file_name.endswith(".pdf"):

                full_path = os.path.join(
                    self.documents_path,
                    file_name
                )

                text = self.load_pdf(full_path)

                if text.strip():

                    all_docs.append({
                        "file_name": file_name,
                        "content": text
                    })

        return all_docs