/**
 * Vercel Serverless Function: /api/admin?action=…  (also /api/admin/:action)
 * Single authenticated entry point for the admin dashboard.
 */
import { isPersistent, rateLimit, clientIp } from '../lib/db.js';
import {
  adminEmail, checkCredentials, createSession, sessionCookie, requireAdmin,
  passwordConfigured, setPassword,
} from '../lib/auth.js';
import {
  listLeads, getLead, updateLead, deleteLead, LEAD_STATUSES,
  listChats, getChat, chatMessages, addChatMessage, updateChat,
  listPosts, getPost, savePost, deletePost,
  getProfile, saveProfile, versions,
} from '../lib/store.js';
import { db } from '../lib/db.js';
import { crawlSite, routesFromSitemap } from '../lib/seoAudit.js';
import { sendDirectReplyEmail, checkSmtp, smtpConfig, LEAD_INBOX } from '../scripts/emailService.js';

const ACTIVE_CHAT_MS = 30 * 60 * 1000;
const GITHUB_REPO = process.env.GITHUB_REPO || 'muhammad-junaid-official/zavronsolutions';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new HttpError(status, message); };

function originOf(req) {
  const proto = String(req.headers['x-forwarded-proto'] || '').split(',')[0] || (/^localhost|^127\./.test(req.headers.host || '') ? 'http' : 'https');
  return `${proto}://${req.headers.host}`;
}

function body(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  return req.body;
}

/* ----------------------------------------------------------- handlers */
const publicActions = {
  async login(req, res) {
    if (req.method !== 'POST') fail(405, 'Method not allowed');
    const ip = clientIp(req);
    if (!(await rateLimit(`login:${ip}`, 8, 15 * 60))) fail(429, 'Too many login attempts. Please wait 15 minutes and try again.');
    if (!(await passwordConfigured())) fail(503, 'Admin password is not configured. Add ADMIN_PASSWORD in Vercel → Settings → Environment Variables, then redeploy.');
    const { email, password } = body(req);
    if (!(await checkCredentials(email, password))) fail(401, 'Invalid administrator email or password.');
    const token = await createSession();
    res.setHeader('Set-Cookie', sessionCookie(token, req));
    const profile = await getProfile();
    return { success: true, user: { name: profile.name, email: adminEmail() } };
  },

  async logout(req, res) {
    res.setHeader('Set-Cookie', sessionCookie('', req));
    return { success: true };
  },
};

const actions = {
  async me() {
    const profile = await getProfile();
    return {
      success: true,
      user: { ...profile, email: adminEmail() },
      system: {
        database: isPersistent ? 'connected' : 'memory',
        smtpHost: smtpConfig.host,
        smtpUser: smtpConfig.auth.user,
        smtpPasswordSet: Boolean(smtpConfig.auth.pass),
        leadInbox: LEAD_INBOX,
        github: Boolean(process.env.GITHUB_TOKEN),
        openai: Boolean(process.env.OPENAI_API_KEY),
      },
    };
  },

  /** lightweight real-time heartbeat: 1 database read unless something changed */
  async pulse(req) {
    const ver = await versions();
    const clientChatsVer = Number(req.query.chatsVer);
    const out = { success: true, serverTime: Date.now(), versions: ver };
    if (clientChatsVer !== ver.chats) {
      const active = (await listChats(ACTIVE_CHAT_MS)).filter((c) => !c.closed);
      out.chats = active.map(summarizeChat);
      out.unreadChats = active.reduce((s, c) => s + (c.unread || 0), 0);
    }
    return out;
  },

  /* ------------------------------ leads */
  async leads() {
    return { success: true, leads: await listLeads() };
  },

  async 'lead-update'(req) {
    const { id, status, notes } = body(req);
    const patch = {};
    if (status !== undefined) {
      if (!LEAD_STATUSES.includes(status)) fail(400, 'Invalid status');
      patch.status = status;
    }
    if (notes !== undefined) patch.notes = String(notes).slice(0, 5000);
    const lead = await updateLead(id, patch);
    if (!lead) fail(404, 'Lead not found');
    return { success: true, lead };
  },

  async 'lead-delete'(req) {
    const { id } = body(req);
    if (!(await getLead(id))) fail(404, 'Lead not found');
    await deleteLead(id);
    return { success: true };
  },

  async 'lead-reply'(req) {
    const { id, to, subject, message } = body(req);
    const lead = id ? await getLead(id) : null;
    const recipient = (lead && lead.email) || to;
    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) fail(400, 'A valid recipient email is required.');
    if (!message || !String(message).trim()) fail(400, 'Message body is required.');
    const result = await sendDirectReplyEmail({
      to: recipient,
      subject: subject || 'Message from Zavron Solutions',
      message: String(message),
      recipientName: (lead && lead.name) || 'Valued Client',
    });
    let updated = null;
    if (lead) {
      updated = await updateLead(lead.id, {
        status: ['converted', 'lost'].includes(lead.status) ? lead.status : 'replied',
        repliedAt: new Date().toISOString(),
        replies: [...(lead.replies || []), { at: new Date().toISOString(), subject, message: String(message).slice(0, 10000), messageId: result.messageId || null }],
      });
    }
    return { success: true, lead: updated, messageId: result.messageId || null };
  },

  /* ------------------------------ live chat */
  async chats(req) {
    const days = Math.min(14, Math.max(1, parseInt(req.query.days, 10) || 7));
    const chats = await listChats(days * 86400e3);
    return { success: true, chats: chats.map(summarizeChat) };
  },

  async chat(req) {
    const id = String(req.query.id || '');
    const chat = await getChat(id);
    if (!chat) fail(404, 'Chat session not found');
    const since = Number(req.query.since) || 0;
    const messages = await chatMessages(id, since);
    if (chat.unread && req.query.markRead !== '0') await updateChat(id, { unread: 0 });
    return { success: true, chat: summarizeChat({ ...chat, unread: 0 }), messages };
  },

  async 'chat-join'(req) {
    const { id } = body(req);
    const chat = await getChat(id);
    if (!chat) fail(404, 'Chat session not found');
    const profile = await getProfile();
    await updateChat(id, { adminJoined: true, closed: false, unread: 0, agentName: profile.name });
    const { msg } = await addChatMessage(id, 'admin', `Hi${chat.userInfo && chat.userInfo.name ? ` ${chat.userInfo.name}` : ''}, this is ${profile.name} from Zavron Solutions. I've joined the chat — how can I help you today?`);
    return { success: true, message: msg };
  },

  async 'chat-reply'(req) {
    const { id, message } = body(req);
    if (!message || !String(message).trim()) fail(400, 'Message is required');
    const chat = await getChat(id);
    if (!chat) fail(404, 'Chat session not found');
    if (!chat.adminJoined) await updateChat(id, { adminJoined: true, closed: false });
    const { msg } = await addChatMessage(id, 'admin', message);
    await updateChat(id, { unread: 0 });
    return { success: true, message: msg };
  },

  async 'chat-close'(req) {
    const { id } = body(req);
    if (!(await getChat(id))) fail(404, 'Chat session not found');
    await addChatMessage(id, 'system', 'The support agent has left the chat. Our AI assistant will continue to help you.');
    await updateChat(id, { adminJoined: false, closed: true, unread: 0 });
    return { success: true };
  },

  /* ------------------------------ posts */
  async posts(req) {
    const [dbPosts, staticPosts] = await Promise.all([listPosts(), loadStaticPosts(req)]);
    return { success: true, posts: dbPosts, staticPosts };
  },

  async 'post-save'(req) {
    const input = body(req);
    if (!input.title || !String(input.title).trim()) fail(400, 'Article title is required.');
    const staticSlugs = new Set((await loadStaticPosts(req)).map((p) => p.slug));
    try {
      const post = await savePost(input, staticSlugs);
      return { success: true, post, url: `/blog/${post.slug}/` };
    } catch (e) { fail(e.status || 500, e.message); }
  },

  async 'post-delete'(req) {
    const { id } = body(req);
    if (!(await deletePost(id))) fail(404, 'Post not found');
    return { success: true };
  },

  /* ------------------------------ SEO */
  async audit() {
    return { success: true, audit: await db.get('audit:last') };
  },

  async 'audit-run'(req) {
    const origin = originOf(req);
    const [mainXml, blogXml] = await Promise.all([
      fetch(`${origin}/sitemap.xml`).then((r) => (r.ok ? r.text() : '')).catch(() => ''),
      fetch(`${origin}/blog-sitemap.xml`).then((r) => (r.ok ? r.text() : '')).catch(() => ''),
    ]);
    let routes = [...new Set([...routesFromSitemap(mainXml), ...routesFromSitemap(blogXml)])];
    if (!routes.length) fail(502, 'Could not read sitemap.xml to discover pages.');
    routes = [...routes, '/404.html', '/admin/'].filter((r, i, a) => a.indexOf(r) === i);
    const audit = await crawlSite(origin, routes);
    await db.set('audit:last', audit);
    return { success: true, audit };
  },

  async 'page-seo'(req) {
    const { route, title, metaDescription, canonical } = body(req);
    if (!process.env.GITHUB_TOKEN) fail(501, 'Editing static pages needs a GITHUB_TOKEN environment variable (fine-grained token with Contents: Read & write on the website repository).');
    if (!route || !/^\/[a-z0-9/_-]*$/i.test(route)) fail(400, 'Invalid page route');
    const path = route === '/' ? 'index.html' : `${route.replace(/^\/|\/$/g, '')}/index.html`;
    const result = await updateStaticPageSeo(path, { title, metaDescription, canonical });
    return { success: true, ...result };
  },

  /* ------------------------------ profile & system */
  async profile() {
    return { success: true, profile: { ...(await getProfile()), email: adminEmail() } };
  },

  async 'profile-save'(req) {
    return { success: true, profile: await saveProfile(body(req)) };
  },

  async password(req) {
    const { currentPassword, newPassword } = body(req);
    if (!(await checkCredentials(adminEmail(), currentPassword))) fail(401, 'Current password is incorrect.');
    if (!newPassword || String(newPassword).length < 10) fail(400, 'New password must be at least 10 characters.');
    await setPassword(newPassword);
    const token = await createSession();
    return { success: true, _cookie: token };
  },

  async 'smtp-check'() {
    return { success: true, smtp: await checkSmtp() };
  },

  async 'smtp-test'() {
    const info = await sendDirectReplyEmail({
      to: LEAD_INBOX,
      subject: 'Zavron dashboard — SMTP test email',
      message: `This is a test email sent from the Zavron Solutions admin dashboard at ${new Date().toUTCString()}.\n\nIf you can read this, outgoing email is working.`,
      recipientName: 'Admin',
    });
    return { success: true, to: LEAD_INBOX, messageId: info.messageId || null };
  },

  async 'ai-draft'(req) {
    const { leadId, instruction, preset } = body(req);
    if (!process.env.OPENAI_API_KEY) fail(501, 'OPENAI_API_KEY is not set — using built-in templates.');
    const lead = leadId ? await getLead(leadId) : null;
    const profile = await getProfile();
    const prompt = [
      `Write a concise, warm, professional email reply from ${profile.name} (${profile.role}, Zavron Solutions — a US web development & SEO agency).`,
      lead ? `Client: ${lead.name}. Service: ${lead.service}. Budget: ${lead.budget || 'n/a'}. Timeline: ${lead.timeline || 'n/a'}. Their message: """${(lead.details || '').slice(0, 2000)}"""` : '',
      preset ? `Goal: ${preset}.` : '',
      instruction ? `Extra instruction from the sender: ${instruction}` : '',
      `Do not invent prices or facts not given. Plain text only, no subject line. End with this signature:\n${profile.signature}`,
    ].filter(Boolean).join('\n');
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.5, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!r.ok) fail(502, 'AI service error');
    const j = await r.json();
    return { success: true, draft: j.choices?.[0]?.message?.content?.trim() || '' };
  },
};

/* ----------------------------------------------------------- helpers */
function summarizeChat(c) {
  return {
    id: c.id,
    startTime: c.startTime,
    lastActivity: c.lastActivity,
    userInfo: c.userInfo || {},
    page: c.page || '',
    adminJoined: Boolean(c.adminJoined),
    closed: Boolean(c.closed),
    unread: c.unread || 0,
    messageCount: c.messageCount || 0,
    lastMessage: c.lastMessage || '',
  };
}

let staticPostsCache = null;
async function loadStaticPosts(req) {
  if (staticPostsCache && staticPostsCache.at > Date.now() - 10 * 60e3) return staticPostsCache.data;
  try {
    const r = await fetch(`${originOf(req)}/_data/static-posts.json`);
    const data = r.ok ? await r.json() : [];
    staticPostsCache = { at: Date.now(), data };
    return data;
  } catch { return []; }
}

const escAttr = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function updateStaticPageSeo(path, { title, metaDescription, canonical }) {
  const api = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'zavron-admin' };
  const cur = await fetch(`${api}?ref=${GITHUB_BRANCH}`, { headers });
  if (!cur.ok) fail(cur.status === 404 ? 404 : 502, `GitHub: could not read ${path} (${cur.status})`);
  const file = await cur.json();
  let html = Buffer.from(file.content, 'base64').toString('utf8');
  const before = html;
  const rep = (re, val) => { if (val !== undefined && val !== null && String(val).trim()) html = html.replace(re, (m, a, b) => `${a}${escAttr(String(val).trim())}${b}`); };
  if (title && title.trim()) html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escAttr(title.trim())}</title>`);
  rep(/(<meta name="description" content=")[^"]*(")/i, metaDescription);
  rep(/(<meta property="og:title" content=")[^"]*(")/i, title);
  rep(/(<meta name="twitter:title" content=")[^"]*(")/i, title);
  rep(/(<meta property="og:description" content=")[^"]*(")/i, metaDescription);
  rep(/(<meta name="twitter:description" content=")[^"]*(")/i, metaDescription);
  rep(/(<link rel="canonical" href=")[^"]*(")/i, canonical);
  if (html === before) return { changed: false, message: 'No changes to save.' };
  const put = await fetch(api, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `seo: update title/meta for ${path} from admin dashboard`,
      content: Buffer.from(html, 'utf8').toString('base64'),
      sha: file.sha,
      branch: GITHUB_BRANCH,
    }),
  });
  if (!put.ok) fail(502, `GitHub: could not save ${path} (${put.status})`);
  return { changed: true, message: 'Saved to GitHub. Vercel will redeploy the page in 1–2 minutes.' };
}

/* ----------------------------------------------------------- router */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const action = String((req.query && req.query.action) || '').replace(/[^a-z-]/g, '');

  try {
    // CSRF guard: state-changing requests must come from our own scripts
    if (req.method !== 'GET' && req.headers['x-zs-admin'] !== '1') fail(403, 'Forbidden');

    if (publicActions[action]) return res.status(200).json(await publicActions[action](req, res));

    const fn = actions[action];
    if (!fn) fail(404, `Unknown action "${action}"`);

    const session = await requireAdmin(req);
    if (!session) fail(401, 'Your session has expired. Please sign in again.');

    const result = await fn(req, res);
    if (result && result._cookie) {
      res.setHeader('Set-Cookie', sessionCookie(result._cookie, req));
      delete result._cookie;
    }
    return res.status(200).json(result);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status >= 500) console.error(`[admin:${action}]`, err);
    return res.status(status).json({
      success: false,
      error: err instanceof HttpError ? err.message : (err.code ? `Server error (${err.code})` : 'Server error'),
      code: err.code || undefined,
    });
  }
}
