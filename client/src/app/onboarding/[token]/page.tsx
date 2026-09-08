'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Truck, 
  ShieldCheck, 
  Lock, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Mail, 
  ArrowRight 
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import NeonButton from '@/components/common/NeonButton';

export default function StaffOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/auth/verify-token/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'This onboarding invitation link is invalid or has already been used.');
        } else {
          setProfile(data.data);
          if (data.data.phone_number) {
            setPhoneNumber(data.data.phone_number);
          }
        }
      } catch (err: any) {
        setError('Could not connect to HLG dispatch servers. Please check your network.');
      } finally {
        setLoading(false);
      }
    }
    verifyToken();
  }, [token]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/auth/onboard/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          phoneNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to complete onboarding.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2500);
      }
    } catch (err: any) {
      setError('An error occurred during account activation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Truck className="w-12 h-12 text-primary animate-bounce mx-auto" />
          <p className="font-mono text-sm text-muted">Verifying staff onboarding token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <GlassCard className="border border-primary/40 p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/50 mx-auto flex items-center justify-center text-primary shadow-neon">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-black text-2xl text-white tracking-wide uppercase">
            Staff Onboarding
          </h1>
          <p className="text-xs text-muted font-mono">
            Hi Los Geht Heavy Machinery Fleet Portal
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-lg font-bold text-white">Account Activated!</h2>
            <p className="text-xs text-gray-300">
              Welcome aboard, <strong>{profile?.full_name}</strong>. Redirecting you to login...
            </p>
          </div>
        ) : profile ? (
          <form onSubmit={handleActivate} className="space-y-4 text-xs">
            
            <div className="p-3 bg-surface-card rounded-lg border border-border space-y-1">
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-white">{profile.full_name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted font-mono">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>{profile.email}</span>
              </div>
              <div className="font-mono text-[10px] text-primary uppercase pt-1">
                Role: {profile.role} (Meru Operations)
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-mono mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                Phone Number (WhatsApp Active)
              </label>
              <input
                type="tel"
                required
                placeholder="0712 345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-mono mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Create Secure Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-mono mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-border rounded px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              />
            </div>

            <NeonButton
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-xs"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {submitting ? 'Activating Account...' : 'Activate & Enter Portal'}
            </NeonButton>

          </form>
        ) : null}

      </GlassCard>
    </div>
  );
}
