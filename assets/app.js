(() => {
  const state = {
    session: null,
    conversations: [],
    activeConversationId: null,
  };

  const els = {
    convList: document.getElementById('conv-list'),
    btnNewConv: document.getElementById('btn-new-conv'),
    chatForm: document.getElementById('chat-form'),
    chatText: document.getElementById('chat-text'),
    chatMessages: document.getElementById('chat-messages'),
    fileInput: document.getElementById('file-input'),
    btnSend: document.getElementById('btn-send'),
    btnSettings: document.getElementById('btn-settings'),
    settingsDialog: document.getElementById('settings-dialog'),
    btnAuth: document.getElementById('btn-auth'),
    provider: document.getElementById('ai-provider'),
    apiKey: document.getElementById('ai-api-key'),
    model: document.getElementById('ai-model'),
    temp: document.getElementById('ai-temp'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
  };

  // Supabase client (public)
  const supabase = window.supabase.createClient(
    window.PUBLIC_CONFIG.supabaseUrl,
    window.PUBLIC_CONFIG.supabaseAnonKey
  );

  function renderConversations() {
    els.convList.innerHTML = '';
    state.conversations.forEach((c) => {
      const li = document.createElement('li');
      li.textContent = c.title;
      li.addEventListener('click', () => selectConversation(c.id));
      els.convList.appendChild(li);
    });
  }

  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = content;
    els.chatMessages.appendChild(div);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  }

  function selectConversation(id) {
    state.activeConversationId = id;
    els.chatMessages.innerHTML = '';
  }

  async function createConversation() {
    const id = crypto.randomUUID();
    const title = `محادثة #${state.conversations.length + 1}`;
    state.conversations.unshift({ id, title });
    renderConversations();
    selectConversation(id);
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    addMessage('user', text);
    els.chatText.value = '';

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: state.activeConversationId,
          messages: [{ role: 'user', content: text }],
        }),
      });
      const data = await res.json();
      addMessage('assistant', data.reply || '...');
    } catch (e) {
      addMessage('assistant', 'حدث خطأ، حاول مرة أخرى.');
    }
  }

  // Events
  els.btnNewConv.addEventListener('click', createConversation);
  els.chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(els.chatText.value);
  });
  els.btnSettings.addEventListener('click', () => els.settingsDialog.showModal());
  els.btnSaveSettings.addEventListener('click', (e) => {
    e.preventDefault();
    els.settingsDialog.close();
  });

  els.btnAuth.addEventListener('click', async () => {
    const email = prompt('ادخل بريدك الإلكتروني لتسجيل الدخول:');
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) alert('فشل الإرسال: ' + error.message);
    else alert('تم إرسال رابط تسجيل الدخول إلى بريدك.');
  });

  // Init
  createConversation();
})();


