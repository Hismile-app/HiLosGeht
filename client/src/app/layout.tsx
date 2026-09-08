import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Hi Los Geht (HLG) — Heavy Machinery Rental & Fleet Logistics | Meru, Kenya',
  description: 'Book certified heavy construction machinery in Meru, Kenya. Komatsu excavators, dozers, JCB backhoes, Shantui motor graders, wheel loaders, and Isuzu tippers. Rapid WhatsApp dispatch and verified fleet operations.',
  keywords: 'heavy machinery rental Meru, excavator hire Kenya, Komatsu PC-200, JCB backhoe, Shantui grader, construction equipment logistics Kenya, Meru quarry machinery',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-ink min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
        <Navbar />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
