/**
 * Vercel / Netlify Serverless API Endpoint: /api/send-email
 */
import { sendInquiryEmails } from '../scripts/emailService.js';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
    
    if (!data || (!data.email && !data.name)) {
      return res.status(400).json({ success: false, error: 'Missing required client fields' });
    }

    const result = await sendInquiryEmails(data);
    return res.status(200).json({ success: true, message: 'Email dispatched successfully via SMTP', result });
  } catch (error) {
    console.error('API Email Sending Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
