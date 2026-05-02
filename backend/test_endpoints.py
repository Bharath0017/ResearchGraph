import urllib.request
import json

BASE = "http://localhost:8000"

# Test graph
try:
    with urllib.request.urlopen(f"{BASE}/graph") as r:
        data = json.loads(r.read())
        print("GRAPH:", data)
except Exception as e:
    print("GRAPH ERROR:", e)

# Test query
try:
    body = json.dumps({"query": "What is machine learning?"}).encode()
    req = urllib.request.Request(
        f"{BASE}/query", data=body,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read())
        print("QUERY ANSWER:", data.get("answer", "EMPTY"))
except Exception as e:
    print("QUERY ERROR:", e)
