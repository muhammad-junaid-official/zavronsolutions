/**
 * Admin authentication
 *
 * - Credentials: ADMIN_EMAIL (default info@zavronsolutions.com) and
 *   ADMIN_PASSWORD (Vercel environment variable, required).
 *   A password changed from the dashboard is stored hashed (scrypt) in the
 *   database and takes priority over ADMIN_PASSWORD.
 * - Session: HMAC-signed token in an HttpOnly, Secure, SameSite=Strict cookie.
 */
import crypto from 'node:crypto';
import { db } from './db.js';

export const COOKIE = 'zs_admin';
const SESSION_DAYS = 7;

export const adminEmail = () => (process.env.ADMIN_EMAIL || 'info@zavronsolutions.com').trim().toLowerCase();

async function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  let s = await db.get('auth:secret');
  if (!s) {
    s = crypto.randomBytes(32).toString('hex');
    await db.set('auth:secret', s);
  }
  return s;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyHash(password, stored) {
  const [, salt, hash] = String(stored).split('$');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === test.length && crypto.timingSafeEqual(expected, test);
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/** true when a password has been configured (env or dashboard) */
export async function passwordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD) || Boolean(await db.get('auth:pwhash'));
}

export async function checkCredentials(email, password) {
  if (!email || !password) return false;
  if (String(email).trim().toLowerCase() !== adminEmail()) return false;
  const stored = await db.get('auth:pwhash');
  if (stored) return verifyHash(password, stored);
  const envPw = process.env.ADMIN_PASSWORD;
  return Boolean(envPw) && safeEqual(password, envPw);
}

export async function setPassword(newPassword) {
  await db.set('auth:pwhash', hashPassword(newPassword));
  // invalidate every existing session
  await db.set('auth:epoch', Date.now());
}

async function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', await secret()).update(body).digest('base64url');
  return `${body}.${mac}`;
}

export async function createSession() {
  const epoch = (await db.get('auth:epoch')) || 0;
  return sign({ sub: adminEmail(), exp: Date.now() + SESSION_DAYS * 864e5, epoch });
}

export async function verifySession(token) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', await secret()).update(body).digest('base64url');
  if (!safeEqual(mac, expected)) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; }
  if (!payload || payload.exp < Date.now()) return null;
  const epoch = (await db.get('auth:epoch')) || 0;
  if ((payload.epoch || 0) !== epoch) return null;
  return payload;
}

export function readCookie(req, name = COOKIE) {
  const raw = (req.headers && req.headers.cookie) || '';
  const hit = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : '';
}

export function sessionCookie(token, req) {
  const secure = !/^localhost|^127\./.test(String((req && req.headers && req.headers.host) || ''));
  const parts = [
    `${COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${token ? SESSION_DAYS * 86400 : 0}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export async function requireAdmin(req) {
  return verifySession(readCookie(req));
}
