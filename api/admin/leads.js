/**
 * Vercel Serverless API Endpoint: /api/admin/leads & /api/leads
 * Returns current leads list
 */
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const leadsFile = path.join(process.cwd(), 'data', 'leads.json');
    if (fs.existsSync(leadsFile)) {
      const data = JSON.parse(fs.readFileSync(leadsFile, 'utf8') || '[]');
      return res.status(200).json(data);
    }
    return res.status(200).json([]);
  } catch (error) {
    return res.status(200).json([]);
  }
}
