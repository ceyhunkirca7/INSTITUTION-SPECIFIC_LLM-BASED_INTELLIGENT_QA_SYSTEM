/**
 * app.js — CHaRM-AI Frontend Mantığı
 * Sidebar toggle, mesaj gönderme (SSE streaming), sohbet geçmişi (localStorage)
 */

/* ════════════════════════════════════════════
   İNGİLİZCE / TÜRKÇE DİL SÖZLÜĞÜ (i18n)
════════════════════════════════════════════ */
const i18n = {
  tr: {
    important_notes: "Önemli Notlar",
    note_1: "Bu yapay zeka sadece sisteme yüklenmiş ilgili belgelerden cevap verir. Sistemdeki PDF'leri görmek için",
    note_1_link: "buraya tıklayın",
    note_2: "<u>Sadece ilk soruda</u> devasa modellerin belleğe yüklenmesi 1-2 dakika sürebilir, lütfen bekleyiniz.",
    note_3: "Metrikleri değiştirmek için sağ üstteki filtreleme simgesine tıklayın.",
    note_4: "Gelişmiş ayarlar (RAG Settings) menüsünden 'Reranker' özelliğini açmak yapay zekanın belge bulma başarısını artırır.",
    note_5: "Hafif (Light) Reranker daha hızlıdır (5-10 sn), Ağır (Heavy) Reranker ise daha nokta atışı bulur ama yavaştır (15-20 sn). Uyarı: Ağır Reranker için en az 16GB RAM önerilir, aksi halde sistem yetersiz bellek nedeniyle çökebilir.",
    note_6: "Veritabanı menüsünden direkt olarak UNESCO vb. PDF linklerini (URL) yapıştırarak sisteme saniyeler içinde yeni kaynak ekleyebilirsiniz.",
    example_questions: "Örnek Sorular",
    chat_history: "Sohbetler",
    search_chat: "Sohbetlerde ara...",
    new_chat: "Yeni Sohbet",
    db_management: "Veritabanı",
    settings: "Ayarlar",
    no_notif: "Yeni bildirim yok",
    export_chats: "Sohbetleri Dışa Aktar",
    delete_all_chats: "Tüm Sohbetleri Sil",
    ask_charm: "CHaRM'a sorun...",
    upload_pdf: "PDF Yükle",
    drag_drop: "PDF dosyalarını sürükle bırak ya da seç",
    max_5gb: "PDF, DOCX &middot; Maks 5 GB",
    choose_file: "Dosya Seç",
    preparing: "Hazırlanıyor...",
    db_files: "Veritabanındaki Dosyalar",
    search_file: "Dosya ara...",
    appearance: "Görünüm",
    dark_mode: "Karanlık Mod",
    dark_mode_desc: "Koyu renk temasına geç",
    chats: "Sohbetler",
    export_desc: "Tüm sohbet geçmişini JSON olarak indir",
    download: "İndir",
    archive_all: "Tüm Sohbetleri Arşivle",
    archive_desc: "Sohbetleri gizle ama silme",
    archive: "Arşivle",
    delete_desc: "Bu işlem geri alınamaz",
    delete: "Sil",
    about: "Hakkında",
    about_desc: "Mimari miras koruma ve afet risk yönetimi alanında uzmanlaşmış RAG tabanlı yapay zeka asistanı.",
    are_you_sure: "Emin misiniz?",
    cancel: "İptal",
    manage_archive: "Arşivlenmiş Sohbetleri Yönet",
    manage_archive_desc: "Arşivdeki sohbetleri gör, geri al veya sil",
    manage: "Yönet",
    archived_chats: "Arşivlenmiş Sohbetler",
    reranker_disabled: "Kapalı",
    reranker_heavy: "BGE-v2-m3 (Ağır)",
    reranker_light: "MiniLM-L6 (Hafif)",
    top_k_llm: "Top K <span class=\"config-hint\">(LLM'e giden)</span>",
    initial_top_k_hint: "(Sadece Rerank modunda işlevli)",
    paste_url_placeholder: "PDF Linki Yapıştır (Örn: https://whc.unesco.org/...)",
    upload_url_btn: "Linkten Yükle",
    upload_warning: "Bu işlem normal bir dosya yüklemesi değildir. Dosyalar yapay zeka için yüzlerce parçaya (chunk) bölünür ve matematiksel vektörleri hesaplanır. Dosya boyutuna göre uzun sürebilir.",
    dynamic: {
      voice_not_supported: "Tarayıcınız sesli girişi desteklemiyor (Chrome/Edge kullanın)",
      upload_failed: "Yükleme başarısız",
      files_uploaded: "dosya yüklendi, işleme başladı.",
      processing: "İşleniyor...",
      models_preparing: "Yapay zeka modelleri belleğe yükleniyor...",
      files_added: "dosya eklendi",
      file_label: "Dosya",
      chunk_label: "Parça",
      yes: "Evet",
      no_results: "Sonuç bulunamadı",
      list_failed: "Liste yüklenemedi.",
      delete_chat_confirm: "Bu sohbeti silmek istediğine emin misin?",
      chat_archived: "Sohbet arşivlendi!",
      conn_error: "Bağlantı hatası:",
      delete_all_confirm: "Tüm sohbetleri silmek istediğinize emin misiniz?",
      all_archived: "Tüm sohbetler arşivlendi!",
      error: "Hata",
      delete_all_title: "Tüm sohbetleri sil",
      all_deleted: "Tüm sohbetler silindi.",
      restore: "Geri Al",
      delete_permanently: "Kalıcı Sil",
      restored_success: "Sohbet başarıyla geri yüklendi!",
      no_archived_chats: "Arşivlenmiş sohbet bulunmuyor.",
      delete_doc_title: "Dosyayı Sil",
      delete_doc_confirm: "dosyasını veritabanından silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      delete_doc_btn: "Sil",
      delete_doc_error: "Silme hatası:",
      delete_doc_conn_error: "Sunucuya ulaşılamadı.",
      sources_label: "kaynak",
      sources_hide: "Kaynakları gizle",
      page: "Sayfa",
      unknown_source: "Bilinmeyen Kaynak",
      time_now: "şimdi",
      time_min: "dk",
      time_hr: "sa",
      time_day: "g",
      sources_used: "Kullanılan Kaynaklar",
      sources_additional: "Getirilen Ek Bağlam"
    }
  },
  en: {
    important_notes: "Important Notes",
    note_1: "This AI only answers from relevant documents uploaded to the system. To view the PDFs in the system,",
    note_1_link: "click here",
    note_2: "Loading massive models into memory during the <u>only first question</u> may take 1-2 minutes, please wait.",
    note_3: "To change metrics, click the filter icon on the top right.",
    note_4: "Enabling the 'Reranker' feature from the RAG Settings menu increases the AI's success in finding the right documents.",
    note_5: "The Light Reranker is faster (5-10 sec), while the Heavy Reranker is more precise but slower (15-20 sec). Warning: At least 16GB RAM is recommended for the Heavy Reranker, otherwise the system may crash due to insufficient memory.",
    note_6: "You can quickly add new sources to the system in seconds by pasting UNESCO or similar PDF links directly into the Database menu.",
    example_questions: "Example Questions",
    chat_history: "Chats",
    search_chat: "Search chats...",
    new_chat: "New Chat",
    db_management: "Database",
    settings: "Settings",
    no_notif: "No new notifications",
    export_chats: "Export Chats",
    delete_all_chats: "Delete All Chats",
    ask_charm: "Ask CHaRM...",
    upload_pdf: "Upload PDF",
    drag_drop: "Drag & drop PDF files or select",
    max_5gb: "PDF, DOCX &middot; Max 5 GB",
    choose_file: "Choose File",
    preparing: "Preparing...",
    db_files: "Database Files",
    search_file: "Search file...",
    appearance: "Appearance",
    dark_mode: "Dark Mode",
    dark_mode_desc: "Switch to dark color theme",
    chats: "Chats",
    export_desc: "Download all chat history as JSON",
    download: "Download",
    archive_all: "Archive All Chats",
    archive_desc: "Hide chats without deleting",
    archive: "Archive",
    delete_desc: "This action cannot be undone",
    delete: "Delete",
    about: "About",
    about_desc: "RAG-based AI assistant specialized in architectural heritage conservation and disaster risk management.",
    are_you_sure: "Are you sure?",
    cancel: "Cancel",
    manage_archive: "Manage Archived Chats",
    manage_archive_desc: "View, restore or delete archived chats",
    manage: "Manage",
    archived_chats: "Archived Chats",
    reranker_disabled: "Disabled",
    reranker_heavy: "BGE-v2-m3 (Heavy)",
    reranker_light: "MiniLM-L6 (Light)",
    top_k_llm: "Top K <span class=\"config-hint\">(To LLM)</span>",
    initial_top_k_hint: "(Only active in Rerank mode)",
    paste_url_placeholder: "Paste PDF Link (e.g., https://whc.unesco.org/...)",
    upload_url_btn: "Upload from Link",
    upload_warning: "This is not a regular file upload. Documents are split into hundreds of chunks and mathematical vectors are calculated. This process may take a while depending on file size.",
    dynamic: {
      voice_not_supported: "Your browser does not support voice input (use Chrome/Edge)",
      upload_failed: "Upload failed",
      files_uploaded: "file(s) uploaded, processing started.",
      processing: "Processing...",
      models_preparing: "AI models are loading into memory...",
      files_added: "files added",
      file_label: "File",
      chunk_label: "Chunk",
      yes: "Yes",
      no_results: "No results found",
      list_failed: "Failed to load list.",
      delete_chat_confirm: "Are you sure you want to delete this chat?",
      chat_archived: "Chat archived!",
      conn_error: "Connection error:",
      delete_all_confirm: "Are you sure you want to delete all chats?",
      all_archived: "All chats archived!",
      error: "Error",
      delete_all_title: "Delete all chats",
      all_deleted: "All chats deleted.",
      restore: "Restore",
      delete_permanently: "Delete",
      restored_success: "Chat restored successfully!",
      no_archived_chats: "No archived chats found.",
      delete_doc_title: "Delete File",
      delete_doc_confirm: "Are you sure you want to remove this file from the database? This action cannot be undone.",
      delete_doc_btn: "Delete",
      delete_doc_error: "Delete error:",
      delete_doc_conn_error: "Could not reach the server.",
      sources_label: "source(s)",
      sources_hide: "Hide sources",
      page: "Page",
      unknown_source: "Unknown Source",
      time_now: "now",
      time_min: "m",
      time_hr: "h",
      time_day: "d",
      sources_used: "Sources Used",
      sources_additional: "Additional Retrieved Context"
    }
  }
};

let currentLang = localStorage.getItem('charm_lang') || 'tr';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('charm_lang', lang);
  const dict = i18n[lang];

  // Data etiketlerine göre çevir
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.innerHTML = dict[key]; // innerHTML kullandık çünkü max_5gb gibi tagler html içeriyor
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });

  // Üst butondaki yazıyı güncelle
  const langText = document.getElementById('current-lang-text');
  if (langText) langText.textContent = lang === 'tr' ? 'TR' : 'EN';
}

function t(key) {
  return i18n[currentLang].dynamic[key] || key;
}

/* ════════════════════════════════════════════
   STATE
════════════════════════════════════════════ */
let conversations = [];         // [{id, title, messages:[]}]
let activeConvId  = null;       // Aktif sohbetin ID'si
let isLoading     = false;      // İstek devam ediyor mu?

/* ════════════════════════════════════════════
   DOM REFERANSLARI
════════════════════════════════════════════ */
const sidebar       = document.getElementById('sidebar');
const sidebarHeader = document.getElementById('sidebar-header');
const convList      = document.getElementById('conv-list');
const convSearch    = document.getElementById('conv-search');
const newChatBtn    = document.getElementById('new-chat-btn');

const welcomeView   = document.getElementById('welcome-view');
const welcomeInput  = document.getElementById('welcome-input');
const welcomeSend   = document.getElementById('welcome-send');

const chatView      = document.getElementById('chat-view');
const chatInput     = document.getElementById('chat-input');
const chatSend      = document.getElementById('chat-send');
const messagesEl    = document.getElementById('messages');

/* ════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════ */
sidebarHeader.addEventListener('click', toggleSidebar);
sidebarHeader.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggleSidebar(); });

function toggleSidebar() {
  sidebar.classList.toggle('expanded');
}

// ESC tuşu ile sidebar kapatma (tablet/mobile)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && sidebar.classList.contains('expanded')) {
    sidebar.classList.remove('expanded');
  }
});

/* ════════════════════════════════════════════
   SOHBET GEÇMİŞİ — localStorage
════════════════════════════════════════════ */
function loadConversations() {
  try {
    const stored = localStorage.getItem('charm_conversations');
    conversations = stored ? JSON.parse(stored) : [];
  } catch { conversations = []; }
}

function saveConversations() {
  localStorage.setItem('charm_conversations', JSON.stringify(conversations));
}

function createConversation(firstMessage) {
  const id = Date.now().toString();
  const title = firstMessage.length > 35 ? firstMessage.slice(0, 35) + '…' : firstMessage;
  const conv  = { id, title, messages: [], createdAt: Date.now() };
  conversations.unshift(conv);
  saveConversations();
  return conv;
}

function getActiveConv() {
  return conversations.find(c => c.id === activeConvId) || null;
}

function addMessageToConv(convId, role, content, sources = []) {
  const conv = conversations.find(c => c.id === convId);
  if (conv) {
    conv.messages.push({ role, content, sources, ts: Date.now() });
    saveConversations();
  }
}

function renderConvList(filter = '') {
  convList.innerHTML = '';
  const filtered = filter
    ? conversations.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()))
    : conversations;

  filtered.forEach(conv => {
    if (conv.archived) return; // Arşivlenenleri listede gösterme

    const li = document.createElement('li');
    li.className = 'conv-item' + (conv.id === activeConvId ? ' active' : '');
    li.dataset.id = conv.id;

    const age = getRelativeTime(conv.createdAt);

    li.innerHTML = `
      <i data-lucide="message-square"></i>
      <span class="conv-title">${escHtml(conv.title)}</span>
      <span class="conv-time">${age}</span>
      <div class="conv-options">
        <button class="conv-opt-btn" aria-label="Seçenekler" onclick="event.stopPropagation(); toggleConvMenu('${conv.id}')">
          <i data-lucide="more-horizontal"></i>
        </button>
        <div class="conv-menu" id="menu-${conv.id}" hidden>
          <button onclick="event.stopPropagation(); archiveConversation('${conv.id}')">
            <i data-lucide="archive"></i> ${i18n[currentLang].archive}
          </button>
          <button class="delete-btn" onclick="event.stopPropagation(); deleteConversation('${conv.id}')">
            <i data-lucide="trash-2"></i> ${i18n[currentLang].delete}
          </button>
        </div>
      </div>
    `;

    li.addEventListener('click', () => openConversation(conv.id));
    convList.appendChild(li);
  });

  // İkonları yenile
  if (window.lucide) lucide.createIcons();
}

convSearch.addEventListener('input', () => renderConvList(convSearch.value));

function openConversation(id) {
  activeConvId = id;
  const conv   = getActiveConv();
  if (!conv) return;

  // Welcome → Chat geçişi
  showChatView();

  // Mesajları render et
  messagesEl.innerHTML = '';
  conv.messages.forEach(m => appendMessageBubble(m.role, m.content, m.sources || []));

  renderConvList(convSearch.value);
  scrollToBottom();
}

function toggleConvMenu(id) {
  // Açık olan diğer menüleri kapat
  document.querySelectorAll('.conv-menu').forEach(m => {
    if (m.id !== `menu-${id}`) m.setAttribute('hidden', '');
  });
  const menu = document.getElementById(`menu-${id}`);
  if (menu) {
    if (menu.hasAttribute('hidden')) menu.removeAttribute('hidden');
    else menu.setAttribute('hidden', '');
  }
}

// Menü dışına tıklanınca kapat
document.addEventListener('click', (e) => {
  if (!e.target.closest('.conv-options')) {
    document.querySelectorAll('.conv-menu').forEach(m => m.setAttribute('hidden', ''));
  }
});

function deleteConversation(id) {
  if (!confirm(t('delete_chat_confirm'))) return;
  conversations = conversations.filter(c => c.id !== id);
  saveConversations();
  if (activeConvId === id) showWelcomeView();
  renderConvList(convSearch ? convSearch.value : '');
}

function archiveConversation(id) {
  const conv = conversations.find(c => c.id === id);
  if (conv) {
    conv.archived = true;
    saveConversations();
    if (activeConvId === id) showWelcomeView();
    renderConvList(convSearch ? convSearch.value : '');
    showToast(t('chat_archived'));
  }
}

/* ════════════════════════════════════════════
   VIEW GEÇİŞLERİ
════════════════════════════════════════════ */
function showChatView() {
  welcomeView.style.display = 'none';
  chatView.removeAttribute('hidden');
  // Yeni bir sohbete geçerken kilitleri kaldır
  isLoading = false;
  if (typeof setInputsDisabled === 'function') setInputsDisabled(false);
}

function showWelcomeView() {
  welcomeView.style.display = '';
  chatView.setAttribute('hidden', '');
  activeConvId = null;
  messagesEl.innerHTML = '';
  
  // Arayüz sıfırlanırken tüm input kilitlerini aç ve temizle
  isLoading = false;
  if (typeof setInputsDisabled === 'function') setInputsDisabled(false);
  welcomeInput.value = '';
  chatInput.value = '';
  if (typeof autoResize === 'function') {
    autoResize(welcomeInput);
    autoResize(chatInput);
  }
}

// Model seçicileri senkronize et — biri değişince diğeri de güncellenir
(function() {
  const selW = document.getElementById('model-selector-welcome');
  const selC = document.getElementById('model-selector-chat');
  if (!selW || !selC) return;
  selW.addEventListener('change', () => { selC.value = selW.value; });
  selC.addEventListener('change', () => { selW.value = selC.value; });
})();

// Geçerli model ID'leri — eski/deprecated değerleri sıfırla
(function validateModelSelectors() {
  const VALID_MODELS = [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'qwen/qwen3-32b'
  ];
  ['model-selector-welcome', 'model-selector-chat'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    if (!VALID_MODELS.includes(sel.value)) {
      sel.value = 'llama-3.1-8b-instant';
    }
  });
})();

/* ════════════════════════════════════════════
   MESAJ GÖNDERME
════════════════════════════════════════════ */
async function sendMessage(text) {
  if (!text.trim() || isLoading) return;
  isLoading = true;
  setInputsDisabled(true);

  // İlk mesajsa yeni sohbet oluştur ve chat view'a geç
  if (!activeConvId) {
    const conv = createConversation(text);
    activeConvId = conv.id;
    showChatView();
    renderConvList();
  }

  // Kullanıcı balonu
  addMessageToConv(activeConvId, 'user', text);
  appendMessageBubble('user', text, []);
  scrollToBottom();

  // Typing indicator
  const typingEl = appendTypingIndicator();

  // Temizle input
  welcomeInput.value = '';
  chatInput.value    = '';
  autoResize(chatInput);
  autoResize(welcomeInput);

  // SSE stream'i dinle
  let aiText    = '';
  let aiSources = [];
  const _reqStart = Date.now(); // ← zamanlayıcı başlat

  try {
    const selW  = document.getElementById('model-selector-welcome');
    const selC  = document.getElementById('model-selector-chat');
    const selectedModel = (selC && !selC.closest('[hidden]') ? selC : selW)?.value || 'llama-3.1-8b-instant';

    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, model: selectedModel })
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const reader  = resp.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

    // Typing indicator kaldır, boş AI balonu oluştur
    typingEl.remove();
    const aiBubble = appendMessageBubble('ai', '', []);
    const bubbleText = aiBubble.querySelector('.msg-bubble');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Tamamlanmamış satır tampona bırakılır

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'token') {
            aiText += data.content;
            bubbleText.innerHTML = formatMessageContent(aiText, aiSources);
            scrollToBottom();

          } else if (data.type === 'sources') {
            aiSources = data.content || [];
            // Kaynak butonu ekle
            renderSources(aiBubble, aiSources, aiText);
            // Linkleri aktifleştirmek için metni tekrar formatla
            bubbleText.innerHTML = formatMessageContent(aiText, aiSources);

          } else if (data.type === 'done') {
            // Konuşmayı kaydet
            addMessageToConv(activeConvId, 'ai', aiText, aiSources);
            // Metin tamamen bittikten sonra kaynakları TEKRAR renderla (Başlıkların çıkması için)
            if (aiSources && aiSources.length > 0) {
              renderSources(aiBubble, aiSources, aiText);
            }
            // Like/Dislike ekle
            renderActions(aiBubble);
            if (window.lucide) lucide.createIcons();
            // Bildirim ekle (süreyle birlikte)
            const _elapsed = ((Date.now() - _reqStart) / 1000).toFixed(1);
            const _activeConv = conversations.find(c => c.id === activeConvId);
            addNotification(_activeConv ? _activeConv.title : 'Sohbet', _elapsed);

          } else if (data.type === 'error') {
            bubbleText.textContent = `${t('error')}: ${data.content}`;
          }
        } catch { /* JSON parse hatası, devam et */ }
      }
    }
  } catch (err) {
    typingEl?.remove();
    appendMessageBubble('ai', `${t('conn_error')} ${err.message}`, []);
  } finally {
    isLoading = false;
    setInputsDisabled(false);
    chatInput.focus();
    scrollToBottom();
  }
}

/* ════════════════════════════════════════════
   BALON / UI HELPERS
════════════════════════════════════════════ */
function formatMessageContent(content, sources) {
  if (!content) return '';
  // XSS koruması
  let html = escHtml(content);

  // Markdown Bold (**text**) ve İtalik (*text*)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '<em>$1</em>');
  
  // Satır atlamaları
  html = html.replace(/\n/g, '<br>');

  // [Source X, Page Y] yakalama ve linke çevirme (Çoklu kaynaklar ve yuvarlak parantezler dahil)
  if (sources && sources.length > 0) {
    html = html.replace(/([\[\(])(.*?[sS]ource.*?)([\]\)])/g, (match, openBracket, innerText, closeBracket) => {
      let modifiedInner = innerText.replace(/Source\s+(\d+)(?:,\s*Page\s+([\w\d]+))?/gi, (srcMatch, idxStr) => {
        const idx = parseInt(idxStr, 10) - 1;
        if (idx >= 0 && idx < sources.length) {
          const src = sources[idx];
          const url = src.url || '#';
          return `<a href="${url}" target="_blank" class="inline-citation" title="${escHtml(src.name || '')}">${srcMatch}</a>`;
        }
        return srcMatch;
      });
      return `${openBracket}${modifiedInner}${closeBracket}`;
    });
  }
  return html;
}

function appendMessageBubble(role, content, sources) {
  const div = document.createElement('div');
  div.className = `msg msg-${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = formatMessageContent(content, sources);
  div.appendChild(bubble);

  // AI mesajına aksiyonlar (like/dislike) + kaynaklar sonradan eklenir
  if (role === 'ai' && sources && sources.length > 0) {
    renderSources(div, sources, content);
  }
  if (role === 'ai' && content) {
    renderActions(div);
    if (window.lucide) lucide.createIcons();
  }

  messagesEl.appendChild(div);
  return div;
}

function renderActions(parentEl) {
  // Varsa eski actions kaldır
  parentEl.querySelectorAll('.msg-actions').forEach(el => el.remove());

  const actions = document.createElement('div');
  actions.className = 'msg-actions';

  const likeBtn    = makeActionBtn('thumbs-up',   'Beğen');
  const dislikeBtn = makeActionBtn('thumbs-down', 'Beğenme');

  // Toggle mantığı: 2. tıklamada kaldır
  [likeBtn, dislikeBtn].forEach((btn, i) => {
    const other = i === 0 ? dislikeBtn : likeBtn;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
      } else {
        btn.classList.add('active');
        other.classList.remove('active');
      }
    });
  });

  actions.appendChild(likeBtn);
  actions.appendChild(dislikeBtn);
  parentEl.appendChild(actions);
}

function makeActionBtn(icon, label) {
  const btn = document.createElement('button');
  btn.className = 'action-btn';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = `<i data-lucide="${icon}"></i>`;
  return btn;
}

function renderSources(parentEl, sources, aiText = "") {
  if (!sources || sources.length === 0) return;
  parentEl.querySelectorAll('.msg-sources').forEach(el => el.remove());

  // Hangi kaynakların metinde geçtiğini bul
  const citedIndices = new Set();
  if (aiText) {
    const bracketRegex = /([\[\(])(.*?)([\]\)])/g;
    let bMatch;
    while ((bMatch = bracketRegex.exec(aiText)) !== null) {
      const innerText = bMatch[2];
      const sourceRegex = /Source\s+(\d+)/gi;
      let sMatch;
      while ((sMatch = sourceRegex.exec(innerText)) !== null) {
        const idx = parseInt(sMatch[1], 10) - 1;
        if (idx >= 0 && idx < sources.length) citedIndices.add(idx);
      }
    }
  }

  const usedSources = [];
  const unusedSources = [];
  sources.forEach((src, idx) => {
    // Model hiç kaynak göstermemişse veya kaynağı göstermişse "used" listesine al
    if (citedIndices.size === 0 || citedIndices.has(idx)) {
      usedSources.push({ ...src, originalIdx: idx });
    } else {
      unusedSources.push({ ...src, originalIdx: idx });
    }
  });

  const wrap = document.createElement('div');
  wrap.className = 'msg-sources';

  const toggle = document.createElement('button');
  toggle.className = 'sources-toggle';
  toggle.innerHTML = `<i data-lucide="book-open"></i> ${sources.length} ${t('sources_label')}`;

  const list = document.createElement('div');
  list.className = 'sources-list';

  function renderList(srcArr, titleKey) {
    if (srcArr.length === 0) return;
    
    // Eğer ayrım varsa başlık ekle
    if (citedIndices.size > 0 && unusedSources.length > 0) {
      const titleEl = document.createElement('div');
      titleEl.className = 'source-section-title';
      titleEl.style.cssText = 'font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin: 8px 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;';
      titleEl.innerHTML = t(titleKey);
      list.appendChild(titleEl);
    }

    srcArr.forEach(src => {
      const item = document.createElement('div');
      item.className = 'source-item';
      const num = `<span class="source-num">${src.originalIdx + 1}.</span> `;
      
      if (typeof src === 'string') {
        item.innerHTML = num + escHtml(src);
      } else if (src && typeof src === 'object') {
        item.innerHTML = `${num}<a href="${src.url || '#'}" target="_blank" style="color: inherit; text-decoration: underline;">${escHtml(src.name || t('unknown_source'))} (${t('page')} ${src.page || '?'})</a>`;
      }
      
      list.appendChild(item);
    });
  }

  renderList(usedSources, 'sources_used');
  renderList(unusedSources, 'sources_additional');

  toggle.addEventListener('click', () => {
    list.classList.toggle('open');
    toggle.innerHTML = list.classList.contains('open')
      ? `<i data-lucide="book-open"></i> ${t('sources_hide')}`
      : `<i data-lucide="book-open"></i> ${sources.length} ${t('sources_label')}`;
    if (window.lucide) lucide.createIcons();
  });

  wrap.appendChild(toggle);
  wrap.appendChild(list);
  parentEl.appendChild(wrap);
}

function appendTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'msg msg-ai';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble typing-indicator';
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  div.appendChild(bubble);

  messagesEl.appendChild(div);
  scrollToBottom();
  return div;
}

/* ════════════════════════════════════════════
   EVENT LISTENERS — INPUT & SEND
════════════════════════════════════════════ */
function setupInput(inputEl, sendBtn) {
  // Auto-resize textarea
  inputEl.addEventListener('input', () => autoResize(inputEl));

  // Enter gönder, Shift+Enter yeni satır
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
}

setupInput(welcomeInput, welcomeSend);
setupInput(chatInput, chatSend);

// Suggestion chips
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const text = chip.dataset.text || chip.textContent.trim();
    if (welcomeView.style.display !== 'none') {
      welcomeInput.value = text;
      welcomeInput.focus();
    } else {
      chatInput.value = text;
      chatInput.focus();
    }
  });
});

// Yeni sohbet butonu
newChatBtn.addEventListener('click', () => {
  showWelcomeView();
  renderConvList();
  welcomeInput.focus();
});

/* ════════════════════════════════════════════
   UTILS
════════════════════════════════════════════ */
function autoResize(el) {
  el.style.height = 'auto';
  let sh = el.scrollHeight;
  if (sh === 0) sh = 24; // Element gizliyken scrollHeight 0 döner, çökmesini engelle
  el.style.height = Math.min(sh, 160) + 'px';
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setInputsDisabled(val) {
  welcomeInput.disabled = val;
  welcomeSend.disabled  = val;
  chatInput.disabled    = val;
  chatSend.disabled     = val;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getRelativeTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const locale = currentLang === 'en' ? 'en-US' : 'tr-TR';
  if (mins < 1)   return t('time_now');
  if (mins < 60)  return `${mins}${t('time_min')}`;
  if (hrs  < 24)  return `${hrs}${t('time_hr')}`;
  if (days < 7)   return `${days}${t('time_day')}`;
  return new Date(ts).toLocaleDateString(locale, { day:'numeric', month:'short' });
}

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
// Dil uygulamasını başlat
applyLanguage(currentLang);

loadConversations();
renderConvList();

// Dark mode: localStorage'dan hatırla
if (localStorage.getItem('charm_dark') === '1') {
  document.body.classList.add('dark');
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) toggle.checked = true;
}

// Sayfa yüklendiğinde welcome input'a odaklan
welcomeInput.focus();

// Önemli Notlar Accordion
const notesToggle = document.getElementById('notes-toggle');
const notesContent = document.getElementById('notes-content');
if (notesToggle && notesContent) {
  notesToggle.addEventListener('click', () => {
    if (notesContent.hasAttribute('hidden')) {
      notesContent.removeAttribute('hidden');
      notesToggle.classList.add('open');
    } else {
      notesContent.setAttribute('hidden', '');
      notesToggle.classList.remove('open');
    }
  });
}

// "Buraya tıklayın" linkiyle veritabanını aç
const noteDbLink = document.getElementById('note-db-link');
if (noteDbLink) {
  noteDbLink.addEventListener('click', (e) => {
    e.preventDefault();
    const dbBtn = document.getElementById('db-btn');
    if (dbBtn) dbBtn.click();
  });
}

/* ════════════════════════════════════════════
   AYARLAR MODALI
════════════════════════════════════════════ */
const settingsBtn     = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsClose   = document.getElementById('settings-close');
const darkModeToggle  = document.getElementById('dark-mode-toggle');
const exportBtn       = document.getElementById('export-btn');
const archiveBtn      = document.getElementById('archive-btn');
const clearAllBtn     = document.getElementById('clear-all-btn');

function openSettings() {
  settingsOverlay.removeAttribute('hidden');
  settingsClose.focus();
  if (window.lucide) lucide.createIcons();
}

function closeSettings() {
  settingsOverlay.setAttribute('hidden', '');
}

settingsBtn.addEventListener('click', openSettings);
settingsClose.addEventListener('click', closeSettings);

// Overlay'e tıklayınca kapat
settingsOverlay.addEventListener('click', e => {
  if (e.target === settingsOverlay) closeSettings();
});

// ESC ile kapat
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !settingsOverlay.hasAttribute('hidden')) {
    closeSettings();
  }
});

// Dark Mode Toggle
darkModeToggle.addEventListener('change', () => {
  if (darkModeToggle.checked) {
    document.body.classList.add('dark');
    localStorage.setItem('charm_dark', '1');
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('charm_dark', '0');
  }
});

// Sohbetleri Dışa Aktar
function exportConversations() {
  const blob = new Blob([JSON.stringify(conversations, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `charm-ai-sohbetler-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

exportBtn.addEventListener('click', exportConversations);

// Arşivle (görünürden kaldır ama silme)
archiveBtn.addEventListener('click', () => {
  conversations.forEach(c => c.archived = true);
  saveConversations();
  showWelcomeView();
  renderConvList();
  closeSettings();
  showToast(t('all_archived'));
});

// Tümünü Sil
clearAllBtn.addEventListener('click', () => {
  openConfirm(
    t('delete_all_title'),
    t('delete_all_confirm'),
    () => {
      conversations = [];
      saveConversations();
      showWelcomeView();
      renderConvList();
      closeSettings();
      showToast(t('all_deleted'));
    }
  );
});

/* ════════════════════════════════════════════
   DROPDOWN — BİLDİRİM & KULLANICI & DİL
════════════════════════════════════════════ */
const notifBtn   = document.getElementById('notif-btn');
const notifPanel = document.getElementById('notif-panel');
const avatarBtn  = document.getElementById('avatar-btn');
const userMenu   = document.getElementById('user-menu');
const langToggleBtn = document.getElementById('lang-toggle-btn');
const langMenu   = document.getElementById('lang-menu');

// Dropdown aç/kapat
function toggleDropdown(panel) {
  const isOpen = !panel.hasAttribute('hidden');
  // Önce hepsini kapat
  notifPanel.setAttribute('hidden', '');
  userMenu.setAttribute('hidden', '');
  if (langMenu) langMenu.setAttribute('hidden', '');
  
  // Kapalıysa aç
  if (!isOpen) {
    panel.removeAttribute('hidden');
    if (window.lucide) lucide.createIcons();
  }
}

notifBtn.addEventListener('click', e => {
  e.stopPropagation();
  const wasHidden = notifPanel.hasAttribute('hidden');
  toggleDropdown(notifPanel);
  if (wasHidden) {
    // Panel açıldı: içeriği render et, badge temizle
    renderNotifications();
    document.getElementById('notif-dot').style.display = 'none';
  }
});

/* ════════════════════════════════════════════
   BİLDİRİM SİSTEMİ
════════════════════════════════════════════ */
let _notifItems = [];

function addNotification(convTitle, elapsedSec) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  _notifItems.unshift({ title: convTitle, time, elapsed: elapsedSec });
  // Badge göster
  document.getElementById('notif-dot').style.display = '';
}

function renderNotifications() {
  const list     = document.getElementById('notif-list');
  const empty    = document.getElementById('notif-empty');
  const clearBtn = document.getElementById('notif-clear-btn');
  if (!list) return;

  list.innerHTML = '';
  if (_notifItems.length === 0) {
    empty.removeAttribute('hidden');
    clearBtn.setAttribute('hidden', '');
    return;
  }
  empty.setAttribute('hidden', '');
  clearBtn.removeAttribute('hidden');

  _notifItems.forEach(n => {
    const li = document.createElement('li');
    li.className = 'notif-item';
    li.innerHTML = `
      <i data-lucide="check-circle" class="notif-item-icon"></i>
      <div class="notif-item-body">
        <span class="notif-item-title">Response ready <span class="notif-elapsed">${n.elapsed}s</span></span>
        <span class="notif-item-sub">${escHtml(n.title)} · ${n.time}</span>
      </div>`;
    list.appendChild(li);
  });
  if (window.lucide) lucide.createIcons();
}

document.getElementById('notif-clear-btn').addEventListener('click', e => {
  e.stopPropagation();
  _notifItems = [];
  document.getElementById('notif-dot').style.display = 'none';
  renderNotifications();
});

avatarBtn.addEventListener('click', e => {
  e.stopPropagation();
  toggleDropdown(userMenu);
});

if (langToggleBtn && langMenu) {
  langToggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleDropdown(langMenu);
  });
  
  document.getElementById('lang-tr-btn').addEventListener('click', () => {
    applyLanguage('tr');
    langMenu.setAttribute('hidden', '');
  });
  
  document.getElementById('lang-en-btn').addEventListener('click', () => {
    applyLanguage('en');
    langMenu.setAttribute('hidden', '');
  });
}

// Dışarı tıklayınca kapat
document.addEventListener('click', () => {
  notifPanel.setAttribute('hidden', '');
  userMenu.setAttribute('hidden', '');
  if (langMenu) langMenu.setAttribute('hidden', '');
  document.querySelectorAll('.conv-menu').forEach(m => m.setAttribute('hidden', ''));
});

// Kullanıcı menüsü butonları
document.getElementById('dm-settings').addEventListener('click', () => {
  userMenu.setAttribute('hidden', '');
  openSettings();
});

document.getElementById('dm-export').addEventListener('click', () => {
  userMenu.setAttribute('hidden', '');
  exportConversations();
});

document.getElementById('dm-clear-all').addEventListener('click', () => {
  userMenu.setAttribute('hidden', '');
  openConfirm(
    t('delete_all_title'),
    t('delete_all_confirm'),
    () => {
      conversations = [];
      saveConversations();
      showWelcomeView();
      renderConvList();
      showToast(t('all_deleted'));
    }
  );
});

/* ════════════════════════════════════════════
   ONAY DİYALOĞU
════════════════════════════════════════════ */
const confirmOverlay = document.getElementById('confirm-overlay');
const confirmTitle   = document.getElementById('confirm-title');
const confirmDesc    = document.getElementById('confirm-desc');
const confirmCancel  = document.getElementById('confirm-cancel');
const confirmOk      = document.getElementById('confirm-ok');

let _confirmCallback = null;

function openConfirm(title, desc, onOk) {
  confirmTitle.textContent = title;
  confirmDesc.textContent  = desc;
  _confirmCallback = onOk;
  confirmOverlay.removeAttribute('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeConfirm() {
  confirmOverlay.setAttribute('hidden', '');
  _confirmCallback = null;
}

confirmCancel.addEventListener('click', closeConfirm);
confirmOk.addEventListener('click', () => {
  if (_confirmCallback) _confirmCallback();
  closeConfirm();
});
confirmOverlay.addEventListener('click', e => {
  if (e.target === confirmOverlay) closeConfirm();
});

/* ════════════════════════════════════════════
   TOAST BİLDİRİMLERİ
════════════════════════════════════════════ */
function showToast(message, duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // CSS için toast stili yoksa oluştur
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      .toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #1A1A1A;
        color: #FFF;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 13.5px;
        z-index: 999;
        animation: toastIn 0.2s ease both;
      }
      body.dark .toast { background: #F0F0F0; color: #111; }
      @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(8px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => toast.remove(), duration);
}

/* ════════════════════════════════════════════
   SESLİ GİRİŞ — Web Speech API
════════════════════════════════════════════ */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang        = 'en-US';   // İngilizce sorular için
  recognition.interimResults = true;   // Yazılırken anlık göster
  recognition.continuous  = false;

  let activeInput   = null;  // Hangi textarea'ya yazılacak
  let activeMicBtn  = null;  // Hangi mikrofon butonu aktif
  let isListening   = false;

  function startListening(inputEl, micBtn) {
    if (isListening) {
      recognition.stop();
      return;
    }

    activeInput  = inputEl;
    activeMicBtn = micBtn;

    try {
      recognition.start();
    } catch (e) {
      showToast('Mikrofon başlatılamadı: ' + e.message);
    }
  }

  recognition.onstart = () => {
    isListening = true;
    if (activeMicBtn) {
      activeMicBtn.classList.add('mic-active');
      activeMicBtn.setAttribute('aria-label', 'Dinleniyor... (durdurmak için tıkla)');
    }
    showToast('🎤 Dinleniyor...', 10000);
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (activeInput) {
      activeInput.value = transcript;
      autoResize(activeInput);
    }
  };

  recognition.onend = () => {
    isListening = false;
    if (activeMicBtn) {
      activeMicBtn.classList.remove('mic-active');
      activeMicBtn.setAttribute('aria-label', 'Sesli soru sor');
    }
    // Toast varsa kapat
    document.querySelector('.toast')?.remove();

    // Eğer içerik doluysa otomatik gönder
    if (activeInput && activeInput.value.trim()) {
      showToast('✓ Ses alındı, gönderiliyor...');
      setTimeout(() => sendMessage(activeInput.value), 600);
    }
  };

  recognition.onerror = (event) => {
    isListening = false;
    if (activeMicBtn) activeMicBtn.classList.remove('mic-active');
    document.querySelector('.toast')?.remove();

    const messages = {
      'not-allowed':  'Mikrofon izni verilmedi. Tarayıcı ayarlarından izin ver.',
      'no-speech':    'Ses algılanamadı, tekrar dene.',
      'network':      'Ağ hatası oluştu.',
      'aborted':      '',  // Kullanıcı iptal etti, mesaj gösterme
    };
    const msg = messages[event.error] ?? `Hata: ${event.error}`;
    if (msg) showToast(msg, 4000);
  };

  // Welcome mic
  document.getElementById('welcome-mic').addEventListener('click', () => {
    startListening(welcomeInput, document.getElementById('welcome-mic'));
  });

  // Chat mic
  document.getElementById('chat-mic').addEventListener('click', () => {
    startListening(chatInput, document.getElementById('chat-mic'));
  });

} else {
  // Tarayıcı desteklemiyorsa ikonları grile, tooltip ekle
  ['welcome-mic', 'chat-mic'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.disabled = true;
      btn.title    = 'Tarayıcınız sesli girişi desteklemiyor (Chrome/Edge kullanın)';
      btn.style.opacity = '0.35';
    }
  });
}

/* ════════════════════════════════════════════
   VERİTABANI MODALİ
════════════════════════════════════════════ */
const dbBtn      = document.getElementById('db-btn');
const dbOverlay  = document.getElementById('db-overlay');
const dbClose    = document.getElementById('db-close');
const dropZone   = document.getElementById('drop-zone');
const fileInput  = document.getElementById('file-input');
const filePickBtn= document.getElementById('file-pick-btn');
const urlInput   = document.getElementById('url-input');
const urlUploadBtn= document.getElementById('url-upload-btn');
const docSearch  = document.getElementById('doc-search');
const docList    = document.getElementById('doc-list');
const docPagination = document.getElementById('doc-pagination');
const docCountBadge = document.getElementById('doc-count-badge');
const ingestProgress = document.getElementById('ingest-progress');
const progressBar  = document.getElementById('progress-bar');
const progressLabel= document.getElementById('progress-label');
const progressCount= document.getElementById('progress-count');
const progressFile = document.getElementById('progress-file');

let _docPage = 1;
let _pollTimer = null;

function openDbModal() {
  dbOverlay.removeAttribute('hidden');
  if (window.lucide) lucide.createIcons();
  loadDocuments(1);
  checkIngestStatus();
}

function closeDbModal() {
  dbOverlay.setAttribute('hidden', '');
  clearTimeout(_pollTimer);
}

dbBtn.addEventListener('click', openDbModal);
dbClose.addEventListener('click', closeDbModal);
dbOverlay.addEventListener('click', e => { if (e.target === dbOverlay) closeDbModal(); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !dbOverlay.hasAttribute('hidden')) closeDbModal();
});

// ── Dosya seçme / drag-drop ───────────────────
filePickBtn.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('click', e => {
  if (e.target !== filePickBtn) fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) uploadFiles(fileInput.files);
});

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
});

// URL Yükleme
urlUploadBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) return;
  
  // Arayüzü yükleniyor moduna al
  ingestProgress.removeAttribute('hidden');
  progressLabel.textContent = t('processing');
  progressCount.textContent = '';
  progressBar.style.width   = '50%';
  progressFile.textContent  = 'Downloading PDF...';
  
  try {
    const resp = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await resp.json();
    
    if (resp.ok) {
      urlInput.value = '';
      pollIngestStatus(); // Polling döngüsünü başlat
    } else {
      alert(data.error || t('upload_failed'));
      ingestProgress.setAttribute('hidden', 'true');
    }
  } catch (err) {
    console.error(err);
    alert(t('upload_failed'));
    ingestProgress.setAttribute('hidden', 'true');
  }
});

// ── Dosya yükleme ─────────────────────────────
async function uploadFiles(files) {
  const formData = new FormData();
  let count = 0;
  for (const f of files) {
    formData.append('file', f);
    count++;
  }

  // Progress alanını göster
  ingestProgress.removeAttribute('hidden');
  progressLabel.textContent = `${count} ${t('files_uploaded').split(',')[0]}...`;
  progressCount.textContent = '';
  progressBar.style.width   = '0%';
  progressFile.textContent  = '';

  try {
    const resp = await fetch('/api/upload', { method: 'POST', body: formData });
    
    // Yanıt JSON değilse (örn. Flask 413 Payload Too Large HTML hatası döndürdüyse)
    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      showToast(`${t('error')}: Dosya boyutu çok büyük veya sunucu eski sürümde çalışıyor.`, 5000);
      ingestProgress.setAttribute('hidden', '');
      return;
    }

    const data = await resp.json();

    if (!resp.ok) {
      showToast(`${t('error')}: ${data.error || t('upload_failed')}`, 5000);
      ingestProgress.setAttribute('hidden', '');
      return;
    }

    showToast(`✓ ${data.saved.length} ${t('files_uploaded')}`);
    // Polling başlat
    pollIngestStatus();

  } catch (err) {
    showToast(`${t('upload_failed')}: ` + err.message, 5000);
  }
}

// ── Ingest ilerleme polling ───────────────────
function pollIngestStatus() {
  clearTimeout(_pollTimer);
  _pollTimer = setTimeout(async () => {
    const isRunning = await checkIngestStatus();
    if (isRunning) {
      pollIngestStatus();
    }
  }, 1500); // 1.5 saniyede bir sorgula (terminali yormasın)
}

async function checkIngestStatus() {
  try {
    const resp = await fetch('/api/ingest-status');
    const s    = await resp.json();

    if (s.running) {
      ingestProgress.removeAttribute('hidden');
      const pct = s.total > 0 ? Math.round((s.current / s.total) * 100) : 0;
      progressBar.style.width   = pct + '%';
      progressLabel.textContent = t('processing');
      
      // Eğer henüz total 0 ise, modeller yükleniyordur
      if (s.total === 0) {
        progressCount.textContent = t('models_preparing');
      } else {
        const fileLbl = t('file_label');
        const chunkLbl = t('chunk_label');
        
        if (s.total_chunks > 0) {
          progressCount.textContent = `${fileLbl}: ${s.current}/${s.total} | ${chunkLbl}: ${s.current_chunk}/${s.total_chunks}`;
          // Çubuğun genişliğini parçalanma yüzdesine göre ayarla
          const pct = Math.round((s.current_chunk / s.total_chunks) * 100);
          progressBar.style.width = pct + '%';
        } else {
          progressCount.textContent = `${fileLbl}: ${s.current}/${s.total} | ...`;
          progressBar.style.width = '10%';
        }
      }
      
      progressFile.textContent  = s.current_file || '';
      return true;

    } else if (s.done) {
      ingestProgress.removeAttribute('hidden');
      progressBar.style.width   = '100%';
      progressLabel.textContent = s.error
        ? `${t('error')}: ${s.error}`
        : `✓ ${s.added} ${t('files_added')}`;
      progressCount.textContent = '';
      progressFile.textContent  = '';
      loadDocuments(1, docSearch.value);

      // 5 saniye sonra progress'i gizle
      setTimeout(() => ingestProgress.setAttribute('hidden', ''), 5000);
      return false;
    }
    return false;
  } catch {
    return false;
  }
}

// ── Dosya listesi ─────────────────────────────
async function loadDocuments(page = 1, query = '') {
  _docPage = page;
  const url = `/api/documents?page=${page}&per_page=50&q=${encodeURIComponent(query)}`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();

    docCountBadge.textContent = `${data.total.toLocaleString('tr-TR')} doc(s)`;

    // Listeyi doldur
    docList.innerHTML = '';
    if (data.docs.length === 0) {
      docList.innerHTML = `<li class="doc-item" style="justify-content:center;color:var(--text-muted);">${t('no_results')}</li>`;
    } else {
      data.docs.forEach(name => {
        const li = document.createElement('li');
        li.className = 'doc-item';
        li.innerHTML = `
          <i data-lucide="file-text"></i>
          <a class="doc-item-name" href="/api/serve-doc/${encodeURIComponent(name)}" target="_blank" title="${escHtml(name)}">${escHtml(name)}</a>
          <button class="doc-delete-btn" title="${t('delete_doc_btn')}" aria-label="${t('delete_doc_title')}" data-name="${escHtml(name)}">
            <i data-lucide="x"></i>
          </button>`;

        // Silme butonu tıklama
        li.querySelector('.doc-delete-btn').addEventListener('click', e => {
          e.stopPropagation();
          openConfirm(
            t('delete_doc_title'),
            `"${name}" — ${t('delete_doc_confirm')}`,
            async () => {
              try {
                const r = await fetch(`/api/documents/${encodeURIComponent(name)}`, { method: 'DELETE' });
                const j = await r.json();
                if (j.ok) {
                  loadDocuments(_docPage, docSearch.value);
                } else {
                  alert(t('delete_doc_error') + ' ' + (j.error || '?'));
                }
              } catch (err) {
                alert(t('delete_doc_conn_error'));
              }
            }
          );
        });

        docList.appendChild(li);
      });
      if (window.lucide) lucide.createIcons();
    }

    // Sayfalama
    renderPagination(data.page, data.pages, query);

  } catch (err) {
    docList.innerHTML = `<li class="doc-item" style="color:#D32F2F;">${t('list_failed')}</li>`;
  }
}

function renderPagination(current, total, query) {
  docPagination.innerHTML = '';
  if (total <= 1) return;

  const makeBtn = (label, page, active = false) => {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (active ? ' active' : '');
    btn.textContent = label;
    if (!active) btn.addEventListener('click', () => loadDocuments(page, query));
    docPagination.appendChild(btn);
  };

  if (current > 1) makeBtn('‹', current - 1);

  const start = Math.max(1, current - 3);
  const end   = Math.min(total, start + 6);
  for (let p = start; p <= end; p++) makeBtn(p, p, p === current);

  if (current < total) makeBtn('›', current + 1);
}

// Arama
let _searchDebounce = null;
docSearch.addEventListener('input', () => {
  clearTimeout(_searchDebounce);
  _searchDebounce = setTimeout(() => loadDocuments(1, docSearch.value), 300);
});

/* ════════════════════════════════════════════
   ARŞİV YÖNETİMİ
════════════════════════════════════════════ */
const manageArchiveBtn = document.getElementById('manage-archive-btn');
const archiveOverlay   = document.getElementById('archive-overlay');
const archiveClose     = document.getElementById('archive-close');
const archiveList      = document.getElementById('archive-list');

function openArchiveModal() {
  closeSettings();
  archiveOverlay.removeAttribute('hidden');
  renderArchiveList();
  if (window.lucide) lucide.createIcons();
}

function closeArchiveModal() {
  archiveOverlay.setAttribute('hidden', '');
}

if (manageArchiveBtn) manageArchiveBtn.addEventListener('click', openArchiveModal);
if (archiveClose) archiveClose.addEventListener('click', closeArchiveModal);

archiveOverlay.addEventListener('click', e => {
  if (e.target === archiveOverlay) closeArchiveModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !archiveOverlay.hasAttribute('hidden')) {
    closeArchiveModal();
  }
});

function renderArchiveList() {
  archiveList.innerHTML = '';
  const archivedConvs = conversations.filter(c => c.archived);

  if (archivedConvs.length === 0) {
    archiveList.innerHTML = `<li style="text-align:center; padding:20px; color:var(--text-muted);">${t('no_archived_chats')}</li>`;
    return;
  }

  archivedConvs.forEach(conv => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.justifyContent = 'space-between';
    li.style.padding = '12px';
    li.style.borderBottom = '1px solid var(--border)';

    const leftDiv = document.createElement('div');
    leftDiv.style.flex = '1';
    leftDiv.style.whiteSpace = 'nowrap';
    leftDiv.style.overflow = 'hidden';
    leftDiv.style.textOverflow = 'ellipsis';
    leftDiv.style.marginRight = '12px';
    
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'archive');
    icon.style.marginRight = '8px';
    icon.style.verticalAlign = 'middle';
    icon.style.color = 'var(--text-muted)';
    
    const span = document.createElement('span');
    span.textContent = conv.title;
    span.style.verticalAlign = 'middle';

    leftDiv.appendChild(icon);
    leftDiv.appendChild(span);

    const rightDiv = document.createElement('div');
    rightDiv.style.display = 'flex';
    rightDiv.style.gap = '8px';

    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'settings-action-btn';
    restoreBtn.innerHTML = `<i data-lucide="rotate-ccw"></i> <span class="hide-mobile">${t('restore')}</span>`;
    restoreBtn.style.padding = '6px 10px';
    restoreBtn.addEventListener('click', () => {
      conv.archived = false;
      saveConversations();
      renderConvList(convSearch ? convSearch.value : '');
      renderArchiveList();
      showToast(t('restored_success'));
      if (window.lucide) lucide.createIcons();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'settings-action-btn danger';
    deleteBtn.innerHTML = `<i data-lucide="trash-2"></i>`;
    deleteBtn.style.padding = '6px 10px';
    deleteBtn.addEventListener('click', () => {
      if (confirm(t('delete_chat_confirm'))) {
        conversations = conversations.filter(c => c.id !== conv.id);
        saveConversations();
        renderArchiveList();
        if (window.lucide) lucide.createIcons();
      }
    });

    rightDiv.appendChild(restoreBtn);
    rightDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(rightDiv);
    archiveList.appendChild(li);
  });
}

/* ════════════════════════════════════════════
   RAG CONFIG PANELİ
════════════════════════════════════════════ */
const ragConfigBtn   = document.getElementById('rag-config-btn');
const ragConfigPanel = document.getElementById('rag-config-panel');
const ragConfigClose = document.getElementById('rag-config-close');

// Panel aç/kapat
ragConfigBtn.addEventListener('click', e => {
  e.stopPropagation();
  const isHidden = ragConfigPanel.hasAttribute('hidden');
  if (isHidden) {
    ragConfigPanel.removeAttribute('hidden');
    if (window.lucide) lucide.createIcons();
    loadRagConfig();
  } else {
    ragConfigPanel.setAttribute('hidden', '');
  }
});

ragConfigClose.addEventListener('click', () => {
  ragConfigPanel.setAttribute('hidden', '');
});

// Panelin dışına tıklayınca kapat
document.addEventListener('click', e => {
  if (!ragConfigPanel.hasAttribute('hidden') &&
      !ragConfigPanel.contains(e.target) &&
      !ragConfigBtn.contains(e.target)) {  // içindeki <i> ikonuna da tıklanabilsin
    ragConfigPanel.setAttribute('hidden', '');
  }
});

// Config yükle
async function loadRagConfig() {
  try {
    const resp = await fetch('/api/rag-config');
    const cfg  = await resp.json();

    if (!cfg.use_reranker) {
      document.getElementById('cfg-reranker-model').value = 'none';
    } else {
      document.getElementById('cfg-reranker-model').value = cfg.reranker_model || 'BAAI/bge-reranker-v2-m3';
    }
    
    function updateThresholdUI(isReranker, forceReset = false) {
      const thr = document.getElementById('cfg-threshold');
      const thrVal = document.getElementById('cfg-threshold-val');
      if (isReranker) {
        thr.min = -10; thr.max = 5; thr.step = 0.5;
        if (forceReset || parseFloat(thr.value) > 5 || parseFloat(thr.value) < -10) thr.value = -2.0;
      } else {
        thr.min = 0; thr.max = 1; thr.step = 0.05;
        if (forceReset || parseFloat(thr.value) < 0 || parseFloat(thr.value) > 1) thr.value = 0.50;
      }
      thrVal.textContent = Number.isInteger(parseFloat(thr.value)) ? parseFloat(thr.value).toFixed(1) : parseFloat(thr.value).toFixed(2);
    }
    
    window._updateThresholdUI = updateThresholdUI;
    updateThresholdUI(cfg.use_reranker, false);
    const initK = document.getElementById('cfg-initial-k');
    initK.value = cfg.initial_top_k;
    document.getElementById('cfg-initial-k-val').textContent = cfg.initial_top_k;

    const topK = document.getElementById('cfg-top-k');
    topK.value = cfg.top_k;
    document.getElementById('cfg-top-k-val').textContent = cfg.top_k;

    const temp = document.getElementById('cfg-temp');
    temp.value = cfg.temperature;
    document.getElementById('cfg-temp-val').textContent = parseFloat(cfg.temperature).toFixed(1);

    const thr = document.getElementById('cfg-threshold');
    thr.value = cfg.score_threshold;
    window._updateThresholdUI(cfg.use_reranker, false);
  } catch (e) {
    showCfgStatus('Yüklenemedi', true);
  }
}

// Config kaydet (debounced)
let _cfgSaveTimer = null;
function scheduleConfigSave() {
  clearTimeout(_cfgSaveTimer);
  _cfgSaveTimer = setTimeout(saveRagConfig, 600);
}

async function saveRagConfig() {
  const selectedModel = document.getElementById('cfg-reranker-model').value;
  const payload = {
    use_reranker:    selectedModel !== 'none',
    reranker_model:  selectedModel !== 'none' ? selectedModel : undefined,
    initial_top_k:  parseInt(document.getElementById('cfg-initial-k').value),
    top_k:          parseInt(document.getElementById('cfg-top-k').value),
    temperature:    parseFloat(document.getElementById('cfg-temp').value),
    score_threshold: parseFloat(document.getElementById('cfg-threshold').value),
  };
  try {
    const resp = await fetch('/api/rag-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (resp.ok) showCfgStatus('✓ Kaydedildi');
    else         showCfgStatus('Kayıt hatası', true);
  } catch {
    showCfgStatus('Bağlantı hatası', true);
  }
}

function showCfgStatus(msg, isError = false) {
  const el = document.getElementById('cfg-status');
  el.textContent = msg;
  el.style.color = isError ? '#E53935' : '#4CAF50';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = ''; }, 2500);
}

// Slider live update + save
['cfg-initial-k', 'cfg-top-k', 'cfg-temp', 'cfg-threshold'].forEach(id => {
  const slider = document.getElementById(id);
  const valMap = {
    'cfg-initial-k': 'cfg-initial-k-val',
    'cfg-top-k':     'cfg-top-k-val',
    'cfg-temp':      'cfg-temp-val',
    'cfg-threshold': 'cfg-threshold-val',
  };
  slider.addEventListener('input', () => {
    const raw = parseFloat(slider.value);
    const formatted = Number.isInteger(raw) ? raw : raw.toFixed(1);
    document.getElementById(valMap[id]).textContent = formatted;
    scheduleConfigSave();
  });
});

document.getElementById('cfg-reranker-model').addEventListener('change', (e) => {
  if (window._updateThresholdUI) window._updateThresholdUI(e.target.value !== 'none', true);
  scheduleConfigSave();
});
