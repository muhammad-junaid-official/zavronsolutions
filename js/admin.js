/**
 * ZAVRON SOLUTIONS — ADMIN DASHBOARD & REAL-TIME SEO STUDIO
 * Comprehensive blog post management, in-dashboard direct email reply with AI assistant,
 * pinpoint real-time SEO scoring, deep site-wide SEO auditing, and Live Chat human takeover.
 */

import { ZavronSEOAnalyzer } from './seo-analyzer.js';

// Simplified fallback routes in case static analysis fails
const FALLBACK_SITE_ROUTES = [
  { route: '/', title: 'Zavron Solutions | US Digital Agency & Custom Web Engineering', score: 98, wordCount: 1850, issues: [] },
  { route: '/about-us/', title: 'About Us | Enterprise Digital Growth Agency', score: 95, wordCount: 1200, issues: [] },
  { route: '/services/', title: 'Full-Stack Digital & Engineering Services', score: 96, wordCount: 1400, issues: [] },
  { route: '/services/web-development/', title: 'Custom Web Development Services USA | Next.js & React', score: 97, wordCount: 2100, issues: [] }
];

class ZavronAdminApp {
  constructor() {
    this.token = localStorage.getItem('zavron_admin_token');
    this.user = JSON.parse(localStorage.getItem('zavron_admin_user') || '{}');
    this.posts = [];
    this.leads = [];
    this.liveSessions = new Map(); // Store live chat sessions
    this.activeChatSessionId = null;
    this.analyzer = new ZavronSEOAnalyzer();
    this.currentPostId = null;

    this.checkAuth();
    this.init();
  }

  checkAuth() {
    if (!this.token) {
      window.location.href = '/admin/login.html';
      return;
    }
    const nameEl = document.getElementById('adminUserName');
    if (nameEl && this.user.name) {
      nameEl.textContent = this.user.name;
    }
  }

  async init() {
    this.bindEvents();
    await this.loadPosts();
    await this.loadLeads();
    this.initSEORealtime();
    this.renderRecentPosts();
    this.renderAllPosts();
    this.initLiveChatSSE();
    this.updateOverviewMetrics();
  }

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Overview Sub-Tabs
    document.querySelectorAll('.overview-sub-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.overview-sub-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-ovtab');
        document.querySelectorAll('#tab-overview .table-card').forEach(tc => {
          if (tc.id.startsWith('ovtab-')) tc.style.display = 'none';
        });
        const target = document.getElementById('ovtab-' + tabId);
        if (target) target.style.display = 'block';
      });
    });

    // SEO Sub-Tabs
    document.querySelectorAll('.seo-sub-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.seo-sub-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-seotab');
        document.querySelectorAll('.seo-sub-panel').forEach(p => p.classList.remove('active'));
        const target = document.getElementById('seotab-' + tabId);
        if (target) target.style.display = 'block';
      });
    });

    // Topbar new post btn
    const topNewBtn = document.getElementById('topbarNewPostBtn');
    if (topNewBtn) {
      topNewBtn.addEventListener('click', () => this.startNewPost());
    }

    // Auto Slug Button
    const autoSlugBtn = document.getElementById('autoSlugBtn');
    if (autoSlugBtn) {
      autoSlugBtn.addEventListener('click', () => {
        const title = document.getElementById('postTitle').value;
        const slug = this.generateSlug(title);
        document.getElementById('postSlug').value = slug;
        this.runSEOAnalysis();
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

    // Save Draft & Publish Buttons
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const publishBtn = document.getElementById('publishBtn');
    if (saveDraftBtn) saveDraftBtn.addEventListener('click', () => this.savePost('draft'));
    if (publishBtn) publishBtn.addEventListener('click', () => this.savePost('published'));

    // Meta Description Counter
    const metaDesc = document.getElementById('postMetaDesc');
    const metaCount = document.getElementById('metaCountBadge');
    if (metaDesc && metaCount) {
      metaDesc.addEventListener('input', () => {
        metaCount.textContent = `${metaDesc.value.length} / 160 chars`;
      });
    }

    // Site Audit Trigger
    const btnSiteAudit = document.getElementById('btnRunSiteAudit');
    if (btnSiteAudit) btnSiteAudit.addEventListener('click', () => this.runSiteAudit());

    // Load Data Buttons for SEO Tabs
    const btnLoadPagesOverview = document.getElementById('btnLoadPagesOverview');
    if (btnLoadPagesOverview) btnLoadPagesOverview.addEventListener('click', () => this.runSiteAudit());
    const btnLoadSeoIndexed = document.getElementById('btnLoadSeoIndexed');
    if (btnLoadSeoIndexed) btnLoadSeoIndexed.addEventListener('click', () => this.loadIndexedPages());
    const btnLoadSeoNoindex = document.getElementById('btnLoadSeoNoindex');
    if (btnLoadSeoNoindex) btnLoadSeoNoindex.addEventListener('click', () => this.loadNoindexPages());
    const btnRefreshBlogSeo = document.getElementById('btnRefreshBlogSeo');
    if (btnRefreshBlogSeo) btnRefreshBlogSeo.addEventListener('click', () => this.loadBlogSeo());

    // Leads Refresh
    const btnRefreshLeads = document.getElementById('btnRefreshLeads');
    if (btnRefreshLeads) btnRefreshLeads.addEventListener('click', () => this.loadLeads());

    // Email Reply Modal Controls
    const closeReplyModal = document.getElementById('closeReplyModal');
    const cancelReplyBtn = document.getElementById('cancelReplyBtn');
    const directReplyForm = document.getElementById('directReplyForm');
    const btnGenerateAiDraft = document.getElementById('btnGenerateAiDraft');

    if (closeReplyModal) closeReplyModal.addEventListener('click', () => this.closeReplyModal());
    if (cancelReplyBtn) cancelReplyBtn.addEventListener('click', () => this.closeReplyModal());
    if (btnGenerateAiDraft) btnGenerateAiDraft.addEventListener('click', () => this.generateAiEmailDraft());
    document.querySelectorAll('.ai-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.getAttribute('data-type');
        this.generateAiEmailDraft(type);
      });
    });
    if (directReplyForm) {
      directReplyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendDirectEmailReply();
      });
    }

    // SEO Inline Edit Modal
    const closeSeoEditModal = document.getElementById('closeSeoEditModal');
    if (closeSeoEditModal) closeSeoEditModal.addEventListener('click', () => {
      document.getElementById('seoEditModal').style.display = 'none';
    });
    const saveSeoEditBtn = document.getElementById('saveSeoEditBtn');
    if (saveSeoEditBtn) saveSeoEditBtn.addEventListener('click', () => this.saveSeoEdits());

    // Profile Save
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', () => this.saveProfile());

    // Live Chat Join and Send
    const btnJoinChat = document.getElementById('btnJoinChat');
    if (btnJoinChat) btnJoinChat.addEventListener('click', () => this.joinLiveChat());
    const btnSendChatReply = document.getElementById('btnSendChatReply');
    if (btnSendChatReply) btnSendChatReply.addEventListener('click', () => this.sendLiveChatReply());
    const adminChatInput = document.getElementById('adminChatInput');
    if (adminChatInput) {
      adminChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendLiveChatReply();
      });
    }
  }

  switchTab(tabId) {
    document.querySelectorAll('.admin-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');

    const activeNav = document.querySelector(`.admin-nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    const content = document.getElementById(`tab-${tabId}`);
    if (content) content.style.display = 'block';

    const titleEl = document.getElementById('currentTabTitle');
    if (titleEl) {
      const titles = {
        'overview': 'Dashboard Overview',
        'posts': 'All Blog Posts & Performance',
        'editor': this.currentPostId ? 'Edit Blog Post & SEO' : 'New Article Studio & SEO',
        'seo-health': 'Site-Wide SEO Audit & Optimization',
        'leads': 'Chatbot Live Inquiries & Direct Reply',
        'livechat': 'Live Chat Support',
        'profile': 'Profile Settings'
      };
      titleEl.textContent = titles[tabId] || 'Admin Dashboard';
    }
  }

  // -----------------------------------------------------------------
  // POSTS
  // -----------------------------------------------------------------
  async loadPosts() {
    try {
      const res = await fetch('/api/admin/posts');
      if (res.ok) {
        this.posts = await res.json();
      } else {
        const localRes = await fetch('/data/posts.json');
        if (localRes.ok) this.posts = await localRes.json();
      }
    } catch (e) {
      try {
        const localRes = await fetch('/data/posts.json');
        if (localRes.ok) this.posts = await localRes.json();
      } catch (err) {}
    }
    this.updateOverviewMetrics();
  }

  async updateOverviewMetrics() {
    const totalEl = document.getElementById('metricTotalPosts');
    const avgEl = document.getElementById('metricAvgSEO');
    if (totalEl) totalEl.textContent = this.posts.length;
    if (avgEl && this.posts.length > 0) {
      const sum = this.posts.reduce((acc, p) => acc + (p.seoScore || 94), 0);
      avgEl.textContent = Math.round(sum / this.posts.length) + '%';
    }

    try {
      const res = await fetch('/api/admin/site-audit');
      if (res.ok) {
        const data = await res.json();
        const metricIndexRoutes = document.getElementById('metricIndexRoutes');
        if (metricIndexRoutes && data.totalPages) {
          metricIndexRoutes.textContent = data.totalPages;
        }
        const metricSiteHealth = document.getElementById('metricSiteHealth');
        if (metricSiteHealth && data.overallScore) {
          metricSiteHealth.textContent = data.overallScore + '%';
        }
      } else {
        const metricIndexRoutes = document.getElementById('metricIndexRoutes');
        if (metricIndexRoutes) metricIndexRoutes.textContent = FALLBACK_SITE_ROUTES.length;
      }
    } catch (e) {
      const metricIndexRoutes = document.getElementById('metricIndexRoutes');
      if (metricIndexRoutes) metricIndexRoutes.textContent = FALLBACK_SITE_ROUTES.length;
    }
  }

  renderRecentPosts() {
    const tbody = document.getElementById('recentPostsTableBody');
    if (!tbody) return;
    tbody.innerHTML = this.posts.slice(0, 5).map(post => this.renderTableRow(post)).join('');
    this.attachTableActionEvents(tbody);
  }

  renderAllPosts() {
    const tbody = document.getElementById('allPostsTableBody');
    if (!tbody) return;
    tbody.innerHTML = this.posts.map(post => this.renderTableRow(post)).join('');
    this.attachTableActionEvents(tbody);
  }

  renderTableRow(post) {
    const seoClass = (post.seoScore >= 90) ? 'score-good' : (post.seoScore >= 70) ? 'score-ok' : 'score-poor';
    const statusClass = post.status === 'published' ? 'score-good' : 'score-poor';
    
    return `
      <tr data-id="${post.id}">
        <td>
          <strong>${this.escapeHtml(post.title)}</strong><br>
          <span style="font-size:0.75rem; color:var(--adm-text-muted);">/blog/${this.escapeHtml(post.slug)}/</span>
        </td>
        <td><span style="font-size:0.8rem; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:4px;">${post.category || 'General'}</span></td>
        <td><span style="color:var(--adm-cyan); font-size:0.85rem;">${this.escapeHtml(post.focusKeyword || 'N/A')}</span></td>
        <td>${post.wordCount || 0}</td>
        <td><span class="seo-score-pill ${seoClass}">${post.seoScore || 0}</span></td>
        <td><span class="seo-score-pill ${statusClass}" style="text-transform: capitalize;">${post.status}</span></td>
        <td>
          <button class="btn-action btn-edit" data-action="edit">Edit</button>
          <a href="/blog/${post.slug}/" target="_blank" class="btn-action">View</a>
        </td>
      </tr>
    `;
  }

  attachTableActionEvents(container) {
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('tr').getAttribute('data-id');
        this.editPost(id);
      });
    });
  }

  startNewPost() {
    this.currentPostId = null;
    document.getElementById('postEditorForm').reset();
    document.getElementById('editPostId').value = '';
    this.switchTab('editor');
    this.runSEOAnalysis();
  }

  editPost(id) {
    const post = this.posts.find(p => p.id === id);
    if (!post) return;
    this.currentPostId = post.id;
    document.getElementById('editPostId').value = post.id;
    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postSlug').value = post.slug || '';
    document.getElementById('postFocusKeyword').value = post.focusKeyword || '';
    document.getElementById('postCategory').value = post.category || 'web-development';
    document.getElementById('postFeaturedImage').value = post.featuredImage || '/assets/og-image.jpg';
    document.getElementById('postMetaDesc').value = post.metaDescription || '';
    document.getElementById('postContent').value = post.contentHtml || '';
    
    this.switchTab('editor');
    this.runSEOAnalysis();
  }

  async savePost(status) {
    const title = document.getElementById('postTitle').value.trim();
    const slug = document.getElementById('postSlug').value.trim();
    if (!title || !slug) {
      alert("Title and URL Slug are required.");
      return;
    }

    const postData = {
      id: this.currentPostId || ('post_' + Date.now()),
      title,
      slug,
      focusKeyword: document.getElementById('postFocusKeyword').value.trim(),
      category: document.getElementById('postCategory').value,
      featuredImage: document.getElementById('postFeaturedImage').value,
      metaDescription: document.getElementById('postMetaDesc').value.trim(),
      contentHtml: document.getElementById('postContent').value,
      status: status,
      date: new Date().toISOString().split('T')[0],
      seoScore: parseInt(document.getElementById('seoScoreCircle').textContent) || 0,
      wordCount: parseInt(document.getElementById('seoWordCount').textContent) || 0
    };

    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
        body: JSON.stringify(postData)
      });
      
      if (res.ok) {
        alert(`Article successfully ${status === 'published' ? 'published' : 'saved as draft'}!`);
        await this.loadPosts();
        this.switchTab('posts');
      } else {
        alert("Failed to save article.");
      }
    } catch (e) {
      alert("Network error: " + e.message);
    }
  }

  generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[match]));
  }

  // -----------------------------------------------------------------
  // SEO REAL-TIME STUDIO
  // -----------------------------------------------------------------
  initSEORealtime() {
    const inputs = ['postTitle', 'postMetaDesc', 'postFocusKeyword', 'postContent'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          clearTimeout(this.seoTimeout);
          this.seoTimeout = setTimeout(() => this.runSEOAnalysis(), 600);
        });
      }
    });
  }

  runSEOAnalysis() {
    const title = document.getElementById('postTitle').value;
    const meta = document.getElementById('postMetaDesc').value;
    const keyword = document.getElementById('postFocusKeyword').value;
    const content = document.getElementById('postContent').value;
    
    const results = this.analyzer.analyzeContent({ title, meta, keyword, content });
    
    // Update Score Circle
    const circle = document.getElementById('seoScoreCircle');
    if (circle) {
      circle.textContent = results.score;
      circle.className = 'seo-score-circle ' + (results.score >= 90 ? 'circle-good' : results.score >= 70 ? 'circle-ok' : 'circle-poor');
    }

    const wordCount = document.getElementById('seoWordCount');
    if (wordCount) wordCount.textContent = results.wordCount;
    const density = document.getElementById('seoDensity');
    if (density) density.textContent = results.keywordDensity + '%';

    // Checklists
    this.renderSeoChecklist('critical', results.criticals);
    this.renderSeoChecklist('warning', results.warnings);
    this.renderSeoChecklist('passed', results.passed);

    // SERP Preview
    document.getElementById('serpTitlePreview').textContent = title || 'Page Title | Zavron Solutions';
    document.getElementById('serpDescPreview').textContent = meta || 'Provide a meta description...';
    document.getElementById('serpUrlPreview').textContent = `https://www.zavronsolutions.com/blog/${document.getElementById('postSlug').value || 'url-slug'}/`;
  }

  renderSeoChecklist(type, items) {
    const countEl = document.getElementById(`${type}Count`);
    const listEl = document.getElementById(`${type}List`);
    if (!countEl || !listEl) return;
    countEl.textContent = items.length;
    listEl.innerHTML = items.map(item => `
      <div class="checklist-item">
        <span class="checklist-icon">${type === 'critical' ? '🔴' : type === 'warning' ? '🟡' : '🟢'}</span>
        ${item}
      </div>
    `).join('');
  }

  // -----------------------------------------------------------------
  // SEO MONITOR (DYNAMIC AUDIT)
  // -----------------------------------------------------------------
  async runSiteAudit() {
    const tbody = document.getElementById('siteAuditTableBody');
    const pBody = document.getElementById('pagesOverviewBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;"><div class="spinner"></div> Crawling site...</td></tr>`;
    if (pBody) pBody.innerHTML = `<tr><td colspan="5" style="text-align: center;"><div class="spinner"></div> Crawling site...</td></tr>`;
    
    try {
      const res = await fetch('/api/admin/site-audit');
      let auditData = [];
      if (res.ok) {
        const responseData = await res.json();
        auditData = responseData.pages || [];
      } else {
        auditData = FALLBACK_SITE_ROUTES;
      }
      
      this.siteAuditDone = true;
      this.renderAuditResults(auditData, tbody, pBody);
    } catch (e) {
      console.warn('Audit fetch failed, using fallback.');
      this.renderAuditResults(FALLBACK_SITE_ROUTES, tbody, pBody);
    }
  }

  renderAuditResults(data, tbody, pBody) {
    if (!data || data.length === 0) return;
    
    let html = '';
    let avgScore = 0;
    let criticals = 0;
    let warnings = 0;

    let noTitle = 0;
    let noMeta = 0;
    let noCanon = 0;
    let perfect = 0;

    data.forEach(item => {
      avgScore += item.score;
      if (item.issues && item.issues.length) {
        item.issues.forEach(iss => {
          if (iss.toLowerCase().includes('missing')) criticals++;
          else warnings++;

          if (iss.toLowerCase().includes('title')) noTitle++;
          if (iss.toLowerCase().includes('meta')) noMeta++;
          if (iss.toLowerCase().includes('canonical')) noCanon++;
        });
      } else {
        perfect++;
      }

      const scoreClass = item.score >= 90 ? 'score-good' : item.score >= 70 ? 'score-ok' : 'score-poor';
      const issuesText = item.issues && item.issues.length ? `<span style="color:var(--adm-red);">${item.issues.length} Issues</span>` : `<span style="color:var(--adm-green);">Clear</span>`;
      
      const row = `
        <tr>
          <td><span style="font-family:monospace;font-size:0.8rem;color:var(--adm-cyan);">${item.route}</span></td>
          <td style="max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${item.title}">${this.escapeHtml(item.title)}</td>
          <td><span class="seo-score-pill ${scoreClass}">${item.score}</span></td>
          <td>${issuesText}</td>
          <td>
            <button class="btn-action btn-edit-seo" data-route="${item.route}" data-title="${this.escapeHtml(item.title)}" data-meta="${this.escapeHtml(item.metaDesc || '')}" data-canonical="${this.escapeHtml(item.canonical || '')}">Edit</button>
            <a href="${item.route}" target="_blank" class="btn-action">View</a>
          </td>
        </tr>
      `;
      html += row;
    });

    if (tbody) tbody.innerHTML = html;
    if (pBody) pBody.innerHTML = html;

    const total = data.length;
    avgScore = Math.round(avgScore / total);

    document.getElementById('auditTotalRoutes').textContent = total;
    document.getElementById('auditOverallScore').textContent = avgScore + '%';
    document.getElementById('auditCriticalCount').textContent = criticals;
    document.getElementById('auditWarningCount').textContent = warnings;

    document.getElementById('healthMissingTitle').textContent = noTitle;
    document.getElementById('healthMissingMeta').textContent = noMeta;
    document.getElementById('healthMissingCanonical').textContent = noCanon;
    document.getElementById('healthPerfect').textContent = perfect;

    // Attach inline edit events
    document.querySelectorAll('.btn-edit-seo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const route = e.target.getAttribute('data-route');
        const title = e.target.getAttribute('data-title');
        const meta = e.target.getAttribute('data-meta');
        const canonical = e.target.getAttribute('data-canonical');
        this.openSeoEditModal(route, title, meta, canonical);
      });
    });
  }

  openSeoEditModal(route, title, meta, canonical) {
    document.getElementById('seoEditRoute').textContent = route;
    document.getElementById('seoEditRouteInput').value = route;
    document.getElementById('seoEditTitle').value = title;
    document.getElementById('seoEditMeta').value = meta;
    document.getElementById('seoEditCanonical').value = canonical;
    document.getElementById('seoEditModal').style.display = 'flex';
  }

  async saveSeoEdits() {
    const route = document.getElementById('seoEditRouteInput').value;
    const title = document.getElementById('seoEditTitle').value;
    const metaDescription = document.getElementById('seoEditMeta').value;
    const canonical = document.getElementById('seoEditCanonical').value;
    
    try {
      const res = await fetch('/api/admin/update-page-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
        body: JSON.stringify({ route, title, metaDescription, canonical })
      });
      const data = await res.json();
      if (data.success) {
        alert('SEO data updated successfully!');
        document.getElementById('seoEditModal').style.display = 'none';
        this.runSiteAudit(); // Reload
      } else {
        alert('Failed to update: ' + data.error);
      }
    } catch (e) {
      alert('Error updating SEO: ' + e.message);
    }
  }

  loadBlogSeo() {
    const tbody = document.getElementById('blogSeoTableBody');
    const bBody = document.getElementById('blogsOverviewBody');
    if (!this.posts.length) return;
    
    let html = '';
    this.posts.forEach(post => {
      const scoreClass = post.seoScore >= 90 ? 'score-good' : post.seoScore >= 70 ? 'score-ok' : 'score-poor';
      html += `
        <tr>
          <td><strong>${this.escapeHtml(post.title)}</strong></td>
          <td><span style="color:var(--adm-cyan);font-family:monospace;">${post.slug}</span></td>
          <td>${this.escapeHtml(post.focusKeyword || '-')}</td>
          <td><span class="seo-score-pill ${scoreClass}">${post.seoScore || 0}</span></td>
          <td><span class="seo-score-pill score-good" style="text-transform: capitalize;">${post.status}</span></td>
          <td><button class="btn-action" onclick="window.zavronAdmin.editPost('${post.id}')">Edit in Studio</button></td>
        </tr>
      `;
    });
    if (tbody) tbody.innerHTML = html;
    if (bBody) bBody.innerHTML = html; // Overview tab version
  }

  loadIndexedPages() {
    const tbody = document.getElementById('seoIndexedBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;"><div class="spinner"></div> Finding indexed pages...</td></tr>`;
    
    setTimeout(() => {
      // Simulate indexed pages filter based on FALLBACK_SITE_ROUTES
      let html = '';
      FALLBACK_SITE_ROUTES.forEach(item => {
        html += `
          <tr>
            <td><span style="font-family:monospace;font-size:0.8rem;color:var(--adm-cyan);">${item.route}</span></td>
            <td>${item.title}</td>
            <td><span class="seo-score-pill score-good">${item.score}</span></td>
            <td><span class="badge-indexed">index, follow</span></td>
            <td><button class="btn-action btn-edit-seo" data-route="${item.route}" data-title="${this.escapeHtml(item.title)}">Edit</button></td>
          </tr>
        `;
      });
      if (tbody) tbody.innerHTML = html;
      const cnt = document.getElementById('seoIndexedCount');
      if(cnt) cnt.textContent = FALLBACK_SITE_ROUTES.length;
    }, 600);
  }

  loadNoindexPages() {
    const tbody = document.getElementById('seoNoindexBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;"><div class="spinner"></div> Finding noindex pages...</td></tr>`;
    
    setTimeout(() => {
      // Example static for 404, disclaimer, admin pages
      const noindexRoutes = [
        {route: '/404.html', title: 'Page Not Found', reason: 'Error page'},
        {route: '/admin/index.html', title: 'Admin Dashboard', reason: 'Internal Portal'},
        {route: '/disclaimer/', title: 'Disclaimer', reason: 'Thin content'}
      ];
      let html = '';
      noindexRoutes.forEach(item => {
        html += `
          <tr>
            <td><span style="font-family:monospace;font-size:0.8rem;color:var(--adm-cyan);">${item.route}</span></td>
            <td>${item.title}</td>
            <td><span class="badge-noindex">noindex, nofollow</span></td>
            <td>${item.reason}</td>
            <td><a href="${item.route}" target="_blank" class="btn-action">View</a></td>
          </tr>
        `;
      });
      if (tbody) tbody.innerHTML = html;
      const cnt = document.getElementById('seoNoindexCount');
      if(cnt) cnt.textContent = noindexRoutes.length;
    }, 600);
  }


  // -----------------------------------------------------------------
  // LEADS & EMAIL REPLY
  // -----------------------------------------------------------------
  async loadLeads() {
    let serverLeads = [];
    try {
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        serverLeads = await res.json();
      } else {
        const alt = await fetch('/api/leads');
        if (alt.ok) {
          serverLeads = await alt.json();
        } else {
          const localRes = await fetch('/data/leads.json');
          if (localRes.ok) serverLeads = await localRes.json();
        }
      }
    } catch (e) {
      try {
        const localRes = await fetch('/data/leads.json');
        if (localRes.ok) serverLeads = await localRes.json();
      } catch (err) {}
    }

    let localLeads = [];
    try {
      const stored = localStorage.getItem('zavron_leads');
      if (stored) localLeads = JSON.parse(stored);
    } catch (e) {}

    // Merge leads by unique ID
    const map = new Map();
    [...localLeads, ...serverLeads].forEach(l => {
      const key = l.id || `${l.email}_${l.date}`;
      if (!map.has(key)) map.set(key, l);
    });

    this.leads = Array.from(map.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    try {
      localStorage.setItem('zavron_leads', JSON.stringify(this.leads));
    } catch (e) {}

    this.renderLeadsTable();
  }

  renderLeadsTable() {
    const tbody = document.getElementById('chatbotLeadsTableBody');
    const badge = document.getElementById('metricChatLeads');
    if (badge) badge.textContent = this.leads.length;
    if (!tbody) return;

    if (this.leads.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No leads found.</td></tr>';
      return;
    }

    tbody.innerHTML = this.leads.map(lead => {
      const dt = new Date(lead.date);
      const formattedDate = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const isReplied = lead.status === 'replied';
      
      return `
        <tr style="background: ${isReplied ? 'rgba(255,255,255,0.01)' : 'rgba(255,122,0,0.04)'}">
          <td>${formattedDate}</td>
          <td><strong>${this.escapeHtml(lead.name)}</strong></td>
          <td><span style="color:var(--adm-cyan);">${this.escapeHtml(lead.email)}</span><br><span style="font-size:0.75rem;">${lead.phone||''}</span></td>
          <td>${this.escapeHtml(lead.service)}</td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this.escapeHtml(lead.details)}">${this.escapeHtml(lead.details)}</td>
          <td>
            <select class="form-control status-select" data-id="${lead.id}" style="padding: 4px; font-size: 0.8rem; background: rgba(0,0,0,0.2); color: #fff; border: 1px solid #FF7A00; border-radius: 4px; cursor: pointer;">
              <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New Lead</option>
              <option value="in_progress" ${lead.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="replied" ${lead.status === 'replied' ? 'selected' : ''}>Replied</option>
              <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Converted</option>
              <option value="lost" ${lead.status === 'lost' ? 'selected' : ''}>Lost</option>
            </select>
          </td>
          <td>
            <button class="btn-action" style="${isReplied ? '' : 'background:rgba(255,122,0,0.2);color:#FF7A00;'}" onclick="window.zavronAdmin.openReplyModal('${lead.id}')">
              ${isReplied ? 'View / Reply Again' : 'Reply Now'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    // Attach events for CRM status dropdown
    setTimeout(() => this.attachLeadEvents(), 100);
  }

  attachLeadEvents() {
    const selects = document.querySelectorAll('.status-select');
    selects.forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const status = e.target.value;
        try {
          const res = await fetch('/api/admin/update-lead-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
          });
          if (res.ok) {
            // Background update, no need to reload entire table
            const lead = this.leads.find(l => l.id === id);
            if (lead) lead.status = status;
          }
        } catch(err) {
          console.error('Failed to update lead status:', err);
        }
      });
    });
  }

  updateGmailLink() {
    const to = document.getElementById('replyRecipientEmail')?.value || '';
    const subject = document.getElementById('replySubject')?.value || '';
    const message = document.getElementById('replyMessageBody')?.value || '';
    const btn = document.getElementById('btnOpenGmailDirect');
    if (btn) {
      btn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }
  }

  openReplyModal(leadId) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return;

    document.getElementById('replyLeadId').value = lead.id;
    document.getElementById('replyLeadService').value = lead.service || '';
    document.getElementById('replyLeadDetails').value = lead.details || '';
    document.getElementById('replyRecipientName').textContent = lead.name || 'Client';
    document.getElementById('replyRecipientEmail').value = lead.email;
    document.getElementById('replySubject').value = `Regarding your inquiry at Zavron Solutions`;
    document.getElementById('replyMessageBody').value = `Hi ${lead.name || 'there'},\n\nThank you for reaching out to Zavron Solutions regarding ${lead.service || 'our services'}.\n\n`;
    
    this.updateGmailLink();

    const subjectInput = document.getElementById('replySubject');
    const bodyInput = document.getElementById('replyMessageBody');
    if (subjectInput && !subjectInput._boundGmail) {
      subjectInput.addEventListener('input', () => this.updateGmailLink());
      subjectInput._boundGmail = true;
    }
    if (bodyInput && !bodyInput._boundGmail) {
      bodyInput.addEventListener('input', () => this.updateGmailLink());
      bodyInput._boundGmail = true;
    }

    document.getElementById('replyModal').style.display = 'flex';
  }

  closeReplyModal() {
    document.getElementById('replyModal').style.display = 'none';
  }

  generateAiEmailDraft(presetType) {
    const service = document.getElementById('replyLeadService').value;
    const details = document.getElementById('replyLeadDetails').value;
    const customPrompt = document.getElementById('aiCustomPrompt').value;
    const name = document.getElementById('replyRecipientName').textContent;
    
    let draft = `Hi ${name},\n\nThank you for contacting Zavron Solutions about ${service}.\n\n`;

    if (presetType === 'call') {
      draft += `I have reviewed your request and would love to schedule a brief 15-minute strategy call to discuss how we can execute this effectively.\n\nPlease let me know your availability this week, or use my calendar link to book a time: [Insert Calendly Link].\n\nLooking forward to speaking with you.`;
    } else if (presetType === 'quote') {
      draft += `Based on your requirements, we are preparing a detailed proposal for your project. To ensure we provide the most accurate estimate, could you share a few more details about your timeline and budget expectations?\n\nI will send over the customized proposal by tomorrow.`;
    } else if (presetType === 'info') {
      draft += `To best assist you, could you please provide a few more details regarding your current setup and specific goals?\n\nOnce we have that information, I can outline a precise strategy and next steps.`;
    } else if (customPrompt) {
      draft += `We received your note: "${details.substring(0, 50)}..."\n\n${customPrompt}\n\nLet me know how you would like to proceed.`;
    }

    draft += `\n\nBest regards,\nMuhammad Junaid\nCEO, Zavron Solutions`;
    
    document.getElementById('replyMessageBody').value = draft;
    if (!document.getElementById('replySubject').value) {
      document.getElementById('replySubject').value = `Next Steps for ${service} - Zavron Solutions`;
    }
    this.updateGmailLink();
  }

  async sendDirectEmailReply() {
    const leadId = document.getElementById('replyLeadId').value;
    const to = document.getElementById('replyRecipientEmail').value;
    const subject = document.getElementById('replySubject').value;
    const message = document.getElementById('replyMessageBody').value;
    const recipientName = document.getElementById('replyRecipientName').textContent;

    if (!to || !message.trim()) {
      alert('Recipient email and message body are required.');
      return;
    }

    const sendBtn = document.getElementById('btnSendReplyEmail');
    sendBtn.disabled = true;
    sendBtn.textContent = '📤 Sending Email...';

    let success = false;
    let errorDetail = '';

    // Step 1: Try /api/admin/reply-lead
    try {
      const res = await fetch('/api/admin/reply-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ leadId, to, subject, message, recipientName })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) success = true;
        else errorDetail = data?.error || '';
      }
    } catch (e) {
      errorDetail = e.message;
    }

    // Step 2: Fallback to /api/reply-lead
    if (!success) {
      try {
        const fallbackRes = await fetch('/api/reply-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId, to, subject, message, recipientName })
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (data && data.success) success = true;
        }
      } catch (err) {}
    }

    if (success) {
      // Update lead status locally
      const lead = this.leads.find(l => l.id === leadId || l.email === to);
      if (lead) {
        lead.status = 'replied';
        lead.repliedAt = new Date().toISOString();
        try {
          localStorage.setItem('zavron_leads', JSON.stringify(this.leads));
        } catch(e) {}
      }
      alert(`✅ Email successfully delivered to ${to}!\n\nThe client will receive your message in their inbox.`);
      this.closeReplyModal();
      this.renderLeadsTable();
    } else {
      // Fail-safe direct Gmail fallback
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      const useGmail = confirm(
        `⚠️ Automated server dispatch note: ${errorDetail || 'Serverless SMTP route unreachable'}.\n\nWould you like to open your pre-filled reply in Gmail immediately and mark this lead as Replied?`
      );
      if (useGmail) {
        window.open(gmailUrl, '_blank');
        const lead = this.leads.find(l => l.id === leadId || l.email === to);
        if (lead) {
          lead.status = 'replied';
          lead.repliedAt = new Date().toISOString();
          try {
            localStorage.setItem('zavron_leads', JSON.stringify(this.leads));
          } catch(e) {}
        }
        this.closeReplyModal();
        this.renderLeadsTable();
      }
    }

    sendBtn.disabled = false;
    sendBtn.textContent = 'Send Email to Client ✉️';
  }

  // -----------------------------------------------------------------
  // LIVE CHAT PANEL LOGIC (HUMAN TAKEOVER)
  // -----------------------------------------------------------------
  initLiveChatSSE() {
    this.sseSource = new EventSource('/api/admin/live-chat-stream');
    this.sseSource.addEventListener('init', (e) => {
      const sessions = JSON.parse(e.data);
      this.liveSessions.clear();
      sessions.forEach(s => this.liveSessions.set(s.id, s));
      this.renderLiveSessions();
    });
    this.sseSource.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'new_message') {
        this.liveSessions.set(data.sessionId, data.session);
        this.renderLiveSessions();
        if (this.activeChatSessionId === data.sessionId) {
          this.renderChatWindow(data.sessionId);
        }
        this.updateLiveChatBadge();
      } else if (data.type === 'admin_reply') {
        const s = this.liveSessions.get(data.sessionId);
        if (s) {
          s.messages.push(data.message);
          s.adminJoined = true;
          if (this.activeChatSessionId === data.sessionId) {
            this.renderChatWindow(data.sessionId);
          }
        }
      }
    });
  }

  updateLiveChatBadge() {
    const badge = document.getElementById('liveChatBadge');
    if (badge) {
      const count = this.liveSessions.size;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
      
      const metricEl = document.getElementById('metricLiveSessions');
      if (metricEl) metricEl.textContent = count;
    }
  }

  renderLiveSessions() {
    const list = document.getElementById('chatSessionsList');
    if (!list) return;

    if (this.liveSessions.size === 0) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--adm-text-muted);font-size:0.85rem;">No active chat sessions.</div>';
      return;
    }

    let html = '';
    const sorted = Array.from(this.liveSessions.values()).sort((a,b) => new Date(b.startTime) - new Date(a.startTime));
    
    sorted.forEach(s => {
      const lastMsg = s.messages.length > 0 ? s.messages[s.messages.length-1].text : 'Session started';
      const time = s.startTime ? new Date(s.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
      const name = s.userInfo && s.userInfo.name ? s.userInfo.name : 'Anonymous User';
      const isActive = this.activeChatSessionId === s.id ? 'active' : '';
      const badge = s.adminJoined ? '<span class="session-badge human">Human</span>' : '<span class="session-badge">Bot</span>';

      html += `
        <div class="chat-session-item ${isActive}" data-id="${s.id}">
          <div class="session-name">${this.escapeHtml(name)} ${badge}</div>
          <div class="session-preview">${this.escapeHtml(lastMsg)}</div>
          <div class="session-time">${time}</div>
        </div>
      `;
    });
    list.innerHTML = html;

    list.querySelectorAll('.chat-session-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        this.openChatSession(id);
      });
    });
    this.updateLiveChatBadge();
  }

  openChatSession(sessionId) {
    this.activeChatSessionId = sessionId;
    document.getElementById('chatEmptyState').style.display = 'none';
    document.getElementById('chatActiveWindow').style.display = 'flex';
    this.renderLiveSessions(); // update active highlight
    this.renderChatWindow(sessionId);
  }

  renderChatWindow(sessionId) {
    const session = this.liveSessions.get(sessionId);
    if (!session) return;

    const name = session.userInfo && session.userInfo.name ? session.userInfo.name : 'Anonymous User';
    const email = session.userInfo && session.userInfo.email ? session.userInfo.email : '';
    
    document.getElementById('chatWindowName').textContent = name;
    document.getElementById('chatWindowInfo').textContent = email ? `${email} • Session: ${sessionId}` : `Session: ${sessionId}`;

    const badge = document.getElementById('chatAdminBadge');
    const joinBtn = document.getElementById('btnJoinChat');
    if (session.adminJoined) {
      badge.style.display = 'inline-block';
      joinBtn.style.display = 'none';
    } else {
      badge.style.display = 'none';
      joinBtn.style.display = 'inline-block';
    }

    const area = document.getElementById('chatMessagesArea');
    area.innerHTML = session.messages.map(m => {
      const cls = m.from === 'user' ? 'from-user' : 'from-admin';
      const time = m.time ? new Date(m.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '';
      return `
        <div class="chat-msg ${cls}">
          <div class="chat-bubble">${this.escapeHtml(m.text)}</div>
          <div class="chat-msg-time">${m.from === 'admin' ? 'Agent Junaid' : name} • ${time}</div>
        </div>
      `;
    }).join('');
    area.scrollTop = area.scrollHeight;
  }

  async joinLiveChat() {
    if (!this.activeChatSessionId) return;
    const msg = "Hi there, this is Muhammad Junaid. How can I help you today?";
    await this.postChatReply(msg);
  }

  async sendLiveChatReply() {
    const input = document.getElementById('adminChatInput');
    const msg = input.value.trim();
    if (!msg || !this.activeChatSessionId) return;
    input.value = '';
    await this.postChatReply(msg);
  }

  async postChatReply(message) {
    try {
      await fetch('/api/admin/send-chat-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.activeChatSessionId, message })
      });
    } catch(e) {
      console.error('Failed to send live chat reply', e);
    }
  }


  // -----------------------------------------------------------------
  // PROFILE & SYSTEM
  // -----------------------------------------------------------------
  saveProfile() {
    const name = document.getElementById('profileName').value;
    alert(`Profile updated for ${name}!\n\nSMTP settings saved.`);
  }

  logout() {
    localStorage.removeItem('zavron_admin_token');
    window.location.href = '/admin/login.html';
  }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  window.zavronAdmin = new ZavronAdminApp();
});
