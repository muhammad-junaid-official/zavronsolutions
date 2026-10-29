/**
 * ZAVRON SOLUTIONS — ADMIN DASHBOARD (dynamic, real-time)
 *
 * Talks to /api/admin?action=… (HttpOnly session cookie). Data lives in
 * Upstash Redis. Real-time updates use a lightweight heartbeat ("pulse")
 * every few seconds; live chat transcripts poll faster while a chat is open.
 */
import { ZavronSEOAnalyzer } from './seo-analyzer.js';

const PULSE_MS = 5000;
const PULSE_HIDDEN_MS = 30000;
const CHAT_POLL_MS = 2500;

const CATEGORY_LABELS = {
  'web-development': 'Web Development',
  'wordpress-development': 'WordPress',
  'ecommerce-development': 'E-Commerce',
  seo: 'SEO',
  'local-seo': 'Local SEO',
  'technical-seo': 'Technical SEO',
  'ecommerce-seo': 'E-Commerce SEO',
  'digital-marketing': 'Digital Marketing',
  'google-ads': 'Google Ads',
  'social-media-marketing': 'Social Media',
  'ui-ux-design': 'UI/UX Design',
};

const STATUS_LABELS = { new: 'New Lead', in_progress: 'In Progress', replied: 'Replied', converted: 'Converted', lost: 'Lost' };

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[m]));
const scoreClass = (n) => (n >= 90 ? 'score-excellent' : n >= 70 ? 'score-good' : 'score-poor');
const fmtDate = (d) => { const dt = new Date(d); return isNaN(dt) ? '—' : `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`; };
const fmtTime = (d) => { const dt = new Date(d); return isNaN(dt) ? '' : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
const ago = (ts) => {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
};

class ApiError extends Error { constructor(status, message, data) { super(message); this.status = status; this.data = data; } }

async function api(action, { method = 'GET', body, query = {} } = {}) {
  const qs = new URLSearchParams({ action, ...query }).toString();
  const res = await fetch(`/api/admin?${qs}`, {
    method,
    credentials: 'same-origin',
    headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-ZS-Admin': '1' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* non-JSON */ }
  if (res.status === 401 && action !== 'login') {
    window.location.href = action === 'me' ? '/admin/login.html' : '/admin/login.html?expired=1';
    throw new ApiError(401, 'Session expired');
  }
  if (!res.ok || data.success === false) throw new ApiError(res.status, data.error || `Request failed (${res.status})`, data);
  return data;
}

class ZavronAdminApp {
  constructor() {
    this.analyzer = new ZavronSEOAnalyzer();
    this.user = null;
    this.system = {};
    this.leads = [];
    this.knownLeadIds = null;
    this.posts = [];
    this.staticPosts = [];
    this.chats = [];
    this.audit = null;
    this.versions = null;
    this.activeTab = 'overview';
    this.currentPostId = null;
    this.activeChatId = null;
    this.chatMessages = [];
    this.chatLastTs = 0;
    this.pulseTimer = null;
    this.chatTimer = null;
    this.init();
  }

  /* ================================================================ BOOT */
  async init() {
    try {
      const me = await api('me');
      this.user = me.user;
      this.system = me.system || {};
    } catch (e) {
      if (e.status !== 401) this.toast(`Could not reach the server: ${e.message}`, 'error');
      return;
    }
    document.body.classList.add('is-authenticated');
    this.renderIdentity();
    this.renderSystemBanners();
    this.bindEvents();
    this.switchTab((location.hash || '#overview').slice(1) || 'overview', { silent: true });

    await Promise.allSettled([this.loadLeads(true), this.loadPosts(), this.loadAudit(), this.loadChats()]);
    this.updateOverviewMetrics();
    this.runSEOAnalysis();
    this.startPulse();
    document.addEventListener('visibilitychange', () => this.startPulse());
  }

  renderIdentity() {
    const name = this.user.name || 'Admin';
    const initial = name.trim().charAt(0).toUpperCase() || 'A';
    $('adminUserName').textContent = name;
    $('adminAvatar').textContent = initial;
    $('profileAvatarLg').textContent = initial;
    $('profileHeaderName').textContent = name;
    $('profileHeaderEmail').textContent = this.user.email || '';
    $('profileName').value = name;
    $('profileEmail').value = this.user.email || '';
    $('profileRole').value = this.user.role || '';
    $('profileWebsite').value = this.user.website || '';
    $('profileSignature').value = this.user.signature || '';
    const s = this.system;
    $('sysSmtpHost').value = s.smtpHost || '';
    $('sysSmtpUser').value = `${s.smtpUser || ''}${s.smtpPasswordSet ? '' : '  (SMTP_PASS not set)'}`;
    $('sysLeadInbox').value = s.leadInbox || '';
    $('sysDatabase').value = s.database === 'connected' ? 'Upstash Redis — connected' : 'NOT CONNECTED (temporary memory)';
    const pill = $('systemStatusPill');
    pill.textContent = s.database === 'connected' ? '● Live — real-time sync on' : '● Database not connected';
    pill.style.color = s.database === 'connected' ? '' : '#FCD34D';
  }

  renderSystemBanners() {
    const topbar = document.querySelector('.admin-topbar');
    let wrap = $('adminBanners');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'adminBanners';
      wrap.style.padding = '0 32px';
      topbar.insertAdjacentElement('afterend', wrap);
    }
    const notes = [];
    if (this.system.database !== 'connected') {
      notes.push('<strong>Database not connected.</strong> Leads, posts and chats are only kept temporarily. In Vercel → <em>Storage</em> → create/connect an <strong>Upstash Redis</strong> database to this project, then redeploy.');
    }
    if (!this.system.smtpPasswordSet) notes.push('<strong>Email sending is off:</strong> add <code>SMTP_PASS</code> in Vercel → Settings → Environment Variables and redeploy.');
    wrap.innerHTML = notes.map((n) => `<div class="adm-banner">${n}</div>`).join('');
  }

  toast(message, type = 'info', onClick) {
    let wrap = document.querySelector('.adm-toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'adm-toast-wrap'; document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = `adm-toast ${type}`;
    el.textContent = message;
    el.addEventListener('click', () => { if (onClick) onClick(); el.remove(); });
    wrap.appendChild(el);
    setTimeout(() => el.remove(), type === 'error' ? 8000 : 5000);
  }

  /* ============================================================== EVENTS */
  bindEvents() {
    document.querySelectorAll('.admin-nav-item').forEach((item) => item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      if (tab === 'editor' && item.id === 'navNewPost' && this.activeTab !== 'editor') this.startNewPost();
      else if (tab) this.switchTab(tab);
    }));
    window.switchTab = (t) => this.switchTab(t);
    window.startNewPost = () => this.startNewPost();
    window.zavronAdmin = this;

    document.querySelectorAll('.overview-sub-tab').forEach((btn) => btn.addEventListener('click', () => {
      document.querySelectorAll('.overview-sub-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#tab-overview .table-card[id^="ovtab-"]').forEach((tc) => { tc.style.display = 'none'; });
      const target = $(`ovtab-${btn.getAttribute('data-ovtab')}`);
      if (target) target.style.display = 'block';
    }));

    document.querySelectorAll('.seo-sub-tab').forEach((btn) => btn.addEventListener('click', () => {
      document.querySelectorAll('.seo-sub-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.seo-sub-panel').forEach((p) => { p.classList.remove('active'); p.style.display = ''; });
      const target = $(`seotab-${btn.getAttribute('data-seotab')}`);
      if (target) target.classList.add('active');
    }));

    $('topbarNewPostBtn').addEventListener('click', () => this.startNewPost());
    $('logoutBtn').addEventListener('click', () => this.logout());

    // Posts list
    $('postSearchInput').addEventListener('input', () => this.renderAllPosts());
    $('postFilterCategory').addEventListener('change', () => this.renderAllPosts());

    // Editor
    $('autoSlugBtn').addEventListener('click', () => { $('postSlug').value = this.slugify($('postTitle').value); this.runSEOAnalysis(); });
    $('saveDraftBtn').addEventListener('click', () => this.savePost('draft'));
    $('publishBtn').addEventListener('click', () => this.savePost('published'));
    ['postTitle', 'postMetaDesc', 'postFocusKeyword', 'postContent', 'postSlug', 'postFeaturedImage'].forEach((id) => {
      $(id).addEventListener('input', () => { clearTimeout(this.seoTimeout); this.seoTimeout = setTimeout(() => this.runSEOAnalysis(), 300); this.editorDirty = true; });
    });
    $('postTitle').addEventListener('blur', () => { if (!$('postSlug').value.trim()) { $('postSlug').value = this.slugify($('postTitle').value); this.runSEOAnalysis(); } });
    document.querySelectorAll('.toolbar-btn').forEach((b) => b.addEventListener('click', () => this.insertTag(b.getAttribute('data-tag'))));

    // SEO monitor
    $('btnRunSiteAudit').addEventListener('click', () => this.runSiteAudit());
    $('btnLoadPagesOverview').addEventListener('click', () => (this.audit ? this.renderAudit() : this.runSiteAudit()));
    $('btnLoadSeoIndexed').addEventListener('click', () => (this.audit ? this.renderAudit() : this.runSiteAudit()));
    $('btnLoadSeoNoindex').addEventListener('click', () => (this.audit ? this.renderAudit() : this.runSiteAudit()));
    $('btnLoadIndexed').addEventListener('click', () => (this.audit ? this.renderAudit() : this.runSiteAudit()));
    $('btnLoadNoindex').addEventListener('click', () => (this.audit ? this.renderAudit() : this.runSiteAudit()));
    $('btnRefreshBlogSeo').addEventListener('click', () => this.loadPosts());
    $('closeSeoEditModal').addEventListener('click', () => { $('seoEditModal').style.display = 'none'; });
    $('saveSeoEditBtn').addEventListener('click', () => this.saveSeoEdits());

    // Leads
    $('btnRefreshLeads').addEventListener('click', () => this.loadLeads());
    $('leadSearchInput').addEventListener('input', () => this.renderLeadsTable());
    $('leadStatusFilter').addEventListener('change', () => this.renderLeadsTable());
    $('closeReplyModal').addEventListener('click', () => this.closeReplyModal());
    $('cancelReplyBtn').addEventListener('click', () => this.closeReplyModal());
    $('btnGenerateAiDraft').addEventListener('click', () => this.generateAiEmailDraft());
    document.querySelectorAll('.ai-preset-chip').forEach((chip) => chip.addEventListener('click', () => this.generateAiEmailDraft(chip.getAttribute('data-type'))));
    $('directReplyForm').addEventListener('submit', (e) => { e.preventDefault(); this.sendDirectEmailReply(); });
    ['replySubject', 'replyMessageBody'].forEach((id) => $(id).addEventListener('input', () => this.updateMailtoLink()));

    // Profile
    $('saveProfileBtn').addEventListener('click', () => this.saveProfile());
    $('changePasswordBtn').addEventListener('click', () => this.changePassword());
    $('btnSmtpCheck').addEventListener('click', () => this.smtpCheck());
    $('btnSmtpTest').addEventListener('click', () => this.smtpTest());

    // Live chat
    $('btnJoinChat').addEventListener('click', () => this.joinLiveChat());
    $('btnEndChat').addEventListener('click', () => this.endLiveChat());
    $('btnSendChatReply').addEventListener('click', () => this.sendLiveChatReply());
    $('adminChatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendLiveChatReply(); } });

    window.addEventListener('beforeunload', (e) => { if (this.editorDirty && this.activeTab === 'editor') { e.preventDefault(); e.returnValue = ''; } });
  }

  switchTab(tabId, { silent = false } = {}) {
    if (!$(`tab-${tabId}`)) tabId = 'overview';
    this.activeTab = tabId;
    document.querySelectorAll('.admin-nav-item').forEach((el) => el.classList.toggle('active', el.getAttribute('data-tab') === tabId));
    document.querySelectorAll('.tab-content').forEach((el) => { el.style.display = 'none'; });
    $(`tab-${tabId}`).style.display = 'block';
    const titles = {
      overview: 'Dashboard Overview',
      posts: 'All Blog Posts & Performance',
      editor: this.currentPostId ? 'Edit Blog Post & SEO' : 'New Article Studio & SEO',
      'seo-health': 'Site-Wide SEO Audit & Optimization',
      leads: 'Leads & Direct Email Reply',
      livechat: 'Live Chat Support',
      profile: 'Profile Settings',
    };
    $('currentTabTitle').textContent = titles[tabId] || 'Admin Dashboard';
    if (!silent) history.replaceState(null, '', `#${tabId}`);
    if (tabId === 'livechat') this.renderLiveSessions();
    if (tabId === 'seo-health' && this.audit) this.renderAudit();
  }

  /* ========================================================== REAL-TIME */
  startPulse() {
    clearTimeout(this.pulseTimer);
    const tick = async () => {
      try {
        const prev = this.versions;
        const p = await api('pulse', { query: prev ? { chatsVer: prev.chats } : {} });
        this.versions = p.versions;
        if (p.chats) { this.chats = p.chats; this.renderLiveSessions(); }
        else if (this.activeTab === 'livechat') this.refreshSessionTimes();
        if (prev) {
          if (p.versions.leads !== prev.leads) await this.loadLeads();
          if (p.versions.posts !== prev.posts) await this.loadPosts();
        }
        this.updateOverviewMetrics();
        $('systemStatusPill').title = `Last sync ${new Date().toLocaleTimeString()}`;
      } catch (e) {
        if (e.status !== 401) $('systemStatusPill').textContent = '● Reconnecting…';
      }
      this.pulseTimer = setTimeout(tick, document.hidden ? PULSE_HIDDEN_MS : PULSE_MS);
    };
    tick();
  }

  /* ============================================================ OVERVIEW */
  allPosts() {
    const dyn = this.posts.map((p) => ({ ...p, source: 'dashboard' }));
    return [...dyn, ...this.staticPosts].sort((a, b) => String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || '')));
  }

  updateOverviewMetrics() {
    const posts = this.allPosts();
    $('metricTotalPosts').textContent = posts.length;
    const scored = posts.filter((p) => p.seoScore);
    $('metricAvgSEO').textContent = scored.length ? `${Math.round(scored.reduce((s, p) => s + p.seoScore, 0) / scored.length)}%` : '--';
    $('metricChatLeads').textContent = this.leads.length;
    const active = this.chats.filter((c) => !c.closed);
    $('metricLiveSessions').textContent = active.length;
    if (this.audit) {
      $('metricIndexRoutes').textContent = this.audit.pages.filter((p) => p.indexable).length;
      $('metricSiteHealth').textContent = `${this.audit.overallScore}%`;
    }
    const newLeads = this.leads.filter((l) => l.status === 'new').length;
    const lb = $('leadsNavBadge');
    lb.textContent = newLeads;
    lb.style.display = newLeads ? 'inline-block' : 'none';
    const unread = active.reduce((s, c) => s + (c.unread || 0), 0);
    const cb = $('liveChatBadge');
    cb.textContent = unread || active.length;
    cb.style.display = active.length ? 'inline-block' : 'none';
    document.title = `${unread + newLeads ? `(${unread + newLeads}) ` : ''}Admin Dashboard | Zavron Solutions`;
  }

  /* =============================================================== POSTS */
  async loadPosts() {
    try {
      const d = await api('posts');
      this.posts = d.posts || [];
      this.staticPosts = (d.staticPosts || []).map((p) => ({ ...p, source: 'static' }));
    } catch (e) { this.toast(`Could not load posts: ${e.message}`, 'error'); }
    this.renderRecentPosts();
    this.renderAllPosts();
    this.renderBlogSeo();
    this.updateOverviewMetrics();
  }

  postRow(post, { compact = false } = {}) {
    const isDyn = post.source !== 'static';
    const badge = isDyn ? '<span class="post-source-badge dyn">Dashboard</span>' : '<span class="post-source-badge static">Static</span>';
    const status = post.status || 'published';
    const viewHref = isDyn && status !== 'published' ? `/blog/${post.slug}/?preview=1` : `/blog/${post.slug}/`;
    const actions = isDyn
      ? `<button class="btn-action" data-edit="${esc(post.id)}">Edit</button>
         <a href="${esc(viewHref)}" target="_blank" rel="noopener" class="btn-action">${status === 'published' ? 'View' : 'Preview'}</a>
         <button class="btn-action danger" data-delete-post="${esc(post.id)}">Delete</button>`
      : `<a href="/blog/${esc(post.slug)}/" target="_blank" rel="noopener" class="btn-action">View</a>
         <button class="btn-action" data-seo-edit="/blog/${esc(post.slug)}/">Edit SEO</button>`;
    const cat = CATEGORY_LABELS[post.category] || post.categoryLabel || post.category || 'General';
    return `<tr>
      <td><strong>${esc(post.title)}</strong>${badge}<br><span style="font-size:0.75rem;color:var(--adm-text-muted);">/blog/${esc(post.slug)}/</span></td>
      <td><span style="font-size:0.8rem;background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px;">${esc(cat)}</span></td>
      ${compact ? '' : `<td><span style="color:var(--adm-cyan);font-size:0.85rem;">${esc(post.focusKeyword || '—')}</span></td>`}
      ${compact ? '' : `<td>${post.wordCount || 0}</td>`}
      ${compact ? `<td><span style="color:var(--adm-cyan);font-size:0.85rem;">${esc(post.focusKeyword || '—')}</span></td>` : ''}
      <td><span class="seo-score-pill ${scoreClass(post.seoScore || 0)}">${post.seoScore || 0}</span></td>
      <td><span class="seo-score-pill ${status === 'published' ? 'score-excellent' : 'score-good'}" style="text-transform:capitalize;">${esc(status)}</span></td>
      <td style="white-space:nowrap;">${actions}</td>
    </tr>`;
  }

  bindPostActions(container) {
    container.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => this.editPost(b.getAttribute('data-edit'))));
    container.querySelectorAll('[data-delete-post]').forEach((b) => b.addEventListener('click', () => this.deletePost(b.getAttribute('data-delete-post'))));
    container.querySelectorAll('[data-seo-edit]').forEach((b) => b.addEventListener('click', () => this.openSeoEditFor(b.getAttribute('data-seo-edit'))));
  }

  renderRecentPosts() {
    const tbody = $('recentPostsTableBody');
    const rows = this.allPosts().slice(0, 6);
    tbody.innerHTML = rows.length ? rows.map((p) => this.postRow(p, { compact: true })).join('') : '<tr><td colspan="6" style="text-align:center;padding:24px;">No articles yet.</td></tr>';
    this.bindPostActions(tbody);
  }

  renderAllPosts() {
    const q = $('postSearchInput').value.trim().toLowerCase();
    const cat = $('postFilterCategory').value;
    const rows = this.allPosts().filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      return [p.title, p.slug, p.focusKeyword, p.category, p.categoryLabel].some((v) => String(v || '').toLowerCase().includes(q));
    });
    const tbody = $('allPostsTableBody');
    tbody.innerHTML = rows.length ? rows.map((p) => this.postRow(p)).join('') : '<tr><td colspan="7" style="text-align:center;padding:24px;">No articles match your search.</td></tr>';
    this.bindPostActions(tbody);
  }

  renderBlogSeo() {
    const rows = this.allPosts();
    const html = rows.map((p) => `<tr>
      <td><strong>${esc(p.title)}</strong>${p.source === 'static' ? '<span class="post-source-badge static">Static</span>' : '<span class="post-source-badge dyn">Dashboard</span>'}</td>
      <td><span style="color:var(--adm-cyan);font-family:monospace;font-size:0.8rem;">${esc(p.slug)}</span></td>
      <td>${esc(p.focusKeyword || '—')}</td>
      <td><span class="seo-score-pill ${scoreClass(p.seoScore || 0)}">${p.seoScore || 0}</span></td>
      <td><span class="seo-score-pill ${p.status === 'published' ? 'score-excellent' : 'score-good'}" style="text-transform:capitalize;">${esc(p.status || 'published')}</span></td>
      <td>${p.source === 'static' ? `<button class="btn-action" data-seo-edit="/blog/${esc(p.slug)}/">Edit SEO</button>` : `<button class="btn-action" data-edit="${esc(p.id)}">Edit in Studio</button>`}</td>
    </tr>`).join('');
    const tbody = $('blogSeoTableBody');
    tbody.innerHTML = html || '<tr><td colspan="6" style="text-align:center;padding:24px;">No posts.</td></tr>';
    this.bindPostActions(tbody);
    const ov = $('blogsOverviewBody');
    ov.innerHTML = rows.map((p) => `<tr><td><strong>${esc(p.title)}</strong></td><td>${esc(CATEGORY_LABELS[p.category] || p.categoryLabel || p.category || '')}</td><td><span class="seo-score-pill ${scoreClass(p.seoScore || 0)}">${p.seoScore || 0}</span></td><td>${p.wordCount || 0}</td><td style="text-transform:capitalize;">${esc(p.status || 'published')}</td></tr>`).join('');
  }

  startNewPost() {
    if (this.editorDirty && this.activeTab === 'editor' && !confirm('Discard unsaved changes in the editor?')) return;
    this.currentPostId = null;
    $('postEditorForm').reset();
    $('editPostId').value = '';
    $('postFeaturedImage').value = '/assets/og-image.jpg';
    $('editorTitle').textContent = 'Write New Article';
    this.editorDirty = false;
    this.switchTab('editor');
    this.runSEOAnalysis();
  }

  editPost(id) {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return;
    this.currentPostId = post.id;
    $('editPostId').value = post.id;
    $('postTitle').value = post.title || '';
    $('postSlug').value = post.slug || '';
    $('postFocusKeyword').value = post.focusKeyword || '';
    $('postCategory').value = post.category || 'web-development';
    $('postFeaturedImage').value = post.featuredImage || '/assets/og-image.jpg';
    $('postMetaDesc').value = post.metaDescription || '';
    $('postContent').value = post.contentHtml || '';
    $('editorTitle').textContent = `Edit Article — ${post.status === 'published' ? 'Live' : 'Draft'}`;
    this.editorDirty = false;
    this.switchTab('editor');
    this.runSEOAnalysis();
  }

  async savePost(status) {
    const title = $('postTitle').value.trim();
    if (!$('postSlug').value.trim()) $('postSlug').value = this.slugify(title);
    const slug = $('postSlug').value.trim();
    if (!title || !slug) { this.toast('Title and URL slug are required.', 'error'); return; }
    if (status === 'published' && !$('postContent').value.trim()) { this.toast('Write some article content before publishing.', 'error'); return; }
    const results = this.runSEOAnalysis();
    const btn = status === 'published' ? $('publishBtn') : $('saveDraftBtn');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = status === 'published' ? 'Publishing…' : 'Saving…';
    try {
      const d = await api('post-save', {
        method: 'POST',
        body: {
          id: this.currentPostId || undefined,
          title,
          slug,
          focusKeyword: $('postFocusKeyword').value.trim(),
          category: $('postCategory').value,
          featuredImage: $('postFeaturedImage').value.trim(),
          metaDescription: $('postMetaDesc').value.trim(),
          contentHtml: $('postContent').value,
          status,
          seoScore: results.score,
          wordCount: results.wordCount,
          author: this.user.name,
        },
      });
      this.currentPostId = d.post.id;
      $('editPostId').value = d.post.id;
      $('postSlug').value = d.post.slug;
      this.editorDirty = false;
      $('editorTitle').textContent = `Edit Article — ${d.post.status === 'published' ? 'Live' : 'Draft'}`;
      await this.loadPosts();
      if (status === 'published') this.toast(`Published! Live at /blog/${d.post.slug}/ — click to open.`, 'success', () => window.open(`/blog/${d.post.slug}/`, '_blank'));
      else this.toast('Draft saved.', 'success');
    } catch (e) {
      this.toast(e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  async deletePost(id) {
    const post = this.posts.find((p) => p.id === id);
    if (!post || !confirm(`Delete "${post.title}"? It will be removed from the live website.`)) return;
    try {
      await api('post-delete', { method: 'POST', body: { id } });
      if (this.currentPostId === id) this.currentPostId = null;
      this.toast('Article deleted.', 'success');
      await this.loadPosts();
    } catch (e) { this.toast(e.message, 'error'); }
  }

  slugify(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90); }

  insertTag(tag) {
    const ta = $('postContent');
    const { selectionStart: a, selectionEnd: b, value } = ta;
    const sel = value.slice(a, b);
    const snippets = {
      h2: `<h2>${sel || 'Section heading'}</h2>\n`,
      h3: `<h3>${sel || 'Sub heading'}</h3>\n`,
      b: `<strong>${sel || 'bold text'}</strong>`,
      i: `<em>${sel || 'italic text'}</em>`,
      a: `<a href="${prompt('Link URL', '/services/web-development/') || '#'}">${sel || 'link text'}</a>`,
      ul: `<ul>\n  <li>${sel || 'First point'}</li>\n  <li>Second point</li>\n</ul>\n`,
      img: `<img src="${prompt('Image URL', '/assets/og-image.jpg') || ''}" alt="${sel || 'Describe the image'}" loading="lazy" width="1200" height="630">\n`,
      callout: `<div class="article-callout"><strong>Key takeaway:</strong>\n<p>${sel || 'Important insight for the reader.'}</p></div>\n`,
    };
    const ins = snippets[tag] || '';
    ta.setRangeText(ins, a, b, 'end');
    ta.focus();
    this.editorDirty = true;
    this.runSEOAnalysis();
  }

  /* ===================================================== SEO STUDIO (editor) */
  runSEOAnalysis() {
    const data = {
      title: $('postTitle').value,
      slug: $('postSlug').value,
      metaDescription: $('postMetaDesc').value,
      focusKeyword: $('postFocusKeyword').value,
      contentHtml: $('postContent').value,
      featuredImage: $('postFeaturedImage').value,
    };
    const r = this.analyzer.analyze(data);
    const circle = $('seoScoreCircle');
    circle.textContent = r.score;
    circle.className = `seo-score-circle ${r.score >= 80 ? 'circle-excellent' : r.score >= 60 ? 'circle-good' : 'circle-poor'}`;
    $('seoScoreRating').textContent = `Score: ${r.score} / 100`;
    $('seoScoreSummary').textContent = r.score >= 80 ? 'Excellent — ready to rank.' : r.score >= 60 ? 'Good — a few improvements will help.' : 'Needs work — fix the critical items below.';
    const badge = $('seoScoreStatusBadge');
    badge.textContent = r.status === 'excellent' ? 'Excellent' : r.status === 'good' ? 'Good' : 'Needs Work';
    badge.className = `seo-score-pill ${r.score >= 80 ? 'score-excellent' : r.score >= 60 ? 'score-good' : 'score-poor'}`;
    $('seoWordCount').textContent = r.wordCount;
    $('seoDensity').textContent = `${r.keywordDensity}%`;
    $('seoHeadingCount').textContent = (data.contentHtml.match(/<h[2-4]\b/gi) || []).length + (data.contentHtml.match(/^#{2,4}\s/gm) || []).length;
    this.renderChecklist('critical', r.checks.critical);
    this.renderChecklist('warning', r.checks.warning);
    this.renderChecklist('passed', r.checks.passed);
    $('serpTitlePreview').textContent = data.title ? `${data.title} | Zavron Solutions` : 'Page Title | Zavron Solutions';
    $('serpDescPreview').textContent = data.metaDescription || 'Provide a meta description to see how your snippet appears in Google search results...';
    $('serpUrlPreview').textContent = `https://www.zavronsolutions.com › blog › ${data.slug || 'url-slug'}`;
    $('metaCountBadge').textContent = `${data.metaDescription.length} / 160 chars`;
    return r;
  }

  renderChecklist(type, items) {
    $(`${type}Count`).textContent = items.length;
    const icon = type === 'critical' ? '🔴' : type === 'warning' ? '🟡' : '🟢';
    $(`${type}List`).innerHTML = items.map((it) => `<div class="checklist-item"><span class="checklist-icon">${icon}</span><div><strong>${esc(it.title)}</strong>${it.detail ? `<div style="font-size:0.75rem;color:var(--adm-text-muted);margin-top:2px;">${esc(it.detail)}</div>` : ''}${it.action ? `<div style="font-size:0.75rem;color:var(--adm-cyan);margin-top:2px;">→ ${esc(it.action)}</div>` : ''}</div></div>`).join('');
  }

  /* ===================================================== SEO MONITOR */
  async loadAudit() {
    try {
      const d = await api('audit');
      this.audit = d.audit || null;
      if (this.audit) this.renderAudit();
    } catch { /* ignore */ }
  }

  async runSiteAudit() {
    const loading = '<tr><td colspan="5" style="text-align:center;padding:24px;"><div class="spinner"></div> Crawling every page on the live site…</td></tr>';
    ['siteAuditTableBody', 'pagesOverviewBody', 'seoIndexedBody', 'seoNoindexBody'].forEach((id) => { $(id).innerHTML = loading; });
    const btn = $('btnRunSiteAudit');
    btn.disabled = true;
    try {
      const d = await api('audit-run', { method: 'POST' });
      this.audit = d.audit;
      this.renderAudit();
      this.updateOverviewMetrics();
      this.toast(`Crawled ${d.audit.totalPages} pages in ${(d.audit.durationMs / 1000).toFixed(1)}s.`, 'success');
    } catch (e) {
      this.toast(`Site crawl failed: ${e.message}`, 'error');
      ['siteAuditTableBody', 'pagesOverviewBody'].forEach((id) => { $(id).innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--adm-red);">${esc(e.message)}</td></tr>`; });
    } finally { btn.disabled = false; }
  }

  renderAudit() {
    const a = this.audit;
    if (!a) return;
    const pages = [...a.pages].sort((x, y) => x.score - y.score);
    const issuesCell = (p) => (p.issues && p.issues.length ? `<span style="color:var(--adm-red);" title="${esc(p.issues.join('\n'))}">${p.issues.length} issue${p.issues.length > 1 ? 's' : ''}</span><div style="font-size:0.72rem;color:var(--adm-text-muted);max-width:260px;">${esc(p.issues.slice(0, 2).join(' • '))}</div>` : '<span style="color:var(--adm-green);">Clear</span>');
    const editBtn = (p) => `<button class="btn-action" data-seo-edit="${esc(p.route)}">Edit</button><a href="${esc(p.route)}" target="_blank" rel="noopener" class="btn-action">View</a>`;

    const auditRows = pages.map((p) => `<tr>
      <td><span style="font-family:monospace;font-size:0.8rem;color:var(--adm-cyan);">${esc(p.route)}</span></td>
      <td style="max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${esc(p.title)}">${esc(p.title || '—')}</td>
      <td><span class="seo-score-pill ${scoreClass(p.score)}">${p.score}</span></td>
      <td>${issuesCell(p)}</td>
      <td style="white-space:nowrap;">${editBtn(p)}</td></tr>`).join('');
    $('siteAuditTableBody').innerHTML = auditRows;

    $('pagesOverviewBody').innerHTML = pages.map((p) => `<tr>
      <td><span style="font-family:monospace;font-size:0.8rem;color:var(--adm-cyan);">${esc(p.route)}</span></td>
      <td>${esc(p.title || '—')}</td>
      <td><span class="seo-score-pill ${scoreClass(p.score)}">${p.score}</span></td>
      <td>${p.indexable ? '<span class="badge-indexed">index</span>' : '<span class="badge-noindex">noindex</span>'}</td>
      <td>${p.issues ? p.issues.length : 0}</td></tr>`).join('');

    const indexed = pages.filter((p) => p.indexable);
    const noindex = pages.filter((p) => !p.indexable);
    $('seoIndexedCount').textContent = `(${indexed.length})`;
    $('indexedCount').textContent = `(${indexed.length})`;
    $('seoNoindexCount').textContent = `(${noindex.length})`;
    $('noindexCount').textContent = `(${noindex.length})`;
    $('seoIndexedBody').innerHTML = indexed.map((p) => `<tr><td><span style="font-family:monospace;font-size:0.8rem;color:var(--adm-cyan);">${esc(p.route)}</span></td><td>${esc(p.title)}</td><td><span class="seo-score-pill ${scoreClass(p.score)}">${p.score}</span></td><td style="font-size:0.75rem;">${esc(p.canonical || '—')}</td><td>${editBtn(p)}</td></tr>`).join('');
    $('indexedPagesBody').innerHTML = indexed.map((p) => `<tr><td><span style="font-family:monospace;font-size:0.8rem;color:var(--adm-cyan);">${esc(p.route)}</span></td><td>${esc(p.title)}</td><td style="font-size:0.75rem;">${esc(p.canonical || '—')}</td><td><span class="seo-score-pill ${scoreClass(p.score)}">${p.score}</span></td></tr>`).join('');
    const reason = (p) => (p.route.startsWith('/admin') ? 'Private admin area' : p.route.includes('404') ? 'Error page' : p.status && p.status >= 300 ? `HTTP ${p.status}` : 'noindex directive');
    $('seoNoindexBody').innerHTML = noindex.map((p) => `<tr><td><span style="font-family:monospace;font-size:0.8rem;color:var(--adm-cyan);">${esc(p.route)}</span></td><td>${esc(p.title || '—')}</td><td><span class="badge-noindex">${esc(p.robots || 'noindex')}</span></td><td>${esc(reason(p))}</td><td><a href="${esc(p.route)}" target="_blank" rel="noopener" class="btn-action">View</a></td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center;padding:20px;">None</td></tr>';
    $('noindexPagesBody').innerHTML = noindex.map((p) => `<tr><td><span style="font-family:monospace;font-size:0.8rem;color:var(--adm-cyan);">${esc(p.route)}</span></td><td>${esc(p.title || '—')}</td><td><span class="badge-noindex">${esc(p.robots || 'noindex')}</span></td><td><a href="${esc(p.route)}" target="_blank" rel="noopener" class="btn-action">View</a></td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center;padding:20px;">None</td></tr>';

    $('auditTotalRoutes').textContent = a.totalPages;
    $('auditOverallScore').textContent = `${a.overallScore}%`;
    $('auditCriticalCount').textContent = a.criticalCount;
    $('auditWarningCount').textContent = a.warningCount;
    const has = (p, w) => (p.issues || []).some((i) => i.toLowerCase().includes(w));
    $('healthMissingTitle').textContent = indexed.filter((p) => has(p, 'missing <title>')).length;
    $('healthMissingMeta').textContent = indexed.filter((p) => has(p, 'missing meta description')).length;
    $('healthMissingCanonical').textContent = indexed.filter((p) => has(p, 'missing canonical')).length;
    $('healthPerfect').textContent = indexed.filter((p) => !p.issues || !p.issues.length).length;

    const buckets = [
      ['Excellent (90–100)', (s) => s >= 90, '#10B981'],
      ['Good (70–89)', (s) => s >= 70 && s < 90, '#00D2FF'],
      ['Fair (50–69)', (s) => s >= 50 && s < 70, '#F59E0B'],
      ['Poor (0–49)', (s) => s < 50, '#EF4444'],
    ].map(([label, fn, color]) => ({ label, color, n: indexed.filter((p) => fn(p.score)).length }));
    $('seoScoreDistribution').innerHTML = buckets.map((b) => `<div style="background:rgba(255,255,255,0.04);border:1px solid var(--adm-border);border-radius:10px;padding:16px;"><div style="font-size:0.75rem;color:var(--adm-text-muted);text-transform:uppercase;font-weight:700;">${b.label}</div><div style="font-size:1.8rem;font-weight:800;color:${b.color};">${b.n}</div></div>`).join('');
    const max = Math.max(1, ...buckets.map((b) => b.n));
    $('seoScoreChart').style.display = 'block';
    $('seoScoreChart').innerHTML = `<div style="font-size:0.8rem;color:var(--adm-text-muted);margin-bottom:14px;">Last crawl: ${fmtDate(a.crawledAt)} — ${indexed.length} indexable pages</div>${buckets.map((b) => `<div class="score-bar-row"><span>${b.label.split(' ')[0]}</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${(b.n / max) * 100}%;background:${b.color};"></div></div><strong>${b.n}</strong></div>`).join('')}`;

    document.querySelectorAll('#tab-seo-health [data-seo-edit], #tab-overview [data-seo-edit]').forEach((b) => {
      if (b._bound) return;
      b._bound = true;
      b.addEventListener('click', () => this.openSeoEditFor(b.getAttribute('data-seo-edit')));
    });
  }

  openSeoEditFor(route) {
    const dyn = this.posts.find((p) => `/blog/${p.slug}/` === route);
    if (dyn) { this.editPost(dyn.id); return; }
    const page = this.audit && this.audit.pages.find((p) => p.route === route);
    const sp = this.staticPosts.find((p) => `/blog/${p.slug}/` === route);
    $('seoEditRoute').textContent = route;
    $('seoEditRouteInput').value = route;
    $('seoEditTitle').value = (page && page.title) || (sp && sp.metaTitle) || '';
    $('seoEditMeta').value = (page && page.metaDesc) || (sp && sp.metaDescription) || '';
    $('seoEditCanonical').value = (page && page.canonical) || `https://www.zavronsolutions.com${route}`;
    $('saveSeoEditBtn').textContent = this.system.github ? '💾 Save & Deploy' : '💾 Save (needs GitHub token)';
    $('seoEditModal').style.display = 'flex';
  }

  async saveSeoEdits() {
    const btn = $('saveSeoEditBtn');
    btn.disabled = true;
    try {
      const d = await api('page-seo', {
        method: 'POST',
        body: {
          route: $('seoEditRouteInput').value,
          title: $('seoEditTitle').value,
          metaDescription: $('seoEditMeta').value,
          canonical: $('seoEditCanonical').value,
        },
      });
      this.toast(d.message || 'Saved.', 'success');
      $('seoEditModal').style.display = 'none';
    } catch (e) {
      this.toast(e.message, 'error');
    } finally { btn.disabled = false; }
  }

  /* =============================================================== LEADS */
  async loadLeads(initial = false) {
    try {
      const d = await api('leads');
      const fresh = d.leads || [];
      if (this.knownLeadIds && !initial) {
        fresh.filter((l) => !this.knownLeadIds.has(l.id)).forEach((l) => {
          this.toast(`🔔 New lead: ${l.name} — ${l.service}`, 'success', () => { this.switchTab('leads'); this.openReplyModal(l.id); });
        });
      }
      this.knownLeadIds = new Set(fresh.map((l) => l.id));
      this.leads = fresh;
    } catch (e) { if (e.status !== 401) this.toast(`Could not load leads: ${e.message}`, 'error'); }
    this.renderLeadsTable();
    this.updateOverviewMetrics();
  }

  deliveryCell(lead) {
    const d = lead.delivery;
    if (!d) return '<span class="delivery-pill delivery-na">—</span>';
    const admin = d.adminSent ? '<span class="delivery-pill delivery-ok">✓ You notified</span>' : `<span class="delivery-pill delivery-bad" title="${esc(d.error || '')}">✗ Notify failed${d.error ? ` (${esc(d.error)})` : ''}</span>`;
    const client = d.clientSent ? '<span class="delivery-pill delivery-ok">✓ Client confirmed</span>' : `<span class="delivery-pill delivery-bad" title="${esc(d.clientError || d.error || '')}">✗ Client email failed${d.clientError ? ` (${esc(d.clientError)})` : ''}</span>`;
    return `${admin}<br>${client}`;
  }

  renderLeadsTable() {
    const tbody = $('chatbotLeadsTableBody');
    const q = $('leadSearchInput').value.trim().toLowerCase();
    const st = $('leadStatusFilter').value;
    const rows = this.leads.filter((l) => (st === 'all' || l.status === st) && (!q || [l.name, l.email, l.phone, l.company, l.service, l.source, l.details].some((v) => String(v || '').toLowerCase().includes(q))));
    $('leadsCountLabel').textContent = `(${this.leads.length})`;
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;">${this.leads.length ? 'No leads match the filter.' : 'No leads yet — new contact, quote and chatbot inquiries will appear here instantly.'}</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map((lead) => {
      const replied = lead.status === 'replied' || (lead.replies && lead.replies.length);
      return `<tr style="background:${lead.status === 'new' ? 'rgba(255,122,0,0.05)' : 'transparent'}">
        <td style="white-space:nowrap;">${fmtDate(lead.date)}</td>
        <td><strong>${esc(lead.name)}</strong>${lead.company ? `<br><span style="font-size:0.75rem;color:var(--adm-text-muted);">${esc(lead.company)}</span>` : ''}</td>
        <td><a href="mailto:${esc(lead.email)}" style="color:var(--adm-cyan);">${esc(lead.email)}</a>${lead.phone ? `<br><span style="font-size:0.75rem;">${esc(lead.phone)}</span>` : ''}</td>
        <td>${esc(lead.service)}<br><span style="font-size:0.72rem;color:var(--adm-text-muted);">${esc(lead.source)}${lead.budget ? ` • ${esc(lead.budget)}` : ''}</span></td>
        <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(lead.details)}">${esc(lead.details)}</td>
        <td>${this.deliveryCell(lead)}</td>
        <td><select class="form-control status-select" data-id="${esc(lead.id)}" style="padding:4px;font-size:0.8rem;background:rgba(0,0,0,0.2);color:#fff;border:1px solid #FF7A00;border-radius:4px;cursor:pointer;">
          ${Object.entries(STATUS_LABELS).map(([v, label]) => `<option value="${v}" ${lead.status === v ? 'selected' : ''}>${label}</option>`).join('')}
        </select></td>
        <td style="white-space:nowrap;">
          <button class="btn-action" data-reply="${esc(lead.id)}" style="${replied ? '' : 'background:rgba(255,122,0,0.2);color:#FF7A00;'}">${replied ? `View / Reply (${(lead.replies || []).length})` : 'Reply Now'}</button>
          <button class="btn-action danger" data-delete-lead="${esc(lead.id)}">Delete</button>
        </td></tr>`;
    }).join('');
    tbody.querySelectorAll('.status-select').forEach((sel) => sel.addEventListener('change', () => this.updateLeadStatus(sel.getAttribute('data-id'), sel.value)));
    tbody.querySelectorAll('[data-reply]').forEach((b) => b.addEventListener('click', () => this.openReplyModal(b.getAttribute('data-reply'))));
    tbody.querySelectorAll('[data-delete-lead]').forEach((b) => b.addEventListener('click', () => this.deleteLead(b.getAttribute('data-delete-lead'))));
  }

  async updateLeadStatus(id, status) {
    try {
      const d = await api('lead-update', { method: 'POST', body: { id, status } });
      const i = this.leads.findIndex((l) => l.id === id);
      if (i >= 0) this.leads[i] = d.lead;
      this.updateOverviewMetrics();
      this.toast(`Status updated to "${STATUS_LABELS[status]}".`, 'success');
    } catch (e) { this.toast(e.message, 'error'); this.renderLeadsTable(); }
  }

  async deleteLead(id) {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead || !confirm(`Delete the lead from ${lead.name}? This cannot be undone.`)) return;
    try {
      await api('lead-delete', { method: 'POST', body: { id } });
      this.leads = this.leads.filter((l) => l.id !== id);
      this.renderLeadsTable();
      this.updateOverviewMetrics();
      this.toast('Lead deleted.', 'success');
    } catch (e) { this.toast(e.message, 'error'); }
  }

  openReplyModal(leadId) {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return;
    this.replyLead = lead;
    $('replyLeadId').value = lead.id;
    $('replyLeadService').value = lead.service || '';
    $('replyLeadDetails').value = lead.details || '';
    $('replyRecipientName').textContent = lead.name || 'Client';
    $('replyRecipientEmail').value = lead.email;
    $('replySubject').value = `Re: Your ${lead.service || 'project'} inquiry — Zavron Solutions`;
    $('replyMessageBody').value = `Hi ${lead.name ? lead.name.split(' ')[0] : 'there'},\n\nThank you for reaching out to Zavron Solutions about ${lead.service || 'your project'}.\n\n\n\n${this.user.signature || ''}`;
    $('aiCustomPrompt').value = '';
    const history = (lead.replies || []).map((r) => `\n— Sent ${fmtDate(r.at)}: ${r.subject || ''}\n${String(r.message || '').slice(0, 400)}`).join('\n');
    $('replyLeadSummary').innerHTML = `<strong>${esc(lead.name)}</strong> • ${esc(lead.email)}${lead.phone ? ` • ${esc(lead.phone)}` : ''}\n<strong>Source:</strong> ${esc(lead.source)} • <strong>Received:</strong> ${fmtDate(lead.date)}${lead.budget ? `\n<strong>Budget:</strong> ${esc(lead.budget)}` : ''}${lead.timeline ? ` • <strong>Timeline:</strong> ${esc(lead.timeline)}` : ''}\n<strong>Message:</strong>\n${esc(lead.details || '—')}${history ? `\n\n<strong>Previous replies:</strong>${esc(history)}` : ''}`;
    this.updateMailtoLink();
    $('replyModal').style.display = 'flex';
    if (lead.status === 'new') this.updateLeadStatus(lead.id, 'in_progress');
  }

  closeReplyModal() { $('replyModal').style.display = 'none'; }

  updateMailtoLink() {
    $('btnOpenGmailDirect').href = `mailto:${encodeURIComponent($('replyRecipientEmail').value)}?subject=${encodeURIComponent($('replySubject').value)}&body=${encodeURIComponent($('replyMessageBody').value)}`;
  }

  async generateAiEmailDraft(preset) {
    const lead = this.replyLead || {};
    const custom = $('aiCustomPrompt').value.trim();
    const goals = { call: 'schedule a 15-minute strategy call this week', quote: 'say a custom proposal is being prepared and ask for any missing budget/timeline details', info: 'ask for more project details (current website, goals, timeline)' };
    if (this.system.openai) {
      const btn = $('btnGenerateAiDraft');
      btn.disabled = true;
      btn.textContent = '✨ Writing…';
      try {
        const d = await api('ai-draft', { method: 'POST', body: { leadId: lead.id, preset: goals[preset] || '', instruction: custom } });
        if (d.draft) { $('replyMessageBody').value = d.draft; this.updateMailtoLink(); return; }
      } catch (e) { this.toast(`AI draft unavailable (${e.message}) — using template.`, 'warn'); } finally { btn.disabled = false; btn.textContent = '✨ Generate AI Draft'; }
    }
    const first = lead.name ? lead.name.split(' ')[0] : 'there';
    let draft = `Hi ${first},\n\nThank you for contacting Zavron Solutions about ${lead.service || 'your project'}.\n\n`;
    if (preset === 'call') draft += 'I have reviewed your request and would love to schedule a brief 15-minute strategy call to discuss how we can deliver this effectively.\n\nPlease let me know two or three times that suit you this week (with your time zone) and I will send a calendar invite.';
    else if (preset === 'quote') draft += 'Based on your requirements, we are preparing a detailed proposal for your project. To make the estimate as accurate as possible, could you confirm your target timeline and budget range, plus any must-have features or integrations?\n\nI will send the customized proposal within one business day of hearing back.';
    else if (preset === 'info') draft += 'To make sure we recommend the right approach, could you share a few more details?\n\n• Your current website (if any)\n• The main goal of the project\n• Any deadline we should plan around\n\nOnce I have this, I will outline a clear strategy and next steps.';
    else draft += `${custom || 'I have reviewed your message and will follow up with next steps shortly.'}\n\nLet me know how you would like to proceed.`;
    draft += `\n\nBest regards,\n${this.user.signature || this.user.name || 'Zavron Solutions'}`;
    $('replyMessageBody').value = draft;
    this.updateMailtoLink();
  }

  async sendDirectEmailReply() {
    const btn = $('btnSendReplyEmail');
    const body = {
      id: $('replyLeadId').value,
      to: $('replyRecipientEmail').value,
      subject: $('replySubject').value.trim(),
      message: $('replyMessageBody').value,
    };
    if (!body.message.trim()) { this.toast('Write a message first.', 'error'); return; }
    btn.disabled = true;
    btn.textContent = '📤 Sending…';
    try {
      const d = await api('lead-reply', { method: 'POST', body });
      if (d.lead) { const i = this.leads.findIndex((l) => l.id === d.lead.id); if (i >= 0) this.leads[i] = d.lead; }
      this.renderLeadsTable();
      this.closeReplyModal();
      this.toast(`✅ Email delivered to ${body.to}`, 'success');
    } catch (e) {
      this.toast(`Email not sent: ${e.message}. You can use "Open in Mail App" instead.`, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Email to Client ✉️';
    }
  }

  /* =========================================================== LIVE CHAT */
  async loadChats() {
    try { const d = await api('chats'); this.chats = d.chats || []; } catch { /* pulse will retry */ }
    this.renderLiveSessions();
  }

  renderLiveSessions() {
    const list = $('chatSessionsList');
    const recent = [...this.chats].sort((a, b) => b.lastActivity - a.lastActivity);
    $('chatSessionsCount').textContent = recent.length ? `(${recent.length})` : '';
    if (!recent.length) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--adm-text-muted);font-size:0.85rem;">No active chats in the last 30 minutes. New visitor chats appear here instantly.</div>';
    } else {
      list.innerHTML = recent.map((s) => {
        const name = (s.userInfo && s.userInfo.name) || `Visitor ${s.id.slice(-4)}`;
        const badge = s.adminJoined ? '<span class="session-badge human">You</span>' : '<span class="session-badge">Bot</span>';
        return `<div class="chat-session-item ${this.activeChatId === s.id ? 'active' : ''} ${s.unread ? 'new-msg' : ''}" data-id="${esc(s.id)}">
          <div class="session-name">${esc(name)}${s.unread ? `<span class="session-unread">${s.unread}</span>` : ''} ${badge}</div>
          <div class="session-preview">${esc(s.lastMessage || 'Session started')}</div>
          <div class="session-time">${ago(s.lastActivity)}${s.page ? ` • ${esc(s.page)}` : ''}</div></div>`;
      }).join('');
      list.querySelectorAll('.chat-session-item').forEach((item) => item.addEventListener('click', () => this.openChatSession(item.getAttribute('data-id'))));
    }
    // notify about new visitor messages while not looking at that chat
    recent.forEach((s) => {
      const prev = (this._chatSeen || {})[s.id];
      if (prev !== undefined && s.unread > prev && s.id !== this.activeChatId) {
        this.toast(`💬 ${(s.userInfo && s.userInfo.name) || 'A visitor'}: ${s.lastMessage}`, 'info', () => { this.switchTab('livechat'); this.openChatSession(s.id); });
      }
    });
    this._chatSeen = Object.fromEntries(recent.map((s) => [s.id, s.unread || 0]));
    this.updateOverviewMetrics();
  }

  refreshSessionTimes() {
    document.querySelectorAll('.chat-session-item').forEach((el) => {
      const c = this.chats.find((x) => x.id === el.getAttribute('data-id'));
      const t = el.querySelector('.session-time');
      if (c && t) t.textContent = `${ago(c.lastActivity)}${c.page ? ` • ${c.page}` : ''}`;
    });
  }

  async openChatSession(id) {
    this.activeChatId = id;
    this.chatMessages = [];
    this.chatLastTs = 0;
    $('chatEmptyState').style.display = 'none';
    $('chatActiveWindow').style.display = 'flex';
    $('chatMessagesArea').innerHTML = '<div style="text-align:center;color:var(--adm-text-muted);padding:20px;">Loading conversation…</div>';
    await this.fetchChat(true);
    this.renderLiveSessions();
    clearTimeout(this.chatTimer);
    const poll = async () => {
      if (this.activeChatId !== id) return;
      if (this.activeTab === 'livechat' && !document.hidden) await this.fetchChat(false);
      this.chatTimer = setTimeout(poll, CHAT_POLL_MS);
    };
    this.chatTimer = setTimeout(poll, CHAT_POLL_MS);
  }

  async fetchChat(full) {
    const id = this.activeChatId;
    if (!id) return;
    try {
      const d = await api('chat', { query: { id, since: full ? 0 : this.chatLastTs } });
      if (this.activeChatId !== id) return;
      this.activeChat = d.chat;
      if (full) this.chatMessages = d.messages;
      else if (d.messages.length) {
        const known = new Set(this.chatMessages.map((m) => m.id));
        this.chatMessages.push(...d.messages.filter((m) => !known.has(m.id)));
      }
      if (this.chatMessages.length) this.chatLastTs = this.chatMessages[this.chatMessages.length - 1].ts;
      const c = this.chats.find((x) => x.id === id);
      if (c) c.unread = 0;
      this.renderChatWindow(full || d.messages.length > 0);
    } catch (e) {
      if (e.status === 404) { this.toast('This chat session has expired.', 'warn'); this.activeChatId = null; }
    }
  }

  renderChatWindow(scroll) {
    const s = this.activeChat;
    if (!s) return;
    const name = (s.userInfo && s.userInfo.name) || `Visitor ${s.id.slice(-4)}`;
    $('chatWindowName').textContent = name;
    $('chatWindowInfo').textContent = [s.userInfo && s.userInfo.email, s.page, `started ${fmtDate(s.startTime)}`].filter(Boolean).join(' • ');
    $('chatAdminBadge').style.display = s.adminJoined ? 'inline-block' : 'none';
    $('btnJoinChat').style.display = s.adminJoined ? 'none' : 'inline-block';
    $('btnEndChat').style.display = s.adminJoined ? 'inline-block' : 'none';
    $('adminChatInput').placeholder = s.adminJoined ? 'Type your reply… (Enter to send)' : 'Type to reply — sending joins the chat as a human agent';
    const area = $('chatMessagesArea');
    const atBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 60;
    area.innerHTML = this.chatMessages.map((m) => {
      const who = m.from === 'user' ? name : m.from === 'admin' ? `${this.user.name} (you)` : m.from === 'bot' ? 'AI Assistant' : '';
      return `<div class="chat-msg from-${esc(m.from)}"><div class="chat-bubble">${esc(m.text)}</div>${m.from !== 'system' ? `<div class="chat-msg-time">${esc(who)} • ${fmtTime(m.time)}</div>` : ''}</div>`;
    }).join('') || '<div style="text-align:center;color:var(--adm-text-muted);padding:20px;">No messages yet.</div>';
    if (scroll || atBottom) area.scrollTop = area.scrollHeight;
  }

  async joinLiveChat() {
    if (!this.activeChatId) return;
    try {
      await api('chat-join', { method: 'POST', body: { id: this.activeChatId } });
      await this.fetchChat(true);
      $('adminChatInput').focus();
      this.toast('You joined the chat. The bot is paused for this visitor.', 'success');
    } catch (e) { this.toast(e.message, 'error'); }
  }

  async endLiveChat() {
    if (!this.activeChatId || !confirm('End this chat? The AI assistant will take over again for the visitor.')) return;
    try {
      await api('chat-close', { method: 'POST', body: { id: this.activeChatId } });
      await this.fetchChat(true);
    } catch (e) { this.toast(e.message, 'error'); }
  }

  async sendLiveChatReply() {
    const input = $('adminChatInput');
    const message = input.value.trim();
    if (!message || !this.activeChatId) return;
    input.value = '';
    try {
      await api('chat-reply', { method: 'POST', body: { id: this.activeChatId, message } });
      await this.fetchChat(false);
    } catch (e) { input.value = message; this.toast(e.message, 'error'); }
  }

  /* ============================================================= PROFILE */
  async saveProfile() {
    try {
      const d = await api('profile-save', { method: 'POST', body: { name: $('profileName').value, role: $('profileRole').value, website: $('profileWebsite').value, signature: $('profileSignature').value } });
      this.user = { ...this.user, ...d.profile };
      this.renderIdentity();
      this.toast('Profile saved.', 'success');
    } catch (e) { this.toast(e.message, 'error'); }
  }

  async changePassword() {
    const currentPassword = $('profileCurrentPw').value;
    const newPassword = $('profileNewPw').value;
    if (!currentPassword || !newPassword) { this.toast('Enter your current and new password.', 'error'); return; }
    try {
      await api('password', { method: 'POST', body: { currentPassword, newPassword } });
      $('profileCurrentPw').value = '';
      $('profileNewPw').value = '';
      this.toast('Password updated. Other devices have been signed out.', 'success');
    } catch (e) { this.toast(e.message, 'error'); }
  }

  async smtpCheck() {
    const out = $('smtpStatusResult');
    out.textContent = 'Checking…';
    try {
      const d = await api('smtp-check');
      const s = d.smtp;
      out.innerHTML = s.ok ? `<span style="color:var(--adm-green);">✓ Connected to ${esc(s.host)}:${s.port} as ${esc(s.user)}</span>` : `<span style="color:var(--adm-red);">✗ ${esc(s.code || 'Error')}${s.message ? ` — ${esc(s.message)}` : ''}</span>`;
    } catch (e) { out.innerHTML = `<span style="color:var(--adm-red);">${esc(e.message)}</span>`; }
  }

  async smtpTest() {
    const out = $('smtpStatusResult');
    out.textContent = 'Sending test email…';
    try {
      const d = await api('smtp-test', { method: 'POST' });
      out.innerHTML = `<span style="color:var(--adm-green);">✓ Test email sent to ${esc(d.to)} — check the inbox.</span>`;
    } catch (e) { out.innerHTML = `<span style="color:var(--adm-red);">✗ ${esc(e.message)}</span>`; }
  }

  async logout() {
    try { await api('logout', { method: 'POST' }); } catch { /* ignore */ }
    window.location.href = '/admin/login.html';
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => new ZavronAdminApp());
else new ZavronAdminApp();
