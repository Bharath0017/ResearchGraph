import os
import base64
import requests

from app.config import settings


class ImageProcessor:
    """
    Handles image understanding
    using Ollama vision models.
    """

    def __init__(self):

        self.model = "llava"

        self.api_url = "http://localhost:11434/api/generate"

        self.image_dir = settings.IMAGES_DIR


    def encode_image(self, image_path):

        """
        Convert image to base64.
        """

        with open(image_path, "rb") as f:

            return base64.b64encode(
                f.read()
            ).decode("utf-8")


    def explain_image(self, image_path):

        """
        Generate explanation for image.
        """

        image_base64 = self.encode_image(
            image_path
        )

        payload = {

            "model": self.model,

            "prompt": """
    Describe this figure in detail.

    Explain:
    - What the figure shows
    - Any charts, diagrams, or graphs
    - Key observations
    """,

            "images": [image_base64],

            "stream": False   #  critical fix
        }

        try:

            response = requests.post(
                self.api_url,
                json=payload
            )

            result = response.json()

            return result.get(
                "response",
                "No explanation generated."
            )

        except Exception as e:

            return f"Image processing error: {e}"

    def explain_all_images(self):

        """
        Process all extracted images.
        """

        explanations = {}

        if not os.path.exists(
            self.image_dir
        ):
            return explanations

        for file in os.listdir(
            self.image_dir
        ):

            if file.endswith(".png"):

                image_path = os.path.join(
                    self.image_dir,
                    file
                )

                print(
                    f" Processing {file}"
                )

                explanation = self.explain_image(
                    image_path
                )

                explanations[file] = explanation

        return explanations
    
    def save_explanations(self, explanations):
        """
        Save explanations to file.
        """

        save_path = os.path.join(
            settings.DATA_DIR,
            "image_explanations.txt"
        )

        with open(
            save_path,
            "w",
            encoding="utf-8"
        ) as f:

            for img, text in explanations.items():

                f.write(f"Image: {img}\n")

                f.write(text)

                f.write("\n\n")