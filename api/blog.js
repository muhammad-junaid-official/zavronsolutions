/**
 * Vercel Serverless Function: dashboard-published blog posts
 *
 *   /blog/:slug/          → ?slug=…     server-rendered article (SEO-friendly HTML)
 *   /blog-sitemap.xml     → ?sitemap=1  XML sitemap of published dashboard posts
 *   /api/blog?list=1                    JSON list for the /blog/ index page
 */
import { listPosts, getPostBySlug } from '../lib/store.js';
import { renderPostPage, CATEGORY_LABELS, SITE, esc, readingMinutes } from '../lib/blogRender.js';
import { requireAdmin } from '../lib/auth.js';

let templateCache = null;

function originOf(req) {
  const proto = String(req.headers['x-forwarded-proto'] || '').split(',')[0] || (/^localhost|^127\./.test(req.headers.host || '') ? 'http' : 'https');
  return `${proto}://${req.headers.host}`;
}

async function template(req) {
  if (templateCache && templateCache.at > Date.now() - 5 * 60e3) return templateCache.html;
  const r = await fetch(`${originOf(req)}/_tpl/article.html`);
  if (!r.ok) throw new Error(`template ${r.status}`);
  const html = await r.text();
  templateCache = { at: Date.now(), html };
  return html;
}

async function notFound(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const r = await fetch(`${originOf(req)}/404.html`);
    return res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(await r.text());
  } catch {
    return res.status(404).send('Not found');
  }
}

export default async function handler(req, res) {
  try {
    const published = (await listPosts()).filter((p) => p.status === 'published');

    if (req.query.list) {
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json(published.map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        categoryLabel: CATEGORY_LABELS[p.category] || 'Insights',
        description: p.metaDescription,
        featuredImage: p.featuredImage || '/assets/og-image.jpg',
        minutes: readingMinutes(p.wordCount),
        publishedAt: p.publishedAt,
      })));
    }

    if (req.query.sitemap) {
      const urls = published.map((p) => `  <url>\n    <loc>${SITE}/blog/${esc(p.slug)}/</loc>\n    <lastmod>${(p.updatedAt || p.publishedAt || '').slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.70</priority>\n  </url>`);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
    }

    const slug = String(req.query.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!slug) return notFound(req, res);
    let post = await getPostBySlug(slug);
    const preview = req.query.preview && post && post.status !== 'published' && (await requireAdmin(req));
    if (!post || (post.status !== 'published' && !preview)) return notFound(req, res);

    const related = published.filter((p) => p.id !== post.id)
      .sort((a, b) => (b.category === post.category) - (a.category === post.category))
      .slice(0, 3);
    let html = renderPostPage(await template(req), post, related);
    if (preview) html = html.replace(/<meta name="robots" content="[^"]*">/i, '<meta name="robots" content="noindex, nofollow">');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', preview ? 'no-store' : 'public, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).send(html);
  } catch (err) {
    console.error('api/blog error:', err);
    return res.status(500).send('Blog service error');
  }
}
