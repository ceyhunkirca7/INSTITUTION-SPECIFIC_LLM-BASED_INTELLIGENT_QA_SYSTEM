"""
rag_engine.py — RAG Query Engine
Kullanıcının sorusunu alır, ChromaDB'den ilgili chunk'ları getirir,
Groq LLM'ine gönderir ve kaynaklı cevap döndürür.
"""
import os
import sys
from dotenv import load_dotenv

if __name__ == "__main__":
    print("=" * 60, flush=True)
    print("  RAG Engine — Terminal Test Modu", flush=True)
    print("  Çıkmak için 'quit' yazın", flush=True)
    print("=" * 60, flush=True)
    print("\nYapay zeka modelleri ve devasa veritabanı belleğe yükleniyor...", flush=True)
    print("(İlk açılışta bu işlem 1-3 dakika sürebilir, lütfen bekleyin)\n", flush=True)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vector_store import VectorStore

load_dotenv()

# ── Konfigürasyon ──────────────────────────────────────────
DB_PATH         = "chroma_db"
COLLECTION_NAME = "architecture_docs"
TOP_K           = 10
LLM_MODEL       = "llama-3.1-8b-instant"
TEMPERATURE     = 0.0
SCORE_THRESHOLD = 0.55
# ───────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert assistant specialized in architecture, \
heritage conservation, and disaster risk management. \
Answer questions ONLY based on the provided context documents. \
If the answer is not found in the context, say: \
"This information is not available in the provided documents." \
Always cite your sources (document name and page number) at the end of your answer."""

def build_context(results: dict) -> tuple[str, list[str], list[dict]]:
    """ChromaDB sonuçlarından context metni, kaynak listesi ve yapılandırılmış kaynak listesi oluşturur."""
    docs      = results.get("documents", [[]])[0]
    metas     = results.get("metadatas", [[]])[0]
    distances = results.get("distances",  [[]])[0]

    if not docs:
        return "", [], []

    context_parts = []
    sources = []
    seen_sources = {}  # (source, page) -> True, tekrar eklemeyi önler

    for i, (doc, meta, dist) in enumerate(zip(docs, metas, distances)):
        source = meta.get("source", "Unknown")
        page   = meta.get("page", "?")
        # dist değeri ChromaDB'de L2 Squared'dir (0 ile 2 arası). 
        # Bunu gerçek Kosinüs Benzerliğine (Cosine Similarity) çevirmek için formül: 1 - (dist / 2)
        score  = round(1 - (dist / 2), 3)   

        # Eğer skor barajı geçemezse bu parçayı LLM'e gönderme
        if score < SCORE_THRESHOLD:
            continue

        context_parts.append(
            f"[Source {i+1}: {source}, Page {page} | Similarity: {score}]\n{doc}"
        )

        key = (source, page)
        if key not in seen_sources:
            seen_sources[key] = True
            sources.append(f"{source} (Page {page})")

    # Yapılandırılmış kaynak listesi (arayüzde link oluşturmak için)
    structured_sources = []
    for (source, page) in seen_sources.keys():
        structured_sources.append({
            "name": source,
            "page": page,
            "url": f"/api/serve-doc/{source}#page={page}"
        })

    return "\n\n---\n\n".join(context_parts), sources, structured_sources


_store_instance = None

def ask(query: str, top_k: int = TOP_K) -> dict:
    """
    Tam RAG pipeline:
    1. Semantic search
    2. Context hazırlama
    3. LLM'e gönderme
    4. Cevap + kaynaklar döndürme
    """
    global _store_instance
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.")

    # 1. Semantic Search (Cache edilmiş instance kullanımı)
    if _store_instance is None:
        _store_instance = VectorStore(db_path=DB_PATH, collection_name=COLLECTION_NAME)
    
    results = _store_instance.semantic_search(query=query, top_k=top_k)

    # 2. Context + Kaynaklar
    context, sources, structured_sources = build_context(results)

    if not context:
        return {
            "answer": "No relevant documents were found in the database for your query.",
            "sources": [],
            "structured_sources": [],
            "context": ""
        }

    # 3. Prompt oluştur
    user_message = f"""Context Documents:
{context}

Question: {query}"""

    # 4. Groq LLM çağrısı
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model=LLM_MODEL,
        temperature=TEMPERATURE,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message},
        ]
    )

    answer = response.choices[0].message.content

    return {
        "answer":             answer,
        "sources":            sources,
        "structured_sources": structured_sources,
        "context":            context
    }


# ── Terminal Test ──────────────────────────────────────────
if __name__ == "__main__":
    while True:
        print()
        query = input("Sorunuz: ").strip()

        if not query:
            continue
        if query.lower() in ("quit", "exit", "q"):
            print("Çıkılıyor...")
            break

        print("\nAranıyor...")
        try:
            result = ask(query)
            print("\n" + "─" * 60)
            print("CEVAP:")
            print(result["answer"])
            print("\nKAYNAKLAR:")
            for src in result["sources"]:
                print(f"  • {src}")
            print("─" * 60)
        except Exception as e:
            import traceback
            print(f"\n[DETAYLI HATA RAPORU]")
            traceback.print_exc()
            print("─" * 60)

