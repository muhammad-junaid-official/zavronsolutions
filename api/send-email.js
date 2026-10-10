/**
 * Vercel Serverless API Endpoint: /api/send-email
 * Robust Lead Capture Handler with Server-Side Validation & Abuse Protection
 */
import { sendInquiryEmails } from '../scripts/emailService.js';

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

    // Dispatch emails via primary SMTP
    const result = await sendInquiryEmails({
      ...data,
      name,
      email,
      service,
      message
    });

    return res.status(200).json({
      success: true,
      accepted: true,
      message: 'Inquiry accepted and routed to Zavron Solutions executive desk.',
      delivery: {
        adminSent: !!result.adminMessageId,
        clientSent: !!result.clientMessageId
      }
    });
  } catch (error) {
    console.error('API Email Dispatch Error:', error);
    // Return sanitized error without exposing credentials or internal paths
    return res.status(500).json({
      success: false,
      error: 'Unable to deliver inquiry via primary mail server. Please try again or email zavronsolutions@gmail.com directly.'
    });
  }
}
