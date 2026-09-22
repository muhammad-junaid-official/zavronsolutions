import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendInquiryEmails, sendDirectReplyEmail } from './scripts/emailService.js';
import { generatePostHtml } from './scripts/blogGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');
const POSTS_FILE = path.join(__dirname, 'data', 'posts.json');
const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');

// In-memory Live Chat store
const liveChatSessions = new Map(); // sessionId -> { messages: [], userInfo: {}, adminJoined: false }
const adminSSEClients = []; // All connected admin SSE clients for real-time push

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

function getLeads() {
  if (fs.existsSync(LEADS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8') || '[]');
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveLeads(leads) {
  const dir = path.dirname(LEADS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

// Recursively find all HTML files in project
function findHtmlFiles(dir, fileList = [], baseDir = dir) {
  const ignored = ['node_modules', '.git', 'dist', '.gemini', 'tmp'];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (ignored.includes(item)) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findHtmlFiles(fullPath, fileList, baseDir);
    } else if (item.endsWith('.html') && !item.includes('google1a53f697314249ec')) {
      fileList.push({
        fullPath,
        relPath: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
        route: '/' + path.relative(baseDir, fullPath).replace(/\\/g, '/').replace(/index\.html$/, '')
      });
    }
  }
  return fileList;
}

// Deep SEO Audit on an HTML file
function auditHtmlFile(filePath, route) {
  const html = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  let score = 100;

  // Title check
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  const title = titleMatch ? titleMatch[1].trim() : '';
  if (!title) {
    issues.push({ type: 'critical', field: 'Title', text: 'Missing <title> tag.', location: '<head>' });
    score -= 20;
  } else if (title.length < 40) {
    issues.push({ type: 'warning', field: 'Title', text: `Title is short (${title.length} chars). Recommend 50-65 chars.`, location: `<title>${title}</title>` });
    score -= 6;
  } else if (title.length > 70) {
    issues.push({ type: 'warning', field: 'Title', text: `Title is long (${title.length} chars) and may truncate on SERP.`, location: `<title>${title}</title>` });
    score -= 5;
  }

  // Meta Description check
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                     html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  const metaDesc = metaMatch ? metaMatch[1].trim() : '';
  if (!metaDesc) {
    issues.push({ type: 'critical', field: 'Meta Description', text: 'Missing meta description.', location: '<head>' });
    score -= 20;
  } else if (metaDesc.length < 100) {
    issues.push({ type: 'warning', field: 'Meta Description', text: `Meta description is short (${metaDesc.length} chars). Target 140-160 chars.`, location: `<meta name="description">` });
    score -= 8;
  } else if (metaDesc.length > 170) {
    issues.push({ type: 'warning', field: 'Meta Description', text: `Meta description exceeds 160 characters (${metaDesc.length} chars).`, location: `<meta name="description">` });
    score -= 5;
  }

  // Canonical tag check
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  if (!canonicalMatch && !route.includes('admin') && !route.includes('404')) {
    issues.push({ type: 'warning', field: 'Canonical', text: 'Missing self-referencing <link rel="canonical"> tag.', location: '<head>' });
    score -= 10;
  }

  // H1 tag check
  const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gis) || [];
  if (h1Matches.length === 0 && !route.includes('admin') && !route.includes('404')) {
    issues.push({ type: 'critical', field: 'H1 Heading', text: 'No <h1> tag found on page.', location: '<body>' });
    score -= 15;
  } else if (h1Matches.length > 1) {
    issues.push({ type: 'warning', field: 'H1 Heading', text: `Found ${h1Matches.length} <h1> tags. Recommend exactly one H1 per page.`, location: '<body>' });
    score -= 6;
  }

  // Schema.org Structured Data
  const schemaMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/i);
  if (!schemaMatch && !route.includes('admin') && !route.includes('404')) {
    issues.push({ type: 'optimization', field: 'Structured Data', text: 'Missing Schema.org JSON-LD structured data.', location: '<head>' });
    score -= 8;
  }

  // Images missing alt
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  let missingAltCount = 0;
  imgMatches.forEach(img => {
    if (!img.includes('alt=') || img.match(/alt=["']\s*["']/)) {
      missingAltCount++;
    }
  });
  if (missingAltCount > 0) {
    issues.push({ type: 'warning', field: 'Image Alt Tags', text: `${missingAltCount} image(s) missing descriptive alt attributes.`, location: '<body> images' });
    score -= Math.min(15, missingAltCount * 4);
  }

  // Open Graph
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*>/i);
  if (!ogTitle && !route.includes('admin') && !route.includes('404')) {
    issues.push({ type: 'optimization', field: 'OpenGraph', text: 'Missing og:title social card tag.', location: '<head>' });
    score -= 5;
  }

  return {
    route: route || '/',
    title: title || 'Untitled Page',
    metaDesc: metaDesc || '',
    score: Math.max(20, Math.min(100, score)),
    issues,
    wordCount: html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).length
  };
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
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

  // 1. Send Email API (Public Contact & Quotes)
  if (url === '/api/send-email' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const result = await sendInquiryEmails(data);

      // Save to leads database
      const leads = getLeads();
      leads.unshift({
        id: 'lead_' + Date.now(),
        date: new Date().toISOString(),
        name: data.name || 'Website Prospect',
        email: data.email || 'N/A',
        phone: data.phone || 'N/A',
        company: data.company || 'N/A',
        service: data.service || 'General Inquiry',
        details: data.message || 'Contact form submission',
        status: 'new'
      });
      saveLeads(leads);

      return sendJson(res, 200, { success: true, message: 'Email sent successfully', result });
    } catch (err) {
      console.error('Email Dispatch Error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. Chatbot AI & Lead Capture API
  if (url === '/api/chat' && req.method === 'POST') {
    try {
      const { message, lead, sessionId } = await parseJsonBody(req);

      // Track in live chat sessions
      const sid = sessionId || ('sess_' + Date.now());
      if (!liveChatSessions.has(sid)) {
        liveChatSessions.set(sid, {
          messages: [],
          userInfo: lead || {},
          adminJoined: false,
          startTime: new Date().toISOString()
        });
      }
      const session = liveChatSessions.get(sid);
      if (lead) session.userInfo = { ...session.userInfo, ...lead };
      if (message) {
        session.messages.push({ from: 'user', text: message, time: new Date().toISOString() });
      }

      // Push to admin SSE clients
      const ssePayload = JSON.stringify({
        type: 'new_message',
        sessionId: sid,
        session: { ...session, id: sid }
      });
      adminSSEClients.forEach(client => {
        try { client.write(`event: message\ndata: ${ssePayload}\n\n`); } catch(e) {}
      });

      if (lead && lead.email) {
        // Save to leads DB
        const leads = getLeads();
        leads.unshift({
          id: 'lead_' + Date.now(),
          date: new Date().toISOString(),
          name: lead.name || 'Chat Prospect',
          email: lead.email,
          phone: lead.phone || 'N/A',
          company: lead.company || 'N/A',
          service: 'Live Chatbot Inquiry',
          details: lead.details || message || 'Live chat session',
          status: 'new',
          sessionId: sid
        });
        saveLeads(leads);

        // Dispatch alert email
        sendInquiryEmails({
          name: lead.name || 'Chatbot Prospect',
          email: lead.email,
          phone: lead.phone || 'N/A',
          service: 'Live Chatbot Lead',
          message: `Inquiry: ${message || ''}\nProject Details: ${lead.details || 'N/A'}`
        }).catch(e => console.error('Chat lead email error:', e));
      }

      // Check if admin has joined this session
      const botReply = session.adminJoined
        ? null
        : "Thank you! A senior strategist from Zavron Solutions has received your request and will follow up promptly.";

      return sendJson(res, 200, {
        success: true,
        sessionId: sid,
        adminJoined: session.adminJoined,
        reply: botReply
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
          user: { name: 'Muhammad Junaid', email: ADMIN_EMAIL, role: 'Super Administrator' }
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

  // 5. Admin Blog Posts: POST (Create / Edit / Publish post)
  if (url === '/api/admin/posts' && req.method === 'POST') {
    try {
      const post = await parseJsonBody(req);
      if (!post.title || !post.slug) {
        return sendJson(res, 400, { success: false, error: 'Title and Slug are required.' });
      }

      let posts = [];
      if (fs.existsSync(POSTS_FILE)) {
        try {
          posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8') || '[]');
        } catch (e) {
          posts = [];
        }
      }

      const existingIdx = posts.findIndex(p => p.slug === post.slug || (post.id && p.id === post.id));
      if (existingIdx >= 0) {
        posts[existingIdx] = { ...posts[existingIdx], ...post, date: posts[existingIdx].date || new Date().toISOString().split('T')[0] };
      } else {
        posts.unshift(post);
      }

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
        message: 'Article successfully saved and static page updated.',
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
        posts = posts.filter(p => p.slug !== slug && p.id !== slug);
        fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
      }
      return sendJson(res, 200, { success: true, message: 'Article removed.' });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 7. Admin Leads: GET
  if ((url === '/api/admin/leads' || url === '/api/leads') && req.method === 'GET') {
    try {
      const leads = getLeads();
      return sendJson(res, 200, leads);
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 8. Admin Leads: POST Reply (Direct Email to Client)
  if ((url === '/api/admin/reply-lead' || url === '/api/reply-lead') && req.method === 'POST') {
    try {
      const { leadId, to, subject, message, recipientName } = await parseJsonBody(req);
      if (!to || !message) {
        return sendJson(res, 400, { success: false, error: 'Recipient email and message are required.' });
      }

      await sendDirectReplyEmail({ to, subject, message, recipientName });

      // Update lead status to 'replied'
      const leads = getLeads();
      const lead = leads.find(l => l.id === leadId || l.email === to);
      if (lead) {
        lead.status = 'replied';
        lead.repliedAt = new Date().toISOString();
        saveLeads(leads);
      }

      return sendJson(res, 200, {
        success: true,
        message: `Email successfully delivered to ${to}!`
      });
    } catch (err) {
      console.error('Lead reply error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9. Admin AI Email Writer Assistant: POST
  if (url === '/api/admin/ai-draft-reply' && req.method === 'POST') {
    try {
      const { clientName, service, details, userPrompt, templateType } = await parseJsonBody(req);

      let subject = `Follow-Up: Your ${service || 'Digital Strategy'} Inquiry with Zavron Solutions`;
      let draft = '';

      if (templateType === 'call') {
        subject = `Strategy Consultation: Zavron Solutions & ${clientName || 'Your Project'}`;
        draft = `Thank you for reaching out regarding your project requirements.\n\nI reviewed your inquiry regarding "${details || service}". We have engineered high-performing platforms for several US businesses in this domain with exceptional ROI.\n\n${userPrompt ? 'Note: ' + userPrompt + '\n\n' : ''}I would love to invite you to a brief 15-minute strategy call this week to review your technical architecture and provide an actionable roadmap.\n\nPlease let me know your availability for Thursday or Friday afternoon (EST).\n\nBest regards,\nMuhammad Junaid\nFounder & Principal Strategist\nZavron Solutions`;
      } else if (templateType === 'quote') {
        subject = `Custom Proposal & Scope Breakdown for ${clientName || 'Your Business'}`;
        draft = `Thank you for contacting Zavron Solutions.\n\nBased on your requirements ("${details || service}"), our engineering team has prepared an initial scope and milestone breakdown.\n\n${userPrompt ? 'Special Note: ' + userPrompt + '\n\n' : ''}Our standard turn-around includes dedicated technical architecture, sub-second performance engineering, and full white-hat SEO setup.\n\nWould you like us to send over the formal Statement of Work (SOW) and pricing schedule for your review?\n\nBest regards,\nMuhammad Junaid\nFounder & Principal Strategist\nZavron Solutions`;
      } else if (templateType === 'info') {
        subject = `Quick Clarification on your ${service || 'Project'} Inquiry`;
        draft = `Thank you for your interest in partnering with Zavron Solutions.\n\nTo ensure we provide the most accurate timeline and strategic scope for your project ("${details || service}"), could you share a few more details?\n\n1. Target launch timeline\n2. Any existing tech stack or third-party integrations required\n3. Primary KPIs or goals you are aiming to achieve\n\n${userPrompt ? 'Additional context: ' + userPrompt + '\n\n' : ''}Looking forward to collaborating!\n\nWarm regards,\nMuhammad Junaid\nFounder & Principal Strategist\nZavron Solutions`;
      } else {
        // Custom prompt based draft
        draft = `Thank you for getting in touch with Zavron Solutions regarding "${details || service}".\n\n${userPrompt ? userPrompt + '\n\n' : 'We specialize in delivering high-performance digital solutions tailored to US businesses.\n\n'}We are ready to move your project forward immediately. Please let me know if you have any questions or if you would like to connect on a quick introductory call.\n\nWarm regards,\nMuhammad Junaid\nFounder & Principal Strategist\nZavron Solutions`;
      }

      return sendJson(res, 200, { success: true, subject, draft });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 10. Admin Site-Wide Deep SEO Audit: GET
  if (url === '/api/admin/site-audit' && req.method === 'GET') {
    try {
      const htmlFiles = findHtmlFiles(__dirname);
      const auditReports = htmlFiles.map(f => auditHtmlFile(f.fullPath, f.route));

      const totalScore = Math.round(auditReports.reduce((acc, r) => acc + r.score, 0) / (auditReports.length || 1));
      const criticalCount = auditReports.reduce((acc, r) => acc + r.issues.filter(i => i.type === 'critical').length, 0);
      const warningCount = auditReports.reduce((acc, r) => acc + r.issues.filter(i => i.type === 'warning').length, 0);
      const optimizationCount = auditReports.reduce((acc, r) => acc + r.issues.filter(i => i.type === 'optimization').length, 0);

      return sendJson(res, 200, {
        overallScore: totalScore,
        totalPages: auditReports.length,
        criticalCount,
        warningCount,
        optimizationCount,
        pages: auditReports
      });
    } catch (err) {
      console.error('Site audit error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 11. Admin 1-Click SEO Auto Fix: POST
  if (url === '/api/admin/auto-fix-seo' && req.method === 'POST') {
    try {
      const { route } = await parseJsonBody(req);
      let targetFile = path.join(__dirname, route.endsWith('.html') ? route : path.join(route, 'index.html'));
      if (!fs.existsSync(targetFile)) {
        targetFile = path.join(__dirname, route === '/' ? 'index.html' : route + '.html');
      }

      if (fs.existsSync(targetFile)) {
        let content = fs.readFileSync(targetFile, 'utf8');

        // 1. Add canonical if missing
        if (!content.includes('rel="canonical"')) {
          const canonicalUrl = `https://www.zavronsolutions.com${route.replace(/index\.html$/, '').replace(/\/$/, '')}/`;
          content = content.replace(/<\/head>/i, `  <link rel="canonical" href="${canonicalUrl}">\n</head>`);
        }

        // 2. Add default alt to images missing alt
        content = content.replace(/<img(?![^>]*\balt=)([^>]+)>/gi, '<img alt="Zavron Solutions Digital Agency"$1>');

        fs.writeFileSync(targetFile, content, 'utf8');
        return sendJson(res, 200, { success: true, message: `SEO fixes applied to ${route}!` });
      }
      return sendJson(res, 404, { success: false, error: 'File not found' });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 12. Admin Update Page SEO: POST — inline edit title/meta/canonical in HTML file
  if (url === '/api/admin/update-page-seo' && req.method === 'POST') {
    try {
      const { route, title, metaDescription, canonical } = await parseJsonBody(req);
      let targetFile = path.join(__dirname, route.endsWith('.html') ? route : path.join(route, 'index.html'));
      if (!fs.existsSync(targetFile)) {
        targetFile = path.join(__dirname, route === '/' ? 'index.html' : route + '.html');
      }
      if (!fs.existsSync(targetFile)) {
        return sendJson(res, 404, { success: false, error: 'HTML file not found for route: ' + route });
      }

      let content = fs.readFileSync(targetFile, 'utf8');

      // Update title
      if (title) {
        content = content.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
      }
      // Update meta description
      if (metaDescription) {
        content = content.replace(/(<meta[^>]*name=["']description["'][^>]*content=["'])[^"']*([^>]*>)/i, `$1${metaDescription}$2`);
        content = content.replace(/(<meta[^>]*content=["'])[^"']*([^>]*name=["']description["'][^>]*>)/i, `$1${metaDescription}$2`);
      }
      // Update canonical
      if (canonical) {
        if (content.includes('rel="canonical"')) {
          content = content.replace(/(<link[^>]*rel=["']canonical["'][^>]*href=["'])[^"']*([^>]*>)/i, `$1${canonical}$2`);
        } else {
          content = content.replace(/<\/head>/i, `  <link rel="canonical" href="${canonical}">\n</head>`);
        }
      }

      fs.writeFileSync(targetFile, content, 'utf8');
      return sendJson(res, 200, { success: true, message: `SEO data updated for ${route}` });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 13. Admin Live Chat SSE Stream: GET — real-time push to admin panel
  if (url === '/api/admin/live-chat-stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('retry: 3000\n\n');

    // Send existing sessions on connect
    const sessions = Array.from(liveChatSessions.entries()).map(([id, s]) => ({ id, ...s, messages: s.messages }));
    res.write(`event: init\ndata: ${JSON.stringify(sessions)}\n\n`);

    adminSSEClients.push(res);

    req.on('close', () => {
      const idx = adminSSEClients.indexOf(res);
      if (idx >= 0) adminSSEClients.splice(idx, 1);
    });
    return; // Keep connection open
  }

  // 14. Admin Send Chat Reply: POST — human takeover
  if (url === '/api/admin/send-chat-reply' && req.method === 'POST') {
    try {
      const { sessionId, message } = await parseJsonBody(req);
      if (!sessionId || !message) {
        return sendJson(res, 400, { success: false, error: 'sessionId and message required' });
      }

      let session = liveChatSessions.get(sessionId);
      if (!session) {
        session = { messages: [], userInfo: {}, adminJoined: true };
        liveChatSessions.set(sessionId, session);
      }
      session.adminJoined = true;

      const msgObj = { from: 'admin', text: message, time: new Date().toISOString() };
      session.messages.push(msgObj);

      // Push to all admin SSE clients
      const payload = JSON.stringify({ type: 'admin_reply', sessionId, message: msgObj });
      adminSSEClients.forEach(client => {
        try { client.write(`event: message\ndata: ${payload}\n\n`); } catch(e) {}
      });

      return sendJson(res, 200, { success: true, message: 'Reply sent to user' });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 15. Get chat session status (for user chatbot to check if human joined)
  if (url.startsWith('/api/chat-status/') && req.method === 'GET') {
    const sessionId = url.replace('/api/chat-status/', '');
    const session = liveChatSessions.get(sessionId);
    const adminJoined = session ? session.adminJoined : false;
    const pendingMessages = (session && session.messages) ? session.messages.filter(m => m.from === 'admin' && !m.delivered) : [];
    // Mark as delivered
    if (session) {
      session.messages.forEach(m => { if (m.from === 'admin') m.delivered = true; });
    }
    return sendJson(res, 200, { adminJoined, messages: pendingMessages });
  }

  // =========================================================================
  // SERVE STATIC FILES
  // =========================================================================
  let reqPath = url;
  if (reqPath === '/') reqPath = '/index.html';
  if (reqPath.endsWith('/')) reqPath += 'index.html';

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
    const notFoundPath = path.join(__dirname, '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      fs.createReadStream(notFoundPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, async () => {
  console.log(`\n🚀 Zavron Solutions Server listening on http://localhost:${PORT}`);
  console.log(`🔐 Admin Portal: http://localhost:${PORT}/admin/login.html`);
  console.log(`🌐 Live Website: http://localhost:${PORT}/\n`);

  // Verify SMTP connection on startup
  try {
    const { transporter } = await import('./scripts/emailService.js');
    await transporter.verify();
    console.log(`✅ SMTP Connection Verified — Email delivery active (Gmail SMTP ready)\n`);
  } catch (err) {
    console.warn(`⚠️  SMTP Connection Warning: ${err.message}`);
    console.warn(`   Email replies may not deliver. Check Gmail App Password in scripts/emailService.js\n`);
  }
});
