import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PREFERRED_DOMAIN = 'https://www.zavronsolutions.com';
const NON_WWW_DOMAIN = 'https://zavronsolutions.com';

const ignoredDirs = ['node_modules', '.git', 'dist', '.gemini', 'tmp'];

function findFiles(dir, ext = '.html') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (ignoredDirs.includes(file)) continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(findFiles(filePath, ext));
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  }
  return results;
}

// 1. Audit & Fix Sitemap
function auditAndFixSitemap() {
  const sitemapPath = path.join(rootDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('sitemap.xml not found!');
    return;
  }

  let xml = fs.readFileSync(sitemapPath, 'utf8');
  // Replace all non-www with www
  xml = xml.replaceAll(NON_WWW_DOMAIN, PREFERRED_DOMAIN);

  // Extract all locs
  const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  const urls = locMatches.map(m => m[1]);
  console.log(`Total URLs in sitemap: ${urls.length}`);

  const uniqueUrls = new Set();
  const validUrlBlocks = [];

  const urlBlockRegex = /<url>([\s\S]*?)<\/url>/g;
  let match;
  let duplicateCount = 0;
  let missingCount = 0;

  while ((match = urlBlockRegex.exec(xml)) !== null) {
    const block = match[0];
    const locMatch = block.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch) continue;
    const url = locMatch[1];

    if (uniqueUrls.has(url)) {
      duplicateCount++;
      continue;
    }
    uniqueUrls.add(url);

    // Verify corresponding local file
    const urlObj = new URL(url);
    let relPath = urlObj.pathname.replace(/^\//, '');
    let checkPath;
    if (!relPath || relPath === '') {
      checkPath = path.join(rootDir, 'index.html');
    } else if (relPath.endsWith('/')) {
      checkPath = path.join(rootDir, relPath, 'index.html');
    } else {
      checkPath = path.join(rootDir, relPath);
      if (!fs.existsSync(checkPath)) {
        checkPath = path.join(rootDir, relPath + '.html');
      }
      if (!fs.existsSync(checkPath)) {
        checkPath = path.join(rootDir, relPath, 'index.html');
      }
    }

    if (!fs.existsSync(checkPath)) {
      console.warn(`[Sitemap Warning] URL does not match local file: ${url} (Checked: ${checkPath})`);
      missingCount++;
    }

    validUrlBlocks.push(block);
  }

  const updatedXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${validUrlBlocks.join('\n')}
</urlset>
`;

  fs.writeFileSync(sitemapPath, updatedXml, 'utf8');
  console.log(`Sitemap updated: ${validUrlBlocks.length} unique URLs. Removed duplicates: ${duplicateCount}. Missing targets: ${missingCount}`);
}

// 2. Audit & Fix HTML Pages
function auditAndFixHtmlPages() {
  const htmlFiles = findFiles(rootDir, '.html');
  console.log(`Found ${htmlFiles.length} HTML files.`);

  let modifiedCount = 0;

  for (const filePath of htmlFiles) {
    const relToRoot = path.relative(rootDir, filePath).replace(/\\/g, '/');
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const isNonPublic = relToRoot.startsWith('admin/') || relToRoot.includes('404.html');

    // Determine self-referencing canonical route
    let route = '/' + relToRoot;
    if (route.endsWith('/index.html')) {
      route = route.slice(0, -10); // remove index.html
      if (route === '') route = '/';
      else if (!route.endsWith('/')) route += '/';
    } else if (route === '/index.html') {
      route = '/';
    }

    const canonicalUrl = `${PREFERRED_DOMAIN}${route}`;

    if (!isNonPublic) {
      // 1. Robots meta tag
      const standardRobotsTag = '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';
      if (content.includes('<meta name="robots"')) {
        content = content.replace(/<meta\s+name=["']robots["'][^>]*>/i, standardRobotsTag);
      } else if (content.includes('<meta name="googlebot"')) {
        content = content.replace(/<meta\s+name=["']googlebot["'][^>]*>/i, standardRobotsTag);
      } else {
        // Insert after viewport or in head
        content = content.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, `$1\n  ${standardRobotsTag}`);
      }

      // 2. Canonical tag
      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">`;
      if (content.includes('rel="canonical"') || content.includes("rel='canonical'")) {
        content = content.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, canonicalTag);
      } else {
        // Insert canonical tag
        content = content.replace(/(<\/title>)/i, `$1\n  ${canonicalTag}`);
      }

      // 3. Open Graph og:url
      const ogUrlTag = `<meta property="og:url" content="${canonicalUrl}">`;
      if (content.includes('property="og:url"') || content.includes("property='og:url'")) {
        content = content.replace(/<meta\s+[^>]*property=["']og:url["'][^>]*>/i, ogUrlTag);
      } else if (content.includes('property="og:title"')) {
        content = content.replace(/(<meta\s+[^>]*property=["']og:title["'][^>]*>)/i, `${ogUrlTag}\n  $1`);
      }
    } else if (relToRoot.startsWith('admin/')) {
      // Ensure admin has noindex
      const adminRobots = '<meta name="robots" content="noindex, nofollow">';
      if (content.includes('<meta name="robots"')) {
        content = content.replace(/<meta\s+name=["']robots["'][^>]*>/i, adminRobots);
      } else {
        content = content.replace(/(<head[^>]*>)/i, `$1\n  ${adminRobots}`);
      }
    }

    // 4. Update any hardcoded non-www URLs inside HTML (schema JSON-LD, href, src, etc.)
    // But do NOT touch third-party domains
    content = content.replaceAll('https://zavronsolutions.com/', 'https://www.zavronsolutions.com/');
    content = content.replaceAll('https://zavronsolutions.com', 'https://www.zavronsolutions.com');
    content = content.replaceAll('http://zavronsolutions.com', 'https://www.zavronsolutions.com');
    content = content.replaceAll('http://www.zavronsolutions.com', 'https://www.zavronsolutions.com');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
    }
  }

  console.log(`Updated ${modifiedCount} HTML files.`);
}

// 3. Update JS/JSON/Scripts files
function auditAndFixJsFiles() {
  const codeFiles = [
    ...findFiles(rootDir, '.js'),
    ...findFiles(rootDir, '.json')
  ];

  let modifiedCount = 0;
  for (const filePath of codeFiles) {
    if (filePath.includes('audit-and-fix-seo.js')) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replaceAll('https://zavronsolutions.com/', 'https://www.zavronsolutions.com/');
    content = content.replaceAll('https://zavronsolutions.com', 'https://www.zavronsolutions.com');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log(`Updated code file: ${path.relative(rootDir, filePath)}`);
    }
  }
  console.log(`Updated ${modifiedCount} JS/JSON files.`);
}

console.log('--- STARTING SEO AUDIT & FIX ---');
auditAndFixSitemap();
auditAndFixHtmlPages();
auditAndFixJsFiles();
console.log('--- COMPLETED SEO AUDIT & FIX ---');
