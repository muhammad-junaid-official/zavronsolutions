import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ success: false, error: 'Lead ID and status are required' });
    }

    const leadsFile = path.join(process.cwd(), 'data', 'leads.json');
    let leads = [];
    if (fs.existsSync(leadsFile)) {
      leads = JSON.parse(fs.readFileSync(leadsFile, 'utf8') || '[]');
    }

    const lead = leads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
      return res.status(200).json({ success: true, message: 'Status updated' });
    }
    return res.status(404).json({ success: false, error: 'Lead not found' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
