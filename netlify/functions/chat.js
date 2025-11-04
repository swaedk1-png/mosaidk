const { generateChatCompletion } = require('./_shared/ai');
const { getSupabaseClient } = require('./_shared/supabase');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { 
      conversationId, 
      messages = [], 
      provider, 
      baseUrl, 
      model, 
      temperature, 
      apiKey 
    } = body;
    
    if (!messages || messages.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing messages' })
      };
    }

    const supabase = getSupabaseClient();
    let finalConversationId = conversationId;

    // إنشاء محادثة جديدة إذا لم يتم توفير conversationId
    if (!finalConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ title: messages[0]?.content?.substring(0, 50) || 'محادثة جديدة' })
        .select()
        .single();

      if (convError) throw new Error(`فشل إنشاء المحادثة: ${convError.message}`);
      finalConversationId = newConv.id;
    }

    // تحميل الرسائل السابقة للمحادثة
    let allMessages = messages;
    if (finalConversationId) {
      const { data: previousMessages } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', finalConversationId)
        .order('created_at', { ascending: true });

      if (previousMessages && previousMessages.length > 0) {
        // دمج الرسائل السابقة مع الرسائل الجديدة
        allMessages = [...previousMessages, ...messages];
      }
    }

    // حفظ رسالة المستخدم
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      await supabase.from('messages').insert({
        conversation_id: finalConversationId,
        role: 'user',
        content: lastMessage.content
      });
    }

    // الحصول على الرد من AI
    const reply = await generateChatCompletion(allMessages, { 
      provider, 
      baseUrl,
      model, 
      temperature,
      apiKey,
    });

    // حفظ رد المساعد
    await supabase.from('messages').insert({
      conversation_id: finalConversationId,
      role: 'assistant',
      content: reply
    });
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        reply,
        conversationId: finalConversationId
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error', detail: e.message })
    };
  }
};


