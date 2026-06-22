"""
rag_engine.py — RAG Query Engine (Advanced RAG with Reranker)
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
USE_RERANKER    = True  # True yaparsanız Reranker çalışır, False yaparsanız eski Kosinüs benzerliği (Naive RAG) çalışır.

INITIAL_TOP_K   = 40  # ChromaDB'den ilk etapta getirilecek bol miktarda belge (Sadece Reranker açıksa kullanılır)
TOP_K           = 15  # LLM'e gidecek son belge sayısı
RERANKER_MODEL = "BAAI/bge-reranker-v2-m3"
LLM_MODEL       = "llama-3.1-8b-instant"
TEMPERATURE     = 0.0

# Reranker açıksa Logit barajı (örn -2.0), kapalıysa Kosinüs barajı (örn 0.60) kullanılır.
SCORE_THRESHOLD = -2.0 if USE_RERANKER else 0.50
# ───────────────────────────────────────────────────────────

SYSTEM_PROMPT = """Use the provided context documents to answer the user's question as thoroughly and accurately as possible.

Follow these steps:
1. Carefully read all context documents provided below.
2. Identify the parts most relevant to the question.
3. Synthesize a clear, well-structured answer using only the information found in the context.
4. If the context contains only partial information, provide what is available and briefly note what could not be found.
5. Do not add information from outside the provided context. If the context contains no relevant information at all, briefly state that the documents do not cover this topic.
6. Cite sources inline using the EXACT Source ID and Page numbers provided in the context headers (e.g. [Source 1, Page 55], [Source 3, Page 11]). DO NOT create your own numbering system.
7. Do NOT include a 'Sources:' section at the end of your response. The interface displays sources automatically.
8. If the question asks for a specific number (e.g., "three most common"), limit your output to exactly that number of items.
"""


import re
from datetime import datetime

def _extract_year_range(query: str):
    """Sorgudan yıl aralığı çıkarır. None döndürürse filtreleme yok."""
    current_year = datetime.now().year

    # "last/past N years"
    m = re.search(r'\b(?:last|past|recent|son)\s+(\d+)\s+(?:years?|yıl)', query, re.IGNORECASE)
    if m:
        n = int(m.group(1))
        return (current_year - n, current_year)

    # "since YEAR" / "from YEAR"
    m = re.search(r'\b(?:since|from)\s+(\d{4})', query, re.IGNORECASE)
    if m:
        return (int(m.group(1)), current_year)

    # "between YEAR and YEAR"
    m = re.search(r'\bbetween\s+(\d{4})\s+and\s+(\d{4})', query, re.IGNORECASE)
    if m:
        return (int(m.group(1)), int(m.group(2)))

    # "YEAR-YEAR" or "YEAR to YEAR"
    m = re.search(r'(\d{4})\s*[-–]\s*(\d{4})', query)
    if m:
        return (int(m.group(1)), int(m.group(2)))

    return None


def _filter_by_year(results, year_range):
    """Sonuçları kaynak dosya adındaki yıla göre filtreler."""
    min_year, max_year = year_range
    filtered = []
    for item in results:
        doc, meta, score = item
        source = meta.get('source', '')
        m = re.search(r'_(\d{4})\.[^.]+$', source)
        if m:
            year = int(m.group(1))
            if min_year <= year <= max_year:
                filtered.append(item)
        else:
            filtered.append(item)  # Yıl bilgisi yoksa dahil et
    return filtered


def build_context(reranked_results: list) -> tuple[str, list[str], list[dict]]:
    """Reranker'dan dönen (doc, meta, score) listesinden context oluşturur."""
    if not reranked_results:
        return "", [], []

    context_parts = []
    sources = []
    seen_sources = {}  # (source, page) -> True

    for i, (doc, meta, score) in enumerate(reranked_results):
        source = meta.get("source", "Unknown")
        page   = meta.get("page", "?")

        # BGE Reranker logit skoru filtresi veya Kosinüs filtresi
        if score < SCORE_THRESHOLD:
            continue

        score_label = "Rerank Score" if USE_RERANKER else "Similarity"
        context_parts.append(
            f"[Source {i+1}: {source}, Page {page} | {score_label}: {score:.3f}]\n{doc}"
        )

        key = (source, page)
        if key not in seen_sources:
            seen_sources[key] = True
            sources.append(f"{source} (Page {page})")

    structured_sources = []
    for (source, page) in seen_sources.keys():
        structured_sources.append({
            "name": source,
            "page": page,
            "url": f"/api/serve-doc/{source}#page={page}"
        })

    return "\n\n---\n\n".join(context_parts), sources, structured_sources


_store_instance   = None
_reranker_instance = None
_groq_client      = None

def ask(query: str, top_k: int = None, initial_k: int = None, model: str = None) -> dict:
    """
    Tam RAG pipeline (Reranker Dahil):
    1. Semantic search (High Recall)
    2. Reranking (High Precision)
    3. Context hazırlama
    4. LLM'e gönderme
    5. Cevap + kaynaklar döndürme
    """
    # Global değerleri her çağrıda oku (UI'dan değişince anlık geçerli olsun)
    if top_k is None:
        top_k = TOP_K
    if initial_k is None:
        initial_k = INITIAL_TOP_K
    if model is None:
        model = LLM_MODEL

    global _store_instance
    global _reranker_instance
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.")

    # 1. Semantic Search
    if _store_instance is None:
        _store_instance = VectorStore(db_path=DB_PATH, collection_name=COLLECTION_NAME)
    
    # Reranker kapalıysa doğrudan TOP_K kadar getir, açıksa INITIAL_TOP_K kadar bol getir.
    search_k = initial_k if USE_RERANKER else top_k
    results = _store_instance.semantic_search(query=query, top_k=search_k)
    
    docs  = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    reranked_results = []
    if docs:
        if USE_RERANKER:
            # 2. Reranking (Yeniden Sıralama)
            if _reranker_instance is None:
                from sentence_transformers import CrossEncoder
                _reranker_instance = CrossEncoder(RERANKER_MODEL)

            cross_inp = [[query, doc] for doc in docs]
            scores = _reranker_instance.predict(cross_inp)
            
            # (doc, meta, score) tuple'larını birleştir ve skora göre büyükten küçüğe sırala
            combined = list(zip(docs, metas, scores))
            combined.sort(key=lambda x: x[2], reverse=True)
            
            # Sadece en iyi top_k kadarını al
            reranked_results = combined[:top_k]
        else:
            # Eski Sistem (Naive RAG): Kosinüs benzerliği hesapla ve dön
            for doc, meta, dist in zip(docs, metas, distances):
                score = round(1 - (dist / 2), 3)  # dist -> cosine
                reranked_results.append((doc, meta, score))
            reranked_results = reranked_results[:top_k]

    # 2.5. Temporal Filtering — Yıl bazlı Python filtresi
    year_range = _extract_year_range(query)
    if year_range:
        filtered = _filter_by_year(reranked_results, year_range)
        if filtered:  # Filtrelenmiş sonuç varsa uygula, yoksa orijinali koru
            reranked_results = filtered

    # 3. Context + Kaynaklar
    context, sources, structured_sources = build_context(reranked_results)

    if not context:
        return {
            "answer": "No relevant documents were found in the database for your query.",
            "sources": [],
            "structured_sources": [],
            "context": ""
        }

    # 4. Prompt oluştur
    user_message = f"""Context Documents:
{context}

Question: {query}"""

    # 5. Groq LLM çağrısı (singleton — her sorguda yeni bağlantı kurulmasın)
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=api_key)
    client = _groq_client
    response = client.chat.completions.create(
        model=model,
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
