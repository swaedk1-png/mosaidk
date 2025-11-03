const { generateChatCompletion } = require('./_shared/ai');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages = [], provider, model, temperature } = JSON.parse(event.body || '{}');
    const reply = await generateChatCompletion(messages, { provider, model, temperature });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Internal Server Error', detail: e.message }) };
  }
};


