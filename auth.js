'use strict';
/**
 * أدوات المصادقة: تجزئة كلمات المرور وتوقيع/التحقق من JWT
 * تعتمد فقط على وحدة crypto المدمجة في Node.js — بدون أي مكتبات خارجية.
 */
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_BEFORE_PRODUCTION';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // صلاحية التوكن: 7 أيام

if (!process.env.JWT_SECRET) {
  console.warn(
    '[تحذير] لم يتم ضبط متغير البيئة JWT_SECRET — يتم استخدام مفتاح افتراضي غير آمن. ' +
    'اضبط JWT_SECRET قبل النشر الفعلي.'
  );
}

// ---------------------------------------------------------------------------
// تجزئة كلمات المرور باستخدام scrypt (مدمجة في Node، لا تحتاج bcrypt خارجية)
// ---------------------------------------------------------------------------
function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(plainPassword, storedHash) {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

// ---------------------------------------------------------------------------
// JWT مبسّط (HS256) — تنفيذ يدوي متوافق مع معيار JWT القياسي
// ---------------------------------------------------------------------------
function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) input += '=';
  return Buffer.from(input, 'base64').toString('utf8');
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + TOKEN_TTL_SECONDS };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(encodedPayload));
  } catch {
    return null;
  }

  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    return null; // انتهت صلاحية التوكن
  }

  return payload;
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
