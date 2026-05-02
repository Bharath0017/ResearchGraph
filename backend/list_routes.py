import urllib.request, json

with urllib.request.urlopen("http://localhost:8000/openapi.json") as r:
    d = json.loads(r.read())
    print("Registered routes:")
    for path in d.get("paths", {}).keys():
        print(" ", path)
