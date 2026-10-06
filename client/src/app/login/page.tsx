'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, User, Lock, LogIn, AlertCircle, Truck, Phone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Authentication failed. Please verify credentials.');
      }

      const userProfile = json.data;

      // Store authentic database user profile in browser storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('hlg_user', JSON.stringify(userProfile));
        localStorage.setItem('hlg_role', userProfile.role);
        if (json.token) {
          localStorage.setItem('hlg_token', json.token);
        }
      }

      // Direct to corresponding authenticated workspace based on database role
      if (userProfile.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/staff');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-surface flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-ink">
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex items-center justify-center transition-transform">
              <img src="/logo.png" alt="Hi Los Geht Logo" className="w-11 h-11 group-hover:scale-105 transition-transform object-contain" />
            </div>
            <span className="font-heading font-black text-2xl tracking-wider text-ink">
              HI LOS GEHT
            </span>
          </Link>
          <h2 className="text-xl font-heading font-bold text-ink uppercase">
            Unified Staff & Operations Login
          </h2>
          <p className="text-xs text-muted font-mono">
            Single entry point for certified operators and central fleet administrators.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-card space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-zinc-700 font-semibold uppercase block mb-1.5">
                Username or Work Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. AdminHLG or operator name"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder-zinc-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-700 font-semibold uppercase block mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-ink placeholder-zinc-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-heading font-bold text-sm tracking-wider uppercase transition-all shadow-subtle flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        {/* Dispatch Hotline */}
        <div className="text-center text-xs text-muted font-mono space-y-1">
          <div>Need password reset or operator deployment assistance? (Staff Only)</div>
          <div className="text-zinc-700">
            Staff Helpline: <span className="text-primary font-bold">0748866823</span>
          </div>
        </div>
      </div>
    </div>
  );
}

