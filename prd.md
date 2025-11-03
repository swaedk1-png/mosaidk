## PRD — منصة محادثات ذكاء اصطناعي مع حفظ السياق والملفات

### 1) نظرة عامة
- **الوصف**: منصة تقدم خدمات تطويرية لكل الأعمال عبر تحليل البيانات والسجل السابق لطالب الخدمة، ثم توليد مخرجات وخطط مخصصة مدعومة بالذكاء الاصطناعي.
- **التقنيات**: HTML, CSS, JavaScript, Node.js
- **البنية**: Netlify (استضافة + Functions) + دومين مخصص
- **البيانات**: Supabase v2 (Postgres + Auth + Storage)
- **الذكاء الاصطناعي**: ChatGPT-5 + API AI Platform (قابل للتبديل)
- **بيئة التطوير**: Cursor

### 2) الأهداف وقياسات النجاح
- **TTFV**: ≤ 1.5s
- **زمن نشر من commit إلى live**: ≤ 2 دقائق
- **معدل نجاح تسجيل الدخول**: ≥ 98%
- **P95 زمن رد AI**: ≤ 2.5s
- **أخطاء 5xx/1000 طلب**: ≤ 1

### 3) المستخدمون وحالات الاستخدام
- **مستخدمون**: صناع محتوى، فرق دعم، مطورون
- **حالات**: تسجيل دخول، إنشاء محادثة، إرسال رسالة، رفع ملفات وربطها، مشاركة رابط قراءة فقط، إدارة مزوّد AI ومفتاحه

### 4) نطاق الإصدار الأول (MVP)
- **يشمل**: Auth، محادثة واحدة لكل جلسة مع حفظ الرسائل، رفع ملفات (pdf/txt/md ≤ 10MB)، إعدادات مزوّد AI لكل مستخدم، نشر Netlify + ربط دومين
- **مستبعد**: فرق وأذونات متقدمة، فوترة، RAG متقدم، تحليلات

### 5) المتطلبات الوظيفية
- **المصادقة**: تسجيل/دخول/خروج، استرجاع كلمة المرور
- **المحادثات**: إنشاء/قراءة/أرشفة، رسائل مترابطة، حد طول الرسالة
- **الملفات**: رفع، تخزين، ربط بالمحادثة، معاينة ميتاداتا
- **الذكاء الاصطناعي**: اختيار المزوّد/النموذج، temperature/maxTokens، تبديل مزوّد بسلاسة
- **الإعدادات**: حفظ مفتاح المستخدم مشفّرًا
- **المشاركة**: رابط قراءة فقط مع `share_token`

### 6) متطلبات لا وظيفية
- **الأداء**: Core Web Vitals ضمن المعايير
- **الأمان**: RLS على الجداول، مفاتيح مشفّرة، CORS محدود، CSP
- **التوافر**: 99.9%
- **الخصوصية**: عدم تخزين مفاتيح بنص واضح، حذف عند الطلب
- **التوسع**: وظائف عديمة الحالة، فهارس DB مناسبة

### 7) البنية وتدفق العمل
- **واجهة (SPA)**: HTML/CSS/JS على Netlify
- **Functions (Node.js)**:
  - `POST /api/chat`: messages + context → رد من المزوّد
  - `POST /api/upload`: توقيع ورفع إلى Supabase Storage
  - `GET /api/conversations`، `POST /api/conversations`
- **Supabase**: Auth + Postgres + Storage
- **الدومين**: DNS إلى Netlify، HTTPS

### 8) نموذج البيانات (Supabase)
- **users**: id, email, created_at
- **user_settings**: user_id (FK), ai_provider, api_key_encrypted, model, temperature
- **conversations**: id, user_id, title, is_archived, share_token, created_at
- **messages**: id, conversation_id, role (user/assistant), content, tokens, created_at
- **files**: id, user_id, storage_path, mime, size, created_at
- **conversation_files**: conversation_id, file_id  
فهرسة: على `messages.conversation_id`, `conversations.user_id`, `files.user_id`.

### 9) تكامل الذكاء الاصطناعي
- **المزوّد الافتراضي**: ChatGPT-5، بديل: API AI Platform
- **السياسات**: حد أقصى tokens، فلترة محتوى أساسي، سجلات استخدام
- **السياق**: MVP يرسل نصًا خامًا؛ لاحقًا RAG (تقسيم/ت嵌يد/بحث)

### 10) واجهات المستخدم
- **الرئيسية**: قائمة محادثات + إنشاء
- **المحادثة**: إدخال، رسائل، رفع ملفات، حالة إرسال
- **الإعدادات**: مزوّد AI + مفتاح + معلمات
- **الدخول**: Email/Password + إعادة تعيين
- **المشاركة (قراءة فقط)**: عرض الرسائل دون إدخال

### 11) الأمان والامتثال
- **RLS**: حسب `user_id` لكل الجداول
- **التشفير**: تشفير مفاتيح المستخدم على الخادم قبل التخزين
- **Headers**: CSP، HSTS، X-Content-Type-Options، SameSite
- **الملفات**: Buckets خاصة، روابط موقّتة

### 12) معايير القبول
- إنشاء حساب وتسجيل الدخول والخروج بنجاح
- إرسال رسالة والحصول على رد ≤ 2.5s (P95)
- رفع ملف وربطه بمحادثة وظهوره
- حفظ إعدادات المزوّد واستخدام المفتاح المشفّر بنجاح
- نشر عبر Netlify مع دومين يعمل عبر HTTPS

### 13) الإعداد والتكوين
- **متغيرات البيئة (Netlify)**:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`
  - `AI_PROVIDER`, `OPENAI_API_KEY` (إن لزم)
  - `ENCRYPTION_SECRET`
- **Cursor**: قوالب ومهام، فحص تلقائي، تنسيق موحّد

#### بيئة المشروع الحالية (مقدمة من العميل)
- **MCP Supabase**: تم تعريف الخادم في `c:\Users\omar\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=bcmvgvkmdttwbkjxnsdi",
      "headers": {}
    }
  }
}
```

- **متغيرات البيئة الفعلية** (تُضبط في Netlify أو محليًا دون الالتزام للمستودع):

```env
AI_PROVIDER=chatgpt5
AI_API_KEY=YOUR_OPENAI_PROJECT_KEY
NEXT_PUBLIC_SUPABASE_URL=https://bcmvgvkmdttwbkjxnsdi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjbXZndmttZHR0d2Jranhuc2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzQyODUsImV4cCI6MjA3Nzc1MDI4NX0.o7LnsJ5V8sPe4eJejYPT79cSpeJgs_SYOvfxsRmo5V4
DATABASE_URL=postgresql://postgres:PASSWORD@db.bcmvgvkmdttwbkjxnsdi.supabase.co:5432/postgres
```

ملاحظة:
- `DATABASE_URL` متغير خادمي فقط (لا يوضع في الواجهة). يُفضّل إزالة الأقواس من كلمة المرور واستخدام ترميز URL إذا احتوت أحرفًا خاصة. الصيغة الموصى بها:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.bcmvgvkmdttwbkjxnsdi.supabase.co:5432/postgres
```

### 14) خطة الإطلاق
- **بيئات**: Dev (فرع)، Preview (PR)، Prod (main)
- **نشر**: Netlify CI/CD، معاينات للفروع
- **هجرات**: Supabase CLI
- **مراقبة**: Netlify Analytics + Supabase Logs

### 15) مخاطر وتخفيف
- تغيّر حدود/أسعار مزوّد AI → طبقة تجريد + مفاتيح لكل مستخدم
- تكاليف التخزين → حدود حجم/عدد + تنظيف دوري
- أداء الاستدعاءات → تخزين مؤقت لرسائل النظام، ضغط الطلبات

### 16) خارطة الطريق
- **MVP (أسبوعان)**: Auth، محادثة أساسية، رفع ملفات، إعدادات AI، نشر + دومين
- **v1.1**: مشاركة عامة، تحسين UI، Pagination
- **v1.2**: RAG أساسي
- **v1.3**: تحليلات وتصدير محادثات

