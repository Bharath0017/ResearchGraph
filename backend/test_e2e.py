import urllib.request
import json

BASE = "http://localhost:8000"

def get(path):
    try:
        with urllib.request.urlopen(f"{BASE}{path}") as r:
            return json.loads(r.read())
    except Exception as e:
        return {"error": str(e)}

def post(path, data=None):
    try:
        body = json.dumps(data).encode() if data else b""
        req = urllib.request.Request(
            f"{BASE}{path}", data=body,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except Exception as e:
        return {"error": str(e)}

print("=== 1. Health check ===")
print(get("/"))

print("\n=== 2. Stats ===")
print(get("/stats"))

print("\n=== 3. Documents ===")
docs = get("/documents")
print(docs)

print("\n=== 4. Query test (without index) ===")
result = post("/query", {"query": "What is machine learning?"})
print(result)
