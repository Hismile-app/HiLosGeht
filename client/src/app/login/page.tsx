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
      // Strict Login Routing Logic:
      // If username is exactly 'AdminHLG' and password is 'Admin 321' -> Admin Dashboard
      if (trimmedUser === 'AdminHLG' && trimmedPass === 'Admin 321') {
        const adminSession = {
          id: 'admin_hlg_master',
          full_name: 'HLG Chief Administrator',
          username: 'AdminHLG',
          email: 'admin@hilosgeht.co.ke',
          role: 'ADMIN',
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('hlg_user', JSON.stringify(adminSession));
          localStorage.setItem('hlg_role', 'ADMIN');
        }

        // Attempt backend handshake asynchronously (non-blocking)
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
          await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
          });
        } catch (e) {}

        router.push('/admin');
        return;
      }

      // For ANY other credentials -> Operator Dashboard
      const operatorSession = {
        id: 'op_' + Date.now(),
        full_name: trimmedUser.includes('@') ? trimmedUser.split('@')[0] : trimmedUser || 'Field Operator',
        username: trimmedUser,
        email: trimmedUser.includes('@') ? trimmedUser : `${trimmedUser.toLowerCase()}@hilosgeht.co.ke`,
        role: 'OPERATOR',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('hlg_user', JSON.stringify(operatorSession));
        localStorage.setItem('hlg_role', 'OPERATOR');
      }

      // Attempt backend handshake asynchronously (non-blocking)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
        });
      } catch (e) {}

      router.push('/staff');
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
            <div className="w-11 h-11 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <span className="font-heading font-black text-2xl tracking-wider text-ink">
              <span className="text-primary">HLG</span> HI LOS GEHT
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

          {/* Quick-Fill Helpers */}
          <div className="pt-4 border-t border-border space-y-2">
            <div className="text-[11px] font-mono text-muted text-center">Quick-Fill Credentials:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('AdminHLG');
                  setPassword('Admin 321');
                }}
                className="py-1.5 px-2 bg-surface hover:bg-orange-50 border border-border rounded-lg text-[11px] font-mono text-primary font-bold transition-all text-center cursor-pointer"
              >
                Admin (AdminHLG)
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('OperatorJohn');
                  setPassword('OperatorPass123');
                }}
                className="py-1.5 px-2 bg-surface hover:bg-zinc-200 border border-border rounded-lg text-[11px] font-mono text-zinc-700 font-bold transition-all text-center cursor-pointer"
              >
                Operator (Field Staff)
              </button>
            </div>
          </div>
        </div>

        {/* Dispatch Hotline */}
        <div className="text-center text-xs text-muted font-mono space-y-1">
          <div>Need password reset or operator deployment assistance?</div>
          <div className="text-zinc-700">
            Meru Dispatch: <span className="text-primary font-bold">0717 186396</span> / <span className="text-zinc-900 font-bold">0748866823</span>
          </div>
        </div>
      </div>
    </div>
  );
}

