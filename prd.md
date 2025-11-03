## PRD — منصة محادثات ذكاء اصطناعي مع حفظ السياق والملفات

### 1) نظرة عامة
- **الوصف**: منصة حلول تطويرية وابتكارية مدعومة بالذكاء الاصطناعي، تُحلّل بيانات وسجل العميل السابق لتقديم دراسة احتياج، نطاق عمل، مقترحات (SOW/Proposal)، وخطط تنفيذ مع قابلية توليد الشيفرة الأولية ونشرها وربطها بالأدوات التشغيلية.
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
- **مستخدمون**: أصحاب أعمال، فرق منتج، مدراء مشاريع، مطورون، مستشارون تقنيون
- **حالات**:
  - تقديم طلب خدمة/فكرة (Intake) مع ملفات وروابط سابقة
  - تحليل احتياج تلقائي + تصنيف المجال (Web, Mobile, E‑commerce, AI Agent, Integrations)
  - توليد نطاق عمل (Scope) وخيارات حلول وتقسيم مراحل
  - إنتاج مقترح/SOW (متطلبات، مدة، تكاليف، مخاطرات)
  - توليد هيكل مشروع أولي (Code Scaffold) وربط مستودع ونشر أولي
  - لوحات متابعة تقدم ومخرجات، مع دردشة سياقية لكل مشروع

### 4) نطاق الإصدار الأول (MVP)
- **يشمل**:
  - Auth (Email/Password, OTP)
  - نموذج Intake لجمع المتطلبات والملفات والروابط
  - تصنيف تلقائي للمجال + توصية بحزمة تقنية أولية
  - توليد مسودة SOW/Proposal قابلة للتعديل
  - توليد Scaffold مشروع (SPA + Functions) وربط GitHub + نشر Netlify
  - مساحة دردشة سياقية لكل مشروع مع حفظ الرسائل
  - تخزين ملفات العميل (خاص) وربطها بالمشروع
  - إعدادات مزود الذكاء لكل مستخدم
- **مستبعد الآن**: فوترة وعقود إلكترونية، إدارة فرق متعددة الأدوار، تكاملات مدفوعة متقدمة، RAG على مصادر خارجية كبيرة

### 5) المتطلبات الوظيفية
- **المصادقة**: تسجيل/دخول/خروج، OTP بالبريد
- **Intake**: نموذج ذكي مع أسئلة متفرعة حسب المجال، يدعم روابط وملفات
- **التصنيف والتوصية**: تصنيف المجال والتقنيات (Routing) وإنتاج موجز تقني
- **SOW/Proposal**: توليد هيكل المقترح (نطاق، افتراضات، جدول زمني، تسعير نطاقي)، قابل للتحرير
- **التوليد التقني**: إنشاء Scaffold أولي (HTML/CSS/JS + Functions) وربط GitHub/Netlify تلقائيًا
- **المحادثة السياقية**: دردشة لكل مشروع مع تاريخ محفوظ وارتباط بالمخرجات
- **الملفات**: رفع/ربط/تحميل، روابط موقّتة
- **الإعدادات**: اختيار مزود الذكاء/النموذج ومعلمات التوليد، تخزين مفتاح المستخدم مشفرًا
- **المشاركة**: روابط قراءة فقط للمقترح أو مخرجات المشروع

### 6) متطلبات لا وظيفية
- **الأداء**: Core Web Vitals ضمن المعايير
- **الأمان**: RLS على الجداول، مفاتيح مشفّرة، CORS محدود، CSP
- **التوافر**: 99.9%
- **الخصوصية**: عدم تخزين مفاتيح بنص واضح، حذف عند الطلب
- **التوسع**: وظائف عديمة الحالة، فهارس DB مناسبة

### 7) البنية وتدفق العمل
- **واجهة (SPA)**: HTML/CSS/JS على Netlify
- **Functions (Node.js)**:
  - `POST /api/intake`: استقبال بيانات طلب الخدمة والملفات
  - `POST /api/classify`: تصنيف المجال والتقنيات المقترحة
  - `POST /api/proposal`: توليد مقترح/SOW من بيانات intake
  - `POST /api/scaffold`: توليد مشروع أولي وربط المستودع/النشر
  - `POST /api/chat`: دردشة سياقية للمشروع
  - `POST /api/upload`: توقيع ورفع إلى Supabase Storage
  - `GET/POST /api/projects`: إدارة المشاريع وحالاتها
- **Supabase**: Auth + Postgres + Storage
- **الدومين**: DNS إلى Netlify، HTTPS

### 8) نموذج البيانات (Supabase)
- **users**: id, email, created_at
- **user_settings**: user_id (FK), ai_provider, api_key_encrypted, model, temperature
- **projects**: id, user_id, title, status (draft/active/done), created_at
- **intakes**: id, project_id (FK), domain, answers jsonb, created_at
- **proposals**: id, project_id (FK), summary, scope jsonb, pricing jsonb, status, created_at
- **conversations**: id, project_id (FK), user_id, title, is_archived, share_token, created_at
- **messages**: id, conversation_id (FK), role, content, tokens, created_at
- **files**: id, user_id, project_id, storage_path, mime, size, created_at
- **project_files**: project_id, file_id (PK مركّب)
- **knowledge_docs**: id, project_id, source, title, chunk_count, created_at
- **connectors**: id, user_id, kind (github, notion, jira, drive), auth blob, created_at
فهرسة: على `messages.conversation_id`, `conversations.project_id`, `projects.user_id`, `files.project_id`.

### 9) تكامل الذكاء الاصطناعي (محسّن)
- **الأوركسترا**: طبقة توجيه نوايا (Intent Routing) لتحديد المهمة: تصنيف/مقترح/توليد كود/دردشة.
- **الاستدعاء بالأدوات**: Function calling لدمج أدوات مثل GitHub/Netlify/Supabase وقراءتها.
- **RAG**: فهرسة وثائق العميل والملفات (تقسيم + Embeddings) وبحث دلالي للسياق.
- **الذاكرة**: ذاكرة مشروع قصيرة/طويلة المدى مع سياسات نسيان انتقائي.
- **السلامة**: حد أقصى tokens، فلترة محتوى، إخفاء أسرار قبل الإرسال.
- **التعدد**: دعم مزودين (ChatGPT‑5, API AI Platform) مع Fallback تلقائي.

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
- يستطيع المستخدم ملء نموذج Intake وحفظه مع ملفات.
- ينتج النظام تصنيف مجال وتوصية تقنية أولية بشكل آلي.
- يُولَّد مقترح/SOW بصيغة قابلة للمشاركة (قراءة فقط).
- يُنشأ Scaffold مشروع ويُدفع إلى GitHub ويُنشر على Netlify بنجاح.
- تعمل دردشة المشروع وتسترجع سياقًا من ملفات/Intake.

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
- **MVP (أسبوعان)**: Auth، Intake، تصنيف، توليد مقترح، Scaffold + نشر، دردشة مشروع
- **v1.1**: إدارة مشاريع متعددة، مشاركة عامة للمقترح، تحسين UI
- **v1.2**: RAG على وثائق خارجية + تكامل GitHub/Notion/Jira أساسي
- **v1.3**: تحليلات استخدام، تتبع تكلفة الذكاء، تصدير شامل

