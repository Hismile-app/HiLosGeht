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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-heading font-black text-white text-xl shadow-neon">
              HLG
            </div>
            <span className="font-heading font-black text-2xl tracking-wider text-white">
              HI LOS GEHT
            </span>
          </Link>
          <h2 className="text-xl font-heading font-bold text-gray-200">
            Sign in to Operations Hub
          </h2>
          <p className="text-xs text-muted font-mono">
            Access restricted to verified administrators and field machinery operators.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl space-y-6 backdrop-blur-sm">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted uppercase block mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@hilosgeht.co.ke"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-muted uppercase block mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-heading font-bold text-sm tracking-wider uppercase transition-all shadow-neon flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="pt-4 border-t border-border/60 space-y-2">
            <div className="text-[11px] font-mono text-muted text-center">Demo Quick-Logins:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@hilosgeht.co.ke');
                  setPassword('AdminPass123!');
                }}
                className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-border rounded-lg text-[11px] font-mono text-primary font-bold transition-all text-center"
              >
                Admin Auto-Fill
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('operator.john@hilosgeht.co.ke');
                  setPassword('OperatorPass123!');
                }}
                className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-border rounded-lg text-[11px] font-mono text-gray-300 font-bold transition-all text-center"
              >
                Operator Auto-Fill
              </button>
            </div>
          </div>
        </div>

        {/* Dispatch Hotline Help */}
        <div className="text-center text-xs text-muted font-mono space-y-1">
          <div>Need account access or field deployment assistance?</div>
          <div className="text-gray-300">
            Meru Dispatch: <span className="text-primary font-bold">0717 186396</span> / 0748866823
          </div>
        </div>
      </div>
    </div>
  );
}
