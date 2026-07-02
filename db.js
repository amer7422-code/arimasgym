'use strict';
/**
 * قاعدة بيانات بسيطة قائمة على ملف JSON.
 * كافية للتشغيل والتجربة والمشاريع الصغيرة. للإنتاج على نطاق أوسع
 * يُفضّل استبدالها بـ PostgreSQL / MySQL / MongoDB — الدوال هنا مصممة
 * لتكون سهلة الاستبدال لاحقاً (نفس التوقيعات: findUserByPhone, createUser...).
 */
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'users.json');

function ensureDbFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return { users: [] };
  }
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// طابور كتابة بسيط لمنع تعارض الكتابة المتزامنة على الملف
let writeQueue = Promise.resolve();
function withWriteLock(fn) {
  writeQueue = writeQueue.then(fn, fn);
  return writeQueue;
}

function findUserByPhone(phone) {
  const db = readDb();
  return db.users.find((u) => u.phone === phone) || null;
}

function findUserById(id) {
  const db = readDb();
  return db.users.find((u) => u.id === id) || null;
}

function createUser({ phone, name, passwordHash }) {
  return withWriteLock(() => {
    const db = readDb();
    if (db.users.some((u) => u.phone === phone)) {
      throw new Error('PHONE_ALREADY_EXISTS');
    }
    const user = {
      id: crypto_randomId(),
      phone,
      name: name || '',
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDb(db);
    return user;
  });
}

function crypto_randomId() {
  return require('crypto').randomBytes(12).toString('hex');
}

// نسخة آمنة من بيانات المستخدم بدون كلمة المرور المُجزأة
function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = { findUserByPhone, findUserById, createUser, publicUser };
