# Arimas Gym — كل حاجة في مكان واحد (Backend + Frontend)

## محتويات المجلد
```
arimas-gym/
├── backend/
│   ├── server.js        ← السيرفر (Node.js + Express + SQLite)
│   ├── package.json
│   ├── .env             ← جاهز فعلاً بمفتاح JWT عشوائي قوي (تم توليده لك)
│   └── .env.example
└── frontend/
    └── index.html        ← موقع/تطبيق Arimas (متصل بالفعل بـ API_BASE_URL)
```

## 1) التشغيل على جهازك (خطوة واحدة فعلياً)
```bash
cd backend
npm install
npm start
```
السيرفر هيشتغل على `http://localhost:3000`. ملف `.env` جاهز بالفعل، مش محتاجة تعدلي فيه حاجة للتجربة المحلية.

## 2) الربط بين الفرونت والباك
في `frontend/index.html` لقيت إنه بالفعل متصل بـ:
```js
const API_BASE_URL = 'https://arimasgym.onrender.com';
```
يعني عندك نسخة شغالة على Render قبل كده. لو:
- **لسه شغالة على نفس الرابط ده** → مفيش حاجة تتغير، الموقع هيفضل يشتغل زي ما هو.
- **هتنقلي الباك اند لدومين جديد** → غيّري القيمة دي لرابط الدومين الجديد، وحدّثي `CORS_ORIGIN` في `.env` على السيرفر ليكون رابط موقعك بالظبط (بدل `*`) عشان الأمان.

## 3) النشر (Deploy) على الإنترنت
مش هقدر أنشر الباك اند لك مباشرة من هنا لأن بيئة التنفيذ عندي من غير إنترنت، لكن الخطوات بسيطة:

1. ارفعي مجلد `backend/` على GitHub (repo خاص أو عام).
2. على Render.com أو Railway.app: أنشئي "Web Service" جديد وربطيه بالـ repo.
   - Build Command: `npm install`
   - Start Command: `npm start`
3. ضيفي متغيرات البيئة (Environment Variables) من ملف `.env` بتاعك (نفس القيم، أو ولّدي مفتاح JWT جديد لو حابة).
4. بعد النشر هتاخدي رابط زي `https://your-app.onrender.com` — حطيه في `API_BASE_URL` جوه `frontend/index.html`.
5. ارفعي `frontend/index.html` على الدومين/الاستضافة بتاعة الموقع نفسه.

## 4) نقاط الاتصال (API)
| Method | Endpoint | الوصف |
|---|---|---|
| POST | /api/auth/register | إنشاء حساب: `{ name, phone, email?, password }` |
| POST | /api/auth/login | تسجيل دخول: `{ phone, password }` |
| GET | /api/auth/me | بيانات المستخدم (Header: `Authorization: Bearer TOKEN`) |
| GET | /api/health | فحص إن السيرفر شغال |

رقم الهاتف لازم يكون مصري (01 + 9 أرقام)، وكلمة المرور 6 أحرف على الأقل.

## 5) قبل الاستخدام مع عملاء حقيقيين
- غيّري `JWT_SECRET` بشكل دوري ومتشاركيهوش مع حد.
- حددي `CORS_ORIGIN` برابط موقعك الفعلي بدل `*`.
- فعّلي HTTPS (تلقائي على Render/Railway).
- SQLite كويس للبداية؛ لو الاستخدام كبر، ينقل بسهولة لـ PostgreSQL لاحقاً.
