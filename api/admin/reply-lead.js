/**
 * Vercel Serverless API Endpoint: /api/admin/reply-lead
 * Dispatches direct admin email replies to leads via SMTP
 */
import { sendDirectReplyEmail } from '../../scripts/emailService.js';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { to, subject, message, recipientName } = data || {};

    if (!to || !message) {
      return res.status(400).json({ success: false, error: 'Recipient email and message body are required' });
    }

    const result = await sendDirectReplyEmail({ to, subject, message, recipientName });
    return res.status(200).json({
      success: true,
      message: `Email dispatched successfully to ${to}`,
      result
    });
  } catch (error) {
    console.error('API Reply Lead Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Email Dispatch Error'
    });
  }
}
