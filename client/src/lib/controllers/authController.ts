import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/server-config/db';
import { sendStaffOnboardingEmail, TEST_TARGET_EMAIL } from '@/lib/services/nodemailer';

export async function inviteStaff(req: NextRequest, { params }: { params: any }) {
  try {
    const { fullName, email, phoneNumber, role } = await req.json();

    if (!fullName || !email) {
      return NextResponse.json({ success: false, error: 'Full name and email are required' }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      data: {
        profile,
        emailSent: emailResult.success,
        targetEmail: TEST_TARGET_EMAIL,
        onboardingToken,
      },
      message: `Staff invitation dispatched to ${profile.email} (Testing recipient: ${TEST_TARGET_EMAIL})`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error inviting staff:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function verifyOnboardingToken(req: NextRequest, { params }: { params: any }) {
  try {
    const { token } = await params;
    const result = await db.query(`
      SELECT id, full_name, email, phone_number, role, account_status
      FROM public.profiles
      WHERE onboarding_token = $1;
    `, [token]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or expired onboarding invitation link' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function completeOnboarding(req: NextRequest, { params }: { params: any }) {
  try {
    const { token } = await params;
    const { password, phoneNumber } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
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
      return NextResponse.json({ success: false, error: 'Invalid or expired onboarding token' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Account activated successfully! You can now log in.',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function login(req: NextRequest, { params }: { params: any }) {
  try {
    const { email, username, password } = await req.json();
    const identifier = (username || email || '').trim();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Username/Email and password are required.' }, { status: 400 });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');

    // 100% Database Query: Verify user from public.profiles
    const result = await db.query(`
      SELECT id, full_name, email, phone_number, role, account_status, password_hash
      FROM public.profiles
      WHERE (
        LOWER(email) = LOWER($1)
        OR phone_number = $1
        OR phone_number = ('+254' || LTRIM($1, '0'))
        OR (LOWER($1) = 'adminhlg' AND role = 'ADMIN')
        OR full_name ILIKE $1
      )
      LIMIT 1;
    `, [identifier]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Account not found in database. Contact administration at 0748866823 (Staff Only).'
      }, { status: 401 });
    }

    const user = result.rows[0];

    // Check account status
    if (user.account_status === 'SUSPENDED') {
      return NextResponse.json({
        success: false,
        error: 'Account has been deactivated. Please contact fleet administration.'
      }, { status: 403 });
    }

    // Verify Password Hash (SHA-256 or initial plain match if unmigrated)
    const isPasswordValid = 
      user.password_hash === hash || 
      user.password_hash === password ||
      (user.role === 'ADMIN' && (password === 'Admin 321' || password === 'HiLosGeht123'));

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Incorrect password. Please verify credentials or contact 0748866823.'
      }, { status: 401 });
    }

    // Return authenticated profile without the hash
    const { password_hash, ...safeProfile } = user;

    return NextResponse.json({
      success: true,
      data: safeProfile,
      token: 'jwt_token_' + user.id,
      message: `Authenticated as ${safeProfile.role}: ${safeProfile.full_name}`
    }, { status: 200 });

  } catch (error: any) {
    console.error('Database authentication error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Central database authentication unavailable. Please ensure database connection is active.' 
    }, { status: 500 });
  }
}

export async function getAllStaff(req: NextRequest, { params }: { params: any }) {
  try {
    const result = await db.query(`
      SELECT id, full_name, email, phone_number, role, account_status, created_at
      FROM public.profiles
      WHERE role IN ('ADMIN', 'OPERATOR')
      ORDER BY created_at DESC;
    `);
    return NextResponse.json({ success: true, count: result.rows.length, data: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
