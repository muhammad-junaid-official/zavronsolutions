import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function findHtmlFiles(dir) {
  const ignored = ['node_modules', '.git', 'dist', '.gemini', 'tmp'];
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (ignored.includes(item)) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(findHtmlFiles(full));
    } else if (item.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(rootDir);
console.log(`Auditing ${htmlFiles.length} HTML files...`);

let issues = [];
let publicPageCount = 0;
let canonicalCount = 0;

for (const f of htmlFiles) {
  const rel = path.relative(rootDir, f).replace(/\\/g, '/');
  const isPublic = !rel.startsWith('admin/') && !rel.includes('404.html') && !rel.includes('google1a53f697314249ec');
  const content = fs.readFileSync(f, 'utf8');

  // Check canonical
  const canonicalMatches = content.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi) || [];
  if (isPublic) {
    publicPageCount++;
    if (canonicalMatches.length === 0) {
      issues.push(`[Missing Canonical] ${rel}`);
    } else if (canonicalMatches.length > 1) {
      issues.push(`[Duplicate Canonical] ${rel} (${canonicalMatches.length} tags)`);
    } else {
      canonicalCount++;
      const hrefMatch = canonicalMatches[0].match(/href=["']([^"']*)["']/i);
      if (!hrefMatch || !hrefMatch[1].startsWith('https://www.zavronsolutions.com/')) {
        issues.push(`[Invalid Canonical URL] ${rel} -> ${canonicalMatches[0]}`);
      }
    }

    // Check meta robots
    if (content.includes('noindex')) {
      issues.push(`[Accidental Noindex on Public Page] ${rel}`);
    }

    // Check og:url
    const ogUrlMatches = content.match(/<meta\s+[^>]*property=["']og:url["'][^>]*>/gi) || [];
    if (ogUrlMatches.length > 0) {
      const ogHref = ogUrlMatches[0].match(/content=["']([^"']*)["']/i);
      if (ogHref && !ogHref[1].startsWith('https://www.zavronsolutions.com/')) {
        issues.push(`[Invalid og:url] ${rel} -> ${ogUrlMatches[0]}`);
      }
    }
  } else {
    // Non-public page
    if (rel.startsWith('admin/') && !content.includes('noindex')) {
      issues.push(`[Admin Page Missing Noindex] ${rel}`);
    }
  }
}

console.log(`Audit Summary:`);
console.log(`- Total HTML Files: ${htmlFiles.length}`);
console.log(`- Total Public Indexable Pages: ${publicPageCount}`);
console.log(`- Verified Canonical Tags: ${canonicalCount} / ${publicPageCount}`);
console.log(`- Total Issues Found: ${issues.length}`);
if (issues.length > 0) {
  issues.forEach(i => console.log('  ' + i));
} else {
  console.log('✅ ALL HTML PAGES PASSED CANONICAL, ROBOTS, AND OG:URL VERIFICATION!');
}
