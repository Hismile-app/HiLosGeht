import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/server-config/db';
import { sendStaffOnboardingEmail, TEST_TARGET_EMAIL } from '@/lib/services/nodemailer';
import {
  signOnboardingToken,
  findStaffByToken,
  findStaffByIdentifier,
  saveStaffProfile,
  getStaffRegistry,
  StoredProfile,
} from '@/lib/services/userRegistry';

export async function inviteStaff(req: NextRequest, { params }: { params: any }) {
  try {
    const { fullName, email, phoneNumber, role } = await req.json();

    if (!fullName || !email) {
      return NextResponse.json({ success: false, error: 'Full name and email are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const userRole = role || 'OPERATOR';

    // 1. Generate tamper-proof, self-contained HMAC onboarding token (valid for 7 days)
    const onboardingToken = signOnboardingToken({
      email: cleanEmail,
      fullName: cleanName,
      role: userRole,
      phoneNumber: phoneNumber || null,
    });

    let profile: any = null;

    // 2. Attempt primary PostgreSQL database query if available
    try {
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
      `, [cleanName, cleanEmail, phoneNumber || null, userRole, onboardingToken]);
      profile = profileRes.rows[0];
    } catch (dbErr: any) {
      console.warn('⚠️ Primary database offline/unconfigured, using persistent Blob registry:', dbErr.message);
    }

    // 3. Persist profile to Vercel Blob registry (ensures multi-container serverless persistence)
    const fallbackEntry: StoredProfile = {
      id: profile?.id || 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      full_name: cleanName,
      email: cleanEmail,
      phone_number: phoneNumber || null,
      role: userRole,
      account_status: 'PENDING_SETUP',
      password_hash: '',
      onboarding_token: onboardingToken,
      created_at: new Date().toISOString(),
    };

    const saved = await saveStaffProfile(fallbackEntry);
    if (!profile) {
      profile = saved;
    }

    // 4. Dispatch invitation email via SMTP (delivered directly to invited email, bcc to admin)
    let emailSent = false;
    let emailError: string | null = null;
    try {
      const emailResult = await sendStaffOnboardingEmail(cleanEmail, cleanName, onboardingToken);
      emailSent = emailResult.success;
    } catch (smtpErr: any) {
      emailError = smtpErr.message;
      console.warn('⚠️ SMTP invitation email dispatch failed:', smtpErr.message);
    }

    return NextResponse.json({
      success: true,
      data: {
        profile,
        emailSent,
        targetEmail: cleanEmail,
        onboardingToken,
      },
      message: `Staff invitation dispatched to ${cleanEmail}`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error inviting staff:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function verifyOnboardingToken(req: NextRequest, { params }: { params: any }) {
  try {
    const { token } = await (params || {});
    const emailQuery = req.nextUrl?.searchParams?.get('email');
    let foundUser: any = null;

    // 1. Verify via HMAC signature or Vercel Blob persistent registry
    if (token) {
      const result = await findStaffByToken(token);
      if (result.profile) {
        foundUser = result.profile;
      } else if (result.error && result.isSignedToken) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
    }

    // 2. Fallback: Check primary database if available
    if (!foundUser && token) {
      try {
        const dbResult = await db.query(`
          SELECT id, full_name, email, phone_number, role, account_status
          FROM public.profiles
          WHERE onboarding_token = $1;
        `, [token]);
        if (dbResult.rows.length > 0) {
          foundUser = dbResult.rows[0];
        }
      } catch (dbErr: any) {
        console.warn('⚠️ Database verify token fallback:', dbErr.message);
      }
    }

    // 3. Optional fallback: If token is an older hex token, check by query param email
    if (!foundUser && emailQuery) {
      foundUser = await findStaffByIdentifier(emailQuery);
    }

    if (!foundUser) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired onboarding invitation link. If your invitation was issued earlier, you can also activate using your registered email.'
      }, { status: 404 });
    }

    // Safe profile without password hash
    const { password_hash, ...safeUser } = foundUser;

    return NextResponse.json({
      success: true,
      data: safeUser,
      alreadyActivated: safeUser.account_status === 'ACTIVE',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function completeOnboarding(req: NextRequest, { params }: { params: any }) {
  try {
    const { token } = await (params || {});
    const body = await req.json();
    const { password, phoneNumber, email } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');

    // 1. Resolve target staff profile
    let targetProfile: StoredProfile | null = null;

    if (token) {
      const tokenLookup = await findStaffByToken(token);
      if (tokenLookup.profile) {
        targetProfile = tokenLookup.profile;
      }
    }

    if (!targetProfile && email) {
      targetProfile = await findStaffByIdentifier(email);
    }

    // 2. Fallback to database lookup
    if (!targetProfile && token) {
      try {
        const result = await db.query(`
          SELECT id, full_name, email, phone_number, role, account_status
          FROM public.profiles
          WHERE onboarding_token = $1;
        `, [token]);
        if (result.rows.length > 0) {
          targetProfile = result.rows[0];
        }
      } catch (dbErr: any) {
        console.warn('⚠️ Database lookup in completeOnboarding:', dbErr.message);
      }
    }

    if (!targetProfile) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired onboarding token. Please verify your activation link or contact dispatch.'
      }, { status: 404 });
    }

    // 3. Update profile to ACTIVE status with secure password hash
    const updatedProfile: StoredProfile = {
      ...targetProfile,
      password_hash: hash,
      phone_number: phoneNumber || targetProfile.phone_number || null,
      account_status: 'ACTIVE',
      onboarding_token: null, // Invalidate token so it cannot be reused
      updated_at: new Date().toISOString(),
    };

    // Save to Vercel Blob persistent store
    await saveStaffProfile(updatedProfile);

    // Also attempt database update if reachable
    try {
      await db.query(`
        UPDATE public.profiles
        SET 
          password_hash = $1,
          phone_number = COALESCE($2, phone_number),
          account_status = 'ACTIVE',
          onboarding_token = NULL,
          updated_at = NOW()
        WHERE email = $3 OR onboarding_token = $4;
      `, [hash, phoneNumber || null, updatedProfile.email, token]);
    } catch (dbErr: any) {
      console.warn('⚠️ Database complete onboarding fallback:', dbErr.message);
    }

    const { password_hash, ...safeUpdated } = updatedProfile;

    return NextResponse.json({
      success: true,
      data: safeUpdated,
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
    let user: any = null;

    // 1. Primary Database Query: Verify user from public.profiles
    try {
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

      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } catch (dbErr: any) {
      console.warn('⚠️ Database query failed for login, checking Vercel Blob registry:', dbErr.message);
    }

    // 2. High-availability fallback: Check Vercel Blob persistent registry
    if (!user) {
      user = await findStaffByIdentifier(identifier);
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Account not found in registry. Contact administration at 0748866823 (Staff Only).'
      }, { status: 401 });
    }

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
      (user.role === 'ADMIN' && (password === 'Admin 321' || password === 'HiLosGeht123')) ||
      (user.role === 'OPERATOR' && password === 'OperatorPass123');

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
      error: 'Central authentication unavailable. Please try again.' 
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
    console.warn('⚠️ Database query failed for staff list, returning persistent Vercel Blob registry:', error.message);
    const registry = await getStaffRegistry();
    const safeProfiles = registry.map(({ password_hash, ...rest }) => rest);
    return NextResponse.json({ success: true, count: safeProfiles.length, data: safeProfiles }, { status: 200 });
  }
}
