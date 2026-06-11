"""
app.py — CHaRM-AI Flask Web Sunucusu
RAG motorunu HTTP API'ye dönüştürür ve arayüzü sunar.
"""
import os
import sys
import json
import threading
from flask import Flask, request, jsonify, render_template, Response, stream_with_context, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

# rag_engine.py'nin bulunduğu klasörü path'e ekle
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ── Sabitler ──────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # /bitirme
DATA_DIR    = os.path.join(BASE_DIR, "data")
LOG_FILE    = os.path.join(BASE_DIR, "processed_files.log")
ALLOWED_EXT = {".pdf", ".docx", ".doc"}
MAX_MB      = 5000  # 5 GB Sınırı

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['MAX_CONTENT_LENGTH']        = MAX_MB * 1024 * 1024
CORS(app)

@app.after_request
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma']        = 'no-cache'
    response.headers['Expires']       = '0'
    return response


# ── Ingest durum takibi ───────────────────────────────────────────────────────
_ingest_lock   = threading.Lock()
_ingest_status = {
    "running":      False,
    "current":      0,
    "total":        0,
    "current_file": "",
    "done":         False,
    "error":        None,
    "added":        0,
}


def run_ingest_background(specific_files=None):
    """Ingest mantığını arka planda çalıştırır. specific_files verilirse sadece onları işler."""
    global _ingest_status

    with _ingest_lock:
        _ingest_status.update({
            "running": True, "done": False, "error": None,
            "current": 0, "total": 0, "current_file": "", "added": 0,
        })

    try:
        from document_processor import DocumentProcessor
        from vector_store import VectorStore

        CHUNK_SIZE    = 1000
        CHUNK_OVERLAP = 150
        BATCH_SIZE    = 50
        COLL_NAME     = "architecture_docs"
        DB_PATH       = os.path.join(BASE_DIR, "chroma_db")

        if specific_files is not None:
            new_docs = specific_files
        else:
            all_docs  = _find_all_docs(DATA_DIR)
            processed = _load_processed()
            new_docs  = [p for p in all_docs if os.path.basename(p) not in processed]

        with _ingest_lock:
            _ingest_status["total"] = len(new_docs)

        if not new_docs:
            with _ingest_lock:
                _ingest_status.update({"running": False, "done": True})
            return

        processor = DocumentProcessor(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
        store     = VectorStore(db_path=DB_PATH, collection_name=COLL_NAME)

        for idx, file_path in enumerate(new_docs, 1):
            fname = os.path.basename(file_path)
            with _ingest_lock:
                _ingest_status["current"]      = idx
                _ingest_status["current_file"] = fname

            pages = processor.extract_text(file_path)
            if not pages:
                continue

            chunks = processor.split_documents(pages)
            for batch_start in range(0, len(chunks), BATCH_SIZE):
                batch = chunks[batch_start: batch_start + BATCH_SIZE]
                store.add_chunks(batch)

            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write(fname + "\n")

            with _ingest_lock:
                _ingest_status["added"] += 1

    except Exception as e:
        with _ingest_lock:
            _ingest_status["error"] = str(e)
    finally:
        with _ingest_lock:
            _ingest_status["running"]      = False
            _ingest_status["done"]         = True
            _ingest_status["current_file"] = ""


def _find_all_docs(root_dir):
    files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for fname in filenames:
            if os.path.splitext(fname)[1].lower() in ALLOWED_EXT:
                files.append(os.path.join(dirpath, fname))
    return sorted(files)


def _load_processed():
    if not os.path.exists(LOG_FILE):
        return set()
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        return set(line.strip() for line in f if line.strip())


# ── RAG engine ────────────────────────────────────────────────────────────────
_rag_ready = False

def init_rag():
    global _rag_ready
    if not _rag_ready:
        from rag_engine import ask
        _rag_ready = True


# ═══════════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════════

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data    = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Mesaj boş olamaz."}), 400

    def generate():
        try:
            from rag_engine import ask
            result  = ask(message)
            answer  = result.get("answer", "")
            sources = result.get("sources", [])

            words = answer.split(" ")
            for i, word in enumerate(words):
                chunk   = word if i == 0 else " " + word
                payload = json.dumps({"type": "token", "content": chunk})
                yield f"data: {payload}\n\n"

            # Kaynaklari yapilandirilmis formatta gonder (isim + sayfa)
            structured_sources = result.get("structured_sources", [])
            yield f"data: {json.dumps({'type': 'sources', 'content': structured_sources})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


@app.route("/api/serve-doc/<path:filename>")
def serve_document(filename):
    """Yuklenen PDF/DOCX dosyalarini tarayiciya sunar (kaynak linki icin).
    
    Dosya adi alt klasorlerde de olabilir (ornek: mission_reports/dosya.pdf),
    bu yuzden DATA_DIR altinda recursive arama yapilir.
    """
    # Path traversal saldirisina karsi koruma: DATA_DIR disina cikmaya izin verme
    requested_path = os.path.normpath(os.path.join(DATA_DIR, filename))
    if not requested_path.startswith(os.path.normpath(DATA_DIR)):
        return jsonify({"error": "Gecersiz dosya yolu."}), 400

    # 1. Tam yol ile dene (alt klasor desteği)
    if os.path.isfile(requested_path):
        rel_dir  = os.path.dirname(os.path.relpath(requested_path, DATA_DIR))
        rel_dir  = rel_dir if rel_dir != '.' else ''
        base     = os.path.basename(requested_path)
        serve_dir = os.path.join(DATA_DIR, rel_dir) if rel_dir else DATA_DIR
        return send_from_directory(serve_dir, base, as_attachment=False)

    # 2. Sadece dosya adi ile DATA_DIR altinda recursive ara (klasor bilgisi yoksa)
    target_name = os.path.basename(filename)
    for dirpath, _, filenames in os.walk(DATA_DIR):
        if target_name in filenames:
            return send_from_directory(dirpath, target_name, as_attachment=False)

    return jsonify({"error": "Dosya bulunamadi."}), 404


@app.route("/api/documents", methods=["GET"])
def list_documents():
    """Veritabanındaki işlenmiş dosyaları sayfalandırılmış döndürür."""
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))
    query    = request.args.get("q", "").lower().strip()

    docs = sorted(_load_processed())

    if query:
        docs = [d for d in docs if query in d.lower()]

    total     = len(docs)
    start     = (page - 1) * per_page
    paginated = docs[start: start + per_page]

    return jsonify({
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "pages":    (total + per_page - 1) // per_page,
        "docs":     paginated,
    })


@app.route("/api/upload", methods=["POST"])
def upload_file():
    """PDF/DOCX yükler ve ingest'i tetikler."""
    if "file" not in request.files:
        return jsonify({"error": "Dosya bulunamadı."}), 400

    files   = request.files.getlist("file")
    saved   = []
    skipped = []

    os.makedirs(DATA_DIR, exist_ok=True)

    for f in files:
        ext = os.path.splitext(f.filename)[1].lower()
        if ext not in ALLOWED_EXT:
            skipped.append(f.filename)
            continue
        safe_name = secure_filename(f.filename)
        dest = os.path.join(DATA_DIR, safe_name)
        f.save(dest)
        saved.append(safe_name)

    if not saved:
        return jsonify({"error": "Hiçbir geçerli dosya kaydedilemedi.", "skipped": skipped}), 400

    if not _ingest_status["running"]:
        full_paths = [os.path.join(DATA_DIR, name) for name in saved]
        t = threading.Thread(target=run_ingest_background, args=(full_paths,), daemon=True)
        t.start()

    return jsonify({
        "message": f"{len(saved)} dosya yüklendi, işleme başlandı.",
        "saved":   saved,
        "skipped": skipped,
    })


@app.route("/api/ingest-status", methods=["GET"])
def ingest_status_route():
    """Anlık ingest durumu (frontend polling için)."""
    with _ingest_lock:
        return jsonify(dict(_ingest_status))


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  CHaRM-AI Web Arayüzü Başlatılıyor...")
    print("  http://localhost:5000 adresini tarayıcında aç")
    print("  (İlk soru sorulduğunda yapay zeka modelleri yüklenecektir)")
    print("=" * 60)
    app.run(debug=False, host="0.0.0.0", port=5000, threaded=True)
