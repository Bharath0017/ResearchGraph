import os
from app.config import settings


class CLIPEmbedding:
    """
    Generate embeddings from images using CLIP.
    Uses lazy loading to avoid startup crashes.
    """

    def __init__(self):
        print("Loading CLIP model (lazy)...")
        self.image_dir = settings.IMAGES_DIR
        self.dimension = 512
        self._model = None
        self._preprocess = None

    def _load_model(self):
        if self._model is None:
            try:
                import torch
                import open_clip
                model, _, preprocess = open_clip.create_model_and_transforms(
                    "ViT-B-32", pretrained="openai"
                )
                model.eval()
                self._model = model
                self._preprocess = preprocess
                self._torch = torch
                print("CLIP model loaded")
            except Exception as e:
                print(f"CLIP model unavailable: {e}")
                self._model = False

    def embed_all_images(self):
        """Generate embeddings for all images."""
        self._load_model()
        image_embeddings = []

        if not os.path.exists(self.image_dir):
            print("Image directory not found")
            return image_embeddings

        for img_file in os.listdir(self.image_dir):
            if img_file.endswith((".png", ".jpg", ".jpeg")):
                img_path = os.path.join(self.image_dir, img_file)
                print(f"CLIP embedding: {img_file}")

                if not self._model:
                    image_embeddings.append({
                        "embedding": [0.0] * self.dimension,
                        "source": img_file
                    })
                    continue

                try:
                    from PIL import Image
                    image = self._preprocess(
                        Image.open(img_path).convert("RGB")
                    ).unsqueeze(0)

                    with self._torch.no_grad():
                        features = self._model.encode_image(image)

                    embedding = features[0].cpu().numpy().tolist()

                    if len(embedding) != self.dimension:
                        print(f"Skipping {img_file} (unexpected dimension)")
                        continue

                    image_embeddings.append({"embedding": embedding, "source": img_file})

                except Exception as e:
                    print(f"Error processing {img_file}: {e}")

        print(f"Total CLIP embeddings: {len(image_embeddings)}")
        return image_embeddings