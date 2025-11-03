'use strict';

async function callOpenAI(messages, { model, temperature, apiKey, baseUrl }) {
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-5.0',
      messages,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      stream: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return content;
}

async function generateChatCompletion(messages, options = {}) {
  const provider = (options.provider || process.env.AI_PROVIDER || 'chatgpt5').toLowerCase();
  const apiKey = options.apiKey || process.env.AI_API_KEY;
  if (!apiKey) throw new Error('Missing AI_API_KEY');

  if (provider === 'chatgpt5' || provider === 'api') {
    const baseUrl = options.baseUrl || process.env.AI_API_BASE || 'https://api.openai.com/v1';
    return await callOpenAI(messages, {
      model: options.model || process.env.AI_MODEL || 'gpt-5.0',
      temperature: options.temperature,
      apiKey,
      baseUrl,
    });
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

module.exports = { generateChatCompletion };


