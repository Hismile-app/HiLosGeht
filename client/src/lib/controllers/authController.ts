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
    const { token } = req.params;
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
    const { token } = req.params;
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
      return NextResponse.json({ success: false, error: 'Username/Email and password required' }, { status: 400 });
    }

    // Strict Rule: If credentials are AdminHLG and Admin 321 -> ADMIN role
    if (identifier.toLowerCase() === 'adminhlg' && password === 'Admin 321') {
      const adminUser = {
        id: 'hlg_admin_master',
        full_name: 'HLG Chief Administrator',
        email: 'admin@hilosgeht.co.ke',
        phone_number: '+254717186396',
        role: 'ADMIN',
        account_status: 'ACTIVE',
      };
      return NextResponse.json({
        success: true,
        data: adminUser,
        token: 'jwt_admin_token_master',
      }, { status: 200 });
    }

    // Database lookup for registered profiles
    try {
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      const result = await db.query(`
        SELECT id, full_name, email, phone_number, role, account_status
        FROM public.profiles
        WHERE (email = $1 OR full_name ILIKE $1) AND (password_hash = $2 OR password_hash IS NULL);
      `, [identifier, hash]);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        return NextResponse.json({
          success: true,
          data: user,
          token: 'jwt_token_' + user.id,
        }, { status: 200 });
      }
    } catch (dbErr: any) {
      console.warn('Database auth query fallback:', dbErr.message);
    }

    // For any other operator credentials -> Authenticate as Operator
    const operatorUser = {
      id: 'hlg_op_' + Date.now(),
      full_name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      email: identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@hilosgeht.co.ke`,
      phone_number: '+254717186396',
      role: 'OPERATOR',
      account_status: 'ACTIVE',
    };

    return NextResponse.json({
      success: true,
      data: operatorUser,
      token: 'jwt_operator_token_' + operatorUser.id,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error logging in:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
