import os
import re
import pdfplumber
import pypdf
from docx import Document as DocxDocument
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentProcessor:
    """
    Bu sınıf, PDF ve metin dokümanlarını okumak, temizlemek ve RAG sistemine (ChromaDB)
    uygun şekilde parçalamak (chunking) için tasarlanmıştır.
    """
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ".", " ", ""]
        )

    def clean_text(self, text: str) -> str:
        """
        [DATA CLEANING AŞAMASI]
        Okunan ham metindeki gereksiz boşlukları, bozuk karakterleri ve art arda
        gelen anlamsız satır atlamalarını (PDF okuma hatalarını) temizler.
        """
        if not text:
            return ""
        # 1. Art arda gelen fazla boşlukları (tab vb.) tek bir boşluğa indir.
        text = re.sub(r'\s+', ' ', text)
        # 2. PDF'lerden sızan bozuk karakterleri (null byte vb.) temizle.
        text = text.replace('\x00', '')
        return text.strip()

    def extract_text(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Dosya uzantisina gore dogru okuyucuyu secer.
        PDF -> pdfplumber/pypdf, DOCX -> python-docx
        """
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return self.extract_text_from_pdf(file_path)
        elif ext in (".docx", ".doc"):
            return self.extract_text_from_docx(file_path)
        else:
            print(f"  [ATLANDI] Desteklenmeyen dosya formati: {ext}")
            return []

    def extract_text_from_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Verilen PDF dosyasini okur, Data Cleaning isleminden gecirir ve
        sayfa sayfa parcalayarak listeler.
        Once pdfplumber dener; 0 sayfa donerse pypdf ile fallback yapar.
        """
        documents = self._read_with_pdfplumber(pdf_path)

        # Fallback: pdfplumber hicbir sey cikaramazsa pypdf ile dene
        if not documents:
            print(f"  [FALLBACK] pdfplumber basarisiz, pypdf deneniyor: {os.path.basename(pdf_path)}")
            documents = self._read_with_pypdf(pdf_path)

        return documents

    def extract_text_from_docx(self, docx_path: str) -> List[Dict[str, Any]]:
        """
        DOCX dosyasini okur. Her paragrafi ayri bir 'sayfa' gibi isleme alir.
        """
        documents = []
        try:
            doc = DocxDocument(docx_path)
            full_text = "\n".join(
                para.text for para in doc.paragraphs if para.text.strip()
            )
            if full_text:
                cleaned = self.clean_text(full_text)
                # DOCX'te sayfa kavrami yok, tek bir blok olarak ekliyoruz
                documents.append({
                    "text": cleaned,
                    "metadata": {
                        "source": os.path.basename(docx_path),
                        "page": 1
                    }
                })
        except Exception as e:
            print(f"  [DOCX HATA] {e}")
        return documents

    def _read_with_pdfplumber(self, pdf_path: str) -> List[Dict[str, Any]]:
        """pdfplumber ile PDF okur."""
        documents = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    raw_text = page.extract_text()
                    if raw_text:
                        cleaned_text = self.clean_text(raw_text)
                        documents.append({
                            "text": cleaned_text,
                            "metadata": {
                                "source": os.path.basename(pdf_path),
                                "page": i + 1
                            }
                        })
        except Exception as e:
            print(f"  [pdfplumber HATA] {e}")
        return documents

    def _read_with_pypdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """pypdf ile PDF okur (bozuk baslikli veya non-standard PDF'ler icin fallback)."""
        documents = []
        try:
            reader = pypdf.PdfReader(pdf_path, strict=False)
            for i, page in enumerate(reader.pages):
                raw_text = page.extract_text()
                if raw_text:
                    cleaned_text = self.clean_text(raw_text)
                    documents.append({
                        "text": cleaned_text,
                        "metadata": {
                            "source": os.path.basename(pdf_path),
                            "page": i + 1
                        }
                    })
        except Exception as e:
            print(f"  [pypdf HATA] {e}")
        return documents

    def split_documents(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sayfa sayfa ayrılmış metinleri alır ve RecursiveCharacterTextSplitter kullanarak 
        belirlenmiş boyutlarda ve örtüşme payı (overlap) ile parçalara (chunk) ayırır.
        """
        chunks = []
        for doc in documents:
            text = doc["text"]
            metadata = doc["metadata"]
            
            # Uzun metni parçalara (chunk) bölüyoruz
            split_texts = self.text_splitter.split_text(text)
            
            # Böldüğümüz her parçaya, orijinal sayfa numarası ve kaynak etiketini yapıştırıyoruz
            for chunk_text in split_texts:
                chunks.append({
                    "text": chunk_text,
                    "metadata": metadata
                })
                
        print(f"Toplam {len(documents)} sayfalık doküman, {len(chunks)} adet parçaya (chunk) başarıyla bölündü.")
        return chunks

# Test Amaçlı Çalıştırma Bloğu
if __name__ == "__main__":
    # Sistemin doğruluğunu test etmek için örnek bir senaryo
    print("Doküman Okuyucu (Document Processor) modülü test modunda başlatıldı.")
    # processor = DocumentProcessor()
    # ornek_sayfalar = processor.extract_text_from_pdf("ornek_yonetmelik.pdf")
    # parcalar = processor.split_documents(ornek_sayfalar)
    # print(parcalar[0])
