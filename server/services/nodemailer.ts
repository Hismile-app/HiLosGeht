import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', 'config', '.env') });
dotenv.config();

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

export async function sendStaffOnboardingEmail(
  recipientEmail: string,
  staffName: string,
  onboardingToken: string
): Promise<{ success: boolean; messageId?: string }> {
  // CRITICAL RULE: Route all development & testing emails to kbrian1237@gmail.com
  const targetEmail = TEST_TARGET_EMAIL;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const setupLink = `${clientUrl}/onboarding/${onboardingToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background-color: #0A0A0A; color: #FFFFFF; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #121212; border: 1px solid #F37021; border-radius: 8px; padding: 30px; }
        .header { text-align: center; border-bottom: 1px solid #262626; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #F37021; letter-spacing: 2px; }
        .subtitle { color: #8A8A8A; font-size: 14px; margin-top: 5px; }
        .content { padding: 25px 0; line-height: 1.6; color: #E0E0E0; }
        .cta-btn { display: inline-block; background-color: #F37021; color: #FFFFFF !important; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 6px; margin: 20px 0; box-shadow: 0 0 15px rgba(243, 112, 33, 0.4); }
        .footer { border-top: 1px solid #262626; padding-top: 15px; font-size: 12px; color: #666666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HI LOS GEHT (HLG)</div>
          <div class="subtitle">Heavy Machinery Fleet Operations & Logistics — Meru, Kenya</div>
        </div>
        <div class="content">
          <h2>Welcome to the HLG Fleet Team, ${staffName}!</h2>
          <p>You have been officially invited by HLG Dispatch Administration to join our operations portal as a Heavy Machinery Operator/Technician.</p>
          <p>Please click the button below to complete your profile registration and activate your secure password:</p>
          <div style="text-align: center;">
            <a href="${setupLink}" class="cta-btn">ACTIVATE STAFF ACCOUNT</a>
          </div>
          <p style="font-size: 12px; color: #8A8A8A;">This onboarding token is strictly valid for your email account: <strong>${recipientEmail}</strong>. If you did not expect this invitation, please contact HLG administration at +254 717 186396.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Hi Los Geht Heavy Machinery Ltd. Meru County, Kenya.
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
