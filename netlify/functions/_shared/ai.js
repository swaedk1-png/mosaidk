'use strict';

async function callOpenAI(messages, { model, temperature, apiKey, baseUrl }) {
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || errorData.error?.code || `خطأ ${res.status}`;
      throw new Error(`خطأ من OpenAI: ${errorMsg}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    
    if (!content) {
      throw new Error('لم يتم إرجاع محتوى من النموذج');
    }
    
    return content;
  } catch (e) {
    if (e.message.includes('fetch')) {
      throw new Error('فشل الاتصال بخادم OpenAI. تحقق من الاتصال بالإنترنت.');
    }
    throw e;
  }
}

async function generateChatCompletion(messages, options = {}) {
  const provider = (options.provider || process.env.AI_PROVIDER || 'openai').toLowerCase();
  const apiKey = options.apiKey || process.env.AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('مفتاح API مفقود. يرجى إدخال مفتاح API في الإعدادات.');
  }

  // تحديد baseURL بناءً على المزود
  let baseUrl = options.baseUrl || process.env.AI_API_BASE;
  
  if (!baseUrl) {
    switch (provider) {
      case 'n8n':
        baseUrl = 'https://ai-assistant.n8n.io/v1/ai-credits/proxy/v1';
        break;
      case 'openai':
      case 'chatgpt5':
      case 'api':
      case 'custom':
        baseUrl = 'https://api.openai.com/v1';
        break;
      default:
        baseUrl = 'https://api.openai.com/v1';
    }
  }

  if (provider === 'chatgpt5' || provider === 'api' || provider === 'openai' || provider === 'n8n' || provider === 'custom') {
    const model = options.model || process.env.AI_MODEL || 'gpt-4o';
    
    return await callOpenAI(messages, {
      model,
      temperature: options.temperature,
      apiKey,
      baseUrl,
    });
  }

  throw new Error(`مزوّد الذكاء الاصطناعي غير مدعوم: ${provider}`);
}

module.exports = { generateChatCompletion };


