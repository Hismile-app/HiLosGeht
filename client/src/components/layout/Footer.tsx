import React from 'react';
import Link from 'next/link';
import { Truck, Phone, Mail, MapPin, ShieldCheck, Clock, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border text-zinc-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <span className="font-heading font-black text-lg text-ink">
                <span className="text-primary">HLG</span> HI LOS GEHT
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Meru's premier heavy construction equipment rental and fleet logistics platform. Direct B2B WhatsApp dispatch, telemetry monitoring, and jobsite haulage solutions.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-mono font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Equipment • ISO 15143-3 Telemetry</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-ink font-heading text-xs tracking-wider uppercase mb-4 text-primary font-bold">
              Fleet Catalog
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Komatsu PC-200 Excavator</Link></li>
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Komatsu D155AX-8 Dozer</Link></li>
              <li><Link href="/catalog" className="hover:text-primary transition-colors">JCB 3DXPLUS Backhoe Loader</Link></li>
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Shantui SL60W-2 Wheel Loader</Link></li>
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Shantui SG18-3 Motor Grader</Link></li>
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Isuzu FVZ 34 (15T Tipper Truck)</Link></li>
            </ul>
          </div>

          {/* Operations Portal */}
          <div>
            <h3 className="text-ink font-heading text-xs tracking-wider uppercase mb-4 text-primary font-bold">
              Operations & Portals
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/staff" className="hover:text-primary transition-colors">Operator Daily Logging</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">12-Module Command Center</Link></li>
              <li><Link href="/admin/fleet" className="hover:text-primary transition-colors">Fleet Management & CRUD</Link></li>
              <li><Link href="/admin/ai-insights" className="hover:text-primary transition-colors">AI Anomaly & Fuel Diagnostics</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Staff Authentication</Link></li>
            </ul>
          </div>

          {/* Direct Dispatch & Paybill Contacts */}
          <div>
            <h3 className="text-ink font-heading text-xs tracking-wider uppercase mb-4 text-primary font-bold">
              Direct Dispatch & Booking
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>Primary WhatsApp: <strong className="text-ink">0717 186396</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted shrink-0" />
                <span>Backup Line: <strong className="text-ink">0748866823</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>Email: <strong className="text-ink">hilosgehtinfo@gmail.com</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Meru Town & County Quarry Hubs, Kenya</span>
              </li>
              <li className="p-2.5 bg-white border border-border rounded-lg space-y-1 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>KENYA M-PESA PAYBILL</span>
                </div>
                <div className="text-zinc-800">PAYBILL: <strong className="text-ink font-bold">522522</strong></div>
                <div className="text-zinc-800">ACCOUNT: <strong className="text-ink font-bold">1347339299</strong></div>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>&copy; {new Date().getFullYear()} Hi Los Geht (HLG) Heavy Machinery Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] text-zinc-500">PostgreSQL • GiST Integrity Protected</span>
            <Link href="/admin" className="text-zinc-600 hover:text-primary">Admin Console</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
