import './globals.css';
import React from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { Header } from '../components/layout/Header';

export const metadata = {
  title: 'Molia Strategy — Shaxsiy Moliya & Ijtimoiy Platforma',
  description: 'Zamonaviy shaxsiy moliya, multiplayer o‘yinlar va ijtimoiy muloqot platformasi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#0B1020] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* Desktop Sidebar (240px) */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
              <Header />
              <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation (max 5 items) */}
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
