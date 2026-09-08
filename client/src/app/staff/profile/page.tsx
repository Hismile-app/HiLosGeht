'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Calendar, 
  ArrowLeft,
  CheckCircle2,
  Award,
  AlertCircle
} from 'lucide-react';

export default function StaffProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hlg_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/staff" 
            className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            Back to Operator Log Form
          </Link>
          <span className="text-xs font-mono text-primary font-bold">OPERATOR PROFILE</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary to-amber-500 rounded-2xl flex items-center justify-center text-white font-heading font-black text-2xl shadow-neon">
              {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'OP'}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-heading font-black text-white">
                  {user?.full_name || 'Field Machinery Operator'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit mx-auto sm:mx-0">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED OPERATOR
                </span>
              </div>
              <p className="text-xs font-mono text-muted">
                {user?.email || 'operator@hilosgeht.co.ke'} • Meru Infrastructure Fleet
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-border/60">
            <div className="p-3 bg-neutral-900 rounded-xl">
              <div className="text-[10px] font-mono text-muted uppercase">ASSIGNED REGION</div>
              <div className="text-sm font-bold text-white mt-0.5">Meru County & Mt. Kenya</div>
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl">
              <div className="text-[10px] font-mono text-muted uppercase">OPERATING PERMIT</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">Heavy Plant Class G (Valid)</div>
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl">
              <div className="text-[10px] font-mono text-muted uppercase">DISPATCH STATUS</div>
              <div className="text-sm font-bold text-primary mt-0.5">Active on Shift</div>
            </div>
          </div>
        </div>

        {/* Certified Machinery Qualified to Operate */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Authorized Equipment Certifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Komatsu PC-200', type: 'Hydraulic Excavator', status: 'Certified Level 3' },
              { name: 'JCB 3DXPLUS', type: 'Backhoe Loader', status: 'Certified Level 3' },
              { name: 'Shantui SL60W-2', type: 'Wheel Loader', status: 'Certified Level 2' },
              { name: 'Shantui SG18-3', type: 'Motor Grader', status: 'Certified Level 2' },
              { name: 'XCMG XS163J', type: 'Vibratory Road Roller', status: 'Certified Level 2' },
              { name: 'Isuzu FVZ 34', type: 'Heavy Tipper Truck', status: 'Commercial Class C/E' },
            ].map((mach, i) => (
              <div key={i} className="p-3 bg-neutral-900 border border-border/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{mach.name}</div>
                  <div className="text-xs text-muted font-mono">{mach.type}</div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">{mach.status}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
