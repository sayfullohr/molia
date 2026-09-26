'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, Moon, Sun, Flame, Trophy, ShieldCheck, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { formatDateUz } from '../../lib/utils';

import { Button } from '../ui/Button';
import { AuthModal } from '../../features/auth/AuthModal';

export function Header({ title }: { title?: string }) {
  const { user, refreshUser } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Theme initialization
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
        const unread = res.data.filter((n: NotificationItem) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      refreshUser();
    } catch (e) {
      // Ignore
    }
  };

  return (
    <header className="h-16 px-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between">
      {/* Title / Greeting */}
      <div>
        {title ? (
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base font-medium text-slate-500 dark:text-slate-400">
              Salom,
            </span>
            <span className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              {user ? `${user.username} 👋` : 'Mehmon'}
            </span>
          </div>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2 md:gap-3">
        {user?.stats && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="text-blue-600 dark:text-blue-400">Lvl {user.stats.level}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center text-amber-500 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 mr-1" />
              {user.stats.streak} kun
            </span>
          </div>
        )}

        {/* Login Button for Guests */}
        {!user && (
          <Button
            size="sm"
            onClick={() => setShowAuthModal(true)}
            className="text-xs h-9 px-3.5 shadow-xs"
          >
            Kirish
          </Button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Yorug‘ rejim' : 'Qorong‘u rejim'}
          aria-label="Rejimni almashtirish"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) loadNotifications();
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Bildirishnomalar"
            aria-label="Bildirishnomalar"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-50 animate-slideUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Bildirishnomalar ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Hammasini o‘qish
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center py-6 text-slate-400">
                    Hech qanday bildirishnoma yo‘q
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`py-2.5 px-2 rounded-lg text-xs transition-colors ${
                        !n.read ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                      }`}
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatDateUz(n.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}
