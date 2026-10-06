import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpUser = process.env.SMTP_USER || 'hilosgehtinfo@gmail.com';
const smtpPass = process.env.SMTP_PASS || 'srtk slon wsrl hpat';
export const TEST_TARGET_EMAIL = process.env.TEST_EMAIL_TARGET || 'kbrian1237@gmail.com';

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for 587
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function verifySmtpConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ SMTP Mailer Handshake Successful (Gmail App Auth)');
    return true;
  } catch (error: any) {
    console.warn('⚠️ SMTP Verify Warning:', error.message);
    return false;
  }
}

const HLG_LOGO_URL = 'https://hi-los-geht.vercel.app/logo.png';

/**
 * Reusable white-themed email wrapper compatible with major email clients.
 */
function renderWhiteThemedLayout({
  title,
  subtitle,
  contentHtml,
}: {
  title: string;
  subtitle: string;
  contentHtml: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #F4F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F4F5F7;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F5F7; padding: 30px 15px;">
        <tr>
          <td align="center">
            <!-- Main White Card -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
              
              <!-- Header Section -->
              <tr>
                <td align="center" style="padding: 36px 30px 24px 30px; border-bottom: 1px solid #F3F4F6; background-color: #FFFFFF;">
                  <table border="0" cellpadding="0" cellspacing="0" align="center">
                    <tr>
                      <td align="center">
                        <img src="${HLG_LOGO_URL}" alt="Hi Los Geht Logo" width="60" height="60" style="display: block; width: 60px; height: 60px; object-fit: contain; margin-bottom: 12px;" />
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <div style="font-size: 22px; font-weight: 900; color: #D95400; letter-spacing: 1.5px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          HI LOS GEHT (HLG)
                        </div>
                        <div style="font-size: 12px; color: #6B7280; margin-top: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.3px;">
                          ${subtitle}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px 32px 28px 32px; color: #374151; font-size: 14px; line-height: 1.65; background-color: #FFFFFF;">
                  ${contentHtml}
                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td style="padding: 24px 30px; background-color: #FAFAFA; border-top: 1px solid #F3F4F6; font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.6;">
                  <strong style="color: #4B5563;">Hi Los Geht Heavy Machinery & Infrastructure Ltd.</strong><br>
                  Meru County Operations • Mt. Kenya Logistics Hub • P.O. Box 2439-60200 Meru, Kenya<br>
                  Direct Hotline: <strong style="color: #D95400;">+254 717 186396</strong> | WhatsApp: <strong style="color: #10B981;">+254 748 866823</strong><br>
                  Official Web Portal: <a href="https://hi-los-geht.vercel.app/" style="color: #D95400; text-decoration: underline;">https://hi-los-geht.vercel.app/</a>
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
 * Dispatches staff onboarding invitation email.
 */
export async function sendStaffOnboardingEmail(
  recipientEmail: string,
  staffName: string,
  onboardingToken: string
): Promise<{ success: boolean; messageId?: string }> {
  const targetEmail = recipientEmail?.trim() || TEST_TARGET_EMAIL;
  const clientUrl = process.env.CLIENT_URL || 'https://hi-los-geht.vercel.app';
  const setupLink = `${clientUrl.replace(/\/$/, '')}/onboarding/${onboardingToken}`;

  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      Welcome to the HLG Fleet Team, ${staffName}!
    </h2>
    <p style="margin: 0 0 16px 0; color: #4B5563; font-size: 14px; line-height: 1.6;">
      You have been officially invited by HLG Dispatch Administration to join our heavy equipment operations portal as a certified <strong>Heavy Machinery Operator / Personnel</strong>.
    </p>

    <!-- Welcome & Role Card -->
    <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; border-left: 4px solid #D95400; padding: 18px 20px; border-radius: 10px; margin: 20px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-weight: 800; color: #9A3412; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
          Personnel Account Setup
        </span>
        <span style="background-color: #EA580C; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 12px; font-family: monospace;">
          ROLE: OPERATOR
        </span>
      </div>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #431407; line-height: 1.5;">
        Complete your one-time activation to set up your secure password and gain access to the Operator Daily Log & Machinery Telemetry Ledger.
      </p>
    </div>

    <!-- Call-to-Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
      <tr>
        <td align="center">
          <a href="${setupLink}" target="_blank" style="display: inline-block; background-color: #D95400; color: #FFFFFF !important; font-weight: 800; font-size: 13px; text-decoration: none; padding: 15px 32px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.6px; box-shadow: 0 4px 14px rgba(217, 84, 0, 0.35); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Create Password & Activate Account &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Direct Link Fallback -->
    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 14px 16px; margin: 20px 0;">
      <div style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin-bottom: 6px;">
        Manual Activation Link:
      </div>
      <div style="font-family: monospace; font-size: 11px; color: #D95400; word-break: break-all; line-height: 1.4;">
        ${setupLink}
      </div>
    </div>

    <p style="font-size: 12px; color: #6B7280; line-height: 1.5; margin: 20px 0 0 0;">
      🔒 <strong>Security Notice:</strong> This activation token is cryptographically signed and valid for <strong>7 days</strong> for <strong>${recipientEmail}</strong>. If you did not request this invitation, please inform HLG Dispatch immediately at <strong>+254 717 186396</strong>.
    </p>
  `;

  const htmlContent = renderWhiteThemedLayout({
    title: 'HLG Staff Activation',
    subtitle: 'Heavy Machinery Fleet Operations & Logistics • Meru, Kenya',
    contentHtml,
  });

  try {
    const info = await transporter.sendMail({
      from: `"HLG Fleet Dispatch" <${smtpUser}>`,
      to: targetEmail,
      bcc: TEST_TARGET_EMAIL && TEST_TARGET_EMAIL !== targetEmail ? TEST_TARGET_EMAIL : undefined,
      subject: `HLG Staff Activation: Welcome ${staffName} to Heavy Machinery Operations`,
      text: `Welcome to HLG Fleet Team, ${staffName}!\n\nActivate your operator account by visiting: ${setupLink}\n\nValid for 7 days.`,
      html: htmlContent,
    });

    console.log(`📧 Onboarding Email Dispatched to: ${targetEmail} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send onboarding email:', error.message);
    return { success: false };
  }
}

/**
 * Dispatches contact inquiry notification email to administration.
 */
export async function sendContactInquiryEmail(inquiryData: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceCategory?: string;
  location?: string;
  startDate?: string;
  notes?: string;
}): Promise<{ success: boolean; messageId?: string }> {
  const targetEmail = TEST_TARGET_EMAIL;

  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 19px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      New Heavy Machinery Service Inquiry
    </h2>
    <p style="margin: 0 0 16px 0; color: #4B5563; font-size: 13px;">
      A prospective client has submitted an equipment hire / infrastructure lead via the website contact form:
    </p>

    <!-- Field Details Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px; border-collapse: separate; border-spacing: 0 8px;">
      <tr>
        <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Client Name</div>
          <div style="font-size: 14px; font-weight: 700; color: #111827; margin-top: 2px;">${inquiryData.clientName}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Client Email</div>
          <div style="font-size: 13px; font-weight: 600; color: #111827; margin-top: 2px; font-family: monospace;">${inquiryData.clientEmail}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Phone / WhatsApp</div>
          <div style="font-size: 13px; font-weight: 700; color: #111827; margin-top: 2px; font-family: monospace;">${inquiryData.clientPhone}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Required Machinery / Service</div>
          <div style="font-size: 13px; font-weight: 700; color: #D95400; margin-top: 2px;">${inquiryData.serviceCategory || 'General Machinery Hire'}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Project Location & Start Date</div>
          <div style="font-size: 13px; font-weight: 600; color: #111827; margin-top: 2px;">
            ${inquiryData.location || 'Meru County'} • ${inquiryData.startDate || 'Immediate'}
          </div>
        </td>
      </tr>
    </table>

    <!-- Project Scope -->
    <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; padding: 14px 16px; border-radius: 8px; margin: 16px 0;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9A3412;">Project Scope & Client Notes:</div>
      <div style="font-size: 13px; color: #431407; margin-top: 4px; line-height: 1.5; white-space: pre-line;">${inquiryData.notes || 'No extra notes specified.'}</div>
    </div>

    <!-- Direct WhatsApp Action -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 10px 0;">
      <tr>
        <td align="center">
          <a href="https://wa.me/${(inquiryData.clientPhone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inquiryData.clientName)}%2C%20HLG%20Heavy%20Machinery%20Dispatch%20confirming%20receipt%20of%20your%20inquiry." target="_blank" style="display: inline-block; background-color: #10B981; color: #FFFFFF !important; font-weight: 700; font-size: 12px; text-decoration: none; padding: 12px 24px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
            Follow Up via WhatsApp &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  const htmlContent = renderWhiteThemedLayout({
    title: 'New Machinery Inquiry',
    subtitle: 'Lead Notification • Meru County & Mt. Kenya Region',
    contentHtml,
  });

  try {
    const info = await transporter.sendMail({
      from: `"HLG Web Dispatch" <${smtpUser}>`,
      to: targetEmail,
      subject: `[NEW INQUIRY] ${inquiryData.serviceCategory || 'Machinery'} - ${inquiryData.clientName} (${inquiryData.location || 'Meru'})`,
      text: `New Inquiry from ${inquiryData.clientName} (${inquiryData.clientPhone}, ${inquiryData.clientEmail})\nService: ${inquiryData.serviceCategory || 'General'}\nLocation: ${inquiryData.location || 'Meru'}\nNotes: ${inquiryData.notes || 'None'}`,
      html: htmlContent,
    });

    console.log(`📧 Contact Inquiry Email Dispatched to: ${targetEmail} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send contact inquiry email:', error.message);
    return { success: false };
  }
}

/**
 * Dispatches thank-you email to prospective clients.
 */
export async function sendClientThankYouEmail(
  clientEmail: string,
  clientName: string
): Promise<{ success: boolean; messageId?: string }> {
  const targetEmail = process.env.NODE_ENV === 'production' ? clientEmail : TEST_TARGET_EMAIL;

  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      Thank You for Your Inquiry, ${clientName}!
    </h2>
    <p style="margin: 0 0 14px 0; color: #4B5563; font-size: 14px; line-height: 1.6;">
      We have successfully received your inquiry at <strong>Hi Los Geht Heavy Machinery & Infrastructure Ltd.</strong>
    </p>
    <p style="margin: 0 0 16px 0; color: #4B5563; font-size: 14px; line-height: 1.6;">
      Our fleet dispatch operations team in Meru County is currently reviewing your project specifications and equipment requirements. We will contact you shortly with equipment availability, logistics details, and tailored quotation estimates.
    </p>

    <!-- Support Contacts Box -->
    <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; border-left: 4px solid #D95400; padding: 16px 18px; border-radius: 8px; margin: 20px 0;">
      <div style="font-weight: 800; color: #9A3412; font-size: 13px; text-transform: uppercase;">
        Urgent Site Dispatch?
      </div>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #431407; line-height: 1.5;">
        For emergency road grading, quarry excavation, or crane deployment, call our chief dispatch desk directly at <strong style="color: #D95400;">+254 717 186396</strong>.
      </p>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #374151;">
      Best regards,<br>
      <strong style="color: #111827;">The HLG Fleet Operations Team</strong><br>
      <span style="font-size: 12px; color: #6B7280;">Meru, Kenya</span>
    </p>
  `;

  const htmlContent = renderWhiteThemedLayout({
    title: 'Thank You for Contacting Hi Los Geht',
    subtitle: 'Heavy Machinery Fleet Operations & Logistics • Meru, Kenya',
    contentHtml,
  });

  try {
    const info = await transporter.sendMail({
      from: `"HLG Dispatch" <${smtpUser}>`,
      to: targetEmail,
      subject: `Thank you for contacting Hi Los Geht, ${clientName}!`,
      text: `Dear ${clientName},\n\nThank you for reaching out to Hi Los Geht! We have received your inquiry and our dispatch team will get back to you shortly.\n\nBest regards,\nThe HLG Dispatch Team`,
      html: htmlContent,
    });

    console.log(`📧 Thank You Email Dispatched to: ${targetEmail} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send thank you email:', error.message);
    return { success: false };
  }
}
