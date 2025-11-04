(() => {
  const state = {
    session: null,
    conversations: [],
    activeConversationId: null,
    isSending: false,
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
    baseUrl: document.getElementById('ai-base-url'),
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

  function toggleTyping(show) {
    const t = document.getElementById('typing');
    if (!t) return;
    t.classList.toggle('hidden', !show);
  }

  function hideEmptyState() {
    const empty = document.getElementById('empty-state');
    if (empty) empty.remove();
  }

  function toast(message) {
    const host = document.getElementById('toasts');
    if (!host) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    host.appendChild(node);
    setTimeout(() => node.remove(), 4000);
  }

  async function selectConversation(id) {
    state.activeConversationId = id;
    els.chatMessages.innerHTML = '';
    const empty = document.getElementById('empty-state');
    if (empty) empty.remove();

    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (messages && messages.length > 0) {
        messages.forEach(msg => {
          addMessage(msg.role, msg.content);
        });
      } else {
        showWelcomeMessage();
      }
    } catch (e) {
      toast('فشل تحميل الرسائل: ' + e.message);
      showWelcomeMessage();
    }
  }

  function showWelcomeMessage() {
    const settings = getAISettings();
    if (!settings.apiKey) {
      const welcome = document.createElement('div');
      welcome.className = 'message assistant';
      welcome.innerHTML = `
        <p><strong>مرحباً! 👋</strong></p>
        <p>أنا مساعد ذكي جاهز للإجابة على أسئلتك.</p>
        <p>⚠️ <strong>ملاحظة:</strong> يرجى إدخال مفتاح API في الإعدادات أولاً لبدء المحادثة.</p>
        <p>اضغط على زر "الإعدادات" في الأعلى لإضافة مفتاح API الخاص بك.</p>
      `;
      els.chatMessages.appendChild(welcome);
    } else {
      const welcome = document.createElement('div');
      welcome.className = 'message assistant';
      welcome.innerHTML = `
        <p><strong>مرحباً! 👋</strong></p>
        <p>أنا مساعد ذكي جاهز للإجابة على أسئلتك ومساعدتك في مشاريعك التطويرية.</p>
        <p>يمكنك البدء بطرح أي سؤال أو طلب مساعدة.</p>
      `;
      els.chatMessages.appendChild(welcome);
    }
  }

  async function createConversation() {
    try {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({ title: `محادثة #${state.conversations.length + 1}` })
        .select()
        .single();

      if (error) throw error;

      state.conversations.unshift({ id: newConv.id, title: newConv.title });
      renderConversations();
      selectConversation(newConv.id);
      els.chatText.focus();
    } catch (e) {
      toast('فشل إنشاء المحادثة: ' + e.message);
    }
  }

  async function loadConversations() {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      state.conversations = conversations || [];
      renderConversations();

      if (state.conversations.length > 0 && !state.activeConversationId) {
        selectConversation(state.conversations[0].id);
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    }
  }

  function getAISettings() {
    const saved = localStorage.getItem('ai_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      provider: 'openai',
      baseUrl: '',
      model: 'gpt-4o',
      temperature: 0.7,
      apiKey: '',
    };
  }

  function saveAISettings() {
    const settings = {
      provider: els.provider.value,
      baseUrl: els.baseUrl.value.trim(),
      model: els.model.value,
      temperature: parseFloat(els.temp.value),
      apiKey: els.apiKey.value,
    };
    localStorage.setItem('ai_settings', JSON.stringify(settings));
    toast('تم حفظ الإعدادات');
  }

  function loadAISettings() {
    const settings = getAISettings();
    els.provider.value = settings.provider || 'openai';
    els.model.value = settings.model || 'gpt-4o';
    els.temp.value = settings.temperature || 0.7;
    els.baseUrl.value = settings.baseUrl || '';
    if (settings.apiKey) {
      els.apiKey.value = settings.apiKey;
    }
    updateBaseUrlVisibility();
  }

  function updateBaseUrlVisibility() {
    const provider = els.provider.value;
    const baseUrlLabel = els.baseUrl.closest('label');
    if (baseUrlLabel) {
      if (provider === 'custom' || provider === 'n8n') {
        baseUrlLabel.style.display = 'block';
        if (provider === 'n8n' && !els.baseUrl.value) {
          els.baseUrl.value = 'https://ai-assistant.n8n.io/v1/ai-credits/proxy/v1';
        }
      } else {
        baseUrlLabel.style.display = 'none';
      }
    }
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    if (state.isSending) return;
    
    const settings = getAISettings();
    if (!settings.apiKey) {
      toast('يرجى إدخال مفتاح API في الإعدادات أولاً');
      els.settingsDialog.showModal();
      return;
    }

    addMessage('user', text);
    els.chatText.value = '';
    hideEmptyState();
    state.isSending = true;
    els.btnSend.disabled = true;
    toggleTyping(true);
    updateChatStatus('typing');

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: state.activeConversationId,
          messages: [{ role: 'user', content: text }],
          provider: settings.provider,
          baseUrl: settings.baseUrl,
          model: settings.model,
          temperature: settings.temperature,
          apiKey: settings.apiKey,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `خطأ ${res.status}`);
      }

      const data = await res.json();
      addMessage('assistant', data.reply || data.error || 'لا توجد استجابة');
      
      // تحديث conversationId إذا تم إنشاء محادثة جديدة
      if (data.conversationId && !state.activeConversationId) {
        state.activeConversationId = data.conversationId;
        await loadConversations();
      }
    } catch (e) {
      const errorMsg = e.message || 'حدث خطأ، حاول مرة أخرى.';
      toast(errorMsg);
      addMessage('assistant', `❌ خطأ: ${errorMsg}`);
    }
    toggleTyping(false);
    updateChatStatus('ready');
    state.isSending = false;
    els.btnSend.disabled = false;
  }

  function updateChatStatus(status) {
    const statusEl = document.getElementById('chat-status');
    if (statusEl) {
      statusEl.setAttribute('data-status', status);
      if (status === 'typing') {
        statusEl.textContent = '●';
        statusEl.title = 'جاري الكتابة...';
      } else {
        statusEl.textContent = '●';
        statusEl.title = 'جاهز';
      }
    }
  }

  function initQuickActions() {
    const quickBtns = document.querySelectorAll('.quick-btn');
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        els.chatText.value = prompt;
        els.chatText.focus();
      });
    });
  }

  // Events
  els.btnNewConv.addEventListener('click', createConversation);
  els.chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(els.chatText.value);
  });

  els.chatText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!state.isSending) {
        sendMessage(els.chatText.value);
      }
    }
  });
  els.btnSettings.addEventListener('click', () => {
    loadAISettings();
    els.settingsDialog.showModal();
  });

  els.provider.addEventListener('change', updateBaseUrlVisibility);
  
  els.btnSaveSettings.addEventListener('click', (e) => {
    e.preventDefault();
    saveAISettings();
    els.settingsDialog.close();
  });

  // CTA actions
  const cta = document.getElementById('cta-start');
  cta?.addEventListener('click', () => {
    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const btnTheme = document.getElementById('btn-theme');
  btnTheme?.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'light' ? '' : 'light';
    if (next) html.setAttribute('data-theme', next);
    else html.removeAttribute('data-theme');
  });

  els.btnAuth.addEventListener('click', async () => {
    const email = prompt('ادخل بريدك الإلكتروني لتسجيل الدخول:');
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) alert('فشل الإرسال: ' + error.message);
    else alert('تم إرسال رابط تسجيل الدخول إلى بريدك.');
  });

  // File upload handler
  els.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      toast(`تم اختيار الملف: ${file.name}`);
      // TODO: Handle file upload to Supabase Storage
    }
  });

  // Init
  loadAISettings();
  initQuickActions();
  loadConversations().then(() => {
    if (state.conversations.length === 0) {
      createConversation();
    }
  });
  updateChatStatus('ready');
})();


