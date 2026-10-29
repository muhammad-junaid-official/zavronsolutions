/**
 * Domain data: leads, live chat sessions, blog posts, admin profile.
 */
import { db, newId } from './db.js';

const str = (v, max = 5000) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max));
const now = () => Date.now();

/* ================================================================ LEADS */
export const LEAD_STATUSES = ['new', 'in_progress', 'replied', 'converted', 'lost'];

export async function createLead(data = {}) {
  const lead = {
    id: newId('lead'),
    date: new Date().toISOString(),
    name: str(data.name, 150) || 'Website Visitor',
    email: str(data.email, 254),
    phone: str(data.phone, 60),
    company: str(data.company, 200),
    service: str(data.service, 300) || 'General Inquiry',
    budget: str(data.budget, 100),
    timeline: str(data.timeline, 100),
    details: str(data.message || data.details, 10000),
    source: str(data.source, 200) || 'Website Form',
    sessionId: str(data.sessionId, 80),
    status: 'new',
    delivery: null,
    replies: [],
    notes: '',
  };
  await db.set(`lead:${lead.id}`, lead);
  await db.zadd('leads', now(), lead.id);
  await db.incr('ver:leads');
  return lead;
}

export async function getLead(id) { return db.get(`lead:${id}`); }

export async function updateLead(id, patch) {
  const lead = await getLead(id);
  if (!lead) return null;
  const next = { ...lead, ...patch, id: lead.id, updatedAt: new Date().toISOString() };
  await db.set(`lead:${id}`, next);
  await db.incr('ver:leads');
  return next;
}

export async function listLeads(limit = 500) {
  const ids = await db.zlatest('leads', limit);
  const leads = await db.mget(ids.map((id) => `lead:${id}`));
  return leads.filter(Boolean);
}

export async function deleteLead(id) {
  await db.del(`lead:${id}`);
  await db.zrem('leads', id);
  await db.incr('ver:leads');
}

/* ============================================================ LIVE CHAT */
const CHAT_TTL = 14 * 86400; // keep transcripts for 14 days

export async function getChat(id) { return db.get(`chat:${id}`); }

async function saveChat(chat) {
  await db.set(`chat:${chat.id}`, chat, CHAT_TTL);
  await db.zadd('chats', chat.lastActivity, chat.id);
  await db.incr('ver:chats');
}

export async function ensureChat(id, meta = {}) {
  let chat = await getChat(id);
  if (!chat) {
    chat = {
      id,
      startTime: new Date().toISOString(),
      lastActivity: now(),
      userInfo: {},
      page: str(meta.page, 300),
      lang: str(meta.lang, 30),
      adminJoined: false,
      closed: false,
      unread: 0,
      messageCount: 0,
      lastMessage: '',
    };
    await saveChat(chat);
  }
  return chat;
}

/** from: 'user' | 'bot' | 'admin' | 'system' */
export async function addChatMessage(id, from, text, meta = {}) {
  const chat = await ensureChat(id, meta);
  const msg = { id: newId('m'), from, text: str(text, 4000), time: new Date().toISOString(), ts: now() };
  await db.rpush(`chatmsg:${id}`, msg, CHAT_TTL);
  chat.lastActivity = msg.ts;
  chat.messageCount = (chat.messageCount || 0) + 1;
  if (from !== 'system') chat.lastMessage = msg.text.slice(0, 140);
  if (from === 'user') chat.unread = (chat.unread || 0) + 1;
  if (from === 'user' && chat.closed) chat.closed = false;
  if (meta.page) chat.page = str(meta.page, 300);
  await saveChat(chat);
  return { chat, msg };
}

export async function chatMessages(id, sinceTs = 0) {
  const all = await db.lrange(`chatmsg:${id}`, 0, -1);
  return sinceTs ? all.filter((m) => m && m.ts > sinceTs) : all.filter(Boolean);
}

export async function updateChat(id, patch) {
  const chat = await getChat(id);
  if (!chat) return null;
  const next = { ...chat, ...patch, id };
  await saveChat(next);
  return next;
}

export async function listChats(sinceMs = 7 * 86400e3, limit = 100) {
  const ids = (await db.zsince('chats', now() - sinceMs)).slice(0, limit);
  const chats = await db.mget(ids.map((id) => `chat:${id}`));
  return chats.filter(Boolean);
}

/* ================================================================ POSTS */
export const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

export async function getPost(id) { return db.get(`post:${id}`); }

export async function getPostBySlug(slug) {
  const id = await db.get(`postslug:${slug}`);
  return id ? getPost(id) : null;
}

export async function listPosts() {
  const ids = await db.zlatest('posts', 1000);
  return (await db.mget(ids.map((id) => `post:${id}`))).filter(Boolean);
}

export async function savePost(input, existingSlugs = new Set()) {
  const slug = slugify(input.slug || input.title);
  if (!slug) throw Object.assign(new Error('A title or URL slug is required.'), { status: 400 });
  const owner = await db.get(`postslug:${slug}`);
  if ((owner && owner !== input.id) || existingSlugs.has(slug)) {
    throw Object.assign(new Error(`The URL /blog/${slug}/ is already used by another article.`), { status: 409 });
  }
  const prev = input.id ? await getPost(input.id) : null;
  const status = input.status === 'published' ? 'published' : 'draft';
  const post = {
    id: prev ? prev.id : newId('post'),
    title: str(input.title, 200),
    slug,
    focusKeyword: str(input.focusKeyword, 120),
    category: str(input.category, 60) || 'web-development',
    featuredImage: str(input.featuredImage, 500) || '/assets/og-image.jpg',
    metaDescription: str(input.metaDescription, 320),
    contentHtml: str(input.contentHtml, 200000),
    status,
    seoScore: Math.max(0, Math.min(100, parseInt(input.seoScore, 10) || 0)),
    wordCount: parseInt(input.wordCount, 10) || 0,
    author: str(input.author, 120) || 'Muhammad Junaid',
    createdAt: prev ? prev.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: status === 'published' ? (prev && prev.publishedAt) || new Date().toISOString() : (prev && prev.publishedAt) || null,
  };
  if (prev && prev.slug !== slug) await db.del(`postslug:${prev.slug}`);
  await db.set(`post:${post.id}`, post);
  await db.set(`postslug:${slug}`, post.id);
  await db.zadd('posts', Date.parse(post.updatedAt), post.id);
  await db.incr('ver:posts');
  return post;
}

export async function deletePost(id) {
  const post = await getPost(id);
  if (!post) return false;
  await db.del(`post:${id}`, `postslug:${post.slug}`);
  await db.zrem('posts', id);
  await db.incr('ver:posts');
  return true;
}

/* ============================================================== PROFILE */
const DEFAULT_PROFILE = {
  name: 'Muhammad Junaid',
  role: 'CEO & Principal Strategist',
  website: 'https://www.zavronsolutions.com',
  signature: 'Muhammad Junaid\nCEO, Zavron Solutions\nhttps://www.zavronsolutions.com',
};

export async function getProfile() {
  return { ...DEFAULT_PROFILE, ...((await db.get('admin:profile')) || {}) };
}

export async function saveProfile(patch) {
  const next = {
    ...(await getProfile()),
    name: str(patch.name, 120) || DEFAULT_PROFILE.name,
    role: str(patch.role, 120),
    website: str(patch.website, 300),
    signature: str(patch.signature, 1000),
  };
  await db.set('admin:profile', next);
  return next;
}

export async function versions() {
  const [leads, chats, posts] = await db.mget(['ver:leads', 'ver:chats', 'ver:posts']);
  return { leads: Number(leads) || 0, chats: Number(chats) || 0, posts: Number(posts) || 0 };
}
