from app.rag.pipeline import RAGPipeline


def main():

    print("🚀 Starting index build...")

    pipeline = RAGPipeline()

    pipeline.build_index()

    print("✅ Index build finished!")


if __name__ == "__main__":
    main()