'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'OPERATOR' | 'ANY';
}

export default function AuthGuard({ children, requiredRole = 'ANY' }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUser = localStorage.getItem('hlg_user');
    const storedRole = localStorage.getItem('hlg_role');

    // 1. If no user session in storage, redirect to login
    if (!storedUser) {
      setIsAuthorized(false);
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const role = user?.role || storedRole;

      // Ensure session cookies are synchronized
      if (!document.cookie.includes('hlg_session=')) {
        document.cookie = `hlg_session=${encodeURIComponent(user.id || user.email)}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `hlg_role=${encodeURIComponent(role)}; path=/; max-age=604800; SameSite=Lax`;
      }

      // 2. Role-based authorization check
      if (requiredRole === 'ADMIN' && role !== 'ADMIN') {
        setIsAuthorized(false);
        router.replace('/staff');
        return;
      }

      setIsAuthorized(true);
    } catch (e) {
      console.error('Failed to parse user session in AuthGuard:', e);
      setIsAuthorized(false);
      localStorage.removeItem('hlg_user');
      localStorage.removeItem('hlg_role');
      router.replace('/login');
    }
  }, [pathname, requiredRole, router]);

  // While checking authorization, show a clean, discreet loader instead of unauthorized layout
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white border border-border rounded-2xl p-6 shadow-card max-w-sm w-full text-center">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-primary flex items-center justify-center animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-sm text-ink">Verifying Fleet Authorization</h3>
            <p className="text-xs text-muted font-mono">Authenticating secure workspace session...</p>
          </div>
        </div>
      </div>
    );
  }

  // If unauthorized and waiting for redirect
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white border border-rose-200 rounded-2xl p-6 shadow-card max-w-sm w-full text-center">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-sm text-ink">Access Restricted</h3>
            <p className="text-xs text-muted font-mono">Redirecting to login portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
