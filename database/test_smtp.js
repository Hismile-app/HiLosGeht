const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../client/.env.local') });

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpUser = process.env.SMTP_USER || 'hilosgehtinfo@gmail.com';
const smtpPass = process.env.SMTP_PASS || 'srtk slon wsrl hpat';
const targetEmail = process.env.TEST_EMAIL_TARGET || 'kbrian1237@gmail.com';

console.log('--- Testing SMTP Dispatch Configuration ---');
console.log('SMTP Host:', smtpHost);
console.log('SMTP Port:', smtpPort);
console.log('SMTP User:', smtpUser);
console.log('Target Email:', targetEmail);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

async function main() {
  try {
    console.log('\n1. Verifying SMTP transporter connection...');
    await transporter.verify();
    console.log('✅ SMTP Handshake successful!');

    console.log('\n2. Transmitting live test verification email to:', targetEmail);
    const info = await transporter.sendMail({
      from: `"HLG Heavy Machinery Dispatch" <${smtpUser}>`,
      to: targetEmail,
      subject: `[VERIFIED] HLG System Test: SMTP Delivery Confirmed (${new Date().toLocaleTimeString()})`,
      text: `Hello Brian,\n\nThis is an automated delivery confirmation from Hi-Los-Geht (HLG) Heavy Machinery Ltd.\n\nYour SMTP configuration is active and working properly.\n\nFrom: ${smtpUser}\nTo: ${targetEmail}\nTimestamp: ${new Date().toISOString()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #E4E4E7; border-radius: 12px; padding: 28px; background: #FFFFFF;">
          <div style="border-bottom: 3px solid #D95400; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #D95400; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 1px;">HI LOS GEHT (HLG)</h2>
            <p style="color: #71717A; font-size: 13px; margin: 4px 0 0 0;">Heavy Machinery Operations & Fleet Logistics &bull; Meru, Kenya</p>
          </div>
          <h3 style="color: #09090B; margin-top: 0;">Live SMTP Dispatch Verified &#9989;</h3>
          <p style="color: #3F3F46; line-height: 1.6; font-size: 14px;">
            This email confirms that the HLG Automated Notification and Staff Onboarding SMTP delivery service is 100% operational.
          </p>
          <div style="background: #FFF7ED; border-left: 4px solid #D95400; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
            <div style="font-size: 11px; text-transform: uppercase; color: #9A3412; font-weight: bold;">Dispatcher Details</div>
            <div style="font-size: 13px; color: #431407; margin-top: 4px;">
              <strong>Sender:</strong> ${smtpUser}<br>
              <strong>Recipient:</strong> ${targetEmail}<br>
              <strong>Status:</strong> Delivered via TLS Port ${smtpPort}<br>
              <strong>Server Time:</strong> ${new Date().toISOString()}
            </div>
          </div>
          <p style="color: #71717A; font-size: 12px; line-height: 1.5;">
            All staff invitations, daily voucher submissions, and equipment rental inquiries are routed through this engine.
          </p>
          <div style="border-top: 1px solid #E4E4E7; padding-top: 14px; margin-top: 24px; text-align: center; font-size: 11px; color: #A1A1AA;">
            &copy; ${new Date().getFullYear()} Hi Los Geht Heavy Machinery Ltd. Meru County, Kenya.
          </div>
        </div>
      `,
    });

    console.log('\n🎉 Live email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('SMTP Server Response:', info.response);
  } catch (error) {
    console.error('\n❌ SMTP Verification Failure:', error);
  }
}

main();
