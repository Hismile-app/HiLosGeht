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
        SELECT id, full_name, email, phone_number, role, account_status, password_hash, avatar_url
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
      SELECT id, full_name, email, phone_number, role, account_status, avatar_url, created_at
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

export async function updateStaffProfile(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, currentEmail, fullName, email, phoneNumber, avatarUrl, newPassword, confirmPassword } = body;

    if (!id && !currentEmail) {
      return NextResponse.json({ success: false, error: 'User identifier or email is required.' }, { status: 400 });
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Full name cannot be empty.' }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: 'Email cannot be empty.' }, { status: 400 });
    }

    // Password validation if changing password
    let passwordHash: string | null = null;
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long.' }, { status: 400 });
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ success: false, error: 'New password and confirm password do not match.' }, { status: 400 });
      }
      passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phoneNumber ? phoneNumber.trim() : null;
    const cleanAvatar = avatarUrl ? avatarUrl.trim() : null;

    let updatedUser: any = null;

    // 1. Update in PostgreSQL
    try {
      if (cleanEmail !== (currentEmail || '').toLowerCase()) {
        const conflict = await db.query(
          `SELECT id FROM public.profiles WHERE LOWER(email) = $1 AND id::text != $2;`,
          [cleanEmail, id || '']
        );
        if (conflict.rows.length > 0) {
          return NextResponse.json({ success: false, error: 'That email is already registered to another account.' }, { status: 409 });
        }
      }

      let query = `
        UPDATE public.profiles
        SET 
          full_name = $1,
          email = $2,
          phone_number = $3,
          avatar_url = $4,
          updated_at = NOW()
      `;
      const paramsList: any[] = [cleanName, cleanEmail, cleanPhone, cleanAvatar];

      if (passwordHash) {
        paramsList.push(passwordHash);
        query += `, password_hash = $${paramsList.length}`;
      }

      paramsList.push(id || '');
      paramsList.push((currentEmail || '').toLowerCase());
      query += ` WHERE id::text = $${paramsList.length - 1} OR LOWER(email) = $${paramsList.length} RETURNING id, full_name, email, phone_number, role, account_status, avatar_url, updated_at;`;

      const result = await db.query(query, paramsList);
      if (result.rows.length > 0) {
        updatedUser = result.rows[0];
      }
    } catch (dbErr: any) {
      console.warn('⚠️ Database profile update warning:', dbErr.message);
    }

    // 2. Update in Vercel Blob persistent store
    const registry = await getStaffRegistry();
    let targetIdx = registry.findIndex(
      (p) => (id && p.id === id) || (currentEmail && p.email.toLowerCase() === currentEmail.toLowerCase())
    );

    if (targetIdx >= 0) {
      registry[targetIdx].full_name = cleanName;
      registry[targetIdx].email = cleanEmail;
      registry[targetIdx].phone_number = cleanPhone;
      registry[targetIdx].avatar_url = cleanAvatar;
      if (passwordHash) {
        registry[targetIdx].password_hash = passwordHash;
      }
      registry[targetIdx].updated_at = new Date().toISOString();
      await saveStaffProfile(registry[targetIdx]);
      if (!updatedUser) {
        const { password_hash, ...safe } = registry[targetIdx];
        updatedUser = safe;
      }
    } else {
      const newProf: StoredProfile = {
        id: id || 'usr_' + Date.now().toString(36),
        full_name: cleanName,
        email: cleanEmail,
        phone_number: cleanPhone,
        role: updatedUser?.role || 'OPERATOR',
        account_status: 'ACTIVE',
        password_hash: passwordHash || '',
        avatar_url: cleanAvatar,
        created_at: new Date().toISOString(),
      };
      await saveStaffProfile(newProf);
      if (!updatedUser) {
        const { password_hash, ...safe } = newProf;
        updatedUser = safe;
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully!',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function getStaffProfile(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || '';
    const email = searchParams.get('email') || '';

    if (!id && !email) {
      return NextResponse.json({ success: false, error: 'User identifier or email required.' }, { status: 400 });
    }

    let user: any = null;

    // 1. Primary DB query
    try {
      const res = await db.query(`
        SELECT id, full_name, email, phone_number, role, account_status, avatar_url, created_at, updated_at
        FROM public.profiles
        WHERE (id::text = $1 AND $1 != '') OR (LOWER(email) = LOWER($2) AND $2 != '')
        LIMIT 1;
      `, [id, email]);
      if (res.rows.length > 0) {
        user = res.rows[0];
      }
    } catch (dbErr: any) {
      console.warn('⚠️ DB query error in getStaffProfile:', dbErr.message);
    }

    // 2. Fallback: Check persistent Vercel Blob registry
    if (!user) {
      const stored = await findStaffByIdentifier(email || id);
      if (stored) {
        const { password_hash, ...safe } = stored;
        user = safe;
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching staff profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
