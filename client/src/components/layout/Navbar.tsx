'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Truck, 
  Phone, 
  ShieldCheck, 
  Menu, 
  X, 
  LayoutDashboard, 
  ClipboardList, 
  LogIn 
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 industrial-nav bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center transition-all duration-200">
              <Truck className="w-6 h-6 text-primary group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <span className="font-heading font-black text-xl tracking-wider text-ink flex items-center gap-1.5">
                <span className="text-primary">HLG</span> HI LOS GEHT
              </span>
              <span className="block text-[10px] uppercase font-mono tracking-widest text-muted">
                Heavy Machinery • Meru, Kenya
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/catalog" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isLinkActive('/catalog') ? 'text-primary font-bold' : 'text-zinc-700'
              }`}
            >
              Fleet Catalog
            </Link>
            
            <Link 
              href="/staff" 
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary ${
                isLinkActive('/staff') ? 'text-primary font-bold' : 'text-zinc-700'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-primary" />
              Operator Portal
            </Link>

            <Link 
              href="/admin" 
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary ${
                pathname?.startsWith('/admin') ? 'text-primary font-bold' : 'text-zinc-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              Admin Command
            </Link>

            <a 
              href="https://wa.me/254717186396?text=Hello%20HLG%20Dispatch%20Team%2C%20I%20would%20like%20to%20inquire%20about%20heavy%20machinery%20availability."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-mono text-zinc-800 bg-surface px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>0717 186396</span>
            </a>

            <Link 
              href="/catalog" 
              className="btn-primary text-xs py-2 px-4"
            >
              Book Equipment
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <Link href="/catalog" className="btn-primary text-xs py-2 px-3">
              Book Now
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-surface border border-border text-zinc-700 hover:text-ink"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link 
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-900 hover:bg-surface hover:text-primary"
          >
            🚜 Fleet Catalog
          </Link>
          <Link 
            href="/staff"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-900 hover:bg-surface hover:text-primary"
          >
            📋 Operator Daily Log Portal
          </Link>
          <Link 
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-900 hover:bg-surface hover:text-primary"
          >
            ⚡ Admin 12-Module Command Center
          </Link>
          <Link 
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-900 hover:bg-surface hover:text-primary"
          >
            🔒 Staff Login
          </Link>
          
          <div className="pt-2 border-t border-border text-xs text-muted space-y-1">
            <p className="font-mono text-zinc-800">Dispatch Lines:</p>
            <p>Primary: <a href="tel:+254717186396" className="text-primary font-bold">0717 186396</a></p>
            <p>Backup: <a href="tel:+254748866823" className="text-primary font-bold">0748866823</a></p>
          </div>
        </div>
      )}
    </nav>
  );
}
