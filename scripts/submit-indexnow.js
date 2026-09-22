import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sitemapPath = path.join(rootDir, 'sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

const matches = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)];
const urls = [...new Set(matches.map(m => m[1].trim()))].filter(u => u.startsWith('https://www.zavronsolutions.com/'));

console.log(`Found ${urls.length} canonical URLs for IndexNow submission.`);

const payload = {
  host: "www.zavronsolutions.com",
  key: "9f28a2c2d79d42988ea95f313ac7acec",
  keyLocation: "https://www.zavronsolutions.com/9f28a2c2d79d42988ea95f313ac7acec.txt",
  urlList: urls
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'api.indexnow.org',
  port: 443,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Submitting to IndexNow API (https://api.indexnow.org/indexnow)...');

const req = https.request(options, (res) => {
  console.log(`IndexNow Response Status: ${res.statusCode} ${res.statusMessage}`);
  let responseBody = '';
  res.on('data', (d) => { responseBody += d; });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log('✅ IndexNow submission successful! URLs queued for Bing and Yandex indexing.');
    } else {
      console.log(`IndexNow response body: ${responseBody || '(empty)'}`);
      console.log(`Note: Status 200 or 202 indicates immediate acceptance. Other codes may reflect key propagation if not yet live on production.`);
    }
  });
});

req.on('error', (e) => {
  console.error(`IndexNow submission network error: ${e.message}`);
});

req.write(data);
req.end();
