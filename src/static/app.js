/**
 * app.js — CHaRM-AI Frontend Mantığı
 * Sidebar toggle, mesaj gönderme (SSE streaming), sohbet geçmişi (localStorage)
 */

/* ════════════════════════════════════════════
   İNGİLİZCE / TÜRKÇE DİL SÖZLÜĞÜ (i18n)
════════════════════════════════════════════ */
const i18n = {
  tr: {
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
    important_notes: "Önemli Notlar",
    note_1: "Bu yapay zeka sadece sisteme yüklenmiş ilgili belgelerden cevap verir. Sistemdeki PDF'leri görmek için",
    note_1_link: "buraya tıklayın",
    note_2: "İlk soruyu sorarken devasa modellerin belleğe yüklenmesi 1-2 dakika sürebilir, lütfen bekleyiniz.",
    dynamic: {
      voice_not_supported: "Tarayıcınız sesli girişi desteklemiyor (Chrome/Edge kullanın)",
      upload_failed: "Yükleme başarısız",
      files_uploaded: "dosya yüklendi, işleme başladı.",
      processing: "İşleniyor...",
      models_preparing: "Modeller hazırlanıyor...",
      files_added: "dosya başarıyla işlendi ve eklendi",
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
      no_archived_chats: "Arşivlenmiş sohbet bulunmuyor."
    }
  },
  en: {
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
    important_notes: "Important Notes",
    note_1: "This AI only answers based on the relevant uploaded documents. To see the PDFs in the system,",
    note_1_link: "click here",
    note_2: "When asking the first question, loading the massive models into memory may take 1-2 minutes, please wait.",
    dynamic: {
      voice_not_supported: "Your browser does not support voice input (use Chrome/Edge)",
      upload_failed: "Upload failed",
      files_uploaded: "file(s) uploaded, processing started.",
      processing: "Processing...",
      models_preparing: "Preparing models...",
      files_added: "file(s) successfully processed and added",
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
      no_archived_chats: "No archived chats found."
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

const notesToggle   = document.getElementById('notes-toggle');
const notesContent  = document.getElementById('notes-content');
const noteDbLink    = document.getElementById('note-db-link');

/* ════════════════════════════════════════════
   SIDEBAR & NOTES
════════════════════════════════════════════ */
sidebarHeader.addEventListener('click', toggleSidebar);
sidebarHeader.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggleSidebar(); });

function toggleSidebar() {
  sidebar.classList.toggle('expanded');
}

// Önemli Notlar Accordion
if (notesToggle && notesContent) {
  notesToggle.addEventListener('click', () => {
    notesToggle.classList.toggle('open');
    if (notesContent.hasAttribute('hidden')) {
      notesContent.removeAttribute('hidden');
    } else {
      notesContent.setAttribute('hidden', '');
    }
  });
}

// DB Link in Notes
if (noteDbLink) {
  noteDbLink.addEventListener('click', (e) => {
    e.preventDefault();
    openDbModal();
  });
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
}

function showWelcomeView() {
  welcomeView.style.display = '';
  chatView.setAttribute('hidden', '');
  activeConvId = null;
  messagesEl.innerHTML = '';
}

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

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
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
            bubbleText.textContent = aiText;
            scrollToBottom();

          } else if (data.type === 'sources') {
            aiSources = data.content || [];
            // Kaynak butonu ekle
            renderSources(aiBubble, aiSources);

          } else if (data.type === 'done') {
            // Konuşmayı kaydet
            addMessageToConv(activeConvId, 'ai', aiText, aiSources);
            // Like/Dislike ekle
            renderActions(aiBubble);
            if (window.lucide) lucide.createIcons();

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
function appendMessageBubble(role, content, sources) {
  const div = document.createElement('div');
  div.className = `msg msg-${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = content;
  div.appendChild(bubble);

  // AI mesajına aksiyonlar (like/dislike) + kaynaklar sonradan eklenir
  if (role === 'ai' && sources && sources.length > 0) {
    renderSources(div, sources);
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

function renderSources(parentEl, sources) {
  if (!sources || sources.length === 0) return;
  parentEl.querySelectorAll('.msg-sources').forEach(el => el.remove());

  const wrap = document.createElement('div');
  wrap.className = 'msg-sources';

  const count = sources.length;
  const toggle = document.createElement('button');
  toggle.className = 'sources-toggle';
  toggle.innerHTML = `<i data-lucide="book-open"></i> ${count} kaynak`;

  const list = document.createElement('div');
  list.className = 'sources-list';

  sources.forEach(src => {
    const item = document.createElement('div');
    item.className = 'source-item';

    // Yapılandırılmış (nesne) veya eski (string) formatı destekle
    if (typeof src === 'object' && src.url) {
      const link = document.createElement('a');
      link.href = src.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'source-link';
      link.innerHTML = `<i data-lucide="file-text"></i> ${escHtml(src.name)} <span class="source-page">s.${src.page}</span> <i data-lucide="external-link" class="source-ext-icon"></i>`;
      item.appendChild(link);
    } else {
      item.textContent = '• ' + (typeof src === 'string' ? src : src.name);
    }

    list.appendChild(item);
  });

  toggle.addEventListener('click', () => {
    list.classList.toggle('open');
    toggle.innerHTML = list.classList.contains('open')
      ? `<i data-lucide="book-open"></i> Kaynakları gizle`
      : `<i data-lucide="book-open"></i> ${count} kaynak`;
    if (window.lucide) lucide.createIcons();
  });

  wrap.appendChild(toggle);
  wrap.appendChild(list);
  parentEl.appendChild(wrap);
  if (window.lucide) lucide.createIcons();
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
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
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
  if (mins < 1)   return 'şimdi';
  if (mins < 60)  return `${mins}dk`;
  if (hrs  < 24)  return `${hrs}sa`;
  if (days < 7)   return `${days}g`;
  return new Date(ts).toLocaleDateString('tr-TR', { day:'numeric', month:'short' });
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
  toggleDropdown(notifPanel);
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
        progressCount.textContent = `${s.current} / ${s.total}`;
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
        li.innerHTML = `<i data-lucide="file-text"></i><span class="doc-item-name" title="${escHtml(name)}">${escHtml(name)}</span>`;
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
