import crypto from 'crypto';
import { put, get, list } from '@vercel/blob';

export interface StoredProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: 'ADMIN' | 'OPERATOR';
  account_status: 'ACTIVE' | 'PENDING_SETUP' | 'SUSPENDED';
  password_hash: string;
  onboarding_token?: string | null;
  created_at: string;
  updated_at?: string;
  avatar_url?: string | null;
}

// Built-in seed profiles for high-availability fallback
export const SEED_PROFILES: StoredProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'HLG Admin Dispatcher',
    email: 'hilosgehtinfo@gmail.com',
    phone_number: '+254717186396',
    role: 'ADMIN',
    account_status: 'ACTIVE',
    password_hash: '1a39ea17ac8b37f6fc158e8ecfa679dcb262a9857e042bb0700b8e83235e2775', // SHA256 of 'Admin 321'
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Brian K. (Lead Operator - Meru Quarry)',
    email: 'kbrian1237@gmail.com',
    phone_number: '+254748866823',
    role: 'OPERATOR',
    account_status: 'ACTIVE',
    password_hash: 'afeb25bf07c9ea1803c3ea001b66f8fee3dbd412291110b0776fa57ee46d4ca4', // SHA256 of 'OperatorPass123'
    created_at: '2026-09-02T00:00:00Z',
  },
];

const REGISTRY_PATHNAME = 'system/staff_registry.json';
const TOKEN_SECRET =
  process.env.AUTH_SECRET ||
  process.env.BLOB_READ_WRITE_TOKEN ||
  'hlg_meru_fleet_heavy_machinery_secret_key_2026';

// In-memory cache to prevent excessive Blob network requests within the same serverless instance
let memoryCache: { timestamp: number; profiles: StoredProfile[] } = {
  timestamp: Date.now(),
  profiles: [...SEED_PROFILES],
};
let cachedBlobUrl: string | null = null;

// ==========================================
// 1. Cryptographic HMAC Token Implementation
// ==========================================

export interface TokenPayload {
  email: string;
  fullName: string;
  role: 'ADMIN' | 'OPERATOR';
  phoneNumber?: string | null;
  iat: number;
  exp: number;
  nonce: string;
}

/**
 * Creates a tamper-proof, self-contained onboarding token valid for 7 days.
 * Any serverless instance can instantly verify this token without a database roundtrip.
 */
export function signOnboardingToken(user: {
  email: string;
  fullName: string;
  role?: 'ADMIN' | 'OPERATOR';
  phoneNumber?: string | null;
}): string {
  const payload: TokenPayload = {
    email: user.email.trim().toLowerCase(),
    fullName: user.fullName.trim(),
    role: user.role || 'OPERATOR',
    phoneNumber: user.phoneNumber?.trim() || null,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days validity
    nonce: crypto.randomBytes(6).toString('hex'),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `hlg_v1_${encodedPayload}.${signature}`;
}

/**
 * Verifies the authenticity and expiration of a signed onboarding token.
 */
export function verifySignedToken(token: string): {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing or empty activation token' };
  }

  if (!token.startsWith('hlg_v1_')) {
    return { valid: false, error: 'Legacy or unrecognized token format' };
  }

  const raw = token.slice('hlg_v1_'.length);
  const parts = raw.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed activation token structure' };
  }

  const [encodedPayload, providedSig] = parts;

  // Verify HMAC signature in constant time
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return { valid: false, error: 'Invalid or forged activation signature' };
  }

  try {
    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadStr) as TokenPayload;

    if (Date.now() > payload.exp) {
      return {
        valid: false,
        error: 'This onboarding invitation link has expired (links are valid for 7 days). Please request a new invite from dispatch.',
      };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Failed to decode activation token payload' };
  }
}

// ==========================================
// 2. Vercel Blob Persistent Registry Engine
// ==========================================

function getBlobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Retrieves the complete staff registry from Vercel Blob, merging with seed accounts.
 */
export async function getStaffRegistry(): Promise<StoredProfile[]> {
  const token = getBlobToken();

  // Return memory cache if fresh (< 5 seconds old)
  if (Date.now() - memoryCache.timestamp < 5000 && memoryCache.profiles.length > 0) {
    return memoryCache.profiles;
  }

  if (!token) {
    return memoryCache.profiles;
  }

  try {
    let targetUrl = cachedBlobUrl;

    if (!targetUrl) {
      const listRes = await list({ token, prefix: REGISTRY_PATHNAME });
      const found = listRes.blobs.find((b) => b.pathname === REGISTRY_PATHNAME);
      if (found) {
        targetUrl = found.url;
        cachedBlobUrl = targetUrl;
      }
    }

    if (targetUrl) {
      const blob = await get(targetUrl, { token, access: 'private' });
      if (blob && blob.stream) {
        const text = await new Response(blob.stream).text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with seeds ensuring seed profiles always exist
          const merged = [...parsed];
          for (const seed of SEED_PROFILES) {
            if (!merged.some((p) => p.email.toLowerCase() === seed.email.toLowerCase())) {
              merged.push(seed);
            }
          }
          memoryCache = { timestamp: Date.now(), profiles: merged };
          return merged;
        }
      }
    }
  } catch (err: any) {
    console.warn('⚠️ Could not load staff registry from Vercel Blob:', err.message);
  }

  return memoryCache.profiles;
}

/**
 * Saves or updates a staff profile into the persistent registry in Vercel Blob.
 */
export async function saveStaffProfile(profile: StoredProfile): Promise<StoredProfile> {
  const current = await getStaffRegistry();
  const existingIdx = current.findIndex(
    (p) => p.email.toLowerCase() === profile.email.toLowerCase()
  );

  const updatedProfile: StoredProfile = {
    ...profile,
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    current[existingIdx] = {
      ...current[existingIdx],
      ...updatedProfile,
    };
  } else {
    current.unshift(updatedProfile);
  }

  // Update in-memory cache immediately
  memoryCache = {
    timestamp: Date.now(),
    profiles: current,
  };

  const token = getBlobToken();
  if (token) {
    try {
      const res = await put(REGISTRY_PATHNAME, JSON.stringify(current, null, 2), {
        access: 'private',
        token,
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      cachedBlobUrl = res.url;
    } catch (blobErr: any) {
      console.warn('⚠️ Failed to persist staff registry to Vercel Blob:', blobErr.message);
    }
  }

  return updatedProfile;
}

/**
 * Finds a staff profile by email or username or phone number.
 */
export async function findStaffByIdentifier(identifier: string): Promise<StoredProfile | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const profiles = await getStaffRegistry();

  const found = profiles.find((p) => {
    const emailMatch = p.email.toLowerCase() === clean;
    const phoneMatch =
      p.phone_number === identifier ||
      p.phone_number === '+254' + identifier.replace(/^0+/, '');
    const adminAlias = clean === 'adminhlg' && p.role === 'ADMIN';
    const nameMatch = p.full_name.toLowerCase().includes(clean);
    return emailMatch || phoneMatch || adminAlias || nameMatch;
  });

  return found || null;
}

/**
 * Finds a staff profile by onboarding token.
 */
export async function findStaffByToken(token: string): Promise<{
  profile: StoredProfile | null;
  isSignedToken: boolean;
  error?: string;
}> {
  if (!token) return { profile: null, isSignedToken: false, error: 'Empty token' };

  // 1. First check if it's an HMAC self-contained signed token
  if (token.startsWith('hlg_v1_')) {
    const verified = verifySignedToken(token);
    if (!verified.valid) {
      return { profile: null, isSignedToken: true, error: verified.error };
    }

    const payload = verified.payload!;
    const registry = await getStaffRegistry();
    const existing = registry.find((p) => p.email.toLowerCase() === payload.email.toLowerCase());

    if (existing) {
      return { profile: existing, isSignedToken: true };
    }

    // Return virtual pending profile constructed from the verified payload
    const virtualProfile: StoredProfile = {
      id: 'hlg_user_' + String(payload.iat).slice(-8),
      full_name: payload.fullName,
      email: payload.email,
      phone_number: payload.phoneNumber || null,
      role: payload.role,
      account_status: 'PENDING_SETUP',
      password_hash: '',
      onboarding_token: token,
      created_at: new Date(payload.iat).toISOString(),
    };

    return { profile: virtualProfile, isSignedToken: true };
  }

  // 2. Legacy or plain token: look up in registry
  const registry = await getStaffRegistry();
  const matched = registry.find((p) => p.onboarding_token === token);
  return { profile: matched || null, isSignedToken: false };
}
