# دليل النشر - Render Deployment Guide

## خطوات النشر خطوة بخطوة

### 1️⃣ إعداد قاعدة البيانات PostgreSQL

#### الخيار الأول: Render (الموصى به)
```
1. اذهب إلى https://render.com
2. اختر "New" → "PostgreSQL"
3. أدخل اسم القاعدة: arimasgym
4. اختر المنطقة الجغرافية (أقرب منطقة)
5. انسخ DATABASE_URL
```

#### الخيار الثاني: Neon (بديل مجاني)
```
1. اذهب إلى https://neon.tech
2. أنشئ مشروعاً جديداً
3. انسخ رابط الاتصال
```

---

### 2️⃣ إنشاء خدمة Render للـ Backend

```bash
1. اذهب إلى https://render.com
2. اختر "New" → "Web Service"
3. اختر GitHub
4. ابحث عن: amer7422-code/arimasgym
5. اختر Repository
```

**الإعدادات:**

| الحقل | القيمة |
|-------|--------|
| **Name** | arimasgym-api |
| **Runtime** | Node |
| **Branch** | main |
| **Build Command** | `npm ci && npx prisma generate && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Plan** | Free (للبداية) |

---

### 3️⃣ إضافة متغيرات البيئة

في صفحة Render للخدمة، اذهب إلى **Environment**:

```
DATABASE_URL = postgresql://user:password@host:5432/arimasgym
JWT_ACCESS_SECRET = <generate-random-string-32-char>
JWT_REFRESH_SECRET = <generate-random-string-32-char>
NODE_ENV = production
PORT = 3000
API_DOMAIN = https://api.arimasgym.com
FRONTEND_DOMAIN = https://arimasgym.com
TZ = UTC
```

**لإنشاء مفاتيح عشوائية آمنة:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 4️⃣ ربط الدومين الخاص

#### في Render:
```
1. اذهب إلى Settings → Custom Domains
2. أدخل: api.arimasgym.com
3. انسخ قيمة CNAME المعطاة
```

#### في Namecheap:
```
1. اذهب إلى Domain List
2. اختر arimasgym.com
3. اضغط "Manage"
4. اذهب إلى Advanced DNS
5. أضف CNAME Record:
   - Host: api
   - Value: <القيمة من Render>
   - TTL: 3600
```

**انتظر:**
- 15 دقيقة - ساعة حتى ان��شار DNS
- سيتم تفعيل SSL تلقائياً بعد الانتشار

---

### 5️⃣ إعداد بيئة Staging (اختياري لكن موصى به)

```bash
1. أنشئ فرع staging في GitHub
2. أنشئ خدمة Render ثانية
3. اختر Branch: staging
4. استخدم نفس متغيرات البيئة
5. دومين مختلف: staging-api.arimasgym.com
```

---

### 6️⃣ تطبيق الهجرات (Migrations)

Render سيطبق الهجرات تلقائياً عند النشر بسبب:

```bash
# في Build Command:
npx prisma generate && npx prisma migrate deploy && npm run build
```

**ملاحظة مهمة:**
- استخدم `migrate deploy` وليس `migrate dev` في الإنتاج
- `migrate dev` تفاعلية وقد تتطلب إدخال يدوي
- `migrate deploy` آمنة للإنتاج وتطبق الهجرات بدون أسئلة

---

## ✅ فحص النشر

بعد النشر، اختبر الخدمة:

```bash
# اختبر الاتصال
curl https://api.arimasgym.com/health

# اختبر التسجيل
curl -X POST https://api.arimasgym.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

---

## 🔄 سير العمل المستمر

### عند كل Push:

```
1. GitHub Actions تشغيل تلقائي
2. بناء وفحص الكود
3. اختبار الوحدات (إن وجدت)
4. Render تُعيد نشر التطبيق تلقائياً
```

### للنشر على الإنتاج:

```bash
git push origin main
# Render ينشر تلقائياً
```

### للاختبار على Staging:

```bash
git push origin staging
# Render ينشر على بيئة staging
```

---

## 🐛 استكشاف الأخطاء

### لا أرى موقعي!

```bash
# تحقق من DNS
dig api.arimasgym.com

# تحقق من SSL
curl -v https://api.arimasgym.com
```

### خطأ في قاعدة البيانات

```bash
# تحقق من DATABASE_URL
# تأكد من أن قاعدة البيانات تعمل
# تحقق من Render Logs
```

### الهجرات لم تُطبق

```bash
# شغّل يدوياً (إذا لزم الأمر)
npm run prisma:deploy
```

---

## 📊 مراقبة الخدمة

في Render Dashboard:

- **Logs:** اضغط على الخدمة → اعرض السجلات
- **Metrics:** معدل الأخطاء والأداء
- **Deploys:** سجل النشر
- **Health:** حالة الخدمة

---

## 💰 التكاليف

### Render (المستوى المجاني):

| الموارد | المجاني | الملاحظات |
|--------|--------|----------|
| **Web Service** | ✅ مجاني | مع 750 ساعة/شهر |
| **PostgreSQL** | ✅ مجاني | 256 MB RAM |
| **SSL Certificate** | ✅ تلقائي | مجاني دائماً |

---

## 🚀 التطور المستقبلي

عند نمو التطبيق:

1. **ترقية Render** → Plan مدفوع
2. **إضافة Redis** → للـ caching والـ sessions
3. **Kubernetes** → للـ scaling الأفضل
4. **CDN** → للـ static files
5. **Monitoring** → New Relic أو DataDog

---

## 📝 ملاحظات هامة

✅ **ما تم إنجازه:**
- ✓ إعداد المشروع الكامل
- ✓ GitHub Actions Workflow
- ✓ متغيرات البيئة الآمنة
- ✓ Prisma Migrations

⚠️ **التحسينات المستقبلية:**
- Rate Limiting
- Refresh Token Rotation
- Redis Blacklist
- Monitoring والتنبيهات

---

**للمزيد من المساعدة:**
- 📧 support@arimasgym.com
- 🐛 [GitHub Issues](https://github.com/amer7422-code/arimasgym/issues)
- 📚 [Render Docs](https://render.com/docs)
