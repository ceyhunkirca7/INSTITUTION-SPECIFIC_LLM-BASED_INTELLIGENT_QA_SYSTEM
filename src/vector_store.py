import os
import chromadb
from typing import List, Dict, Any
from langchain_huggingface import HuggingFaceEmbeddings

class VectorStore:
    """
    Bu sınıf Langchain'in 'langchain_chroma' gibi hazır wrapper fonksiyonlarını kullanmadan,
    saf ve yalın (native) ChromaDB metodolojisiyle (PersistentClient) vektör veritabanını
    ayağa kaldırmak ve belgeleri yönetmek (Metadata tagleyerek) için tasarlanmıştır.
    """
    def __init__(self, db_path: str = "chroma_db", collection_name: str = "mimarlik_fakultesi"):
        # Bilgisayarda lokal (sunucusuz) arşiv klasörümüzü oluşturuyoruz
        self.client = chromadb.PersistentClient(path=db_path)
        
        # Kullanacağımız güçlü çok dilli (multilingual) Embedding Modelimizi ayarlıyoruz
        # Çok dilli model — Türkçe dahil 50+ dil destekler
        self.embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
        
        # Koleksiyonumuzu yaratıyoruz (eğer varsa var olanı getirir)
        self.collection = self.client.get_or_create_collection(name=collection_name)
        print(f"[{collection_name}] koleksiyonu {db_path} dizininde başarıyla başlatıldı.")

    def add_chunks(self, chunks: List[Dict[str, Any]]):
        """
        DocumentProcessor'dan gelen parçaları alır ve içlerindeki metadata (sayfa, kaynak)
        bilgileriyle birleştirerek ChromaDB'ye kalıcı olarak kaydeder.
        """
        if not chunks:
            print("Kaydedilecek herhangi bir parça (chunk) bulunamadı.")
            return

        documents = []
        metadatas = []
        ids = []

        for i, chunk in enumerate(chunks):
            documents.append(chunk["text"])
            
            # Metadata'nın güvenli (string/int) formata dönüştürülmesi
            clean_metadata = {k: str(v) for k, v in chunk["metadata"].items()}
            metadatas.append(clean_metadata)
            
            # Her parçaya benzersiz bir kimlik (ID) atanması
            # Gerçek bir projede hash kodu kullanmak verinin mükerrer kaydedilmesini engeller.
            doc_id = f"doc_{i}_{clean_metadata.get('source', 'unknown')}_{clean_metadata.get('page', 'unknown')}"
            ids.append(doc_id)

        # Matrisi kullanarak asıl veritabanına ekleme (veya güncelleme)
        # Embedding işlemi ChromaDB veya kullandığımız sınıf tarafından otomatik hesaplatılacak
        # Ancak burada manuel embedding entegrasyonunu da göstermek istersek aşağıdakini kullanabiliriz
        
        # Uyarı: HuggingFaceEmbeddings ile manuel sayı hesabını collection.add() içine 'embeddings=' olarak verebiliriz
        # ancak ChromaDB'nin kendisi bu text'leri zaten alırken gömme yeteneğine sahiptir. Ekstra kod kalabalığına girmeyelim.

        try:
            # Embedding'leri HuggingFace modelimizle manuel hesaplıyoruz
            print(f"{len(documents)} adet metin için embedding hesaplanıyor...")
            embeddings = self.embedding_model.embed_documents(documents)

            # upsert: ID zaten varsa üzerine yazar, yoksa ekler → tekrar çalıştırmada uyarı çıkmaz
            self.collection.upsert(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            print(f"Başarıyla {len(documents)} adet veri parçası veritabanına eklendi.")
        except Exception as e:
            print(f"Veritabanına ekleme yapılırken hata: {e}")

    def semantic_search(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Gelen soru metnini uzay koordinatında arar ve Kosinüs Benzerliği
        mantığıyla en alakalı ilk 'N' adet paragrafı meta verileriyle (sayfa, pdf adı) döndürür.
        """
        print(f"Soru: '{query}' için veritabanında semantic search yapılıyor...")
        
        # Bu aşamada sorunun Embedding (Sayısal koda çevrilmesi) işlemi kütüphane/huggingface tarafından otomatik yapılır
        try:
            # Soruyu da aynı model ile vektöre çeviriyoruz (boyut uyumu zorunlu)
            query_embedding = self.embedding_model.embed_query(query)
            
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
            return results
        except Exception as e:
            print(f"Arama sırasında hata oluştu: {e}")
            return {}

# Test Amaçlı Çalıştırma Bloğu
if __name__ == "__main__":
    print("Vektör Veritabanı modülü test ediliyor...")
    # store = VectorStore()
    # test_chunks = [
    #    {"text": "Mimari tasarım, disiplinler arası bir eğitim sürecidir.", "metadata": {"source": "test.pdf", "page": 1}},
    #    {"text": "Stajlar yaz tatillerinde 30 iş günü sürer.", "metadata": {"source": "staj.pdf", "page": 4}}
    # ]
    # store.add_chunks(test_chunks)
    # search_result = store.semantic_search("Öğrenci stajı ne zaman yapılır?", top_k=1)
    # print(search_result)
