import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

export const imapConfig = {
  imap: {
    user: process.env.SMTP_USER || 'zavronsolutions@gmail.com',
    password: process.env.SMTP_PASS || 'chrr tbby kjpj dmlt',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 3000
  }
};

let connection = null;

export async function connectImap() {
  try {
    connection = await imaps.connect(imapConfig);
    console.log('✅ IMAP Connection Verified - Ready to receive emails');
    return connection;
  } catch (err) {
    console.error('⚠️ IMAP Connection Failed:', err.message);
    return null;
  }
}

export async function fetchRecentEmails(sinceDate) {
  if (!connection) {
    await connectImap();
    if (!connection) return [];
  }

  try {
    await connection.openBox('INBOX');
    const searchCriteria = ['UNSEEN', ['SINCE', sinceDate.toISOString()]];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: true
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    const emails = [];

    for (const item of messages) {
      const all = item.parts.find(part => part.which === '');
      const id = item.attributes.uid;
      const idHeader = "Imap-Id: "+id+"\r\n";
      
      const mail = await simpleParser(idHeader + all.body);
      
      if (mail.from.value[0].address !== imapConfig.imap.user) {
        emails.push({
          uid: id,
          from: mail.from.value[0],
          subject: mail.subject,
          text: mail.text,
          date: mail.date
        });
      }
    }
    return emails;
  } catch (err) {
    console.error('IMAP Fetch Error:', err);
    connection = null;
    return [];
  }
}
