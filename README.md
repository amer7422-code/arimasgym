# Gym Engine — خادم المصادقة (Auth Backend)

خادم بسيط لتسجيل الدخول وإنشاء الحسابات، **بدون أي مكتبات خارجية** (zero
dependencies) — يعمل مباشرة بأمر `node server.js` على أي جهاز فيه Node.js
(الإصدار 18 فأعلى).

## 1. التشغيل محلياً

```bash
cd gym-engine-backend
node server.js
```

سترى:
```
✅ Gym Engine Auth Backend يعمل على المنفذ 4000
   الصحة: http://localhost:4000/health
```

الخادم يخزّن المستخدمين في ملف `data/users.json` (يُنشأ تلقائياً). هذا كافٍ
للتجربة والمشاريع الصغيرة. لعدد مستخدمين كبير يُفضّل نقل دوال `db.js`
لاستخدام قاعدة بيانات حقيقية (PostgreSQL / MySQL) — التوقيعات مصممة لتكون
سهلة الاستبدال.

## 2. متغيرات البيئة (مهمة قبل النشر الفعلي)

| المتغير | الوصف | افتراضي |
|---|---|---|
| `PORT` | منفذ الخادم | `4000` |
| `JWT_SECRET` | مفتاح توقيع الجلسات — **غيّره وجوباً قبل النشر** | مفتاح تطوير غير آمن |
| `ALLOWED_ORIGIN` | نطاق الواجهة الأمامية المسموح له بالاتصال (CORS) | `*` |

مثال تشغيل بمتغيرات مخصصة:
```bash
JWT_SECRET="سلسلة عشوائية طويلة وسرية" ALLOWED_ORIGIN="https://gym-engine.com" PORT=4000 node server.js
```

لتوليد مفتاح JWT_SECRET قوي:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 3. نقاط النهاية (API)

جميع الردود بصيغة JSON.

### POST `/api/auth/signup`
ينشئ حساباً جديداً.
```json
// الطلب
{ "phone": "0512345678", "password": "secret123", "name": "محمد" }

// الرد 201
{ "token": "...", "user": { "id": "...", "phone": "...", "name": "...", "createdAt": "..." } }
```
أخطاء محتملة: `400` (رقم/كلمة مرور غير صالحة)، `409` (الرقم مسجّل مسبقاً).

### POST `/api/auth/login`
```json
// الطلب
{ "phone": "0512345678", "password": "secret123" }

// الرد 200
{ "token": "...", "user": { ... } }
```
أخطاء: `401` (بيانات خاطئة)، `429` (محاولات كثيرة، حظر مؤقت 15 دقيقة).

### GET `/api/auth/me`
يتطلب ترويسة: `Authorization: Bearer <token>`
```json
{ "user": { "id": "...", "phone": "...", "name": "...", "createdAt": "..." } }
```

### POST `/api/auth/logout`
مسار للتوافق فقط (JWT عديم الحالة — الخروج الفعلي بحذف التوكن من المتصفح).

### GET `/health`
فحص أن الخادم يعمل.

## 4. ربطه بالواجهة الأمامية (ملف `gym-engine-app.html`)

بالملف الأمامي، بأول سطر داخل `<script>` ستجد:
```js
const API_BASE = 'http://localhost:4000';
```
غيّره لعنوان خادمك بعد النشر، مثلاً:
```js
const API_BASE = 'https://api.gym-engine.com';
```

## 5. النشر (Deployment)

### الخيار الأسهل: Railway / Render (مجاني للبداية)
1. ارفع مجلد `gym-engine-backend` كمستودع Git (GitHub).
2. أنشئ حساب على [render.com](https://render.com) أو [railway.app](https://railway.app).
3. أنشئ "Web Service" جديد واربطه بالمستودع.
4. أمر التشغيل: `node server.js` — أمر البناء: (لا يوجد، لا حاجة لـ npm install).
5. أضف متغيرات البيئة `JWT_SECRET` و `ALLOWED_ORIGIN` من لوحة التحكم.
6. بعد النشر ستحصل على رابط مثل `https://your-app.onrender.com` — استخدمه
   كـ `API_BASE` في الواجهة الأمامية.

⚠️ **تنبيه مهم بخصوص التخزين على منصات مثل Render المجانية:** نظام الملفات
فيها قد لا يكون دائماً (يُعاد ضبطه عند إعادة تشغيل الخادم)، فقد تُفقد بيانات
`data/users.json`. للاستخدام الجاد انقل التخزين لقاعدة بيانات مُدارة مجانية
مثل [Supabase](https://supabase.com) أو [Neon](https://neon.tech)
(PostgreSQL) أو استخدم قرصاً دائماً (Persistent Disk) إن توفر في خطتك.

### خيار VPS خاص (مثل DigitalOcean / Hostinger VPS)
1. ارفع مجلد `gym-engine-backend` على السيرفر (عبر `scp` أو Git).
2. ثبّت Node.js 18+ إن لم يكن مثبتاً.
3. شغّل الخادم بشكل دائم باستخدام `pm2`:
   ```bash
   npm install -g pm2
   cd gym-engine-backend
   JWT_SECRET="..." pm2 start server.js --name gym-engine-auth
   pm2 save
   pm2 startup
   ```
4. اربط نطاقاً فرعياً (مثل `api.gym-engine.com`) بالسيرفر عبر Nginx كـ reverse
   proxy، وفعّل HTTPS مجاناً بـ Certbot (Let's Encrypt).

## 6. ما لم يُبنى بعد (خارج نطاق هذا الملف)

- **تسجيل الدخول عبر Google الحقيقي**: الزر موجود بالواجهة لكنه غير مفعّل،
  لأنه يتطلب إنشاء مشروع OAuth على Google Cloud Console والحصول على
  Client ID/Secret، وهذا يحتاج إعداداً من حسابك الخاص لا يمكن تجهيزه هنا.
- **استرجاع كلمة المرور عبر SMS/بريد**: يتطلب حساب مزوّد رسائل (مثل
  Twilio أو Unifonic) أو خدمة بريد (مثل Resend/SendGrid).
- **قاعدة بيانات حقيقية** بدلاً من ملف JSON — موصى بها إذا تجاوز عدد
  الأعضاء بضع مئات أو احتجت استعلامات متقدمة.

## 7. ملخص الأمان المطبّق

- كلمات المرور مُجزأة بـ scrypt مع salt عشوائي لكل مستخدم (لا تُخزَّن كنص صريح).
- الجلسات عبر JWT موقّعة بـ HMAC-SHA256، صلاحية 7 أيام.
- حد لمحاولات تسجيل الدخول الفاشلة لكل IP (10 محاولات / 15 دقيقة).
- حد أقصى لحجم الطلب (1MB) لمنع إغراق الخادم.
- التحقق من صحة رقم الهاتف وطول كلمة المرور (6 أحرف كحد أدنى) قبل أي معالجة.
