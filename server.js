import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendInquiryEmails } from './scripts/emailService.js';
import { generatePostHtml } from './scripts/blogGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');
const POSTS_FILE = path.join(__dirname, 'data', 'posts.json');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@zavronsolutions.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ZavronAdmin2026!';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json'
};

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  // =========================================================================
  // API ROUTES
  // =========================================================================

  // 1. Send Email API
  if (url === '/api/send-email' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const result = await sendInquiryEmails(data);
      return sendJson(res, 200, { success: true, message: 'Email sent successfully', result });
    } catch (err) {
      console.error('Email Dispatch Error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. Chatbot AI & Lead Capture API
  if (url === '/api/chat' && req.method === 'POST') {
    try {
      const { message, lead, history } = await parseJsonBody(req);
      if (lead && lead.email) {
        // Send email alert to team for hot chatbot lead
        sendInquiryEmails({
          name: lead.name || 'Chatbot Prospect',
          email: lead.email,
          phone: lead.phone || 'N/A',
          service: 'Live Chatbot Lead',
          message: `Inquiry: ${message || ''}\nProject Details: ${lead.details || 'N/A'}`
        }).catch(e => console.error('Chat lead email error:', e));
      }
      return sendJson(res, 200, {
        success: true,
        reply: "Thank you! A senior strategist from Zavron Solutions has received your request and will follow up promptly."
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. Admin Authentication Login
  if (url === '/api/admin/login' && req.method === 'POST') {
    try {
      const { email, password } = await parseJsonBody(req);
      if (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        const token = 'ztk_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        return sendJson(res, 200, {
          success: true,
          token,
          user: { name: 'Zavron Admin', email: ADMIN_EMAIL, role: 'Super Administrator' }
        });
      }
      return sendJson(res, 401, { success: false, error: 'Invalid administrator email or password.' });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 4. Admin Blog Posts: GET (List all posts)
  if (url === '/api/admin/posts' && req.method === 'GET') {
    try {
      if (fs.existsSync(POSTS_FILE)) {
        const data = fs.readFileSync(POSTS_FILE, 'utf8');
        return sendJson(res, 200, JSON.parse(data || '[]'));
      }
      return sendJson(res, 200, []);
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 5. Admin Blog Posts: POST (Create / Publish new post)
  if (url === '/api/admin/posts' && req.method === 'POST') {
    try {
      const post = await parseJsonBody(req);
      if (!post.title || !post.slug) {
        return sendJson(res, 400, { success: false, error: 'Title and Slug are required.' });
      }

      // Load existing posts
      let posts = [];
      if (fs.existsSync(POSTS_FILE)) {
        try {
          posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8') || '[]');
        } catch (e) {
          posts = [];
        }
      }

      // Check if post exists, update or push
      const existingIdx = posts.findIndex(p => p.slug === post.slug);
      if (existingIdx >= 0) {
        posts[existingIdx] = { ...posts[existingIdx], ...post };
      } else {
        posts.unshift(post);
      }

      // Save updated posts database
      const dataDir = path.dirname(POSTS_FILE);
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');

      // Generate static HTML page in blog/<slug>/index.html
      const postHtml = generatePostHtml(post);
      const postDir = path.join(__dirname, 'blog', post.slug);
      if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true });
      fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf8');

      return sendJson(res, 200, {
        success: true,
        message: 'Article successfully published and static HTML generated.',
        post
      });
    } catch (err) {
      console.error('Post creation error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 6. Admin Blog Posts: DELETE
  if (url.startsWith('/api/admin/posts/') && req.method === 'DELETE') {
    try {
      const slug = url.replace('/api/admin/posts/', '');
      if (fs.existsSync(POSTS_FILE)) {
        let posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8') || '[]');
        posts = posts.filter(p => p.slug !== slug);
        fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
      }
      return sendJson(res, 200, { success: true, message: 'Article removed.' });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // =========================================================================
  // SERVE STATIC FILES
  // =========================================================================
  let reqPath = url;
  if (reqPath === '/') reqPath = '/index.html';
  if (reqPath.endsWith('/')) reqPath += 'index.html';

  // Support /admin and /admin/ clean routing
  if (reqPath === '/admin') reqPath = '/admin/index.html';
  if (reqPath === '/admin/login') reqPath = '/admin/login.html';

  let filePath = path.join(DIST_DIR, reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, reqPath);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const notFoundPath = path.join(DIST_DIR, '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      fs.createReadStream(notFoundPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Zavron Solutions Server listening on http://localhost:${PORT}`);
  console.log(`Admin Portal: http://localhost:${PORT}/admin/login.html`);
});
