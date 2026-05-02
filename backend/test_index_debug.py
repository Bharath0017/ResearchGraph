import traceback

def run():
    try:
        with open("debug_log.txt", "w", encoding="utf-8") as f:
            f.write("Starting index build...\n")
        
        from app.rag.pipeline import RAGPipeline
        with open("debug_log.txt", "a", encoding="utf-8") as f:
            f.write("Imported RAGPipeline\n")
            
        pipeline = RAGPipeline()
        with open("debug_log.txt", "a", encoding="utf-8") as f:
            f.write("Initialized RAGPipeline\n")
            
        pipeline.build_index()
        with open("debug_log.txt", "a", encoding="utf-8") as f:
            f.write("Finished build_index\n")
            
    except Exception as e:
        with open("debug_log.txt", "a", encoding="utf-8") as f:
            f.write(f"Exception: {e}\n")
            f.write(traceback.format_exc() + "\n")

if __name__ == "__main__":
    run()
