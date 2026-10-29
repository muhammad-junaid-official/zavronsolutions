/**
 * Server-side rendering of dashboard-published blog posts, using the site's
 * own built article page as the template (same header, footer, CSS, analytics).
 */

export const SITE = 'https://www.zavronsolutions.com';

export const CATEGORY_LABELS = {
  'web-development': 'Web Development',
  'wordpress-development': 'WordPress Development',
  'ecommerce-development': 'E-Commerce Development',
  seo: 'SEO & Organic Growth',
  'local-seo': 'Local SEO',
  'technical-seo': 'Technical SEO',
  'ecommerce-seo': 'E-Commerce SEO',
  'digital-marketing': 'Digital Marketing',
  'google-ads': 'Google Ads',
  'social-media-marketing': 'Social Media Marketing',
  'ui-ux-design': 'UI/UX Design',
};

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Minimal Markdown → HTML for posts written without HTML tags. */
export function markdownToHtml(md) {
  const inline = (t) => esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g, '<a href="$2">$1</a>');
  const out = [];
  let list = null;
  const flush = () => { if (list) { out.push(`<${list.tag}>${list.items.map((i) => `<li>${i}</li>`).join('')}</${list.tag}>`); list = null; } };
  String(md).replace(/\r/g, '').split(/\n{2,}/).forEach((block) => {
    const lines = block.split('\n');
    lines.forEach((line) => {
      const h = line.match(/^(#{2,4})\s+(.*)$/);
      const ul = line.match(/^\s*[-*]\s+(.*)$/);
      const ol = line.match(/^\s*\d+\.\s+(.*)$/);
      if (h) { flush(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); }
      else if (ul || ol) {
        const tag = ul ? 'ul' : 'ol';
        if (!list || list.tag !== tag) { flush(); list = { tag, items: [] }; }
        list.items.push(inline((ul || ol)[1]));
      } else if (line.trim()) { flush(); out.push(`<p>${inline(line)}</p>`); }
    });
    flush();
  });
  return out.join('\n');
}

/** Remove scripts and inline event handlers from author HTML. */
export function sanitizeHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

export function contentToHtml(content) {
  const c = String(content || '').replace(/<script[\s\S]*?<\/script>/gi, '').trim();
  return /<\/?(p|h[1-6]|ul|ol|div|img|a|strong|em|blockquote|table)\b/i.test(c) ? sanitizeHtml(c) : markdownToHtml(c);
}

export const readingMinutes = (wordCount) => Math.max(1, Math.round((wordCount || 0) / 220));

export function absoluteUrl(src) {
  if (!src) return `${SITE}/assets/og-image.jpg`;
  return /^https?:\/\//i.test(src) ? src : SITE + (src.startsWith('/') ? src : `/${src}`);
}

function setMeta(html, re, value) { return html.replace(re, (m, a, b) => `${a}${value}${b}`); }

export function renderPostPage(template, post, related = []) {
  const url = `${SITE}/blog/${post.slug}/`;
  const cat = CATEGORY_LABELS[post.category] || 'Insights';
  const desc = post.metaDescription || '';
  const pageTitle = `${post.title} | Zavron Solutions`;
  const image = absoluteUrl(post.featuredImage);
  const bodyHtml = contentToHtml(post.contentHtml);
  const words = post.wordCount || bodyHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const published = new Date(post.publishedAt || post.createdAt || Date.now());
  const monthYear = published.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description: desc,
        image,
        datePublished: published.toISOString(),
        dateModified: new Date(post.updatedAt || published).toISOString(),
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        keywords: post.focusKeyword || undefined,
        articleSection: cat,
        wordCount: words,
        author: { '@type': 'Person', name: post.author || 'Muhammad Junaid', url: `${SITE}/about-us/` },
        publisher: { '@id': `${SITE}/#organization` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  const relatedHtml = related.length ? `
<div class="related-posts-section">
<div class="related-posts-header"><span class="related-posts-label">KEEP READING</span><h3 class="related-posts-title">Related Guides &amp; Analyses</h3></div>
<div class="related-posts-grid">
${related.map((r) => `<a class="related-post-card" href="/blog/${esc(r.slug)}/"><div class="related-post-img"><img alt="${esc(r.title)}" height="225" loading="lazy" src="${esc(r.featuredImage || '/assets/og-image.jpg')}" width="400"></div><div class="related-post-body"><span class="related-post-cat">${esc(CATEGORY_LABELS[r.category] || 'Insights')}</span><h4 class="related-post-title">${esc(r.title)}</h4><span class="related-post-link">Read Analysis →</span></div></a>`).join('\n')}
</div></div>` : '';

  const main = `<main id="main-content">
<article>
<header class="article-hero-header"><div class="container"><div class="article-hero-inner">
<div class="breadcrumbs"><a href="/">Home</a><span class="separator">/</span><a href="/blog/">Blog</a><span class="separator">/</span><span class="current">${esc(cat)}</span></div>
<div class="article-meta"><span class="eyebrow-pill dark">${esc(cat.toUpperCase())}</span><span>• ${readingMinutes(words)} min read</span><span>• Published ${esc(monthYear)}</span></div>
<h1 class="article-headline">${esc(post.title)}</h1>
${desc ? `<p class="article-subtitle">${esc(desc)}</p>` : ''}
</div></div></header>
<div class="section section-white"><div class="container"><div class="article-content-wrap">
<div class="article-featured-img"><img alt="${esc(post.title)}" height="630" loading="eager" fetchpriority="high" src="${esc(post.featuredImage || '/assets/og-image.jpg')}" width="1200"></div>
<div class="article-body">
${bodyHtml}
</div>
<div class="article-author-box"><div class="article-author-avatar">MJ</div><div>
<div class="article-author-name">${esc(post.author || 'Muhammad Junaid')}</div>
<div class="article-author-role">Founder &amp; CEO, Zavron Solutions</div>
<p>Muhammad Junaid is the Founder &amp; CEO of Zavron Solutions, a US web development and SEO agency building fast websites and search growth programs for growing businesses.</p>
</div></div>
<div class="cta-banner"><div class="cta-banner-content"><span class="eyebrow eyebrow-pill dark">READY TO GROW?</span><h2>Work With a Web Development &amp; SEO Agency.</h2><p>Get a free assessment of your website, SEO opportunities and conversion funnel.</p><div class="cta-actions"><a class="btn btn-primary btn-lg" href="/get-a-free-quote/">Request a Free Proposal →</a><a class="btn btn-secondary btn-lg" href="/contact/">Talk to a Strategist</a></div></div></div>
${relatedHtml}
</div></div></div>
</article>
</main>`;

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(pageTitle)}</title>`);
  html = setMeta(html, /(<meta name="description" content=")[^"]*(")/i, esc(desc));
  html = setMeta(html, /(<link rel="canonical" href=")[^"]*(")/i, url);
  html = setMeta(html, /(<meta property="og:url" content=")[^"]*(")/i, url);
  html = setMeta(html, /(<meta property="og:title" content=")[^"]*(")/i, esc(pageTitle));
  html = setMeta(html, /(<meta property="og:description" content=")[^"]*(")/i, esc(desc));
  html = setMeta(html, /(<meta property="og:image" content=")[^"]*(")/i, esc(image));
  html = setMeta(html, /(<meta name="twitter:title" content=")[^"]*(")/i, esc(pageTitle));
  html = setMeta(html, /(<meta name="twitter:description" content=")[^"]*(")/i, esc(desc));
  html = setMeta(html, /(<meta name="twitter:image" content=")[^"]*(")/i, esc(image));
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`);
  html = html.replace(/<main id="main-content">[\s\S]*<\/main>/i, main);
  return html;
}
