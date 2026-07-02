'use strict';
/**
 * Gym Engine - خادم مصادقة (Auth Backend) بسيط
 * -------------------------------------------------
 * بدون أي مكتبات خارجية (zero dependencies) — يعتمد فقط على وحدات Node.js
 * المدمجة (http, crypto, fs) حتى يعمل مباشرة بأمر: node server.js
 *
 * نقاط النهاية المتاحة:
 *   POST /api/auth/signup   { phone, password, name? } -> { token, user }
 *   POST /api/auth/login    { phone, password }         -> { token, user }
 *   GET  /api/auth/me       (Authorization: Bearer <token>) -> { user }
 *   POST /api/auth/logout   -> { ok: true }  (تسجيل الخروج فعلياً يتم بحذف
 *                               التوكن من طرف العميل، هذا المسار للتوافق فقط)
 */
const http = require('http');
const { hashPassword, verifyPassword, signToken, verifyToken } = require('./auth');
const { findUserByPhone, createUser, publicUser } = require('./db');

const PORT = process.env.PORT || 4000;

// اسمح بأصل الواجهة الأمامية (غيّرها لنطاقك الحقيقي بعد النشر)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// ---------------------------------------------------------------------------
// حد بسيط لعدد محاولات تسجيل الدخول لكل IP لمنع هجمات التخمين (Brute-force)
// ---------------------------------------------------------------------------
const LOGIN_ATTEMPTS = new Map(); // ip -> { count, firstAttemptAt }
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 دقيقة

function isRateLimited(ip) {
  const entry = LOGIN_ATTEMPTS.get(ip);
  const now = Date.now();
  if (!entry) return false;
  if (now - entry.firstAttemptAt > WINDOW_MS) {
    LOGIN_ATTEMPTS.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function registerAttempt(ip) {
  const now = Date.now();
  const entry = LOGIN_ATTEMPTS.get(ip);
  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    LOGIN_ATTEMPTS.set(ip, { count: 1, firstAttemptAt: now });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(ip) {
  LOGIN_ATTEMPTS.delete(ip);
}

// ---------------------------------------------------------------------------
// أدوات مساعدة للطلب/الاستجابة
// ---------------------------------------------------------------------------
function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    const MAX_SIZE = 1e6; // 1MB حد أقصى لحجم الطلب
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function getBearerToken(req) {
  const header = req.headers['authorization'] || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// التحقق من صحة المدخلات
// ---------------------------------------------------------------------------
function validatePhone(phone) {
  return typeof phone === 'string' && /^[0-9+\s-]{8,15}$/.test(phone.trim());
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

// ---------------------------------------------------------------------------
// المسارات (Routes)
// ---------------------------------------------------------------------------
async function handleSignup(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: 'طلب غير صالح' });
  }

  const phone = (body.phone || '').trim();
  const password = body.password || '';
  const name = (body.name || '').trim();

  if (!validatePhone(phone)) {
    return sendJson(res, 400, { error: 'رقم الهاتف غير صالح' });
  }
  if (!validatePassword(password)) {
    return sendJson(res, 400, { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }

  if (findUserByPhone(phone)) {
    return sendJson(res, 409, { error: 'رقم الهاتف مسجّل مسبقاً' });
  }

  let user;
  try {
    const passwordHash = hashPassword(password);
    user = await createUser({ phone, name, passwordHash });
  } catch (err) {
    if (err.message === 'PHONE_ALREADY_EXISTS') {
      return sendJson(res, 409, { error: 'رقم الهاتف مسجّل مسبقاً' });
    }
    console.error(err);
    return sendJson(res, 500, { error: 'حدث خطأ في الخادم' });
  }

  const token = signToken({ sub: user.id, phone: user.phone });
  return sendJson(res, 201, { token, user: publicUser(user) });
}

async function handleLogin(req, res) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return sendJson(res, 429, { error: 'محاولات كثيرة جداً، حاول لاحقاً بعد 15 دقيقة' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: 'طلب غير صالح' });
  }

  const phone = (body.phone || '').trim();
  const password = body.password || '';

  const user = findUserByPhone(phone);
  const passwordOk = user ? verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    registerAttempt(ip);
    return sendJson(res, 401, { error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
  }

  clearAttempts(ip);
  const token = signToken({ sub: user.id, phone: user.phone });
  return sendJson(res, 200, { token, user: publicUser(user) });
}

async function handleMe(req, res) {
  const token = getBearerToken(req);
  const payload = verifyToken(token);
  if (!payload) {
    return sendJson(res, 401, { error: 'غير مصرح — سجّل الدخول مجدداً' });
  }
  const { findUserById } = require('./db');
  const user = findUserById(payload.sub);
  if (!user) {
    return sendJson(res, 404, { error: 'المستخدم غير موجود' });
  }
  return sendJson(res, 200, { user: publicUser(user) });
}

async function handleLogout(req, res) {
  // JWT عديم الحالة (stateless) — تسجيل الخروج الفعلي يتم بحذف التوكن
  // من طرف العميل. هذا المسار موجود للتوافق مع أي منطق عميل يستدعيه.
  return sendJson(res, 200, { ok: true });
}

// ---------------------------------------------------------------------------
// المُوجّه الرئيسي (Router)
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  // دعم CORS لطلبات Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'POST' && url.pathname === '/api/auth/signup') {
      return await handleSignup(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      return await handleLogin(req, res);
    }
    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      return await handleMe(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
      return await handleLogout(req, res);
    }
    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { status: 'ok' });
    }

    return sendJson(res, 404, { error: 'المسار غير موجود' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { error: 'حدث خطأ في الخادم' });
  }
});

server.listen(PORT, () => {
  console.log(`✅ Gym Engine Auth Backend يعمل على المنفذ ${PORT}`);
  console.log(`   الصحة: http://localhost:${PORT}/health`);
});
