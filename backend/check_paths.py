from app.config import settings
import os

print("DOCUMENTS_DIR:", settings.DOCUMENTS_DIR)
print("EXISTS:", os.path.exists(settings.DOCUMENTS_DIR))

# Ensure all data dirs exist
for d in [settings.DOCUMENTS_DIR, settings.IMAGES_DIR, settings.AUDIO_DIR,
          settings.TABLES_DIR, settings.VECTOR_STORE_DIR, settings.GRAPH_STORE_DIR]:
    os.makedirs(d, exist_ok=True)
    print("OK:", d)

# Test write
test_file = os.path.join(settings.DOCUMENTS_DIR, "test_write.txt")
with open(test_file, "w") as f:
    f.write("test")
os.remove(test_file)
print("Write test: PASSED")
