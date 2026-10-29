/**
 * Post-build data for the dynamic features:
 *  - dist/_tpl/article.html        page template used to server-render dashboard blog posts
 *  - dist/_data/static-posts.json  metadata + SEO score of every static blog article
 */
import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { analyzeHtml } from '../lib/seoAudit.js';

const DIST = new URL('../dist/', import.meta.url).pathname;
const TEMPLATE_SOURCE = 'blog/wordpress-speed-optimization-techniques/index.html';

const decode = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const pick = (html, re) => decode(((html.match(re) || [])[1] || '').replace(/<[^>]+>/g, '').trim());

const slugToCategory = (label) => String(label || '').toLowerCase()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  // 1. article template
  const tpl = await readFile(join(DIST, TEMPLATE_SOURCE), 'utf8');
  await mkdir(join(DIST, '_tpl'), { recursive: true });
  await writeFile(join(DIST, '_tpl/article.html'), tpl);

  // 2. static posts
  const blogDir = join(DIST, 'blog');
  const posts = [];
  for (const slug of await readdir(blogDir)) {
    const file = join(blogDir, slug, 'index.html');
    try { if (!(await stat(file)).isFile()) continue; } catch { continue; }
    const html = await readFile(file, 'utf8');
    const a = analyzeHtml(html, `/blog/${slug}/`);
    const categoryLabel = pick(html, /<span class="current">([\s\S]*?)<\/span>/i);
    posts.push({
      id: `static_${slug}`,
      source: 'static',
      slug,
      title: pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || a.title,
      metaTitle: a.title,
      metaDescription: a.metaDesc,
      category: slugToCategory(categoryLabel),
      categoryLabel,
      featuredImage: (html.match(/class="article-featured-img">\s*<img[^>]*src="([^"]+)"/i) || [])[1] || '',
      wordCount: a.wordCount,
      seoScore: a.score,
      issues: a.issues,
      status: 'published',
      publishedAt: (html.match(/"datePublished":\s*"([^"]+)"/) || [])[1] || null,
    });
  }
  posts.sort((x, y) => String(y.publishedAt).localeCompare(String(x.publishedAt)));
  await mkdir(join(DIST, '_data'), { recursive: true });
  await writeFile(join(DIST, '_data/static-posts.json'), JSON.stringify(posts));
  console.log(`post-build data: template + ${posts.length} static posts`);
}

main().catch((e) => { console.error(e); process.exit(1); });
