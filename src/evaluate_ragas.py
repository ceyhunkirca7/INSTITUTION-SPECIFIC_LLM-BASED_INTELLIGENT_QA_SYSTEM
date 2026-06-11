"""
evaluate_ragas.py — RAGAS Değerlendirme Betiği
Bu betik question_answering.xlsx dosyasını okur, rag_engine.py üzerinden
cevaplar üretir ve bu cevapları RAGAS metrikleriyle puanlar.

Kaldırılanlar: context_recall (manuel ground truth context gerektirir, pratikte yanıltıcı)
Düzeltmeler  : context metadata satırı RAGAS'a verilmeden önce temizlenir,
               Excel yolu script'in bulunduğu klasöre göre değil proje köküne göre aranır.
"""

print(">>> [1/3] evaluate_ragas.py başlatıldı, kütüphaneler yükleniyor...")
import os
import re
import sys
import time
import pandas as pd
from dotenv import load_dotenv

print(">>> [2/3] Ragas ve HuggingFace kütüphaneleri (PyTorch) belleğe alınıyor... (Bu işlem 1-2 dakika sürebilir)")
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
)

from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings

print(">>> [3/3] RAG Motoru başlatılıyor...")

# rag_engine.py ile aynı klasörde olduğumuz için doğrudan import edilebilir
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rag_engine import ask

# Proje kökü: src/ bir üst klasör
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Context parçasındaki metadata etiketini temizler
# Örn: "[Source 1: dosya.pdf, Page 5 | Similarity: 0.87]\n..." → "..."
_META_RE = re.compile(r"^\[Source\s+\d+:[^\]]+\]\n?", re.MULTILINE)

def clean_context_chunk(chunk: str) -> str:
    """RAGAS'a verilmeden önce chunk başındaki kaynak etiketini siler."""
    return _META_RE.sub("", chunk).strip()


def main():
    print("=" * 60)
    print("  RAGAS EVALUATION PIPELINE")
    print("=" * 60)

    load_dotenv()

    # --- API Anahtarı Kontrolü ---
    if not os.getenv("GROQ_API_KEY"):
        print("HATA: GROQ_API_KEY bulunamadı! (RAG sistemi için gerekli)")
        return
    if not os.getenv("OPENAI_API_KEY"):
        print("HATA: OPENAI_API_KEY bulunamadı! (RAGAS judge modeli için gerekli)")
        print("Lütfen .env dosyasına OPENAI_API_KEY=sk-proj-... satırını ekleyin.")
        return

    # --- Excel Verisini Okuma ---
    dataset_path = os.path.join(PROJECT_ROOT, "question_answering.xlsx")
    if not os.path.exists(dataset_path):
        print(f"HATA: {dataset_path} bulunamadı!")
        return

    print(f"1. Veri seti okunuyor: {dataset_path}")
    df = pd.read_excel(dataset_path)
    
    required_cols = {"question", "answer"}
    if not required_cols.issubset(df.columns):
        print(f"HATA: Excel dosyasında 'question' ve 'answer' sütunları bulunmalı.")
        print(f"   Bulunan sütunlar: {list(df.columns)}")
        return

    print(f"   Toplam {len(df)} soru-cevap çifti bulundu.")
    test_df = df.copy()

    questions      = []
    ground_truths  = []
    answers        = []
    contexts_list  = []

    print("\n2. RAG sisteminden cevaplar toplanıyor...")
    for idx, row in test_df.iterrows():
        q  = str(row["question"]).strip()
        gt = str(row["answer"]).strip()
        print(f"  [{idx+1}/{len(test_df)}] {q[:60]}...")

        try:
            result = ask(q)
            time.sleep(2)   # Groq rate limit için
        except Exception as api_err:
            print(f"    -> [DİKKAT] Groq API Hatası: {api_err}")
            print("    -> 30 saniye bekleniyor (rate limit)...")
            time.sleep(30)
            try:
                result = ask(q)
            except Exception:
                print("    -> [ATLANDI] Bu soru atlanıyor.")
                continue

        ctx_raw = result.get("context", "")
        if ctx_raw:
            # Önce \n\n---\n\n ayracıyla chunk'lara böl
            raw_chunks = ctx_raw.split("\n\n---\n\n")
            # Her chunk'tan kaynak metadata etiketini temizle
            ctx_list = [clean_context_chunk(c) for c in raw_chunks if clean_context_chunk(c)]
        else:
            ctx_list = ["No context found"]

        questions.append(q)
        ground_truths.append(gt)
        answers.append(result.get("answer", ""))
        contexts_list.append(ctx_list)

    if not questions:
        print("\n[HATA] Hiçbir soru işlenemedi. Değerlendirme iptal ediliyor.")
        return

    # --- HuggingFace Dataset formatına dönüştür ---
    data_dict = {
        "question":     questions,
        "answer":       answers,
        "contexts":     contexts_list,
        "ground_truth": ground_truths,
    }
    dataset = Dataset.from_dict(data_dict)
    print(f"\n3. {len(questions)} soru için RAGAS judge modeli yükleniyor...")

    # RAGAS Hakem Modeli — gpt-4o-mini hız/maliyet için idealdir
    judge_llm        = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    # answer_relevancy için embedding (İngilizce ağırlıklı belgeler için uygundur)
    judge_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    print("4. Puanlama başladı... (faithfulness, answer_relevancy, context_precision)")
    try:
        results = evaluate(
            dataset=dataset,
            metrics=[faithfulness, answer_relevancy, context_precision],
            llm=judge_llm,
            embeddings=judge_embeddings,
        )

        print("\n" + "=" * 60)
        print("RAGAS GENEL ORTALAMA SONUÇLARI:")
        print(results)
        print("=" * 60)

        # Soru bazlı detaylı tablo
        results_df = results.to_pandas()

        # Çok uzun sütunları kaldır (Excel'i şişirmesin)
        for col in ["contexts", "answer"]:
            if col in results_df.columns:
                results_df = results_df.drop(columns=[col])

        print("\nİLK 5 SORUNUN BİREYSEL SKORLARI:")
        print(results_df.head(5).to_string())

        from rag_engine import LLM_MODEL, TOP_K, SCORE_THRESHOLD
        import datetime
        safe_model_name = LLM_MODEL.replace("/", "-")
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M")
        filename = f"ragas_results_reranker_{safe_model_name}_k{TOP_K}_t{SCORE_THRESHOLD}_{timestamp}.xlsx"
        output_file = os.path.join(PROJECT_ROOT, filename)
        
        results_df.to_excel(output_file, index=False)
        print(f"\nDetaylı sonuçlar kaydedildi: {output_file}")
    except Exception as e:
        import traceback
        print("\n[HATA] RAGAS değerlendirmesi sırasında bir hata oluştu:")
        traceback.print_exc()


if __name__ == "__main__":
    main()
