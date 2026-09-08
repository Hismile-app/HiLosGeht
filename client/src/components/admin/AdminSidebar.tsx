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
  ChevronRight
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
    <aside className="w-64 bg-surface border-r border-border shrink-0 min-h-[calc(100vh-5rem)] p-4 space-y-6">
      
      {/* Admin Title */}
      <div className="px-3 py-2 bg-neutral-900 rounded-lg border border-primary/30">
        <div className="flex items-center gap-2 text-primary font-heading font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>HLG Command Hub</span>
        </div>
        <div className="text-[10px] text-muted font-mono mt-0.5">
          12-Module Fleet Platform
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
                  ? 'bg-primary text-white font-bold shadow-neon'
                  : 'text-gray-400 hover:text-white hover:bg-neutral-900'
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

      {/* Dispatch Line Box */}
      <div className="p-3 bg-neutral-900 rounded-lg border border-border text-[11px] text-muted space-y-1 font-mono">
        <span className="text-gray-300 block font-semibold">Meru Dispatch Lines:</span>
        <div>Primary: <span className="text-primary">0717 186396</span></div>
        <div>Backup: <span className="text-gray-300">0748866823</span></div>
      </div>

    </aside>
  );
}
