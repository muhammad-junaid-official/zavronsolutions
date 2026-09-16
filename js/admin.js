/**
 * ZAVRON SOLUTIONS — ADMIN DASHBOARD & REAL-TIME SEO STUDIO
 */

import { ZavronSEOAnalyzer } from './seo-analyzer.js';

class ZavronAdminApp {
  constructor() {
    this.token = localStorage.getItem('zavron_admin_token');
    this.user = JSON.parse(localStorage.getItem('zavron_admin_user') || '{}');
    this.posts = [];
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
    this.initSEORealtime();
    this.renderRecentPosts();
    this.renderAllPosts();
  }

  bindEvents() {
    // Tab Switching
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

    // Post Search & Filter
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
        'editor': this.currentPostId ? 'Edit Blog Post' : 'New Article Studio & SEO',
        'seo-health': 'Site-Wide SEO Audit',
        'leads': 'Chatbot Live Inquiries'
      };
      titleEl.textContent = titles[tabId] || 'Admin Dashboard';
    }
  }

  async loadPosts() {
    try {
      const res = await fetch('/api/admin/posts');
      if (res.ok) {
        this.posts = await res.json();
      } else {
        // Fallback to local posts.json
        const localRes = await fetch('/data/posts.json');
        if (localRes.ok) this.posts = await localRes.json();
      }
    } catch (e) {
      // Local fallback
      try {
        const localRes = await fetch('/data/posts.json');
        if (localRes.ok) this.posts = await localRes.json();
      } catch (err) {
        console.warn('Using cached post state');
      }
    }

    // Update Overview Stats
    const totalEl = document.getElementById('metricTotalPosts');
    const pubEl = document.getElementById('metricPublished');
    const avgEl = document.getElementById('metricAvgSEO');

    if (totalEl) totalEl.textContent = this.posts.length;
    if (pubEl) pubEl.textContent = this.posts.filter(p => p.status === 'published').length;
    if (avgEl && this.posts.length > 0) {
      const sum = this.posts.reduce((acc, p) => acc + (p.seoScore || 85), 0);
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

    tbody.innerHTML = this.posts.map(post => this.renderTableRow(post)).join('');
    this.attachTableActionEvents(tbody);
  }

  renderTableRow(post) {
    const scoreClass = (post.seoScore || 0) >= 80 ? 'score-excellent' : ((post.seoScore || 0) >= 60 ? 'score-good' : 'score-poor');
    const statusBadge = post.status === 'published' ? '<span class="badge-status badge-published">Published</span>' : '<span class="badge-status badge-draft">Draft</span>';

    return `
      <tr data-id="${post.id || post.slug}">
        <td>
          <strong style="color: #FFFFFF;">${this.escapeHtml(post.title)}</strong>
          <div style="font-size: 0.75rem; color: var(--adm-text-muted); margin-top: 2px;">/blog/${post.slug}/</div>
        </td>
        <td><span style="font-size: 0.8rem; text-transform: uppercase;">${post.category || 'General'}</span></td>
        <td><span style="color: var(--adm-cyan); font-weight: 600;">${post.focusKeyword || '—'}</span></td>
        <td><span class="seo-score-pill ${scoreClass}">${post.seoScore || 88}/100</span></td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 8px;">
            <a href="/blog/${post.slug}/" target="_blank" class="btn-adm btn-adm-secondary" style="padding: 4px 8px; font-size: 0.75rem;">View</a>
            <button class="btn-adm btn-adm-secondary edit-post-btn" data-slug="${post.slug}" style="padding: 4px 8px; font-size: 0.75rem;">Edit</button>
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
  }

  filterPosts() {
    const term = (document.getElementById('postSearchInput')?.value || '').toLowerCase();
    const cat = document.getElementById('postFilterCategory')?.value || 'all';

    const filtered = this.posts.filter(p => {
      const matchTerm = (p.title || '').toLowerCase().includes(term) || (p.focusKeyword || '').toLowerCase().includes(term);
      const matchCat = cat === 'all' || p.category === cat;
      return matchTerm && matchCat;
    });

    const tbody = document.getElementById('allPostsTableBody');
    if (tbody) {
      tbody.innerHTML = filtered.map(post => this.renderTableRow(post)).join('');
      this.attachTableActionEvents(tbody);
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
    document.getElementById('editorTitle').textContent = `Editing: ${post.title.slice(0, 30)}...`;

    this.switchTab('editor');
    this.runSEOAnalysis();
  }

  // -----------------------------------------------------------------
  // REAL-TIME SEO STUDIO MONITOR
  // -----------------------------------------------------------------
  initSEORealtime() {
    const inputs = ['postTitle', 'postSlug', 'postFocusKeyword', 'postMetaDesc', 'postContent', 'postFeaturedImage'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.runSEOAnalysis());
      }
    });

    // Run initial analysis
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
    // 1. Circle score and status
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
        summary.textContent = '🌟 Excellent! Optimized for top search engine visibility.';
      } else if (report.score >= 60) {
        summary.textContent = '👍 Good standing. Address opportunities below to hit 90+ score.';
      } else {
        summary.textContent = '⚠️ Critical optimizations needed for search ranking.';
      }
    }

    if (badge) {
      badge.textContent = report.status.toUpperCase();
      badge.className = `seo-score-pill score-${report.status}`;
    }

    // 2. Metrics Quick Stats
    const wc = document.getElementById('seoWordCount');
    const kd = document.getElementById('seoDensity');
    const hc = document.getElementById('seoHeadingCount');
    const h2Count = (document.getElementById('postContent')?.value.match(/<h2[^>]*>/gi) || []).length;

    if (wc) wc.textContent = `${report.wordCount} words`;
    if (kd) kd.textContent = `${report.keywordDensity}%`;
    if (hc) hc.textContent = `${h2Count} H2s`;

    // 3. Render Checklists
    this.renderChecklistGroup('critical', report.checks.critical);
    this.renderChecklistGroup('warning', report.checks.warning);
    this.renderChecklistGroup('passed', report.checks.passed);

    // 4. Live Google SERP Snippet Preview
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
      listEl.innerHTML = `<div style="font-size: 0.75rem; color: var(--adm-text-muted); padding: 4px;">None detected.</div>`;
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="check-item item-${type}">
        <div class="check-item-head">${this.escapeHtml(item.title)}</div>
        <div class="check-item-detail">${this.escapeHtml(item.detail)}</div>
      </div>
    `).join('');
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

    // Run SEO to capture score
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
    publishBtn.textContent = 'Publishing & Generating HTML...';

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
      // Fallback local memory update
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
      case 'a': insertion = `<a href="/services/">${selected || 'Anchor Text'}</a>`; break;
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
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
