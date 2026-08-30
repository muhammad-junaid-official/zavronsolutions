/**
 * Zavron Solutions - Enterprise Email Service
 * Handles SMTP Email Dispatching via Nodemailer using Gmail SMTP
 */
import nodemailer from 'nodemailer';

// SMTP Configuration
export const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for 587 (uses STARTTLS)
  auth: {
    user: process.env.SMTP_USER || 'zavronsolutions@gmail.com',
    pass: process.env.SMTP_PASS || 'chrr tbby kjpj dmlt'
  }
};

export const transporter = nodemailer.createTransport(smtpConfig);

/**
 * Generate Admin Notification Email Template
 */
export function getAdminEmailTemplate(data) {
  const {
    name = 'N/A',
    email = 'N/A',
    phone = 'N/A',
    company = 'N/A',
    service = 'General Inquiry',
    budget = 'Not specified',
    timeline = 'Not specified',
    message = 'No additional message provided',
    source = 'Website Form'
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Client Inquiry - Zavron Solutions</title>
</head>
<body style="margin: 0; padding: 0; background-color: #061426; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #061426; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #0b1e36; border: 1px solid #1a365d; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #0d2342 0%, #061426 100%); border-bottom: 2px solid #FF7A00;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #FF7A00, #FF5500); border-radius: 8px; text-align: center; line-height: 36px; color: #ffffff; font-weight: bold; font-size: 18px; vertical-align: middle;">
                      Z
                    </div>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin-left: 12px; vertical-align: middle;">ZAVRON <span style="color: #FF7A00;">SOLUTIONS</span></span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(255, 122, 0, 0.15); border: 1px solid #FF7A00; border-radius: 20px; color: #FF7A00; font-size: 12px; font-weight: 600;">NEW LEAD</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin-top: 0; margin-bottom: 8px; color: #ffffff; font-size: 22px; font-weight: 700;">🚀 New Project Inquiry Received</h2>
              <p style="margin-top: 0; margin-bottom: 24px; color: #94a3b8; font-size: 14px;">Source: <strong style="color: #00D2FF;">${source}</strong> | Received: ${new Date().toUTCString()}</p>

              <!-- Client Info Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #061426; border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; width: 35%; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Client Name</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #ffffff; font-size: 15px; font-weight: 600;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Email Address</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #00D2FF; font-size: 15px;"><a href="mailto:${email}" style="color: #00D2FF; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Phone Number</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #ffffff; font-size: 15px;">${phone !== 'N/A' ? `<a href="tel:${phone}" style="color: #ffffff; text-decoration: none;">${phone}</a>` : 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Company</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #ffffff; font-size: 15px;">${company}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Requested Service</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #FF7A00; font-size: 15px; font-weight: 600;">${service}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Budget Range</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; color: #ffffff; font-size: 15px;">${budget}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Timeline</td>
                  <td style="padding: 14px 18px; color: #ffffff; font-size: 15px;">${timeline}</td>
                </tr>
              </table>

              <!-- Project Details / Message -->
              <h3 style="margin-top: 0; margin-bottom: 10px; color: #ffffff; font-size: 16px; font-weight: 600;">Project Scope & Requirements:</h3>
              <div style="background-color: #061426; border: 1px solid #1e293b; border-radius: 8px; padding: 18px; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 24px;">
${message}
              </div>

              <!-- Quick Action CTAs -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re:%20Your%20Inquiry%20with%20Zavron%20Solutions" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #FF7A00, #FF5500); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 12px;">Reply Directly to Client</a>
                    ${phone !== 'N/A' ? `<a href="tel:${phone}" style="display: inline-block; padding: 12px 24px; background-color: #1e293b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 1px solid #334155;">Call Client</a>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #061426; border-top: 1px solid #1a365d; text-align: center; color: #64748b; font-size: 12px;">
              Zavron Solutions Automated Lead Management System &bull; <a href="https://zavronsolutions.com" style="color: #FF7A00; text-decoration: none;">zavronsolutions.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate Client Confirmation / Auto-Responder Email Template
 */
export function getClientConfirmationTemplate(data) {
  const {
    name = 'Valued Client',
    service = 'Digital Solutions & Web Engineering',
    budget = '',
    timeline = ''
  } = data;

  const firstName = name.split(' ')[0] || 'there';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting Zavron Solutions</title>
</head>
<body style="margin: 0; padding: 0; background-color: #061426; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #061426; padding: 35px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #0b1e36; border: 1px solid #1a365d; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.6);">
          
          <!-- Branded Top Banner -->
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, #0f284a 0%, #061426 100%); border-bottom: 2px solid #FF7A00; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; width: 44px; height: 44px; background: linear-gradient(135deg, #FF7A00, #FF5500); border-radius: 10px; text-align: center; line-height: 44px; color: #ffffff; font-weight: 800; font-size: 22px; vertical-align: middle; box-shadow: 0 4px 14px rgba(255,122,0,0.4);">
                      Z
                    </div>
                    <div style="margin-top: 10px;">
                      <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">ZAVRON</span>
                      <span style="font-size: 12px; font-weight: 700; color: #FF7A00; letter-spacing: 4px; display: block; margin-top: 2px;">SOLUTIONS</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin-top: 0; margin-bottom: 16px; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3;">
                Hi ${firstName}, <br><span style="color: #FF7A00;">We Have Received Your Strategy Brief!</span>
              </h1>
              
              <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
                Thank you for reaching out to <strong>Zavron Solutions</strong>. Our Senior Technical Strategists and Software Architects are already reviewing your inquiry to prepare a tailored action plan for your business.
              </p>

              <!-- Inquiry Summary Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #061426; border: 1px solid #1e293b; border-left: 4px solid #FF7A00; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 12px; font-weight: 700; color: #FF7A00; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your Request Summary</div>
                    <div style="font-size: 15px; color: #ffffff; font-weight: 600; margin-bottom: 4px;">Service: <span style="color: #00D2FF;">${service}</span></div>
                    ${budget ? `<div style="font-size: 14px; color: #94a3b8; margin-bottom: 4px;">Target Budget: <span style="color: #ffffff;">${budget}</span></div>` : ''}
                    ${timeline ? `<div style="font-size: 14px; color: #94a3b8;">Preferred Timeline: <span style="color: #ffffff;">${timeline}</span></div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- What Happens Next Section -->
              <h3 style="color: #ffffff; font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">What Happens Next:</h3>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding-bottom: 14px; vertical-align: top; width: 32px;">
                    <div style="width: 24px; height: 24px; background-color: rgba(255,122,0,0.15); border: 1px solid #FF7A00; border-radius: 50%; text-align: center; line-height: 22px; color: #FF7A00; font-size: 12px; font-weight: bold;">1</div>
                  </td>
                  <td style="padding-bottom: 14px; padding-left: 10px; color: #cbd5e1; font-size: 14px; line-height: 1.5;">
                    <strong style="color: #ffffff;">Initial Assessment (Within 2 Business Hours):</strong> A dedicated senior strategist analyzes your website architecture, SEO visibility, and technical needs.
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 14px; vertical-align: top; width: 32px;">
                    <div style="width: 24px; height: 24px; background-color: rgba(255,122,0,0.15); border: 1px solid #FF7A00; border-radius: 50%; text-align: center; line-height: 22px; color: #FF7A00; font-size: 12px; font-weight: bold;">2</div>
                  </td>
                  <td style="padding-bottom: 14px; padding-left: 10px; color: #cbd5e1; font-size: 14px; line-height: 1.5;">
                    <strong style="color: #ffffff;">Strategic Discovery Call:</strong> We discuss high-impact architecture, conversion milestones, and direct ROI targets for your project.
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align: top; width: 32px;">
                    <div style="width: 24px; height: 24px; background-color: rgba(255,122,0,0.15); border: 1px solid #FF7A00; border-radius: 50%; text-align: center; line-height: 22px; color: #FF7A00; font-size: 12px; font-weight: bold;">3</div>
                  </td>
                  <td style="padding-left: 10px; color: #cbd5e1; font-size: 14px; line-height: 1.5;">
                    <strong style="color: #ffffff;">Comprehensive Proposal:</strong> You receive a transparent scope of work, technical architecture roadmap, and milestone schedule.
                  </td>
                </tr>
              </table>

              <!-- Portfolio CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://zavronsolutions.com/work/" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF7A00, #FF5500); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 15px rgba(255,122,0,0.4);">
                      Explore Our 40+ Live Case Studies &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature Block -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #1e293b; padding-top: 20px;">
                <tr>
                  <td>
                    <div style="font-size: 15px; font-weight: 700; color: #ffffff;">Muhammad Junaid</div>
                    <div style="font-size: 13px; color: #FF7A00; font-weight: 600;">CEO &amp; Principal Strategist</div>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Zavron Solutions &bull; <a href="mailto:zavronsolutions@gmail.com" style="color: #00D2FF; text-decoration: none;">zavronsolutions@gmail.com</a></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #061426; border-top: 1px solid #1a365d; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Zavron Solutions. All rights reserved.<br>
                High-Performance Web Engineering, Custom WordPress &amp; Data-Led SEO for American Businesses.
              </p>
              <div>
                <a href="https://zavronsolutions.com" style="color: #FF7A00; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a> &bull;
                <a href="https://zavronsolutions.com/services/" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px;">Services</a> &bull;
                <a href="https://zavronsolutions.com/work/" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px;">Portfolio</a> &bull;
                <a href="https://zavronsolutions.com/privacy-policy/" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Main Dispatcher Function
 * Sends both Admin Notification & Client Confirmation via Gmail SMTP
 */
export async function sendInquiryEmails(data) {
  const {
    name = '',
    email = '',
    service = 'Digital Solutions Inquiry'
  } = data;

  const adminMailOptions = {
    from: `"Zavron Solutions Inquiries" <${smtpConfig.auth.user}>`,
    to: smtpConfig.auth.user, // sends to zavronsolutions@gmail.com
    replyTo: email || smtpConfig.auth.user,
    subject: `🚀 New Lead: ${service} - ${name || 'Website Visitor'}`,
    html: getAdminEmailTemplate(data)
  };

  // 1. Send Admin Email
  const adminResult = await transporter.sendMail(adminMailOptions);

  let clientResult = null;
  // 2. Send Client Confirmation Email if email is valid
  if (email && email.includes('@')) {
    const clientMailOptions = {
      from: `"Muhammad Junaid | Zavron Solutions" <${smtpConfig.auth.user}>`,
      to: email,
      replyTo: smtpConfig.auth.user,
      subject: `Thank you for contacting Zavron Solutions | Your Strategy Brief is Received`,
      html: getClientConfirmationTemplate(data)
    };

    clientResult = await transporter.sendMail(clientMailOptions);
  }

  return {
    success: true,
    adminMessageId: adminResult.messageId,
    clientMessageId: clientResult ? clientResult.messageId : null
  };
}
