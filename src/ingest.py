"""
ingest.py — Data Ingestion Pipeline
Kullanim: python src/ingest.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from document_processor import DocumentProcessor
from vector_store import VectorStore

# ── Ayarlar ────────────────────────────────────────────────
DATA_DIR        = "data"
DB_PATH         = "chroma_db"
COLLECTION_NAME = "architecture_docs"
CHUNK_SIZE      = 1000
CHUNK_OVERLAP   = 150
BATCH_SIZE      = 50
LOG_FILE        = "processed_files.log"
# ───────────────────────────────────────────────────────────


def find_all_documents(root_dir):
    supported = (".pdf", ".docx", ".doc")
    files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for fname in filenames:
            if os.path.splitext(fname)[1].lower() in supported:
                files.append(os.path.join(dirpath, fname))
    return sorted(files)


def load_processed():
    if not os.path.exists(LOG_FILE):
        return set()
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        return set(line.strip() for line in f if line.strip())


def mark_done(path):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(path + "\n")


def ingest():
    print("=" * 60)
    print("  RAG Ingestion Pipeline")
    print("=" * 60)

    all_docs  = find_all_documents(DATA_DIR)
    processed = load_processed()
    new_docs  = [p for p in all_docs if p not in processed]

    print(f"\nToplam  : {len(all_docs)}")
    print(f"Islendi : {len(processed)}")
    print(f"Yeni    : {len(new_docs)}\n")

    if not new_docs:
        print("Yeni dosya yok.")
        return

    processor = DocumentProcessor(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    store     = VectorStore(db_path=DB_PATH, collection_name=COLLECTION_NAME)

    total_chunks = 0
    failed = []

    for idx, file_path in enumerate(new_docs, 1):
        print(f"\n[{idx}/{len(new_docs)}] {os.path.basename(file_path)}")

        pages = processor.extract_text(file_path)
        if not pages:
            print(f"  Metin cikartilamadi, atlandi.")
            failed.append(file_path)
            continue

        chunks = processor.split_documents(pages)

        for batch_start in range(0, len(chunks), BATCH_SIZE):
            batch = chunks[batch_start : batch_start + BATCH_SIZE]
            store.add_chunks(batch)
            print(f"  -> Batch [{batch_start+1}-{min(batch_start+BATCH_SIZE, len(chunks))}] eklendi")

        total_chunks += len(chunks)
        mark_done(file_path)

    print("\n" + "=" * 60)
    print(f"  Islenen  : {len(new_docs) - len(failed)}")
    print(f"  Chunk    : {total_chunks}")
    print(f"  Basarisiz: {len(failed)}")
    if failed:
        for f in failed:
            print(f"    - {f}")
    print("=" * 60)


if __name__ == "__main__":
    ingest()
