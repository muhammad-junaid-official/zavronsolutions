import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function processDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (['node_modules', '.git', 'dist', '.gemini', 'tmp'].includes(item)) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (item.endsWith('.html') || item.endsWith('.js')) {
      let content = fs.readFileSync(full, 'utf8');
      let orig = content;

      // Replace schema homepage URLs to include trailing slash
      content = content.replaceAll('"url": "https://www.zavronsolutions.com/"', '"url": "https://www.zavronsolutions.com/"');
      content = content.replaceAll('"url":"https://www.zavronsolutions.com/"', '"url":"https://www.zavronsolutions.com/"');
      content = content.replaceAll('href="https://www.zavronsolutions.com/"', 'href="https://www.zavronsolutions.com/"');

      if (content !== orig) {
        fs.writeFileSync(full, content, 'utf8');
        console.log('Updated:', path.relative(rootDir, full));
      }
    }
  }
}

console.log('Standardizing homepage URLs in structured data and links...');
processDir(rootDir);
console.log('Complete.');
