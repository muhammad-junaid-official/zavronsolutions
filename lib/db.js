/**
 * Zavron Solutions — data store
 *
 * Production: Upstash Redis (Vercel Marketplace). Vercel adds either
 *   KV_REST_API_URL + KV_REST_API_TOKEN  or
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * automatically when the database is connected to the project.
 *
 * Without those variables an in-memory store is used (local development
 * and tests only — data does not survive between serverless invocations).
 */
import { Redis } from '@upstash/redis';

/**
 * Find Upstash credentials whatever names Vercel gave them:
 *  - KV_REST_API_URL / KV_REST_API_TOKEN (default)
 *  - <PREFIX>_KV_REST_API_URL / <PREFIX>_KV_REST_API_TOKEN (custom prefix)
 *  - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *  - only a rediss:// URL (REDIS_URL / KV_URL / <PREFIX>_REDIS_URL) → derive REST endpoint
 */
function resolveCredentials(env = process.env) {
  const keys = Object.keys(env);
  const pick = (suffix) => {
    const exact = keys.find((k) => k === suffix);
    const hit = exact || keys.filter((k) => k.endsWith(`_${suffix}`) && env[k]).sort((a, b) => a.length - b.length)[0];
    return hit ? String(env[hit]).trim() : '';
  };
  let u = pick('KV_REST_API_URL') || pick('UPSTASH_REDIS_REST_URL') || pick('REDIS_REST_URL');
  let t = pick('KV_REST_API_TOKEN') || pick('UPSTASH_REDIS_REST_TOKEN') || pick('REDIS_REST_TOKEN');
  if (!(u && t)) {
    const tcp = pick('REDIS_URL') || pick('KV_URL');
    try {
      const parsed = tcp ? new URL(tcp) : null;
      if (parsed && /upstash\.io$/.test(parsed.hostname) && parsed.password) {
        u = `https://${parsed.hostname}`;
        t = decodeURIComponent(parsed.password);
      }
    } catch { /* not a URL */ }
  }
  return { url: u, token: t };
}

const { url, token } = resolveCredentials();

export const PREFIX = 'zs:';
export const isPersistent = Boolean(url && token);

/* ---------------------------------------------------------------- memory */
class MemoryStore {
  constructor() { this.kv = new Map(); this.exp = new Map(); }
  _alive(k) {
    const e = this.exp.get(k);
    if (e && e < Date.now()) { this.kv.delete(k); this.exp.delete(k); }
    return this.kv.has(k);
  }
  async get(k) { return this._alive(k) ? this.kv.get(k) : null; }
  async set(k, v, opts = {}) {
    this.kv.set(k, v);
    if (opts.ex) this.exp.set(k, Date.now() + opts.ex * 1000); else this.exp.delete(k);
    return 'OK';
  }
  async del(...keys) { let n = 0; keys.forEach((k) => { if (this.kv.delete(k)) n++; this.exp.delete(k); }); return n; }
  async incr(k) { const v = Number((await this.get(k)) || 0) + 1; this.kv.set(k, String(v)); return v; }
  async expire(k, s) { if (this._alive(k)) this.exp.set(k, Date.now() + s * 1000); return 1; }
  _z(k) { if (!this._alive(k)) this.kv.set(k, new Map()); return this.kv.get(k); }
  async zadd(k, { score, member }) { this._z(k).set(member, score); return 1; }
  async zrem(k, ...members) { const z = this._z(k); let n = 0; members.forEach((m) => { if (z.delete(m)) n++; }); return n; }
  async zcard(k) { return this._z(k).size; }
  async zrange(k, start, stop, opts = {}) {
    let arr = [...this._z(k).entries()];
    if (opts.byScore) {
      // Redis semantics: with REV the arguments are (max, min)
      const [lo, hi] = opts.rev ? [stop, start] : [start, stop];
      const num = (v) => (v === '-inf' ? -Infinity : v === '+inf' ? Infinity : Number(v));
      const min = num(lo);
      const max = num(hi);
      arr = arr.filter(([, s]) => s >= min && s <= max).sort((a, b) => a[1] - b[1]);
      if (opts.rev) arr.reverse();
      return arr.map(([m]) => m);
    }
    arr.sort((a, b) => a[1] - b[1]);
    if (opts.rev) arr.reverse();
    const end = stop < 0 ? arr.length + stop : stop;
    return arr.slice(start, end + 1).map(([m]) => m);
  }
  _l(k) { if (!this._alive(k)) this.kv.set(k, []); return this.kv.get(k); }
  async rpush(k, ...vals) { const l = this._l(k); l.push(...vals); return l.length; }
  async lrange(k, start, stop) { const l = this._l(k); const end = stop < 0 ? l.length + stop : stop; return l.slice(start, end + 1); }
  async llen(k) { return this._l(k).length; }
  async mget(...keys) { return Promise.all(keys.map((k) => this.get(k))); }
}

const globalStore = globalThis.__zsMemoryStore || (globalThis.__zsMemoryStore = new MemoryStore());
const client = isPersistent ? new Redis({ url, token, automaticDeserialization: false }) : globalStore;

/* --------------------------------------------------------------- helpers */
const k = (key) => PREFIX + key;
const parse = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return v; }
};

export const db = {
  async get(key) { return parse(await client.get(k(key))); },
  async set(key, value, ttlSeconds) {
    const v = JSON.stringify(value);
    return ttlSeconds ? client.set(k(key), v, { ex: ttlSeconds }) : client.set(k(key), v);
  },
  async del(...keys) { return keys.length ? client.del(...keys.map(k)) : 0; },
  async mget(keys) {
    if (!keys.length) return [];
    const vals = await client.mget(...keys.map(k));
    return vals.map(parse);
  },
  async incr(key, ttlSeconds) {
    const n = await client.incr(k(key));
    if (ttlSeconds && n === 1) await client.expire(k(key), ttlSeconds);
    return n;
  },
  async zadd(key, score, member) { return client.zadd(k(key), { score, member }); },
  async zrem(key, member) { return client.zrem(k(key), member); },
  async zcard(key) { return client.zcard(k(key)); },
  /** newest first */
  async zlatest(key, count = 100) { return client.zrange(k(key), 0, count - 1, { rev: true }); },
  /** members with score >= minScore, newest first */
  async zsince(key, minScore) { return client.zrange(k(key), '+inf', minScore, { byScore: true, rev: true }); },
  async rpush(key, value, ttlSeconds) {
    const n = await client.rpush(k(key), JSON.stringify(value));
    if (ttlSeconds) await client.expire(k(key), ttlSeconds);
    return n;
  },
  async lrange(key, start = 0, stop = -1) { return (await client.lrange(k(key), start, stop)).map(parse); },
  async llen(key) { return client.llen(k(key)); },
  async expire(key, s) { return client.expire(k(key), s); },
};

/** Simple fixed-window rate limiter. Returns true when allowed. */
export async function rateLimit(bucket, limit, windowSeconds) {
  try {
    const n = await db.incr(`rl:${bucket}`, windowSeconds);
    return n <= limit;
  } catch {
    return true; // never block traffic because the limiter itself failed
  }
}

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function clientIp(req) {
  const fwd = (req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'])) || '';
  return String(fwd).split(',')[0].trim() || 'unknown';
}

/** "connected" when a real round-trip to the database succeeds */
export async function pingDatabase() {
  try {
    await db.set('health:ping', Date.now(), 300);
    return (await db.get('health:ping')) ? 'connected' : 'error';
  } catch (e) {
    return `error: ${String(e.message || e).slice(0, 80)}`;
  }
}
