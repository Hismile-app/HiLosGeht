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

export async function sendContactInquiryEmail(inquiryData: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceCategory?: string;
  location?: string;
  startDate?: string;
  notes?: string;
}): Promise<{ success: boolean; messageId?: string }> {
  // CRITICAL RULE: Route all development & testing emails to kbrian1237@gmail.com
  const targetEmail = TEST_TARGET_EMAIL;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background-color: #F8F9FA; color: #09090B; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #D95400; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #D95400; letter-spacing: 1.5px; }
        .subtitle { color: #71717A; font-size: 13px; margin-top: 5px; }
        .content { padding: 25px 0; line-height: 1.6; color: #27272A; }
        .field-group { background: #F8F9FA; border-left: 4px solid #D95400; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px; }
        .field-label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #71717A; letter-spacing: 0.5px; }
        .field-value { font-size: 14px; font-weight: 600; color: #09090B; margin-top: 2px; }
        .notes-box { background: #FFF7ED; border: 1px solid #FFEDD5; padding: 14px; border-radius: 8px; margin-top: 15px; }
        .cta-btn { display: inline-block; background-color: #D95400; color: #FFFFFF !important; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 20px; }
        .footer { border-top: 1px solid #E4E4E7; padding-top: 15px; font-size: 12px; color: #A1A1AA; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HI LOS GEHT (HLG)</div>
          <div class="subtitle">Heavy Machinery Fleet & Infrastructure Inquiry Notification</div>
        </div>
        <div class="content">
          <h2 style="color: #09090B; margin-top: 0;">New Client Inquiry Received</h2>
          <p>A new heavy equipment / infrastructure service lead has been submitted via the website contact form.</p>
          
          <div class="field-group">
            <div class="field-label">Client Name</div>
            <div class="field-value">${inquiryData.clientName}</div>
          </div>

          <div class="field-group">
            <div class="field-label">Work Email</div>
            <div class="field-value">${inquiryData.clientEmail}</div>
          </div>

          <div class="field-group">
            <div class="field-label">Phone / WhatsApp Number</div>
            <div class="field-value">${inquiryData.clientPhone}</div>
          </div>

          <div class="field-group">
            <div class="field-label">Machinery / Service Required</div>
            <div class="field-value">${inquiryData.serviceCategory || 'General Fleet / Heavy Equipment Inquiry'}</div>
          </div>

          <div class="field-group">
            <div class="field-label">Project Location / County</div>
            <div class="field-value">${inquiryData.location || 'Meru County / Mt. Kenya Region'}</div>
          </div>

          <div class="field-group">
            <div class="field-label">Estimated Start Date</div>
            <div class="field-value">${inquiryData.startDate || 'Immediate / Negotiable'}</div>
          </div>

          <div class="notes-box">
            <div class="field-label" style="color: #C2410C;">Project Scope & Specifications</div>
            <div style="font-size: 13px; color: #431407; margin-top: 4px; white-space: pre-line;">${inquiryData.notes || 'No additional notes provided.'}</div>
          </div>

          <div style="text-align: center;">
            <a href="https://wa.me/${(inquiryData.clientPhone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inquiryData.clientName)}%2C%20HLG%20Dispatch%20team%20confirming%20receipt%20of%20your%20inquiry." class="cta-btn">
              Direct WhatsApp Dispatch Follow-up
            </a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Hi Los Geht Heavy Machinery Ltd. Meru County, Kenya.<br>
          Direct Hotline: +254 717 186396 | Email: hilosgehtinfo@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"HLG Web Dispatch" <${smtpUser}>`,
      to: targetEmail, // Strictly routed to testing target
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

export async function sendStaffOnboardingEmail(
  recipientEmail: string,
  staffName: string,
  onboardingToken: string
): Promise<{ success: boolean; messageId?: string }> {
  // CRITICAL RULE: Route all development & testing emails to kbrian1237@gmail.com
  const targetEmail = TEST_TARGET_EMAIL;
  const clientUrl = process.env.CLIENT_URL || 'https://hi-los-geht.vercel.app';
  const setupLink = `${clientUrl.replace(/\/$/, '')}/onboarding/${onboardingToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background-color: #F8F9FA; color: #09090B; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #D95400; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #D95400; letter-spacing: 1.5px; }
        .subtitle { color: #71717A; font-size: 13px; margin-top: 5px; }
        .content { padding: 25px 0; line-height: 1.6; color: #27272A; }
        .welcome-card { background: #FFF7ED; border-left: 4px solid #D95400; padding: 16px; border-radius: 6px; margin: 15px 0; }
        .cta-btn { display: inline-block; background-color: #D95400; color: #FFFFFF !important; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 12px rgba(217, 84, 0, 0.3); font-size: 14px; }
        .link-text { word-break: break-all; font-size: 11px; color: #D95400; font-family: monospace; }
        .footer { border-top: 1px solid #E4E4E7; padding-top: 15px; font-size: 12px; color: #A1A1AA; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HI LOS GEHT (HLG)</div>
          <div class="subtitle">Heavy Machinery Fleet Operations & Logistics — Meru, Kenya</div>
        </div>
        <div class="content">
          <h2 style="color: #09090B; margin-top: 0;">Welcome to the HLG Fleet Team, ${staffName}!</h2>
          <p>You have been officially invited by HLG Dispatch Administration to join our operations portal as a certified Heavy Machinery Operator / Staff Member.</p>
          
          <div class="welcome-card">
            <strong style="color: #9A3412;">Account Activation Required</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #431407;">Please click the button below to create your password and activate your operator field portal access.</p>
          </div>

          <div style="text-align: center;">
            <a href="${setupLink}" class="cta-btn">CREATE PASSWORD & ACTIVATE ACCOUNT</a>
          </div>

          <p style="font-size: 12px; color: #71717A;">If the button above does not open, copy and paste this link into your browser:</p>
          <div class="link-text">${setupLink}</div>

          <p style="font-size: 12px; color: #71717A; margin-top: 15px;">This invitation token is valid for <strong>${recipientEmail}</strong>. If you did not expect this invitation, please contact HLG Dispatch at +254 717 186396.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Hi Los Geht Heavy Machinery Ltd. Meru County, Kenya.<br>
          Official Portal: <a href="https://hi-los-geht.vercel.app/" style="color: #D95400;">https://hi-los-geht.vercel.app/</a>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"HLG Fleet Dispatch" <${smtpUser}>`,
      to: targetEmail, // Strictly routed to test target
      subject: `HLG Staff Activation: Welcome ${staffName} to Heavy Machinery Operations`,
      text: `Welcome to HLG Fleet Team, ${staffName}!\n\nActivate your operator account by visiting: ${setupLink}`,
      html: htmlContent,
    });

    console.log(`📧 Onboarding Email Dispatched to: ${targetEmail} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send onboarding email:', error.message);
    return { success: false };
  }
}
export async function sendClientThankYouEmail(
  clientEmail: string,
  clientName: string
): Promise<{ success: boolean; messageId?: string }> {
  // CRITICAL RULE: Route all development & testing emails to kbrian1237@gmail.com
  // If not testing, we would send to clientEmail, but sticking to TEST_TARGET_EMAIL 
  // rule just to be safe as per previous implementations, OR we can use the provided clientEmail.
  // Given this is a real-world sim but previous functions use TEST_TARGET_EMAIL, 
  // I will send it to clientEmail, but log that we're strictly using test targets if requested. 
  // Wait, let's respect the "CRITICAL RULE: Route all development & testing emails to kbrian1237@gmail.com" 
  // found in other functions.
  const targetEmail = process.env.NODE_ENV === 'production' ? clientEmail : TEST_TARGET_EMAIL;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background-color: #F8F9FA; color: #09090B; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #D95400; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #D95400; letter-spacing: 1.5px; }
        .content { padding: 25px 0; line-height: 1.6; color: #27272A; }
        .footer { border-top: 1px solid #E4E4E7; padding-top: 15px; font-size: 12px; color: #A1A1AA; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HI LOS GEHT</div>
        </div>
        <div class="content">
          <h2 style="color: #09090B; margin-top: 0;">Thank You for Your Inquiry!</h2>
          <p>Dear ${clientName},</p>
          <p>We have successfully received your message and inquiry. Thank you for reaching out to Hi Los Geht Heavy Machinery Ltd.</p>
          <p>Our dispatch team is currently reviewing your requirements and will get right back to you shortly to discuss your project needs.</p>
          <p>If you have any urgent matters, please feel free to call our direct hotline or reply to this email.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The HLG Dispatch Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Hi Los Geht Heavy Machinery Ltd. Meru County, Kenya.<br>
          Direct Hotline: +254 717 186396 | Email: hilosgehtinfo@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

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

