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

export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('254') && digits.length === 12) {
    return '0' + digits.slice(3);
  }
  if (digits.length === 9) {
    return '0' + digits;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return digits;
  }
  return digits;
}

export function getPhoneVariants(phone: string | null | undefined): string[] {
  if (!phone) return [];
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return [raw];

  const variants = new Set<string>();
  variants.add(raw);
  variants.add(digits);

  const norm = normalizePhone(phone);
  if (norm) {
    variants.add(norm);
    if (norm.startsWith('0')) {
      const core = norm.slice(1);
      variants.add(core);
      variants.add('+254' + core);
      variants.add('254' + core);
    }
  }

  return Array.from(variants);
}

export function phonesMatch(phoneA: string | null | undefined, phoneB: string | null | undefined): boolean {
  if (!phoneA || !phoneB) return false;
  const normA = normalizePhone(phoneA);
  const normB = normalizePhone(phoneB);
  if (normA && normB && normA === normB) return true;

  const rawA = phoneA.replace(/\D/g, '');
  const rawB = phoneB.replace(/\D/g, '');
  if (rawA && rawB) {
    if (rawA === rawB) return true;
    if (Math.min(rawA.length, rawB.length) >= 9) {
      if (rawA.endsWith(rawB) || rawB.endsWith(rawA)) return true;
    }
  }
  return false;
}

// Built-in seed profiles for high-availability fallback
export const SEED_PROFILES: StoredProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'HLG Admin Dispatcher',
    email: 'hilosgehtinfo@gmail.com',
    phone_number: '+254748866823',
    role: 'ADMIN',
    account_status: 'ACTIVE',
    password_hash: '1a39ea17ac8b37f6fc158e8ecfa679dcb262a9857e042bb0700b8e83235e2775', // Admin 321
    created_at: '2026-09-01T00:00:00Z',
    avatar_url: '/avatars/avatar-4.svg',
  },
  {
    id: '90bb2eaa-fc49-4d08-bc01-bf401124ce74',
    full_name: 'kb 1445 testor operator',
    email: 'kbrian1445@gmail.com',
    phone_number: '0788183496',
    role: 'OPERATOR',
    account_status: 'ACTIVE',
    password_hash: '481a48e9647afdc33c07b964725d23ba6fcd57df0f3ecc921c8d0e49d0fb0bbf', // 0788183496
    created_at: '2026-10-07T12:00:00Z',
    avatar_url: '/avatars/avatar-5.svg',
  },
  {
    id: '22222222-2222-2222-2222-222222222201',
    full_name: 'Joseph Mbogo',
    email: 'joseph.mbogo@hilosgeht.co.ke',
    phone_number: '0728803790',
    role: 'OPERATOR',
    account_status: 'ACTIVE',
    password_hash: 'c5f323bee5dea9f9a19dd89ade34963c44d21cb30304611f1d0e5515411b7b83', // 0728803790
    created_at: '2026-09-05T00:00:00Z',
    avatar_url: '/avatars/avatar-1.svg',
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    full_name: 'Fredrick Mutuma',
    email: 'fredrick.mutuma@hilosgeht.co.ke',
    phone_number: '0717186396',
    role: 'OPERATOR',
    account_status: 'ACTIVE',
    password_hash: '0ce9b2b3900f36b34e08275be31cd3b5139bc1848df8084a6418d73a6201d80f', // 0717186396
    created_at: '2026-08-19T00:00:00Z',
    avatar_url: '/avatars/avatar-2.svg',
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    full_name: 'Felix Maore',
    email: 'felix.maore@hilosgeht.co.ke',
    phone_number: '0729139178',
    role: 'OPERATOR',
    account_status: 'ACTIVE',
    password_hash: 'cc6b030eb004f629fd3041a4d27cc411c04ddf956095c48a6b8a93fe60f99bc6', // 0729139178
    created_at: '2026-08-19T00:00:00Z',
    avatar_url: '/avatars/avatar-3.svg',
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
            const seedIdx = merged.findIndex((p) => p.email.toLowerCase() === seed.email.toLowerCase());
            if (seedIdx === -1) {
              merged.push(seed);
            } else if (!merged[seedIdx].password_hash && seed.password_hash) {
              // Auto-restore password hash from seed if empty
              merged[seedIdx].password_hash = seed.password_hash;
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
    (p) => (profile.id && p.id === profile.id) || p.email.toLowerCase() === profile.email.toLowerCase()
  );

  const updatedProfile: StoredProfile = {
    ...profile,
    updated_at: new Date().toISOString(),
  };

  // Ensure password_hash is never accidentally wiped out
  if (!updatedProfile.password_hash && existingIdx >= 0 && current[existingIdx].password_hash) {
    updatedProfile.password_hash = current[existingIdx].password_hash;
  }

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
 * Finds a staff profile by email or username or phone number (with robust normalization).
 */
export async function findStaffByIdentifier(identifier: string): Promise<StoredProfile | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const profiles = await getStaffRegistry();

  const found = profiles.find((p) => {
    const emailMatch = p.email.toLowerCase() === clean;
    const phoneMatch = phonesMatch(p.phone_number, identifier);
    const adminAlias = (clean === 'adminhlg' || clean === 'admin') && p.role === 'ADMIN';
    const nameMatch = p.full_name.toLowerCase().trim() === clean || p.full_name.toLowerCase().includes(clean);
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
