'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide topnav and footer on admin or operator dashboard pages
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/staff');

  if (isDashboard) {
    return (
      <main className="flex-grow min-h-screen w-full bg-white text-ink">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
