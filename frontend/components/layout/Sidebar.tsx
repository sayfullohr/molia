'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Wallet,
  Gamepad2,
  Users,
  BarChart3,
  Trophy,
  ShieldCheck,
  User,
  LogOut,
  Flame,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Bosh sahifa', href: '/', icon: Home },
    { label: 'Moliya', href: '/finance', icon: Wallet },
    { label: 'O‘yinlar', href: '/games', icon: Gamepad2 },
    { label: 'Do‘stlar', href: '/social', icon: Users },
    { label: 'Statistika', href: '/statistics', icon: BarChart3 },
    { label: 'Reyting', href: '/leaderboard', icon: Trophy },
    { label: 'Xavfsizlik', href: '/security', icon: ShieldCheck },
    { label: 'Profil', href: '/profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-30 select-none">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/30">
          M
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
            Molia Strategy
          </h1>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Moliya & Ijtimoiy</p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Mini Profile & Logout */}
      {user && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-semibold flex items-center justify-center text-xs shrink-0">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user.username}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>Lvl {user.stats?.level || 1}</span>
                  <span>•</span>
                  <span className="flex items-center text-amber-500 font-medium">
                    <Flame className="w-3 h-3 fill-amber-500 mr-0.5" />
                    {user.stats?.streak || 0}d
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Chiqish"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              aria-label="Chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
