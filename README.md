# Gym Management System — Backend

نظام إدارة صالة رياضية مبني بـ NestJS + Prisma + PostgreSQL.

## المراحل المُنجزة حتى الآن
1. `prisma/schema.prisma` — نماذج قاعدة البيانات (User, Membership, Attendance, WorkoutPlan) + Soft Delete.
2. `prisma/migrations/` — Migration لحقول الملف الشخصي.
3. `src/auth/` — تسجيل، دخول، JWT (access + refresh)، RBAC.
4. `src/members/` — CRUD لإدارة الأعضاء (مقتصر على الطاقم).
5. `src/subscriptions/` — إدارة الاشتراكات + Cron يومي لإنهاء الاشتراكات المنتهية تلقائياً.

راجع `AUTH_MODULE_README.md` لتفاصيل أعمق حول Auth Module.

## التشغيل
```bash
npm install
cp .env.example .env   # ثم عدّل القيم الحقيقية
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

## الخطوات القادمة
- Attendance Module
- Trainers & Sessions Module
- Payments & Revenue Module
