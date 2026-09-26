'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Gamepad2, Users, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Bosh sahifa', href: '/', icon: Home },
    { label: 'Moliya', href: '/finance', icon: Wallet },
    { label: 'O‘yinlar', href: '/games', icon: Gamepad2 },
    { label: 'Do‘stlar', href: '/social', icon: Users },
    { label: 'Profil', href: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 z-40 px-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[48px] select-none transition-colors relative',
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Icon className={cn('w-5 h-5 mb-0.5', isActive && 'stroke-[2.5]')} />
            <span className="text-[10px] leading-tight">{item.label}</span>
            {isActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
