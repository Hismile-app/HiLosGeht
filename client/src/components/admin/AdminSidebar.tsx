'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Inbox,
  Users,
  ClipboardList,
  Sparkles,
  TrendingUp,
  PieChart,
  Calendar,
  Contact,
  FileCheck,
  Settings,
  ShieldAlert,
  ChevronRight,
  PhoneCall,
  User,
  LogOut,
  ShieldCheck,
  Home,
  ExternalLink
} from 'lucide-react';

const ADMIN_MODULES = [
  { name: '1. Command Overview', path: '/admin', icon: LayoutDashboard },
  { name: '2. Fleet Management', path: '/admin/fleet', icon: Truck },
  { name: '3. Request & Order Inbox', path: '/admin/inbox', icon: Inbox },
  { name: '4. Staff Management', path: '/admin/staff', icon: Users },
  { name: '5. Daily Logs Ledger', path: '/admin/logs', icon: ClipboardList },
  { name: '6. AI Insights & Anomalies', path: '/admin/ai-insights', icon: Sparkles },
  { name: '7. Financial & Fuel Analytics', path: '/admin/financials', icon: TrendingUp },
  { name: '8. Fleet Utilization', path: '/admin/utilization', icon: PieChart },
  { name: '9. Master Calendar', path: '/admin/calendar', icon: Calendar },
  { name: '10. Client CRM', path: '/admin/crm', icon: Contact },
  { name: '11. Document Verification', path: '/admin/verification', icon: FileCheck },
  { name: '12. System Settings', path: '/admin/settings', icon: Settings },
];

const OPERATOR_MODULES = [
  { name: 'Daily Log Submission', path: '/staff', icon: ClipboardList },
  { name: 'Staff Profile & Permits', path: '/staff/profile', icon: User },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>('ADMIN');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('hlg_role');
      const storedUser = localStorage.getItem('hlg_user');
      if (storedRole === 'OPERATOR') {
        setRole('OPERATOR');
      } else {
        setRole('ADMIN');
      }
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {}
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hlg_user');
      localStorage.removeItem('hlg_role');
    }
    router.push('/login');
  };

  const navItems = role === 'OPERATOR' ? OPERATOR_MODULES : ADMIN_MODULES;

  return (
    <aside className="w-full lg:w-64 bg-surface border-r border-border shrink-0 min-h-[calc(100vh-5rem)] p-4 space-y-5">
      
      {/* Role Banner */}
      <div className="px-3.5 py-3 bg-white rounded-xl border border-border shadow-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-heading font-bold text-xs uppercase tracking-wider">
            {role === 'ADMIN' ? (
              <>
                <ShieldAlert className="w-4 h-4 text-primary" />
                <span>HLG Command Hub</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-800">Operator Field Hub</span>
              </>
            )}
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            role === 'ADMIN' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
          }`}>
            {role}
          </span>
        </div>
        <div className="text-[11px] text-muted font-mono mt-1">
          {role === 'ADMIN' ? '12-Module Industrial Platform' : 'Field Operations & Daily Logging'}
        </div>
      </div>

      {/* Nav Module Links */}
      <nav className="space-y-1">
        {/* Home Item leading to https://hi-los-geht.vercel.app/ */}
        <a
          href="https://hi-los-geht.vercel.app/"
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-zinc-800 hover:text-primary hover:bg-orange-50/80 border border-border/60 bg-white mb-2 shadow-subtle group"
        >
          <div className="flex items-center gap-2.5">
            <Home className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span>Home (Public Site)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-primary transition-colors" />
        </a>

        {navItems.map((mod) => {

          const Icon = mod.icon;
          const isActive = pathname === mod.path;
          return (
            <Link
              key={mod.path}
              href={mod.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white font-bold shadow-orange'
                  : 'text-foreground hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                <span>{mod.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
            </Link>
          );
        })}

        {/* Admin extra links to Operator view */}
        {role === 'ADMIN' && (
          <div className="pt-2 mt-2 border-t border-border space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono text-muted uppercase font-bold">
              Field Operations Quick-Link
            </div>
            <Link
              href="/staff"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                pathname === '/staff' ? 'bg-orange-50 text-primary font-bold' : 'text-zinc-600 hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-primary" />
              <span>Operator Field View</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User Session & Logout */}
      <div className="p-3 bg-white rounded-xl border border-border shadow-subtle space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink truncate max-w-[140px]">
            {user?.full_name || (role === 'ADMIN' ? 'Admin Master' : 'Field Operator')}
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-muted hover:text-rose-600 p-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-[10px] font-mono text-muted truncate">
          {user?.email || (role === 'ADMIN' ? 'admin@hilosgeht.co.ke' : 'operator@hilosgeht.co.ke')}
        </div>
      </div>

      {/* Meru Dispatch Hotline Box */}
      <div className="p-3.5 bg-white rounded-xl border border-border shadow-subtle text-[11px] text-muted space-y-1.5 font-mono">
        <div className="flex items-center gap-1.5 text-foreground font-semibold">
          <PhoneCall className="w-3.5 h-3.5 text-primary" />
          <span>Meru Dispatch Lines:</span>
        </div>
        <div>Primary: <span className="text-primary font-bold">0717 186396</span></div>
        <div>Backup: <span className="text-foreground font-bold">0748866823</span></div>
      </div>

    </aside>
  );
}

