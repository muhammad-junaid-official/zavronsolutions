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

    let aiReply = null;
    if (process.env.OPENAI_API_KEY && message) {
      try {
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.6,
            messages: [
              {
                role: 'system',
                content: `You are the official AI Solutions Strategist for Zavron Solutions (https://www.zavronsolutions.com), an elite US digital solutions agency founded by Muhammad Junaid.
We specialize in:
- Custom Web Engineering (Next.js, React, Node.js, TypeScript)
- Enterprise WordPress & Headless CMS
- High-Converting E-Commerce (Shopify Plus & WooCommerce)
- Technical SEO, Core Web Vitals, Google Maps 3-Pack, Topical Authority
- Google Ads PPC & Social Media Marketing
- UI/UX & Conversion Rate Optimization (CRO)

CRITICAL INSTRUCTIONS:
1. Detect and reply in the EXACT language of the user:
   - If the user speaks Roman Urdu / Hindi (e.g. "mujhy kuch or poochana hai as a humanbaat karo", "rates kya hain", "website banwani hai"), reply fluently in natural, warm Roman Urdu!
   - If the user speaks Urdu (Urdu script), reply in respectful, professional Urdu.
   - If Spanish, reply in Spanish. If Arabic, in Arabic. If French, in French. If German, in German. If English, in English.
2. Tone: Friendly, highly competent, professional, consultative, and human-like.
3. If the user asks to speak to a human or Muhammad Junaid:
   Warmly explain that they can connect directly with Muhammad Junaid or our US senior technical leadership for a free 15-minute discovery consultation, and invite them to leave their contact details.
4. If the user wants a website audit, tell them to share their website URL (e.g. company.com) so you can run an instant live audit. NEVER suggest auditing zavronsolutions.com.
5. Keep answers concise, clear, and well-structured.`
              },
              { role: 'user', content: message }
            ]
          })
        });
        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          aiReply = openAiData.choices?.[0]?.message?.content || null;
        }
      } catch (e) {
        console.error('OpenAI error in api/chat.js:', e);
      }
    }

    return res.status(200).json({
      success: true,
      sessionId: sid,
      reply: aiReply,
      aiGenerated: !!aiReply
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
