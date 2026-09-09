'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, Truck, Phone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Invalid email or password');
      }

      // Save user session in localStorage / cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('hlg_user', JSON.stringify(data.data.user));
        localStorage.setItem('hlg_role', data.data.user.role);
      }

      // Redirect based on role
      if (data.data.user.role === 'ADMIN') {
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
        {/* Branding header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-11 h-11 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <span className="font-heading font-black text-2xl tracking-wider text-ink">
              <span className="text-primary">HLG</span> HI LOS GEHT
            </span>
          </Link>
          <h2 className="text-xl font-heading font-bold text-ink">
            Sign in to Operations Hub
          </h2>
          <p className="text-xs text-muted font-mono">
            Access restricted to verified administrators and field machinery operators.
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
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@hilosgeht.co.ke"
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
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="pt-4 border-t border-border space-y-2">
            <div className="text-[11px] font-mono text-muted text-center">Demo Quick-Logins:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@hilosgeht.co.ke');
                  setPassword('AdminPass123!');
                }}
                className="py-1.5 px-2 bg-surface hover:bg-orange-50 border border-border rounded-lg text-[11px] font-mono text-primary font-bold transition-all text-center cursor-pointer"
              >
                Admin Auto-Fill
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('operator.john@hilosgeht.co.ke');
                  setPassword('OperatorPass123!');
                }}
                className="py-1.5 px-2 bg-surface hover:bg-zinc-200 border border-border rounded-lg text-[11px] font-mono text-zinc-700 font-bold transition-all text-center cursor-pointer"
              >
                Operator Auto-Fill
              </button>
            </div>
          </div>
        </div>

        {/* Dispatch Hotline Help */}
        <div className="text-center text-xs text-muted font-mono space-y-1">
          <div>Need account access or field deployment assistance?</div>
          <div className="text-zinc-700">
            Meru Dispatch: <span className="text-primary font-bold">0717 186396</span> / <span className="text-zinc-900 font-bold">0748866823</span>
          </div>
        </div>
      </div>
    </div>
  );
}
