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
  const provider = (options.provider || process.env.AI_PROVIDER || 'chatgpt5').toLowerCase();
  const apiKey = options.apiKey || process.env.AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('مفتاح API مفقود. يرجى إدخال مفتاح API في الإعدادات.');
  }

  if (provider === 'chatgpt5' || provider === 'api' || provider === 'openai') {
    const baseUrl = options.baseUrl || process.env.AI_API_BASE || 'https://api.openai.com/v1';
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


