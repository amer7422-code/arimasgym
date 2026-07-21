# Arimas Gym Management System 🏋️

## نظام إدارة النادي الرياضي

**نظام شامل لإدارة أعضاء الجيم والاشتراكات والحضور والبرامج التدريبية.**

### المكدس التكنولوجي

- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (Access + Refresh Tokens)
- **Deployment:** Render + GitHub Actions
- **API Domain:** api.arimasgym.com

---

## 🚀 البدء السريع

### المتطلبات
- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm أو yarn

### التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/amer7422-code/arimasgym.git
cd arimasgym

# تثبيت المكتبات
npm install

# إنشاء ملف البيئة
cp .env.example .env
# عدّل .env بقيمك الخاصة

# إنشاء قاعدة البيانات والجداول
npx prisma migrate dev --name init

# تشغيل الخادم
npm run start:dev
```

الخادم سيكون متاحاً على: `http://localhost:3000`

---

## 📚 الميزات الرئيسية

### 🔐 مصادقة آمنة
- تسجيل وتسجيل دخول
- JWT مع Access + Refresh Tokens
- دعم الأدوار (Admin, Member, Trainer)
- حماية من Brute Force (مخطط)

### 👥 إدارة الأعضاء
- بيانات العضو الشاملة
- حالة الاشتراك
- تاريخ الحضور
- البرامج التدريبية المخصصة

### 💳 إدارة الاشتراكات
- أنواع خطط متعددة (شهري، ربع سنوي، سنوي، دخول يومي)
- تجديد تلقائي
- تتبع التواريخ

### 📊 تقارير وإحصائيات
- حضور يومي
- إحصائيات العضوية
- برامج تدريبية منظمة

---

## 📁 هيكل المشروع

```
arimasgym/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── auth/                      # Authentication module
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── strategies/            # JWT strategies
│   │   ├── guards/                # Auth guards
│   │   └── dto/                   # Data transfer objects
│   ├── members/                   # Members management
│   ├── subscriptions/             # Subscriptions management
│   ├── prisma/                    # Database service
│   └── main.ts                    # Entry point
├── test/
│   └── jest-e2e.json              # E2E tests config
├── .env.example                   # Environment template
├── .eslintrc.js                   # ESLint config
├── .prettierrc                    # Prettier config
├── .gitignore                     # Git ignore rules
├── nest-cli.json                  # NestJS CLI config
├── tsconfig.json                  # TypeScript config
├── tsconfig.build.json            # Build config
├── package.json                   # Dependencies
└── README.md                      # This file
```

---

## 🔧 سكريبتات npm

```bash
# التطوير
npm run start:dev          # تشغيل مع مراقب التغييرات

# الإنتاج
npm run build             # بناء التطبيق
npm run start:prod        # تشغيل الإنتاج

# الجودة
npm run lint              # فحص الكود
npm run format            # تنسيق الكود

# الاختبار
npm test                  # اختبارات الوحدة
npm run test:e2e          # اختبارات التكامل

# Prisma
npm run prisma:generate   # إنشاء Prisma Client
npm run prisma:migrate    # تطبيق الهجرات (تطوير)
npm run prisma:deploy     # تطبيق الهجرات (إنتاج)
```

---

## 🔐 متغيرات البيئة

انظر `.env.example` للقائمة الكاملة:

```env
# قاعدة البيانات
DATABASE_URL=postgresql://user:password@localhost:5432/arimasgym

# JWT
JWT_ACCESS_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# التطبيق
NODE_ENV=development
PORT=3000
API_DOMAIN=http://localhost:3000
FRONTEND_DOMAIN=http://localhost:3000
```

---

## 🌐 النشر على Render

### 1️⃣ إعداد قاعدة البيانات
```bash
# أنشئ PostgreSQL على Render أو Neon
# انسخ DATABASE_URL
```

### 2️⃣ أنشئ خدمة Render
1. اذهب إلى [Render](https://render.com)
2. اختر **New** → **Web Service**
3. اربط مستودع GitHub
4. اختر الفرع (`main` للإنتاج، `staging` للاختبار)
5. أضف متغيرات البيئة

### 3️⃣ ربط الدومين
**في Render:**
- **Custom Domain:** `api.arimasgym.com`

**في Namecheap DNS:**
1. اذهب إلى **Domain List** → **Manage** → **Advanced DNS**
2. أضف CNAME:
   - **Host:** `api`
   - **Value:** `your-render-url.onrender.com`
3. انتظر انتشار DNS (15 دقيقة - ساعة)

### 4️⃣ GitHub Actions
- الـ Workflow يعمل تلقائياً عند push
- يبني ويختبر التطبيق
- يرسل تنبيهات عند النجاح/الفشل

---

## 📖 التوثيق الإضافية

- **[Auth Module](./AUTH_MODULE_README.md)** - تفاصيل نظام المصادقة
- **[Database Schema](./prisma/schema.prisma)** - تصميم قاعدة البيانات
- **[Render Deploy Guide](./DEPLOYMENT.md)** - دليل النشر المفصل

---

## 🧪 الاختبار

```bash
# اختبارات الوحدة
npm test

# اختبارات e2e
npm run test:e2e

# تغطية الاختبارات
npm test -- --coverage
```

---

## 🌳 إدارة الفروع

```bash
# production
main                  ← النشر المباشر

# staging/testing
staging               ← الاختبار قبل الإنتاج

# features
feature/...           ← ميزات جديدة
```

**سير العمل:**
1. أنشئ فرع من `staging`: `git checkout -b feature/my-feature`
2. اجعل التغييرات واختبرها
3. أنشئ PR إلى `staging`
4. عند الجاهزية، PR من `staging` إلى `main`

---

## 🤝 المساهمة

1. Fork المستودع
2. أنشئ فرع للميزة: `git checkout -b feature/amazing-feature`
3. اجعل الالتزامات: `git commit -m 'Add amazing feature'`
4. ادفع الفرع: `git push origin feature/amazing-feature`
5. افتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت MIT License - انظر [LICENSE](./LICENSE) للتفاصيل.

---

## 💬 الدعم والتواصل

- 📧 البريد الإلكتروني: support@arimasgym.com
- 🐛 أبلغ عن الأخطاء: [GitHub Issues](https://github.com/amer7422-code/arimasgym/issues)
- 💡 اقترح ميزات: [GitHub Discussions](https://github.com/amer7422-code/arimasgym/discussions)

---

## 🗺️ خارطة الطريق

- [ ] Rate Limiting على `/auth/login`
- [ ] Refresh Token Rotation
- [ ] Redis Blacklist للـ Logout
- [ ] Swagger/OpenAPI Documentation
- [ ] Mobile App Integration
- [ ] Payment Gateway Integration
- [ ] Advanced Analytics Dashboard
- [ ] Kubernetes Deployment

---

**حقوق الطبع © 2026 Arimas Gym. جميع الحقوق محفوظة.**
