import { Request, Response } from 'express';
import crypto from 'crypto';
import db from '../config/db';
import { sendStaffOnboardingEmail, TEST_TARGET_EMAIL } from '../services/nodemailer';

export async function inviteStaff(req: Request, res: Response) {
  try {
    const { fullName, email, phoneNumber, role } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ success: false, error: 'Full name and email are required' });
    }

    // Generate secure onboarding token
    const onboardingToken = 'hlg_' + crypto.randomBytes(24).toString('hex');

    // Create or update profile with PENDING_SETUP
    const profileRes = await db.query(`
      INSERT INTO public.profiles (
        full_name, email, phone_number, role, account_status, onboarding_token
      ) VALUES (
        $1, $2, $3, $4, 'PENDING_SETUP', $5
      )
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone_number = EXCLUDED.phone_number,
        role = EXCLUDED.role,
        onboarding_token = EXCLUDED.onboarding_token,
        account_status = 'PENDING_SETUP'
      RETURNING id, full_name, email, role, onboarding_token;
    `, [fullName, email, phoneNumber || null, role || 'OPERATOR', onboardingToken]);

    const profile = profileRes.rows[0];

    // Dispatch invitation email via SMTP (routes to test target kbrian1237@gmail.com)
    const emailResult = await sendStaffOnboardingEmail(profile.email, profile.full_name, onboardingToken);

    return res.status(201).json({
      success: true,
      data: {
        profile,
        emailSent: emailResult.success,
        targetEmail: TEST_TARGET_EMAIL,
        onboardingToken,
      },
      message: `Staff invitation dispatched to ${profile.email} (Testing recipient: ${TEST_TARGET_EMAIL})`,
    });
  } catch (error: any) {
    console.error('Error inviting staff:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function verifyOnboardingToken(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const result = await db.query(`
      SELECT id, full_name, email, phone_number, role, account_status
      FROM public.profiles
      WHERE onboarding_token = $1;
    `, [token]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invalid or expired onboarding invitation link' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function completeOnboarding(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { password, phoneNumber } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const result = await db.query(`
      UPDATE public.profiles
      SET 
        password_hash = $1,
        phone_number = COALESCE($2, phone_number),
        account_status = 'ACTIVE',
        onboarding_token = NULL,
        updated_at = NOW()
      WHERE onboarding_token = $3
      RETURNING id, full_name, email, phone_number, role, account_status;
    `, [hash, phoneNumber || null, token]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invalid or expired onboarding token' });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Account activated successfully! You can now log in.',
    });
  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const result = await db.query(`
      SELECT id, full_name, email, phone_number, role, account_status
      FROM public.profiles
      WHERE email = $1 AND (password_hash = $2 OR password_hash IS NULL);
    `, [email, hash]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    return res.status(200).json({
      success: true,
      data: user,
      token: 'jwt_mock_token_' + user.id,
    });
  } catch (error: any) {
    console.error('Error logging in:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllStaff(req: Request, res: Response) {
  try {
    const result = await db.query(`
      SELECT id, full_name, email, phone_number, role, account_status, created_at
      FROM public.profiles
      WHERE role IN ('ADMIN', 'OPERATOR')
      ORDER BY created_at DESC;
    `);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
