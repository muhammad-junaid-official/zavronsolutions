/**
 * Adds articles published from the admin dashboard to the /blog/ index.
 * (Each article page itself is server-rendered for SEO at /blog/<slug>/.)
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

async function injectDashboardPosts() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;
  try {
    const res = await fetch('/api/blog?list=1');
    if (!res.ok) return;
    const posts = await res.json();
    if (!Array.isArray(posts) || !posts.length) return;
    const existing = new Set([...grid.querySelectorAll('a[href^="/blog/"]')].map((a) => a.getAttribute('href')));
    const html = posts.filter((p) => !existing.has(`/blog/${p.slug}/`)).map((p) => `
<article class="blog-card" data-category="${esc(p.category)}" data-type="service">
<div class="blog-card-media"><img alt="${esc(p.title)}" height="338" loading="lazy" src="${esc(p.featuredImage)}" width="600"></div>
<div class="blog-card-body">
<div class="blog-meta"><span class="eyebrow-pill blog-pill">${esc(String(p.categoryLabel || '').toUpperCase())}</span><span> ${p.minutes} min read</span></div>
<h2 class="blog-card-title"><a href="/blog/${esc(p.slug)}/">${esc(p.title)}</a></h2>
<p class="blog-card-desc">${esc(p.description)}</p>
<a class="blog-card-link" href="/blog/${esc(p.slug)}/">Read Full Analysis →</a>
</div>
</article>`).join('');
    grid.insertAdjacentHTML('afterbegin', html);
  } catch (e) { /* static list still works */ }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectDashboardPosts);
else injectDashboardPosts();
