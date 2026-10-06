'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Truck,
  LogIn
} from 'lucide-react';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [alreadyActive, setAlreadyActive] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Recovery email state if token link was from an earlier session
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError('Missing activation token. Please verify the onboarding link sent to your email.');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = '/api/v1';
        const res = await fetch(`${apiUrl}/auth/verify-token/${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setTokenValid(true);
          setInviteEmail(data.data.email);
          setInviteRole(data.data.role);
          setFullName(data.data.full_name || '');
          if (data.data.phone_number) {
            setPhone(data.data.phone_number);
          }
          if (data.alreadyActivated || data.data.account_status === 'ACTIVE') {
            setAlreadyActive(true);
          }
        } else {
          setError(data.error || 'This activation link has expired or is invalid.');
        }
      } catch (err: any) {
        setError('Connection failure communicating with fleet dispatch.');
      } finally {
        setLoading(false);
      }
    }
    verifyToken();
  }, [token]);

  const handleLookupByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackEmail.trim()) return;

    setLookingUp(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/auth/verify-token/direct?email=${encodeURIComponent(fallbackEmail.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No invitation found for this email address. Please check spelling or contact dispatch.');
      } else {
        setTokenValid(true);
        setInviteEmail(data.data.email);
        setInviteRole(data.data.role);
        setFullName(data.data.full_name || '');
        if (data.data.phone_number) {
          setPhone(data.data.phone_number);
        }
        if (data.alreadyActivated || data.data.account_status === 'ACTIVE') {
          setAlreadyActive(true);
        }
      }
    } catch {
      setError('Connection failure looking up account. Please try again.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = '/api/v1';
      const res = await fetch(`${apiUrl}/auth/onboard/${token || 'direct'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          password,
          email: inviteEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok && !data.success) {
        throw new Error(data.error || 'Activation failed.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete activation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg w-full bg-white border border-border rounded-2xl p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center mx-auto text-primary">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-heading font-black text-ink uppercase">
          Staff Onboarding & Activation
        </h1>
        <p className="text-xs text-muted font-mono">
          Hi Los Geht (HLG) Heavy Machinery Operations Fleet
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-zinc-500 font-mono text-xs">
          Verifying secure onboarding credentials...
        </div>
      ) : alreadyActive ? (
        <div className="text-center space-y-4 py-4 animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-heading font-bold text-ink">
            Account Already Active
          </h2>
          <p className="text-xs text-zinc-600 font-mono">
            Welcome back, <strong>{fullName}</strong> ({inviteEmail}). This profile is active.
          </p>
          <Link
            href="/login"
            className="btn-primary w-full py-3 text-xs inline-flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            Proceed to Login &rarr;
          </Link>
        </div>
      ) : error && !tokenValid ? (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 text-xs">
            <p className="text-zinc-600 font-sans leading-relaxed">
              If your link was issued earlier, enter your <strong>invited email address</strong> below to proceed:
            </p>
            <form onSubmit={handleLookupByEmail} className="space-y-2">
              <input
                type="email"
                required
                placeholder="your-email@example.com"
                value={fallbackEmail}
                onChange={(e) => setFallbackEmail(e.target.value)}
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-xs text-ink focus:border-primary focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={lookingUp || !fallbackEmail.trim()}
                className="btn-primary w-full py-2.5 text-xs"
              >
                {lookingUp ? 'Verifying Invite...' : 'Verify Email & Setup Password'}
              </button>
            </form>
          </div>
        </div>
      ) : success ? (
        <div className="text-center space-y-4 py-4 animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-heading font-bold text-ink">
            Account Activated Successfully!
          </h2>
          <p className="text-xs text-zinc-600 font-mono">
            Your operator profile is now verified. You can now log into the mobile operator ledger.
          </p>
          <Link
            href="/login"
            className="btn-primary w-full py-3 text-xs block text-center mt-2"
          >
            Proceed to Login &rarr;
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-surface rounded-xl border border-border text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-muted">Target Account:</span>
              <span className="font-bold text-ink">{inviteEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Role Assignment:</span>
              <span className="text-primary font-bold">{inviteRole}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-700 mb-1 font-bold">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Brian Operator"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-700 mb-1 font-bold">
              Operator Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +254717186396"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-700 mb-1 font-bold">
              Set Secure Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-700 mb-1 font-bold">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 text-xs"
          >
            {submitting ? 'Activating Profile...' : 'Complete Account Activation'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function OnboardingQueryPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-zinc-500 font-mono">Loading onboarding...</div>}>
        <OnboardingContent />
      </Suspense>
    </div>
  );
}
