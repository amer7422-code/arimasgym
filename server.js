// ============================================================
// Arimas Gym - Backend حقيقي لتسجيل الدخول وإنشاء الحسابات
// Node.js + Express + SQLite + bcrypt + JWT
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const rateLimit = require('express-rate-limit');
const path = require('path');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  تحذير: لم يتم ضبط JWT_SECRET في .env — استخدم مفتاحاً سرياً قوياً قبل النشر الفعلي.');
}

// ------------------------------------------------------------
// قاعدة البيانات (SQLite - ملف واحد، لا يحتاج سيرفر منفصل)
// ------------------------------------------------------------
const db = new Database(path.join(__dirname, 'arimasgym.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ------------------------------------------------------------
// الإعداد العام
// ------------------------------------------------------------
const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// تحديد عدد المحاولات على مسارات المصادقة لمنع الهجمات
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'محاولات كثيرة جداً، حاول مرة أخرى بعد قليل.' }
});

// ------------------------------------------------------------
// أدوات مساعدة
// ------------------------------------------------------------
function signToken(user) {
  return jwt.sign({ sub: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function toPublicUser(user) {
  return { id: user.id, name: user.name, phone: user.phone, email: user.email, created_at: user.created_at };
}

function isValidPhone(phone) {
  return typeof phone === 'string' && /^01[0-9]{9}$/.test(phone.trim());
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    if (!user) return res.status(401).json({ error: 'المستخدم غير موجود.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة غير صالحة أو منتهية، سجل الدخول من جديد.' });
  }
}

// ------------------------------------------------------------
// مسارات المصادقة
// ------------------------------------------------------------

// إنشاء حساب جديد
app.post('/api/auth/register', authLimiter, (req, res) => {
  const { name, phone, email, password } = req.body || {};

  if (!name || !name.trim()) return res.status(400).json({ error: 'الاسم مطلوب.' });
  if (!isValidPhone(phone)) return res.status(400).json({ error: 'رقم الهاتف غير صالح، يجب أن يكون رقماً مصرياً مكوناً من 11 رقم.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' });

  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone.trim());
  if (existing) return res.status(409).json({ error: 'هذا الرقم مسجل بالفعل، جرب تسجيل الدخول.' });

  const passwordHash = bcrypt.hashSync(password, 10);

  const info = db.prepare(
    'INSERT INTO users (name, phone, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(name.trim(), phone.trim(), (email || '').trim(), passwordHash);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = signToken(user);

  res.status(201).json({ token, user: toPublicUser(user) });
});

// تسجيل الدخول
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { phone, password } = req.body || {};

  if (!phone || !password) return res.status(400).json({ error: 'رقم الهاتف وكلمة المرور مطلوبان.' });

  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone.trim());
  if (!user) return res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

// بيانات المستخدم الحالي (مسار محمي بالتوكن)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

// فحص صحة السيرفر
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: 'المسار غير موجود.' }));

app.listen(PORT, () => {
  console.log(`✅ Arimas Gym backend يعمل على http://localhost:${PORT}`);
});

