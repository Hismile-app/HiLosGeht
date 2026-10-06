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
  const targetEmail = clientEmail?.trim() || TEST_TARGET_EMAIL;

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
      bcc: (TEST_TARGET_EMAIL && TEST_TARGET_EMAIL.toLowerCase() !== targetEmail.toLowerCase()) ? TEST_TARGET_EMAIL : undefined,
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

/**
 * Parameters for order change / schedule update notification email.
 */
export interface OrderChangeNotificationParams {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  orderId?: string;
  equipmentName?: string;
  equipmentModel?: string;
  equipmentCategory?: string;
  startDate?: string;
  endDate?: string;
  previousStartDate?: string;
  previousEndDate?: string;
  status: string;
  previousStatus?: string;
  changeType: 'STATUS_CHANGE' | 'DATE_CHANGE' | 'EXTENSION' | 'EQUIPMENT_REALLOCATION' | 'ORDER_MODIFIED';
  changeDescription?: string;
  location?: string;
  dailyRate?: number;
  totalAmount?: number;
  notes?: string;
}

function formatEmailDate(dateStr?: string): string {
  if (!dateStr) return 'TBD';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getStatusBadgeHtml(status: string): string {
  const norm = status?.toUpperCase();
  if (norm === 'CONFIRMED') {
    return `<span style="display: inline-block; background-color: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">✓ CONFIRMED & DISPATCH READY</span>`;
  }
  if (norm === 'CANCELLED') {
    return `<span style="display: inline-block; background-color: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">✕ CANCELLED / RELEASED</span>`;
  }
  return `<span style="display: inline-block; background-color: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">⏳ PENDING DISPATCH REVIEW</span>`;
}

/**
 * Dispatches an automated email to the client whenever ANY date change,
 * status change, extension, machinery reallocation, or order edit occurs.
 */
export async function sendOrderChangeNotificationEmail(
  params: OrderChangeNotificationParams
): Promise<{ success: boolean; messageId?: string }> {
  const targetEmail = params.clientEmail?.trim() || TEST_TARGET_EMAIL;
  const isDateChanged = Boolean(
    (params.previousStartDate && params.startDate && params.previousStartDate !== params.startDate) ||
    (params.previousEndDate && params.endDate && params.previousEndDate !== params.endDate)
  );

  let dynamicHeadline = 'Order Details Updated';
  if (params.changeType === 'EXTENSION') {
    dynamicHeadline = 'Project Duration Extended';
  } else if (params.changeType === 'DATE_CHANGE') {
    dynamicHeadline = 'Project Schedule Rescheduled';
  } else if (params.changeType === 'STATUS_CHANGE') {
    if (params.status === 'CONFIRMED') {
      dynamicHeadline = 'Booking Approved & Confirmed';
    } else if (params.status === 'CANCELLED') {
      dynamicHeadline = 'Booking Hold Released / Cancelled';
    } else {
      dynamicHeadline = 'Booking Status Updated';
    }
  } else if (params.changeType === 'EQUIPMENT_REALLOCATION') {
    dynamicHeadline = 'Machinery Allocation Updated';
  }

  // Determine Subject
  let subject = `[Order Update] Booking Ref #${params.orderId || 'HLG'} - ${params.equipmentName || 'Heavy Equipment'}`;
  if (params.changeType === 'STATUS_CHANGE' && params.status === 'CONFIRMED') {
    subject = `✅ Booking Confirmed: ${params.equipmentName || 'Heavy Equipment'} - HLG Fleet Dispatch`;
  } else if (params.changeType === 'STATUS_CHANGE' && params.status === 'CANCELLED') {
    subject = `⚠️ Booking Notice: Hold Released / Cancelled - ${params.equipmentName || 'Heavy Equipment'}`;
  } else if (params.changeType === 'EXTENSION') {
    subject = `📅 Project Extended: ${params.equipmentName || 'Heavy Equipment'} to ${formatEmailDate(params.endDate)}`;
  } else if (params.changeType === 'DATE_CHANGE') {
    subject = `📅 Schedule Updated: ${params.equipmentName || 'Heavy Equipment'} (${formatEmailDate(params.startDate)} - ${formatEmailDate(params.endDate)})`;
  } else if (params.changeType === 'EQUIPMENT_REALLOCATION') {
    subject = `🚜 Equipment Allocation Updated: ${params.equipmentName || 'Heavy Equipment'}`;
  }

  // Calculate added days if extended
  let extensionSnippet = '';
  if (params.changeType === 'EXTENSION' && params.previousEndDate && params.endDate) {
    const prevTime = new Date(params.previousEndDate).getTime();
    const newTime = new Date(params.endDate).getTime();
    const diffDays = Math.round((newTime - prevTime) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      extensionSnippet = `
        <div style="margin-top: 10px; display: inline-block; background-color: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace;">
          +${diffDays} ADDITIONAL DAY${diffDays > 1 ? 'S' : ''} ADDED TO DISPATCH TIMELINE
        </div>
      `;
    }
  }

  // WhatsApp support link
  const waNumber = '254748866823';
  const waText = encodeURIComponent(
    `Hello HLG Dispatch, regarding Order #${params.orderId || ''} (${params.equipmentName || 'Equipment'}).`
  );
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

  const contentHtml = `
    <!-- Top Status Banner -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; border-bottom: 1px solid #F3F4F6; padding-bottom: 14px;">
      <div>
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6B7280; letter-spacing: 0.5px;">Booking Reference:</span>
        <div style="font-family: monospace; font-size: 14px; font-weight: 800; color: #111827; margin-top: 2px;">
          #${params.orderId || 'HLG-BOOKING'}
        </div>
      </div>
      <div>
        ${getStatusBadgeHtml(params.status)}
      </div>
    </div>

    <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      ${dynamicHeadline}
    </h2>

    <p style="margin: 0 0 16px 0; color: #4B5563; font-size: 14px; line-height: 1.6;">
      Dear <strong>${params.clientName}</strong>,<br>
      This is an official schedule & dispatch notification from <strong>Hi Los Geht Heavy Machinery & Infrastructure Ltd.</strong> regarding your equipment booking.
    </p>

    <!-- Change Summary Alert Box -->
    <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; border-left: 4px solid #D95400; padding: 16px 18px; border-radius: 8px; margin: 18px 0;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9A3412; letter-spacing: 0.5px; margin-bottom: 4px;">
        Modification Summary:
      </div>
      <div style="font-size: 14px; font-weight: 600; color: #431407; line-height: 1.5;">
        ${params.changeDescription || 'Your order schedule or status has been updated by HLG Dispatch Administration.'}
      </div>
    </div>

    <!-- Date Comparison Box (if dates were changed or extended) -->
    ${isDateChanged ? `
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px 20px; margin: 18px 0;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 12px;">
          📅 Schedule Timeline Modification
        </div>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-bottom: 8px; width: 45%; vertical-align: top;">
              <span style="font-size: 10px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Previous Dates:</span><br>
              <span style="font-size: 13px; color: #64748B; text-decoration: line-through; font-family: monospace;">
                ${formatEmailDate(params.previousStartDate)} → ${formatEmailDate(params.previousEndDate)}
              </span>
            </td>
            <td style="padding-bottom: 8px; width: 10%; text-align: center; vertical-align: middle; color: #D95400; font-size: 18px; font-weight: bold;">
              &rarr;
            </td>
            <td style="padding-bottom: 8px; width: 45%; vertical-align: top;">
              <span style="font-size: 10px; color: #059669; text-transform: uppercase; font-weight: 700;">New Confirmed Schedule:</span><br>
              <span style="font-size: 14px; color: #065F46; font-weight: 800; font-family: monospace;">
                ${formatEmailDate(params.startDate)} → ${formatEmailDate(params.endDate)}
              </span>
            </td>
          </tr>
        </table>
        ${extensionSnippet}
      </div>
    ` : ''}

    <!-- Detailed Order Parameters Table -->
    <div style="margin: 22px 0;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 0.5px; margin-bottom: 8px;">
        Machinery & Deployment Specifications:
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0 6px;">
        <tr>
          <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px; width: 35%;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Assigned Machinery</div>
          </td>
          <td style="padding: 10px 14px; background-color: #F9FAFB; border-radius: 6px;">
            <strong style="color: #111827; font-size: 13px;">${params.equipmentName || 'Heavy Equipment'}</strong>
            ${params.equipmentModel ? `<span style="color: #6B7280; font-size: 11px; margin-left: 6px; font-family: monospace;">(${params.equipmentModel})</span>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Active Project Schedule</div>
          </td>
          <td style="padding: 10px 14px; background-color: #F9FAFB; border-radius: 6px;">
            <span style="color: #065F46; font-weight: 700; font-size: 13px; font-family: monospace;">
              ${formatEmailDate(params.startDate)} → ${formatEmailDate(params.endDate)}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Project Site Location</div>
          </td>
          <td style="padding: 10px 14px; background-color: #F9FAFB; border-radius: 6px;">
            <span style="color: #374151; font-size: 13px; font-weight: 600;">
              ${params.location || 'Meru County / Mt. Kenya Region'}
            </span>
          </td>
        </tr>
        ${params.dailyRate ? `
          <tr>
            <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px;">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Daily Hire Rate</div>
            </td>
            <td style="padding: 10px 14px; background-color: #F9FAFB; border-radius: 6px;">
              <span style="color: #111827; font-weight: 700; font-size: 13px; font-family: monospace;">
                KES ${params.dailyRate.toLocaleString()} / day
              </span>
            </td>
          </tr>
        ` : ''}
        ${params.notes ? `
          <tr>
            <td style="padding: 10px 14px; background-color: #F9FAFB; border-left: 3px solid #D95400; border-radius: 6px;">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280;">Dispatch Notes</div>
            </td>
            <td style="padding: 10px 14px; background-color: #F9FAFB; border-radius: 6px;">
              <span style="color: #4B5563; font-size: 12px; line-height: 1.4;">
                ${params.notes}
              </span>
            </td>
          </tr>
        ` : ''}
      </table>
    </div>

    <!-- Exclusive Deployment Assurance -->
    <div style="background-color: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
      <div style="font-size: 12px; color: #166534; font-weight: 600; line-height: 1.5;">
        🔒 <strong>Exclusive Machine Allocation:</strong> HLG guarantees that during confirmed project dates, your assigned heavy machinery is dedicated solely to your site without double-booking or shared assignment.
      </div>
    </div>

    <!-- Action Buttons -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0 16px 0;">
      <tr>
        <td align="center">
          <a href="${waLink}" target="_blank" style="display: inline-block; background-color: #10B981; color: #FFFFFF !important; font-weight: 800; font-size: 12px; text-decoration: none; padding: 13px 26px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-right: 10px;">
            💬 Chat Dispatch on WhatsApp &rarr;
          </a>
          <a href="tel:+254717186396" style="display: inline-block; background-color: #D95400; color: #FFFFFF !important; font-weight: 800; font-size: 12px; text-decoration: none; padding: 13px 26px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(217, 84, 0, 0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            📞 Call Desk: +254 717 186396
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0 0; font-size: 13px; color: #4B5563; line-height: 1.5;">
      If you have questions regarding site access, low-bed transport logistics, fuel provisions, or wish to adjust your project dates, please reach out to our dispatch officers immediately.<br><br>
      Warm regards,<br>
      <strong style="color: #111827;">HLG Fleet Operations & Logistics Desk</strong><br>
      <span style="font-size: 12px; color: #6B7280;">Hi Los Geht Heavy Machinery & Infrastructure Ltd. • Meru, Kenya</span>
    </p>
  `;

  const htmlContent = renderWhiteThemedLayout({
    title: dynamicHeadline,
    subtitle: 'Heavy Machinery Fleet Operations & Logistics • Meru, Kenya',
    contentHtml,
  });

  try {
    const info = await transporter.sendMail({
      from: `"HLG Fleet Dispatch" <${smtpUser}>`,
      to: targetEmail,
      bcc: (TEST_TARGET_EMAIL && TEST_TARGET_EMAIL.toLowerCase() !== targetEmail.toLowerCase()) ? TEST_TARGET_EMAIL : undefined,
      subject,
      text: `${dynamicHeadline}\n\nClient: ${params.clientName}\nBooking Ref: #${params.orderId || 'HLG'}\nStatus: ${params.status}\nMachinery: ${params.equipmentName}\nDates: ${params.startDate} to ${params.endDate}\n${params.changeDescription || ''}\n\nDirect Hotline: +254 717 186396`,
      html: htmlContent,
    });

    console.log(`📧 Order Change Email Dispatched to: ${targetEmail} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send order change email:', error.message);
    return { success: false };
  }
}

