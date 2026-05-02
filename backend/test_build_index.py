import sys
import traceback
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from app.rag.pipeline import RAGPipeline

def test():
    try:
        pipeline = RAGPipeline()
        pipeline.build_index()
        print("Success")
    except Exception as e:
        print(f"FAILED WITH EXCEPTION: {type(e).__name__}: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test()
