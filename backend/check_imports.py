import importlib

modules = [
    "networkx",
    "numpy",
    "pandas",
    "pinecone",
    "fitz",
    "camelot",
    "torch",
    "torchvision",
    "torchaudio",
    "open_clip",
    "whisper"
]

missing = []
for mod in modules:
    try:
        importlib.import_module(mod)
    except Exception as e:
        missing.append(mod)

if missing:
    print("MISSING:", ", ".join(missing))
else:
    print("ALL GOOD")
