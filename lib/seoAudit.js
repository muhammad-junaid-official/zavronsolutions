/**
 * Lightweight on-page SEO auditor (no DOM dependency — runs in Node,
 * in Vercel functions and in the build script).
 */

const decode = (s) => String(s || '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[2] !== undefined ? m[2] : m[3]) : null;
};

function metaContent(html, key, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const t of tags) {
    const v = attr(t, key);
    if (v && v.toLowerCase() === value) return attr(t, 'content');
  }
  return null;
}

export function analyzeHtml(html, route, { xRobots = '' } = {}) {
  const issues = [];
  const add = (severity, text, points) => issues.push({ severity, text, points });

  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').trim();
  const metaDesc = (metaContent(html, 'name', 'description') || '').trim();
  const robots = ((metaContent(html, 'name', 'robots') || '') + (xRobots ? `, ${xRobots}` : '')).toLowerCase();
  const canonTag = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || [])[0];
  const canonical = canonTag ? attr(canonTag, 'href') || '' : '';
  const ogImage = metaContent(html, 'property', 'og:image');
  const ogTitle = metaContent(html, 'property', 'og:title');
  const viewportCount = (html.match(/<meta\b[^>]*name=["']viewport["']/gi) || []).length;
  const jsonLd = /<script[^>]*application\/ld\+json/i.test(html);

  const bodyHtml = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [])[1] || html;
  const mainHtml = (bodyHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || bodyHtml;
  const text = decode(mainHtml.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ').trim();
  const wordCount = text ? text.split(' ').length : 0;
  const h1Count = (bodyHtml.match(/<h1\b/gi) || []).length;
  const imgs = bodyHtml.match(/<img\b[^>]*>/gi) || [];
  const imgNoAlt = imgs.filter((t) => { const a = attr(t, 'alt'); return a === null || !a.trim(); }).length;
  const noindex = /noindex/.test(robots);

  if (!title) add('critical', 'Missing <title> tag', 25);
  else if (title.length < 30) add('warning', `Title is short (${title.length} chars, aim 50–60)`, 6);
  else if (title.length > 65) add('warning', `Title may be truncated (${title.length} chars, aim 50–60)`, 6);

  if (!metaDesc) add('critical', 'Missing meta description', 20);
  else if (metaDesc.length < 70) add('warning', `Meta description is short (${metaDesc.length} chars, aim 120–160)`, 6);
  else if (metaDesc.length > 165) add('warning', `Meta description is long (${metaDesc.length} chars, aim 120–160)`, 5);

  if (!canonical) add('critical', 'Missing canonical URL', 10);
  if (h1Count === 0) add('critical', 'Missing H1 heading', 12);
  else if (h1Count > 1) add('warning', `Multiple H1 headings (${h1Count})`, 5);
  if (viewportCount !== 1) add('warning', viewportCount ? `${viewportCount} viewport tags (should be 1)` : 'Missing viewport tag', 5);
  if (!jsonLd) add('warning', 'No JSON-LD structured data', 6);
  if (!ogImage || !ogTitle) add('warning', 'Missing Open Graph title/image', 4);
  if (imgNoAlt) add('warning', `${imgNoAlt} image(s) missing alt text`, Math.min(8, imgNoAlt * 2));
  if (!noindex && wordCount < 300) add('warning', `Thin content (${wordCount} words)`, 6);

  const score = Math.max(0, 100 - issues.reduce((s, i) => s + i.points, 0));
  return {
    route,
    title,
    metaDesc,
    canonical,
    robots: robots || 'index, follow',
    indexable: !noindex,
    h1Count,
    wordCount,
    imgNoAlt,
    score,
    issues: issues.map((i) => i.text),
    critical: issues.filter((i) => i.severity === 'critical').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
  };
}

export function routesFromSitemap(xml, origin) {
  return [...String(xml).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)]
    .map((m) => m[1])
    .map((u) => { try { return new URL(u).pathname; } catch { return null; } })
    .filter(Boolean)
    .filter((p, i, arr) => arr.indexOf(p) === i)
    .map((p) => (origin ? p : p));
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  }));
  return out;
}

/** Crawl live pages over HTTP and analyse each one. */
export async function crawlSite(origin, routes, { concurrency = 12, timeoutMs = 12000 } = {}) {
  const started = Date.now();
  const pages = await pool(routes, concurrency, async (route) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(origin + route, { signal: ctrl.signal, redirect: 'manual', headers: { 'User-Agent': 'ZavronSEOAudit/1.0' } });
      if (res.status >= 300 && res.status < 400) {
        return { route, title: '', status: res.status, score: 0, indexable: false, robots: `redirect → ${res.headers.get('location') || ''}`, issues: [`Redirects (${res.status}) — remove from sitemap`], critical: 1, warnings: 0, wordCount: 0 };
      }
      const html = await res.text();
      const a = analyzeHtml(html, route, { xRobots: res.headers.get('x-robots-tag') || '' });
      if (res.status >= 400) { a.issues.unshift(`HTTP ${res.status} error`); a.critical += 1; a.score = 0; }
      return { ...a, status: res.status };
    } catch (e) {
      return { route, title: '', status: 0, score: 0, indexable: false, robots: '', issues: [`Could not fetch (${e.name === 'AbortError' ? 'timeout' : e.message})`], critical: 1, warnings: 0, wordCount: 0 };
    } finally { clearTimeout(t); }
  });
  const scored = pages.filter((p) => p.indexable);
  const overallScore = scored.length ? Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length) : 0;
  return {
    crawledAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    totalPages: pages.length,
    overallScore,
    criticalCount: pages.reduce((s, p) => s + (p.critical || 0), 0),
    warningCount: pages.reduce((s, p) => s + (p.warnings || 0), 0),
    pages,
  };
}
