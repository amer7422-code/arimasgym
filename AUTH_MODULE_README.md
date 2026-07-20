# Auth Module — دليل الاستخدام

## التثبيت
```bash
npm install @nestjs/jwt @nestjs/passport @nestjs/config passport passport-jwt bcrypt class-validator class-transformer
npm install -D @types/passport-jwt @types/bcrypt
```

## هيكل الملفات
```
src/
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── auth/
    ├── auth.module.ts
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── dto/
    │   ├── register.dto.ts
    │   └── login.dto.ts
    ├── strategies/
    │   ├── jwt.strategy.ts        (Access Token)
    │   └── refresh.strategy.ts    (Refresh Token)
    ├── guards/
    │   ├── jwt-auth.guard.ts
    │   ├── refresh-jwt.guard.ts
    │   └── roles.guard.ts
    └── decorators/
        ├── roles.decorator.ts
        └── get-user.decorator.ts
```

## كيف تحققنا من المتطلبات الأربعة

**1. JWT + Passport:** `JwtStrategy` (access) و `RefreshTokenStrategy` (refresh) منفصلتان بمفتاحين سريين مختلفين — هذا يمنع استخدام refresh token كـ access token عن طريق الخطأ.

**2. Endpoints:**
- `POST /auth/register` — يشفّر كلمة المرور بـ `bcrypt` بقوة تشفير `saltRounds=12`، ويمنع تمرير `role=ADMIN` مباشرة من الطلب.
- `POST /auth/login` — يتحقق من `deletedAt` و `status` قبل مطابقة كلمة المرور، ويعيد رسالة خطأ موحّدة لمنع User Enumeration.
- `POST /auth/refresh` — يستخدم `RefreshJwtGuard` منفصل، ويعيد التحقق من حالة المستخدم في القاعدة عند كل تجديد.

**3. AuthGuard + Roles:** `JwtAuthGuard` للمصادقة، و `RolesGuard` + `@Roles()` decorator للتفويض. **يجب استخدامهما معاً وبهذا الترتيب**:
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
```

**4. فحص Soft Delete:** يتم داخل دالة `validate()` في كل من `JwtStrategy` و `RefreshTokenStrategy` — أي طلب يحمل توكن صالح لمستخدم `deletedAt != null` سيُرفض تلقائياً بـ `401 Unauthorized`، حتى لو كان التوكن نفسه لم تنتهِ صلاحيته بعد. هذا هو الحل الصحيح: التحقق يتم من القاعدة في كل طلب، وليس فقط عند إصدار التوكن، لأن حساباً قد يُحذف بعد إصدار التوكن وقبل انتهاء صلاحيته.

## نقاط أمنية مهمة يجب التنبه لها لاحقاً
- **Refresh Token Rotation:** حالياً كل refresh يصدر access + refresh جديدين لكن لا نُبطل القديم. للمرحلة القادمة، يُنصح بتخزين hash لآخر refresh token صادر لكل مستخدم (عمود جديد أو جدول `sessions`) وإبطاله عند كل استخدام (Rotation) لمنع إعادة استخدام توكن مسروق.
- **Rate Limiting:** أضف `@nestjs/throttler` على `/auth/login` لمنع هجمات Brute Force.
- **Logout الحقيقي:** بما أن JWT stateless، الـ logout الفعلي يتطلب Redis blacklist للتوكنات الملغاة (كما هو مخطط في المرحلة الأولى من الهندسة المعمارية).
