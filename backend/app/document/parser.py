import os
import fitz  # PyMuPDF

from app.config import settings


class DocumentParser:
    """
    Extract images from PDF files.
    """

    def __init__(self):

        self.image_dir = settings.IMAGES_DIR

        # Ensure directory exists
        os.makedirs(
            self.image_dir,
            exist_ok=True
        )

    def extract_images(self, pdf_path):

        """
        Extract images from PDF.
        """

        extracted_images = []

        try:

            doc = fitz.open(pdf_path)

            for page_index in range(len(doc)):

                page = doc[page_index]

                images = page.get_images(
                    full=True
                )

                for img_index, img in enumerate(images):

                    xref = img[0]

                    pix = fitz.Pixmap(
                        doc,
                        xref
                    )

                    image_name = (
                        f"page_{page_index+1}"
                        f"_img_{img_index+1}.png"
                    )

                    image_path = os.path.join(
                        self.image_dir,
                        image_name
                    )

                    if pix.n < 5:

                        pix.save(image_path)

                    else:

                        pix = fitz.Pixmap(
                            fitz.csRGB,
                            pix
                        )

                        pix.save(image_path)

                    extracted_images.append(
                        image_path
                    )

                    pix = None

            doc.close()

        except Exception as e:

            print(
                f"Image extraction error: {e}"
            )

        return extracted_images