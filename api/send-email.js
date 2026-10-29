/**
 * Vercel Serverless API Endpoint: /api/send-email
 * Robust Lead Capture Handler with Server-Side Validation & Abuse Protection
 */
import { sendInquiryEmails, checkSmtp } from '../scripts/emailService.js';
import { isPersistent, rateLimit, clientIp, pingDatabase } from '../lib/db.js';
import { createLead, updateLead, getChat, updateChat, addChatMessage } from '../lib/store.js';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check: GET /api/send-email?check=1 (never exposes the password)
  if (req.method === 'GET' && req.query && req.query.check) {
    const status = await checkSmtp();
    status.database = isPersistent ? await pingDatabase() : 'not connected';
    res.setHeader('Cache-Control', 'no-store');
    return res.status(status.ok ? 200 : 503).json(status);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload format' });
    }

    // Bot honeypot abuse protection
    if (data._gotcha || data.honeypot || data.website_url_hp) {
      // Silently accept bot submission without dispatching email
      return res.status(200).json({ success: true, message: 'Inquiry received' });
    }

    const email = typeof data.email === 'string' ? data.email.trim() : '';
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const message = typeof data.message === 'string' ? data.message.trim() : '';
    const service = typeof data.service === 'string' ? data.service.trim() : 'General Inquiry';

    // Server-side field validation
    if (!name || name.length < 2 || name.length > 150) {
      return res.status(400).json({ success: false, error: 'Please provide a valid contact name.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({ success: false, error: 'Please provide a valid work email address.' });
    }

    if (message.length > 10000) {
      return res.status(400).json({ success: false, error: 'Message content exceeds maximum allowed length.' });
    }

    // Abuse protection: max 8 submissions per IP per 10 minutes
    if (!(await rateLimit(`lead:${clientIp(req)}`, 8, 600))) {
      return res.status(429).json({ success: false, error: 'Too many submissions. Please wait a few minutes and try again.' });
    }

    // 1. Save the lead first so it is never lost, even if email delivery fails
    let lead = null;
    try {
      lead = await createLead({ ...data, name, email, service, message });
      if (data.sessionId) {
        const chat = await getChat(String(data.sessionId));
        if (chat) {
          await updateChat(chat.id, { userInfo: { name, email, phone: data.phone || '' } });
          await addChatMessage(chat.id, 'system', `Lead captured: ${name} <${email}>`);
        }
      }
    } catch (dbErr) {
      console.error('Lead storage error:', dbErr.message);
    }

    // 2. Dispatch emails via SMTP (admin notification + client confirmation)
    let result = null;
    let smtpError = null;
    try {
      result = await sendInquiryEmails({ ...data, name, email, service, message });
    } catch (mailErr) {
      smtpError = mailErr;
      console.error('API Email Dispatch Error:', mailErr);
    }

    const delivery = {
      adminSent: !!(result && result.adminMessageId),
      clientSent: !!(result && result.clientMessageId),
      clientError: (result && result.clientError) || null,
      error: smtpError ? String(smtpError.code || smtpError.responseCode || 'ERROR') : null,
      at: new Date().toISOString()
    };
    if (lead) {
      try { await updateLead(lead.id, { delivery }); } catch (e) { /* non-fatal */ }
    }

    // Accept the inquiry when it was emailed OR safely stored in the database
    if (!smtpError || (lead && isPersistent)) {
      return res.status(200).json({
        success: true,
        accepted: true,
        leadId: lead ? lead.id : null,
        message: 'Inquiry accepted and routed to Zavron Solutions executive desk.',
        delivery
      });
    }
    throw smtpError;
  } catch (error) {
    console.error('API Email Dispatch Error:', error);
    // Return sanitized error without exposing credentials or internal paths
    return res.status(500).json({
      success: false,
      code: error && (error.code || error.responseCode) ? String(error.code || error.responseCode) : 'ERROR',
      error: 'Unable to deliver inquiry via primary mail server. Please try again or email info@zavronsolutions.com directly.'
    });
  }
}
