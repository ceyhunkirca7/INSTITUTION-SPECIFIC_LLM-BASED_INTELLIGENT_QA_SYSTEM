# Advanced RAG Architecture for Cultural Heritage 🏛️

This repository contains an **Advanced Retrieval-Augmented Generation (RAG)** pipeline optimized for analyzing and querying large collections of architectural, heritage conservation, and disaster risk management documents. 

The system leverages **BAAI/bge-m3** for dense multilingual embeddings, **ChromaDB** with HNSW indexing for rapid semantic search, Cross-Encoder models (e.g., **BAAI/bge-reranker-v2-m3**) for high-precision reranking, and the **Llama 3.1 8B / Llama 3.3 70B** models (via Groq API) for high-speed, zero-hallucination text generation.

demo presentation video link: https://www.youtube.com/watch?v=ZNL_4c0UVZw

## 🚀 Features
- **Interactive Web UI:** A sleek, dynamic Flask-based web interface to manage documents, toggle models, and chat with the AI seamlessly.
- **Advanced Document Processing:** Automatic chunking and cleaning of `.pdf`, `.docx`, and even legacy `.doc` files (powered by **Apache Tika** for bulletproof parsing).
- **Direct URL Ingestion:** Paste UNESCO or other web PDF links directly into the UI to download and ingest them into the database in seconds.
- **Two-Stage Retrieval (Reranker):** Toggle between Naive RAG (Cosine Similarity) and Advanced RAG (Cross-Encoder Reranking) for vastly improved context precision.
- **Local Vector Database:** Completely private and local `ChromaDB` integration.
- **RAGAS Evaluation Integration:** Built-in scripts to scientifically measure Faithfulness, Answer Relevancy, and Context Precision.
- **Blind Manual Evaluation:** Interface for human experts to blindly evaluate LLM outputs.

---

## 🛠️ Installation

**1. Clone the repository:**
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

**2. Create a virtual environment and install dependencies:**
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**3. Configure Environment Variables:**
Create a `.env` file in the root directory and add your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here # (Only required if you want to run Ragas evaluations)
```

---

## 📂 Data Ingestion (Building the Database)

This repository comes with an empty database. **You must provide your own documents** before you can query the system.

**Option A: Via the Web Interface (Recommended)**
Run the Web UI (see Usage below) and use the **Database** menu to directly upload PDF/Docx files or paste direct URLs to ingest them on the fly.

**Option B: Via the Terminal**
1. Create a folder named `data/` in the root directory.
2. Place your documents inside the `data/` folder.
3. Run the ingestion script:

```bash
python src/ingest.py
```
*Depending on the number of documents and your hardware, this process may take a few minutes. A `chroma_db/` folder will be automatically generated.*

---

## 💡 Usage

### 🌐 Web Interface (Recommended)
To launch the full graphical user interface with chat history, document management, and dynamic settings:
```bash
python src/app.py
```
*Then open your browser and go to `http://127.0.0.1:5000`.*

### 💻 Terminal Chat Interface
To test the RAG engine directly in your terminal without the UI:
```bash
python src/rag_engine.py
```

### 📊 Running Automated Evaluations (Ragas)
If you want to scientifically evaluate the performance of the RAG system using the RAGAS framework:
```bash
python src/evaluate_ragas.py
```
*This will generate an Excel file containing precision, recall, and relevancy metrics.*

### 🧑‍⚖️ Running Manual Blind Evaluations
To allow human experts to score the outputs blindly (without knowing the parameters):
```bash
python src/manual_eval.py
```

---

## ⚙️ Configuration
You can tweak the core parameters of the RAG pipeline dynamically via the Web UI's **RAG Settings** menu, or statically by modifying the configuration section at the top of `src/rag_engine.py`:
- `TOP_K`: Number of document chunks to retrieve and feed to the LLM.
- `USE_RERANKER`: Boolean flag to enable/disable the Two-Stage Retrieval architecture.
- `RERANKER_MODEL`: The specific cross-encoder model to use (e.g., `BAAI/bge-reranker-v2-m3` for heavy precision, or `ms-marco-MiniLM-L-6-v2` for speed). *(Note: Heavy rerankers require >=16GB RAM).*
- `SCORE_THRESHOLD`: The minimum similarity score required for a document chunk to be accepted.

---

## 📁 Repository Structure
```text
.
├── src/
│   ├── app.py                # Main application/UI entry point
│   ├── ingest.py             # Script to load PDFs and generate vector db
│   ├── document_processor.py # PDF/Docx/Doc parser (Tika) and text chunker
│   ├── vector_store.py       # ChromaDB interactions and embedding logic
│   ├── rag_engine.py         # The core Retrieval & Generation pipeline
│   ├── evaluate_ragas.py     # Ragas automated evaluation script
│   └── manual_eval.py        # Blind human evaluation interface
├── requirements.txt          # Python dependencies
└── README.md                 # You are here
```

*(Note: Folders like `data/` and `chroma_db/` are ignored by git to keep the repository lightweight.)*
