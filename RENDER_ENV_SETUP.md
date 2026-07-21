# إضافة متغيرات البيئة في Render 🔧

## خطوات إضافة Environment Variables

### 1️⃣ الوصول إلى لوحة Render

```
1. اذهب إلى https://dashboard.render.com
2. اختر خدمتك (arimasgym-api أو نحو ذلك)
3. اضغط على Settings
4. اختر "Environment"
```

### 2️⃣ متغيرات البيئة المطلوبة

أضف كل متغير بـ النقر على **Add Environment Variable**:

#### قاعدة البيانات:
```
Name:  DATABASE_URL
Value: postgresql://user:password@host:port/dbname

مثال:
postgresql://arimasgym_user:SecurePassword123@dpg-xxx.postgres.render.com:5432/arimasgym
```

#### JWT Access Token:
```
Name:  JWT_ACCESS_SECRET
Value: <قيمة عشوائية قوية 32 حرف>

لإنشاء قيمة آمنة، استخدم:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

مثال:
a7f3b9c2e1d4f6a8b5c7e9d1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f
```

#### JWT Refresh Token:
```
Name:  JWT_REFRESH_SECRET
Value: <قيمة عشوائية قوية 32 حرف مختلفة>

مثال:
c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c
```

#### إعدادات التطبيق:
```
Name:  NODE_ENV
Value: production

Name:  PORT
Value: 10000

Name:  API_DOMAIN
Value: https://api.arimasgym.com

Name:  FRONTEND_DOMAIN
Value: https://arimasgym.com

Name:  TZ
Value: UTC
```

#### JWT Expiration:
```
Name:  JWT_ACCESS_EXPIRATION
Value: 15m

Name:  JWT_REFRESH_EXPIRATION
Value: 7d
```

---

## 🎯 جدول متغيرات البيئة الكاملة

| المتغير | القيمة | النوع | ملاحظات |
|--------|--------|-------|---------|
| **DATABASE_URL** | من Render PostgreSQL | string | مهم جداً |
| **JWT_ACCESS_SECRET** | عشوائي 32 حرف | string | سري - لا تشاركه |
| **JWT_REFRESH_SECRET** | عشوائي 32 حرف | string | سري - مختلف عن Access |
| **NODE_ENV** | production | string | دائماً production |
| **PORT** | 10000 | number | من Render |
| **API_DOMAIN** | https://api.arimasgym.com | string | الدومين النهائي |
| **FRONTEND_DOMAIN** | https://arimasgym.com | string | للـ CORS |
| **JWT_ACCESS_EXPIRATION** | 15m | string | مدة صل��حية Access Token |
| **JWT_REFRESH_EXPIRATION** | 7d | string | مدة صلاحية Refresh Token |
| **TZ** | UTC | string | المنطقة الزمنية |

---

## 🔑 كيفية إنشاء مفاتيح آمنة

### الطريقة الأولى: استخدام Node.js

```bash
# شغّل هذا الأمر في Terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# سيطبع شيئاً مثل:
# a7f3b9c2e1d4f6a8b5c7e9d1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f

# كرر الأمر لإنشاء مفتاح آخر للـ Refresh Token
```

### الطريقة الثانية: أونلاين

استخدم مولدات آمنة أونلاين:
- https://tools.owasp.org/online-tools/ 
- أو أي مولد عشوائي آمن موثوق

---

## 📝 خطوات بالصور

### الخطوة 1: افتح لوحة Render
```
1. اذهب إلى https://dashboard.render.com
2. اختر الخدمة من القائمة اليسرى
```

### الخطوة 2: اضغط على Settings
```
في أعلى الصفحة:
Services → [اسم الخدمة] → Settings
```

### الخطوة 3: اختر Environment
```
في القائمة اليسرى:
Settings → Environment
```

### الخطوة 4: أضف المتغيرات
```
1. اضغط "Add Environment Variable"
2. أدخل Name (مثل: DATABASE_URL)
3. أدخل Value (الرابط من PostgreSQL)
4. اضغط "Save"
5. كرر لكل متغير
```

### الخطوة 5: أعد التشغيل
```
بعد إضافة جميع المتغيرات:
1. اذهب إلى "Deploys"
2. اضغط على آخر deployment
3. اضغط "Re-deploy"

أو انتظر push جديد من GitHub
```

---

## ⚠️ نقاط أمنية مهمة

### ✅ افعل:
- ✅ استخدم قيماً عشوائية قوية للـ Secrets
- ✅ لا تشارك Secrets مع أحد
- ✅ غيّر Secrets بانتظام
- ✅ استخدم Render's Environment Variables (آمنة)
- ✅ تحقق من القيم بعد الإضافة

### ❌ لا تفعل:
- ❌ لا تدفع متغيرات حساسة إلى GitHub
- ❌ لا تستخدم نفس السر لـ Access و Refresh
- ❌ لا تكشف Secrets في Logs
- ❌ لا تستخدم كلمات مرور بسيطة
- ❌ لا تخزن Secrets في ملفات عادية

---

## 🧪 اختبار المتغيرات

بعد إضافة المتغيرات، تحقق من أنها تعمل:

```bash
# شغّل هذا الأمر للتحقق من الاتصال
curl https://arimasgym.onrender.com/health

# يجب أن تحصل على:
# {"status":"ok"}
```

---

## 📊 ترتيب الأولويات

### يجب إضافتها أولاً (حرجة):
1. ⭐ DATABASE_URL
2. ⭐ JWT_ACCESS_SECRET
3. ⭐ JWT_REFRESH_SECRET
4. ⭐ NODE_ENV

### ثم إضافة (مهمة):
5. PORT
6. API_DOMAIN
7. FRONTEND_DOMAIN

### اختيارية:
8. TZ
9. JWT_ACCESS_EXPIRATION
10. JWT_REFRESH_EXPIRATION

---

## 🔄 تحديث المتغيرات

إذا احتجت لتغيير متغير:

```
1. اذهب إلى Environment
2. ابحث عن المتغير
3. اضغط على "Edit"
4. غيّر القيمة
5. اضغط "Save"
6. أعد التشغيل (اختياري - التغييرات تطبق تلقائياً)
```

---

## 🆘 حل المشاكل الشائعة

### المشكلة: "Database connection failed"
```
الحل:
1. تحقق من DATABASE_URL - هل هو صحيح؟
2. هل قاعدة البيانات قيد التشغيل؟
3. هل الكلمة المرورية صحيحة؟
4. جرب النسخ واللصق من Render PostgreSQL Dashboard
```

### المشكلة: "Invalid token"
```
الحل:
1. تحقق من JWT_ACCESS_SECRET - هل هو صحيح؟
2. هل JWT_REFRESH_SECRET مختلف؟
3. جرب إعادة تشغيل الخدمة
```

### المشكلة: "Port already in use"
```
الحل:
1. Render يختار PORT تلقائياً
2. استخدم process.env.PORT بدلاً من رقم ثابت
3. في package.json:
   "start:prod": "PORT=$PORT node dist/main"
```

---

## 📚 مراجع إضافية

### من Render:
- [Environment Variables Guide](https://render.com/docs/environment-variables)
- [PostgreSQL Setup](https://render.com/docs/databases)

### من NestJS:
- [Configuration](https://docs.nestjs.com/techniques/configuration)
- [Environment Variables](https://docs.nestjs.com/techniques/configuration#schema-validation)

---

## ✅ قائمة التحقق النهائية

قبل الضغط Deploy:

```
☐ DATABASE_URL مضافة وصحيحة
☐ JWT_ACCESS_SECRET مضافة (عشوائية 32 حرف)
☐ JWT_REFRESH_SECRET مضافة (عشوائية 32 حرف مختلفة)
☐ NODE_ENV = "production"
☐ PORT = "10000"
☐ API_DOMAIN = "https://api.arimasgym.com"
☐ FRONTEND_DOMAIN = "https://arimasgym.com"
☐ TZ = "UTC"
☐ JWT_ACCESS_EXPIRATION = "15m"
☐ JWT_REFRESH_EXPIRATION = "7d"

بعد التأكد:
☐ اضغط Re-deploy
☐ انتظر الـ Deployment
☐ اختبر الـ Endpoints
☐ تحقق من الـ Logs
```

---

**آخر تحديث:** 2026-07-21
**الحالة:** جاهز للتطبيق على Render
