'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Phone, 
  Menu, 
  X, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
  { name: 'Fleet Catalog', path: '/catalog' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 industrial-nav bg-white/95 backdrop-blur-md border-b border-border shadow-subtle print:static print:bg-white print:border-b-2 print:border-zinc-900 print:shadow-none print:py-2">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 print:h-auto">
          
          {/* Logo & Brand Header */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink min-w-0">
            <div className="flex items-center justify-center transition-all duration-200 shrink-0">
              <img 
                src="/logo.png" 
                alt="Hi Los Geht Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 group-hover:scale-105 transition-transform object-contain print:w-12 print:h-12" 
              />
            </div>
            <div className="min-w-0">
              <span className="font-heading font-black text-sm xs:text-base sm:text-lg md:text-xl tracking-wider text-ink block leading-tight truncate print:text-xl">
                HI LOS GEHT
              </span>
              <span className="hidden xs:block text-[8px] sm:text-[9.5px] md:text-[10px] uppercase font-mono tracking-wider sm:tracking-widest text-muted leading-tight mt-0.5 truncate print:block print:text-xs print:text-zinc-600">
                Heavy Machinery • Meru, Kenya
              </span>
            </div>
          </Link>

          {/* Print Letterhead Header Details */}
          <div className="hidden print:flex flex-col items-end text-xs font-mono text-zinc-800">
            <span className="font-bold text-primary">MERU DISPATCH & BOOKING</span>
            <span>Hotline: 0717 186396 | Email: hilosgehtinfo@gmail.com</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex print:hidden items-center gap-5 lg:gap-7 shrink-0">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.path}
                href={link.path} 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isLinkActive(link.path) ? 'text-primary font-bold' : 'text-zinc-700'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <a 
              href="https://wa.me/254717186396?text=Hello%20HLG%20Dispatch%20Team%2C%20I%20would%20like%20to%20inquire%20about%20heavy%20machinery%20availability."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-mono text-zinc-800 bg-surface px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 transition-colors shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>0717 186396</span>
            </a>

            <Link 
              href="/catalog" 
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
            >
              <span>Book Equipment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Right Action Area */}
          <div className="flex md:hidden print:hidden items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link 
              href="/catalog" 
              className="btn-primary text-[11px] sm:text-xs py-1.5 px-2.5 sm:py-2 sm:px-3.5 whitespace-nowrap shrink-0 shadow-sm"
            >
              <span>Book Now</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-1.5 sm:p-2 rounded-lg bg-surface border border-border text-zinc-700 hover:text-ink active:bg-zinc-200 transition-colors flex items-center justify-center shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-ink" /> : <Menu className="w-5 h-5 text-ink" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Collapsible Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-lg border-b border-border px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isLinkActive(link.path) 
                    ? 'bg-orange-50 text-primary font-bold border-l-4 border-primary' 
                    : 'text-zinc-800 hover:bg-surface hover:text-primary'
                }`}
              >
                <span>{link.name}</span>
                <ArrowRight className={`w-4 h-4 ${isLinkActive(link.path) ? 'text-primary' : 'text-zinc-400'}`} />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border space-y-2.5">
            <Link
              href="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <span>View Fleet & Book Equipment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a 
              href="https://wa.me/254717186396?text=Hello%20HLG%20Dispatch%20Team%2C%20I%20would%20like%20to%20inquire%20about%20heavy%20machinery%20availability."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-surface border border-border text-xs font-mono text-zinc-800 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-sans font-medium text-zinc-700">WhatsApp Dispatch:</span>
              </div>
              <span className="text-primary font-bold">0717 186396</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
