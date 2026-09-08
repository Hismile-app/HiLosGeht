'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  PhoneCall
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

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 bg-surface border-r border-border shrink-0 min-h-[calc(100vh-5rem)] p-4 space-y-6">
      
      {/* Admin Title Banner */}
      <div className="px-3.5 py-3 bg-white rounded-xl border border-border shadow-subtle">
        <div className="flex items-center gap-2 text-primary font-heading font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <span>HLG Command Hub</span>
        </div>
        <div className="text-[11px] text-muted font-mono mt-1">
          12-Module Industrial Platform
        </div>
      </div>

      {/* Module Links */}
      <nav className="space-y-1">
        {ADMIN_MODULES.map((mod) => {
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
      </nav>

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
