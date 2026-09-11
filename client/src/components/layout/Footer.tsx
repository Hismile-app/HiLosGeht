import React from 'react';
import Link from 'next/link';
import { Truck, Phone, Mail, MapPin, ShieldCheck, CreditCard, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border text-zinc-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img src="/logo.png" alt="Hi Los Geht Logo" className="w-10 h-10 object-contain" />
              </div>
              <span className="font-heading font-black text-lg text-ink">
                HI LOS GEHT
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Meru's premier heavy construction equipment rental and fleet logistics platform. Direct B2B WhatsApp dispatch, telemetry monitoring, and jobsite haulage solutions.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-mono font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Fleet • ISO 15143-3 Telematics</span>
            </div>
          </div>

          {/* Fleet Catalog Links */}
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

          {/* Company & Services */}
          <div>
            <h3 className="text-ink font-heading text-xs tracking-wider uppercase mb-4 text-primary font-bold">
              Company & Services
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Hi Los Geht</Link></li>
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Machinery Hire Catalog</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Dispatch Office</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Earthmoving & Roadworks</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Quarry & Dam Construction</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Get Project Quotation</Link></li>
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

        {/* Footer Bottom with Exclusive Padlock Staff Portal Link */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>&copy; {new Date().getFullYear()} Hi Los Geht (HLG) Heavy Machinery Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] text-zinc-500">PostgreSQL • GiST Integrity Protected</span>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-primary font-mono text-xs transition-colors group"
            >
              <Lock className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

