/**
 * ZAVRON SOLUTIONS — ADMIN DASHBOARD & REAL-TIME SEO STUDIO
 * Comprehensive blog post management, in-dashboard direct email reply with AI assistant,
 * pinpoint real-time SEO scoring, and deep site-wide SEO auditing.
 */

import { ZavronSEOAnalyzer } from './seo-analyzer.js';

class ZavronAdminApp {
  constructor() {
    this.token = localStorage.getItem('zavron_admin_token');
    this.user = JSON.parse(localStorage.getItem('zavron_admin_user') || '{}');
    this.posts = [];
    this.leads = [];
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
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Post Search & Category Filter
    const searchInput = document.getElementById('postSearchInput');
    const categoryFilter = document.getElementById('postFilterCategory');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterPosts());
    }
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.filterPosts());
    }

    // Save Draft & Publish Buttons
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const publishBtn = document.getElementById('publishBtn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => this.savePost('draft'));
    }
    if (publishBtn) {
      publishBtn.addEventListener('click', () => this.savePost('published'));
    }

    // Editor Toolbar
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        this.insertTag(tag);
      });
    });

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
    if (btnSiteAudit) {
      btnSiteAudit.addEventListener('click', () => this.runSiteAudit());
    }

    // Leads Refresh
    const btnRefreshLeads = document.getElementById('btnRefreshLeads');
    if (btnRefreshLeads) {
      btnRefreshLeads.addEventListener('click', () => this.loadLeads());
    }

    // Email Reply Modal Controls
    const closeReplyModal = document.getElementById('closeReplyModal');
    const cancelReplyBtn = document.getElementById('cancelReplyBtn');
    const directReplyForm = document.getElementById('directReplyForm');
    const btnGenerateAiDraft = document.getElementById('btnGenerateAiDraft');

    if (closeReplyModal) closeReplyModal.addEventListener('click', () => this.closeReplyModal());
    if (cancelReplyBtn) cancelReplyBtn.addEventListener('click', () => this.closeReplyModal());

    if (btnGenerateAiDraft) {
      btnGenerateAiDraft.addEventListener('click', () => this.generateAiEmailDraft());
    }

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
        'leads': 'Chatbot Live Inquiries & Direct Reply'
      };
      titleEl.textContent = titles[tabId] || 'Admin Dashboard';
    }

    if (tabId === 'seo-health' && !this.siteAuditDone) {
      this.runSiteAudit();
    }
    if (tabId === 'leads') {
      this.loadLeads();
    }
  }

  // -----------------------------------------------------------------
  // BLOG POSTS DATA & CRUD
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

    // Update Overview Stats
    const totalEl = document.getElementById('metricTotalPosts');
    const pubEl = document.getElementById('metricPublished');
    const avgEl = document.getElementById('metricAvgSEO');

    if (totalEl) totalEl.textContent = this.posts.length;
    if (pubEl) pubEl.textContent = this.posts.filter(p => p.status === 'published').length;
    if (avgEl && this.posts.length > 0) {
      const sum = this.posts.reduce((acc, p) => acc + (p.seoScore || 88), 0);
      avgEl.textContent = Math.round(sum / this.posts.length) + '%';
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

    if (this.posts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--adm-text-muted);">No blog posts found. Click "+ Add New Article" to write your first post.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.posts.map(post => this.renderTableRow(post, true)).join('');
    this.attachTableActionEvents(tbody);
  }

  renderTableRow(post, showDelete = false) {
    const score = post.seoScore || 88;
    const scoreClass = score >= 80 ? 'score-excellent' : (score >= 60 ? 'score-good' : 'score-poor');
    const statusBadge = post.status === 'published' ? '<span class="badge-status badge-published">Published</span>' : '<span class="badge-status badge-draft">Draft</span>';
    const words = post.contentHtml ? post.contentHtml.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length : (post.readingTime ? parseInt(post.readingTime) * 200 : 850);

    return `
      <tr data-id="${post.id || post.slug}">
        <td>
          <strong style="color: #FFFFFF;">${this.escapeHtml(post.title)}</strong>
          <div style="font-size: 0.75rem; color: var(--adm-cyan); margin-top: 2px;">/blog/${post.slug}/</div>
        </td>
        <td><span style="font-size: 0.8rem; text-transform: capitalize; background: rgba(0,210,255,0.08); padding: 3px 8px; border-radius: 4px; color: #7DD3FC;">${(post.category || 'General').replace(/-/g, ' ')}</span></td>
        <td><span style="color: var(--adm-text); font-weight: 600;">${post.focusKeyword || '—'}</span></td>
        <td><span style="font-size: 0.82rem; color: var(--adm-text-muted);">${words} words</span></td>
        <td><span class="seo-score-pill ${scoreClass}">${score}/100</span></td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <a href="/blog/${post.slug}/" target="_blank" class="btn-adm btn-adm-secondary" style="padding: 4px 8px; font-size: 0.75rem;">View</a>
            <button class="btn-adm btn-adm-secondary edit-post-btn" data-slug="${post.slug}" style="padding: 4px 8px; font-size: 0.75rem; color: var(--adm-cyan);">Edit</button>
            ${showDelete ? `<button class="btn-adm btn-adm-secondary delete-post-btn" data-slug="${post.slug}" style="padding: 4px 8px; font-size: 0.75rem; color: var(--adm-red);">Delete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  attachTableActionEvents(container) {
    container.querySelectorAll('.edit-post-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-slug');
        this.editPost(slug);
      });
    });

    container.querySelectorAll('.delete-post-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const slug = btn.getAttribute('data-slug');
        if (confirm(`Are you sure you want to remove the article "${slug}"?`)) {
          await this.deletePost(slug);
        }
      });
    });
  }

  filterPosts() {
    const term = (document.getElementById('postSearchInput')?.value || '').toLowerCase();
    const cat = document.getElementById('postFilterCategory')?.value || 'all';

    const filtered = this.posts.filter(p => {
      const matchTerm = (p.title || '').toLowerCase().includes(term) || (p.focusKeyword || '').toLowerCase().includes(term) || (p.category || '').toLowerCase().includes(term);
      const matchCat = cat === 'all' || p.category === cat;
      return matchTerm && matchCat;
    });

    const tbody = document.getElementById('allPostsTableBody');
    if (tbody) {
      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--adm-text-muted);">No matching articles found.</td></tr>`;
      } else {
        tbody.innerHTML = filtered.map(post => this.renderTableRow(post, true)).join('');
        this.attachTableActionEvents(tbody);
      }
    }
  }

  startNewPost() {
    this.currentPostId = null;
    document.getElementById('editPostId').value = '';
    document.getElementById('postTitle').value = '';
    document.getElementById('postSlug').value = '';
    document.getElementById('postFocusKeyword').value = '';
    document.getElementById('postCategory').value = 'web-development';
    document.getElementById('postFeaturedImage').value = '/assets/og-image.jpg';
    document.getElementById('postMetaDesc').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('editorTitle').textContent = 'Write New Article & Optimize SEO';

    this.switchTab('editor');
    this.runSEOAnalysis();
  }

  editPost(slug) {
    const post = this.posts.find(p => p.slug === slug);
    if (!post) return;

    this.currentPostId = post.id || post.slug;
    document.getElementById('editPostId').value = this.currentPostId;
    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postSlug').value = post.slug || '';
    document.getElementById('postFocusKeyword').value = post.focusKeyword || '';
    document.getElementById('postCategory').value = post.category || 'web-development';
    document.getElementById('postFeaturedImage').value = post.featuredImage || '/assets/og-image.jpg';
    document.getElementById('postMetaDesc').value = post.metaDescription || '';
    document.getElementById('postContent').value = post.contentHtml || `<h2>Overview</h2><p>${post.metaDescription || ''}</p>`;
    document.getElementById('editorTitle').textContent = `Editing: ${post.title.slice(0, 35)}...`;

    this.switchTab('editor');
    this.runSEOAnalysis();
  }

  async deletePost(slug) {
    try {
      await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' });
      this.posts = this.posts.filter(p => p.slug !== slug);
      this.renderRecentPosts();
      this.renderAllPosts();
    } catch (e) {
      this.posts = this.posts.filter(p => p.slug !== slug);
      this.renderRecentPosts();
      this.renderAllPosts();
    }
  }

  // -----------------------------------------------------------------
  // REAL-TIME PINPOINT SEO STUDIO
  // -----------------------------------------------------------------
  initSEORealtime() {
    const inputs = ['postTitle', 'postSlug', 'postFocusKeyword', 'postMetaDesc', 'postContent', 'postFeaturedImage'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.runSEOAnalysis());
      }
    });
    this.runSEOAnalysis();
  }

  runSEOAnalysis() {
    const data = {
      title: document.getElementById('postTitle')?.value || '',
      slug: document.getElementById('postSlug')?.value || '',
      focusKeyword: document.getElementById('postFocusKeyword')?.value || '',
      metaDescription: document.getElementById('postMetaDesc')?.value || '',
      contentHtml: document.getElementById('postContent')?.value || '',
      featuredImage: document.getElementById('postFeaturedImage')?.value || ''
    };

    const report = this.analyzer.analyze(data);
    this.updateSEOPanel(report);
  }

  updateSEOPanel(report) {
    const circle = document.getElementById('seoScoreCircle');
    const rating = document.getElementById('seoScoreRating');
    const summary = document.getElementById('seoScoreSummary');
    const badge = document.getElementById('seoScoreStatusBadge');

    if (circle) {
      circle.textContent = report.score;
      circle.className = `seo-score-circle circle-${report.status}`;
    }

    if (rating) {
      rating.textContent = `Score: ${report.score} / 100`;
    }

    if (summary) {
      if (report.score >= 80) {
        summary.textContent = '🌟 Excellent! Optimized to dominate Google page 1 rankings.';
      } else if (report.score >= 60) {
        summary.textContent = '👍 Good standing. Address the critical checklist items below to hit 90+ score.';
      } else {
        summary.textContent = '⚠️ Critical optimizations missing. Search crawlers may penalize indexing.';
      }
    }

    if (badge) {
      badge.textContent = report.status.toUpperCase();
      badge.className = `seo-score-pill score-${report.status}`;
    }

    const wc = document.getElementById('seoWordCount');
    const kd = document.getElementById('seoDensity');
    const hc = document.getElementById('seoHeadingCount');
    const h2Count = (document.getElementById('postContent')?.value.match(/<h2[^>]*>/gi) || []).length;

    if (wc) wc.textContent = `${report.wordCount} words`;
    if (kd) kd.textContent = `${report.keywordDensity}%`;
    if (hc) hc.textContent = `${h2Count} H2s`;

    this.renderChecklistGroup('critical', report.checks.critical);
    this.renderChecklistGroup('warning', report.checks.warning);
    this.renderChecklistGroup('passed', report.checks.passed);

    const serpTitle = document.getElementById('serpTitlePreview');
    const serpUrl = document.getElementById('serpUrlPreview');
    const serpDesc = document.getElementById('serpDescPreview');

    if (serpTitle) serpTitle.textContent = report.serpPreview.title;
    if (serpUrl) serpUrl.textContent = report.serpPreview.url;
    if (serpDesc) serpDesc.textContent = report.serpPreview.description;
  }

  renderChecklistGroup(type, items) {
    const listEl = document.getElementById(`${type}List`);
    const countEl = document.getElementById(`${type}Count`);

    if (countEl) countEl.textContent = items.length;
    if (!listEl) return;

    if (items.length === 0) {
      listEl.innerHTML = `<div style="font-size: 0.75rem; color: var(--adm-text-muted); padding: 4px;">None detected. Passed all tests!</div>`;
      return;
    }

    listEl.innerHTML = items.map((item, idx) => `
      <div class="check-item item-${type}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2px;">
          <div class="check-item-head">${this.escapeHtml(item.title)}</div>
          <span style="font-size: 0.68rem; color: var(--adm-cyan); background: rgba(0,210,255,0.1); padding: 2px 6px; border-radius: 4px;">${this.escapeHtml(item.location || item.category)}</span>
        </div>
        <div class="check-item-detail">${this.escapeHtml(item.detail)}</div>
        ${item.action ? `<div style="margin-top: 4px; font-size: 0.74rem; color: #FCD34D;"><strong>👉 Recommendation:</strong> ${this.escapeHtml(item.action)}</div>` : ''}
        ${item.fixSnippet ? `
          <div class="check-item-action">
            <button type="button" class="btn-seo-fix" data-fix="${encodeURIComponent(item.fixSnippet)}" data-cat="${item.category}">
              ⚡ 1-Click Apply Suggestion
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');

    // Attach 1-Click Fix Handlers
    listEl.querySelectorAll('.btn-seo-fix').forEach(btn => {
      btn.addEventListener('click', () => {
        const snippet = decodeURIComponent(btn.getAttribute('data-fix'));
        const cat = btn.getAttribute('data-cat');
        this.applySEOSuggestion(cat, snippet);
      });
    });
  }

  applySEOSuggestion(category, snippet) {
    if (category === 'Title') {
      document.getElementById('postTitle').value = snippet;
    } else if (category === 'Meta Description') {
      document.getElementById('postMetaDesc').value = snippet;
    } else {
      // Append or prepend to content
      const contentEl = document.getElementById('postContent');
      contentEl.value = snippet + '\n\n' + contentEl.value;
    }
    this.runSEOAnalysis();
  }

  // -----------------------------------------------------------------
  // POST SAVING & PUBLISHING
  // -----------------------------------------------------------------
  async savePost(status = 'published') {
    const title = document.getElementById('postTitle').value.trim();
    const slug = document.getElementById('postSlug').value.trim() || this.generateSlug(title);
    const focusKeyword = document.getElementById('postFocusKeyword').value.trim();
    const category = document.getElementById('postCategory').value;
    const featuredImage = document.getElementById('postFeaturedImage').value.trim();
    const metaDescription = document.getElementById('postMetaDesc').value.trim();
    const contentHtml = document.getElementById('postContent').value.trim();

    if (!title || !slug || !metaDescription) {
      alert('Please provide Title, URL Slug, and Meta Description before proceeding.');
      return;
    }

    const report = this.analyzer.analyze({ title, slug, focusKeyword, metaDescription, contentHtml, featuredImage });

    const postPayload = {
      id: slug,
      title,
      slug,
      focusKeyword,
      category,
      type: 'service',
      featuredImage,
      metaDescription,
      contentHtml,
      readingTime: `${Math.max(3, Math.ceil(report.wordCount / 200))} min read`,
      author: 'Muhammad Junaid',
      authorRole: 'CEO & Founder',
      date: new Date().toISOString().split('T')[0],
      status,
      seoScore: report.score
    };

    const publishBtn = document.getElementById('publishBtn');
    publishBtn.disabled = true;
    publishBtn.textContent = 'Publishing Live...';

    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(postPayload)
      });

      const resData = await res.json();
      if (resData.success) {
        alert(`🎉 Article successfully ${status === 'published' ? 'published live' : 'saved as draft'} with SEO Score ${report.score}/100!`);
        await this.loadPosts();
        this.renderRecentPosts();
        this.renderAllPosts();
        this.switchTab('posts');
      } else {
        alert('Server response: ' + (resData.error || 'Failed to save post.'));
      }
    } catch (err) {
      const existingIdx = this.posts.findIndex(p => p.slug === slug);
      if (existingIdx >= 0) {
        this.posts[existingIdx] = postPayload;
      } else {
        this.posts.unshift(postPayload);
      }
      alert(`✓ Article saved locally with SEO Score ${report.score}/100!`);
      this.renderRecentPosts();
      this.renderAllPosts();
      this.switchTab('posts');
    } finally {
      publishBtn.disabled = false;
      publishBtn.textContent = 'Publish Live Article 🚀';
    }
  }

  // -----------------------------------------------------------------
  // CHATBOT LEADS & DIRECT EMAIL REPLY WITH AI
  // -----------------------------------------------------------------
  async loadLeads() {
    try {
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        this.leads = await res.json();
      } else {
        const localRes = await fetch('/data/leads.json');
        if (localRes.ok) this.leads = await localRes.json();
      }
    } catch (e) {
      try {
        const localRes = await fetch('/data/leads.json');
        if (localRes.ok) this.leads = await localRes.json();
      } catch (err) {}
    }

    const leadCountEl = document.getElementById('metricChatLeads');
    if (leadCountEl) leadCountEl.textContent = this.leads.length;

    this.renderLeadsTable();
  }

  renderLeadsTable() {
    const tbody = document.getElementById('chatbotLeadsTableBody');
    if (!tbody) return;

    if (this.leads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--adm-text-muted);">No inquiries received yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.leads.map(lead => {
      const dateStr = new Date(lead.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      let statusBadge = '<span class="badge-status badge-published">New Lead</span>';
      if (lead.status === 'replied') {
        statusBadge = '<span class="badge-status" style="background:rgba(16,185,129,0.2);color:#34D399;border:1px solid rgba(16,185,129,0.4);">✓ Replied</span>';
      } else if (lead.status === 'followed_up') {
        statusBadge = '<span class="badge-status badge-draft">Followed Up</span>';
      }

      return `
        <tr data-id="${lead.id}">
          <td style="font-size:0.8rem; color:var(--adm-text-muted); white-space:nowrap;">${dateStr}</td>
          <td><strong style="color:#FFFFFF;">${this.escapeHtml(lead.name)}</strong></td>
          <td>
            <a href="mailto:${lead.email}" style="color:var(--adm-cyan); text-decoration:none; font-size:0.85rem;">${this.escapeHtml(lead.email)}</a>
            <div style="font-size:0.75rem; color:var(--adm-text-muted);">${this.escapeHtml(lead.phone || 'No phone')}</div>
          </td>
          <td><span style="font-size:0.82rem; color:#FCD34D;">${this.escapeHtml(lead.service || 'General Inquiry')}</span></td>
          <td style="max-width:280px; font-size:0.82rem; color:#CBD5E1; line-height:1.4;">${this.escapeHtml(lead.details || '—')}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn-adm btn-adm-primary reply-lead-btn" data-id="${lead.id}" style="padding:5px 10px; font-size:0.78rem; white-space:nowrap;">
              ✉️ Reply in Dashboard
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.reply-lead-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const lead = this.leads.find(l => l.id === id);
        if (lead) this.openReplyModal(lead);
      });
    });
  }

  openReplyModal(lead) {
    document.getElementById('replyLeadId').value = lead.id;
    document.getElementById('replyLeadService').value = lead.service || 'Digital Solutions';
    document.getElementById('replyLeadDetails').value = lead.details || '';
    document.getElementById('replyRecipientName').textContent = lead.name || 'Client';
    document.getElementById('replyRecipientEmail').value = lead.email;
    document.getElementById('replySubject').value = `Strategy Follow-Up: ${lead.service || 'Digital Strategy'} | Zavron Solutions`;
    document.getElementById('replyMessageBody').value = `Dear ${lead.name},\n\nThank you for getting in touch with Zavron Solutions regarding "${lead.details || lead.service}".\n\nWe would love to discuss how our custom engineering and white-hat growth strategies can help accelerate your goals.\n\nAre you available for a brief 15-minute strategy call this Thursday or Friday?\n\nWarm regards,\nMuhammad Junaid\nFounder & Principal Strategist\nZavron Solutions\nhttps://zavronsolutions.com`;

    document.getElementById('replyModal').style.display = 'flex';
  }

  closeReplyModal() {
    document.getElementById('replyModal').style.display = 'none';
  }

  async generateAiEmailDraft(presetType = null) {
    const leadId = document.getElementById('replyLeadId').value;
    const lead = this.leads.find(l => l.id === leadId) || {};
    const customPrompt = document.getElementById('aiCustomPrompt').value.trim();

    const btn = document.getElementById('btnGenerateAiDraft');
    btn.disabled = true;
    btn.textContent = 'Generating AI Draft...';

    try {
      const res = await fetch('/api/admin/ai-draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: lead.name || 'Valued Client',
          service: lead.service || 'Digital Solutions',
          details: lead.details || '',
          userPrompt: customPrompt,
          templateType: presetType
        })
      });

      const data = await res.json();
      if (data.success) {
        document.getElementById('replySubject').value = data.subject;
        document.getElementById('replyMessageBody').value = data.draft;
      }
    } catch (e) {
      alert('Could not generate draft. You can write your custom response directly.');
    } finally {
      btn.disabled = false;
      btn.textContent = '✨ Generate AI Draft';
    }
  }

  async sendDirectEmailReply() {
    const leadId = document.getElementById('replyLeadId').value;
    const to = document.getElementById('replyRecipientEmail').value;
    const subject = document.getElementById('replySubject').value;
    const message = document.getElementById('replyMessageBody').value;
    const recipientName = document.getElementById('replyRecipientName').textContent;

    const sendBtn = document.getElementById('btnSendReplyEmail');
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending Email...';

    try {
      const res = await fetch('/api/admin/reply-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ leadId, to, subject, message, recipientName })
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Email successfully sent to ${to}!`);
        this.closeReplyModal();
        await this.loadLeads();
      } else {
        alert(`Error: ${data.error || 'Failed to dispatch email'}`);
      }
    } catch (e) {
      alert(`Could not connect to SMTP server: ${e.message}`);
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Email to Client ✉️';
    }
  }

  // -----------------------------------------------------------------
  // SITE-WIDE DEEP SEO CRAWLER AUDIT
  // -----------------------------------------------------------------
  async runSiteAudit() {
    this.siteAuditDone = true;
    const btn = document.getElementById('btnRunSiteAudit');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Scanning All HTML Routes...';
    }

    const tbody = document.getElementById('siteAuditTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--adm-cyan);">Analyzing static routes, OpenGraph headers, canonical tags, and headings across the workspace...</td></tr>`;
    }

    try {
      const res = await fetch('/api/admin/site-audit');
      const data = await res.json();

      document.getElementById('auditOverallScore').textContent = `${data.overallScore}%`;
      document.getElementById('auditTotalRoutes').textContent = data.totalPages;
      document.getElementById('auditCriticalCount').textContent = data.criticalCount;
      document.getElementById('auditWarningCount').textContent = data.warningCount;

      if (tbody) {
        tbody.innerHTML = data.pages.map(page => {
          const scoreClass = page.score >= 80 ? 'score-excellent' : (page.score >= 60 ? 'score-good' : 'score-poor');
          const issueRows = page.issues.map(iss => `
            <div style="margin-bottom: 4px;">
              <span class="badge-severity ${iss.type}">${iss.type}</span>
              <strong style="color:#FFFFFF; font-size:0.75rem; margin-left:4px;">${iss.field}:</strong>
              <span style="font-size:0.75rem; color:var(--adm-text-muted);">${iss.text}</span>
            </div>
          `).join('');

          return `
            <tr>
              <td>
                <strong style="color:var(--adm-cyan);">${page.route}</strong>
                <div style="font-size:0.72rem; color:var(--adm-text-muted);">${page.wordCount} words</div>
              </td>
              <td style="max-width:220px; font-size:0.82rem; color:#FFFFFF;">${this.escapeHtml(page.title)}</td>
              <td><span class="seo-score-pill ${scoreClass}">${page.score}/100</span></td>
              <td style="max-width:320px;">${issueRows || '<span style="color:#10B981; font-size:0.8rem;">✓ 100% SEO compliant</span>'}</td>
              <td>
                <div style="display:flex; gap:6px;">
                  <a href="${page.route}" target="_blank" class="btn-adm btn-adm-secondary" style="padding:4px 8px; font-size:0.72rem;">Inspect</a>
                  ${page.issues.length > 0 ? `<button class="btn-adm btn-adm-primary auto-fix-btn" data-route="${page.route}" style="padding:4px 8px; font-size:0.72rem;">⚡ 1-Click Fix</button>` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('');

        tbody.querySelectorAll('.auto-fix-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const route = btn.getAttribute('data-route');
            await this.autoFixSeoRoute(route);
          });
        });
      }
    } catch (err) {
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--adm-red);">Could not perform audit: ${err.message}</td></tr>`;
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg> Re-Run Site Crawl`;
      }
    }
  }

  async autoFixSeoRoute(route) {
    try {
      const res = await fetch('/api/admin/auto-fix-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        this.runSiteAudit();
      } else {
        alert(data.error || 'Failed to auto fix.');
      }
    } catch (e) {
      alert('Error fixing route.');
    }
  }

  // -----------------------------------------------------------------
  // UTILITIES & HELPERS
  // -----------------------------------------------------------------
  insertTag(tag) {
    const textarea = document.getElementById('postContent');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    let insertion = '';
    switch (tag) {
      case 'h2': insertion = `<h2>${selected || 'Section Heading'}</h2>`; break;
      case 'h3': insertion = `<h3>${selected || 'Subheading'}</h3>`; break;
      case 'b': insertion = `<strong>${selected || 'Bold Text'}</strong>`; break;
      case 'i': insertion = `<em>${selected || 'Italic Text'}</em>`; break;
      case 'a': insertion = `<a href="/services/web-development/">${selected || 'our web development services'}</a>`; break;
      case 'ul': insertion = `<ul>\n  <li>${selected || 'Key takeaway point'}</li>\n  <li>Second key takeaway</li>\n</ul>`; break;
      case 'img': insertion = `<img src="/assets/og-image.jpg" alt="Descriptive visual alt tag" loading="lazy" />`; break;
      case 'callout': insertion = `<div class="callout-box" style="background:rgba(0,210,255,0.08); border-left:4px solid #00D2FF; padding:16px; margin:20px 0;"><strong>Key Insight:</strong> Sub-second performance directly correlates with enterprise conversion.</div>`; break;
      default: insertion = selected;
    }

    textarea.setRangeText(insertion, start, end, 'end');
    textarea.focus();
    this.runSEOAnalysis();
  }

  generateSlug(text) {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  logout() {
    localStorage.removeItem('zavron_admin_token');
    localStorage.removeItem('zavron_admin_user');
    window.location.href = '/admin/login.html';
  }
}

// Global initialization
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new ZavronAdminApp();
    window.switchTab = (tab) => window.adminApp.switchTab(tab);
    window.startNewPost = () => window.adminApp.startNewPost();
  });
}
