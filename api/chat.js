/**
 * Vercel Serverless API Endpoint: /api/chat
 * Handles incoming chat messages, lead capture, and dual email dispatch
 */
import { sendInquiryEmails } from '../scripts/emailService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { message, lead, sessionId } = data || {};
    const sid = sessionId || ('sess_' + Date.now());

    // If a lead was submitted with an email, dispatch dual-email notification
    if (lead && lead.email) {
      try {
        await sendInquiryEmails({
          name: lead.name || 'Chatbot Prospect',
          email: lead.email,
          phone: lead.phone || 'N/A',
          service: lead.service || 'Live Chatbot Inquiry',
          message: `Inquiry / Chat History: ${message || lead.details || 'Live chat session'}\nSource: AI Chat Widget`,
          source: 'Live Chatbot'
        });
      } catch (err) {
        console.error('Chat lead email error:', err);
      }
    }

    return res.status(200).json({
      success: true,
      sessionId: sid,
      message: 'Received'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
