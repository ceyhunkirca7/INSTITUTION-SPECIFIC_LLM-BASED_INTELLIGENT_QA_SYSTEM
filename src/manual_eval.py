"""
manual_eval.py
Bu script, Ragas tarafından üretilen Excel dosyasını okur.
Ragas skorlarını GÖRMEZDEN GELİR. Sadece Soru, Context ve Cevapları alarak 
Llama-3.3-70b-versatile modeline (Kör Jüri olarak) gönderip kendi insan benzeri puanlarını ve Türkçe notlarını oluşturur.
Son olarak iki tarafın skorlarını birleştirip 'final_comparison_8b.xlsx' tablosunu çıkarır.
"""
import os
import glob
import time
import json
import pandas as pd
from dotenv import load_dotenv
from groq import Groq
from rag_engine import LLM_MODEL, TOP_K, SCORE_THRESHOLD

load_dotenv()
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Groq İstemcisi (Kör Jüri)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
JUDGE_MODEL = "llama-3.1-8b-instant"

def evaluate_row(question, context, answer):
    prompt = f"""You are a strict and objective Human RAG Evaluator.
Given the following Question, Retrieved Context, and Generated Answer, you must evaluate them on a scale of 0.0 to 1.0 (e.g., 0.85).

Question: {question}
Context: {context}
Answer: {answer}

You must output ONLY a raw JSON object with no markdown formatting or backticks. The JSON must exactly contain these 4 keys:
{{
  "MY_faith": <float 0.0-1.0: How well is the Answer supported by the Context? 1.0 = completely supported, 0.0 = hallucinated>,
  "MY_rel": <float 0.0-1.0: How directly and fully does the Answer address the Question?>,
  "MY_cp": <float 0.0-1.0: How useful and precise is the Context in containing the necessary information?>,
  "Notlar": "<1-2 sentence brief explanation IN TURKISH summarizing the scores>"
}}"""

    for attempt in range(3):
        try:
            res = client.chat.completions.create(
                model=JUDGE_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0
            )
            txt = res.choices[0].message.content.strip()
            if txt.startswith("```json"): txt = txt[7:-3]
            if txt.startswith("```"): txt = txt[3:-3]
            
            data = json.loads(txt.strip())
            return data["MY_faith"], data["MY_rel"], data["MY_cp"], data["Notlar"]
        except Exception as e:
            print(f"Error parsing JSON (Attempt {attempt+1}): {e}")
            time.sleep(2)
            
    return 0.0, 0.0, 0.0, "Değerlendirme hatası."

def main():
    print("=" * 60)
    print("KÖR DEĞERLENDİRME (BLIND EVALUATION) BAŞLIYOR")
    print("=" * 60)

    # O anki modelin, K sayısının ve baraj değerinin adına göre Ragas dosyasını bul
    safe_model_name = LLM_MODEL.replace("/", "-")
    files = glob.glob(os.path.join(PROJECT_ROOT, f"ragas_results_reranker_{safe_model_name}_k{TOP_K}_t{SCORE_THRESHOLD}*.xlsx"))
    if not files:
        print("RAGAS sonuç dosyası bulunamadı. Lütfen önce evaluate_ragas.py'nin bitmesini bekleyin.")
        return
        
    latest_file = max(files, key=os.path.getctime)
    print(f"Okunan dosya: {os.path.basename(latest_file)}")
    
    df = pd.read_excel(latest_file)
    
    # Yeni sonuçları saklayacağımız liste
    final_rows = []
    
    print(f"Toplam {len(df)} soru için Manuel Jüri (Llama-70B) devreye giriyor...\n")
    
    for idx, row in df.iterrows():
        print(f"[{idx+1}/{len(df)}] Puanlanıyor: {str(row['user_input'])[:50]}...")
        
        my_faith, my_rel, my_cp, notlar = evaluate_row(
            row["user_input"], 
            row["retrieved_contexts"], 
            row["response"]
        )
        
        # Orijinal RAGAS Skorları
        ragas_faith = row.get("faithfulness", 0.0)
        ragas_rel = row.get("answer_relevancy", 0.0)
        ragas_cp = row.get("context_precision", 0.0)
        
        if pd.isna(ragas_faith): ragas_faith = 0.0
        if pd.isna(ragas_rel): ragas_rel = 0.0
        if pd.isna(ragas_cp): ragas_cp = 0.0
        
        final_rows.append({
            "Q#": idx + 1,
            "Question": row["user_input"],
            "RAGAS_faith": round(ragas_faith, 3),
            "MY_faith": round(my_faith, 3),
            "delta_faith": round(ragas_faith - my_faith, 3),
            "RAGAS_rel": round(ragas_rel, 3),
            "MY_rel": round(my_rel, 3),
            "delta_rel": round(ragas_rel - my_rel, 3),
            "RAGAS_cp": round(ragas_cp, 3),
            "MY_cp": round(my_cp, 3),
            "delta_cp": round(ragas_cp - my_cp, 3),
            "Notlar": notlar
        })
        time.sleep(1) # Groq rate limit koruması

    final_df = pd.DataFrame(final_rows)
    
    # Ortalama satırını hesapla
    avg_row = {
        "Q#": "ORTALAMA",
        "Question": "Tüm soruların genel ortalaması",
        "RAGAS_faith": round(final_df["RAGAS_faith"].mean(), 3),
        "MY_faith": round(final_df["MY_faith"].mean(), 3),
        "delta_faith": round(final_df["delta_faith"].mean(), 3),
        "RAGAS_rel": round(final_df["RAGAS_rel"].mean(), 3),
        "MY_rel": round(final_df["MY_rel"].mean(), 3),
        "delta_rel": round(final_df["delta_rel"].mean(), 3),
        "RAGAS_cp": round(final_df["RAGAS_cp"].mean(), 3),
        "MY_cp": round(final_df["MY_cp"].mean(), 3),
        "delta_cp": round(final_df["delta_cp"].mean(), 3),
        "Notlar": ""
    }
    
    # Ortalama satırını en alta ekle
    final_df = pd.concat([final_df, pd.DataFrame([avg_row])], ignore_index=True)
    
    output_path = os.path.join(PROJECT_ROOT, f"final_comparison_reranker_{safe_model_name}_k{TOP_K}_t{SCORE_THRESHOLD}.xlsx")
    final_df.to_excel(output_path, index=False)
    
    print("\n" + "=" * 60)
    print(f"HEPSİ TAMAM! İki tablonun birleştiği dosya kaydedildi: {output_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
